import { NextResponse } from "next/server";
import { analyzeCall, MODEL_FAST, MODEL_SMART, type Line } from "@/lib/mi";
import { parseTranscript } from "@/lib/parse";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_LINES = 300;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 8;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (rateLimited(ip))
    return NextResponse.json(
      { error: "You have run 8 analyses in 10 minutes. Please wait a few minutes, or explore the demo calls meanwhile." },
      { status: 429 },
    );
  let body: { lines?: unknown; transcript?: unknown; model?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  let lines: Line[] = [];
  if (Array.isArray(body.lines)) {
    lines = body.lines
      .filter(
        (l): l is Line =>
          !!l &&
          typeof l === "object" &&
          typeof (l as Line).text === "string" &&
          ((l as Line).speaker === "coach" || (l as Line).speaker === "participant"),
      )
      .map((l, i) => ({ line_number: i + 1, speaker: l.speaker, text: l.text.slice(0, 2000) }));
  } else if (typeof body.transcript === "string") {
    lines = parseTranscript(body.transcript.slice(0, 200_000));
  }

  if (lines.length === 0) return NextResponse.json({ error: "No transcript lines found" }, { status: 400 });
  if (lines.length > MAX_LINES)
    return NextResponse.json({ error: `Transcript too long (max ${MAX_LINES} lines)` }, { status: 400 });

  const model = body.model === "smart" ? MODEL_SMART : MODEL_FAST;
  try {
    // Haiku occasionally emits malformed tool JSON; one retry clears it.
    const analysis = await analyzeCall(lines, { model }).catch(() => analyzeCall(lines, { model }));
    return NextResponse.json({ lines, analysis });
  } catch (e) {
    console.error("analyze failed", e);
    return NextResponse.json({ error: "Analysis failed, please retry" }, { status: 502 });
  }
}
