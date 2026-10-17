"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ClipboardPaste, Loader2, Mic, MicOff, PlayCircle } from "lucide-react";
import type { Analysis, Line, Speaker } from "@/lib/mi";
import { Transcript } from "./Transcript";
import { Scorecard } from "./Scorecard";
import { toLabelMap } from "./tags";

export interface DemoCall {
  id: string;
  title?: string;
  language?: string;
  source?: string;
  lines: Line[];
  analysis: Analysis | null;
  labels?: unknown;
}

type Mode = "demo" | "paste" | "live";

/* eslint-disable @typescript-eslint/no-explicit-any */
function getRecognition(): any {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function Analyzer({ demos }: { demos: DemoCall[] }) {
  const [mode, setMode] = useState<Mode>(demos.length ? "demo" : "paste");
  const [demoId, setDemoId] = useState<string>(demos[0]?.id ?? "");
  const [lines, setLines] = useState<Line[]>(demos[0]?.lines ?? []);
  const [analysis, setAnalysis] = useState<Analysis | null>(demos[0]?.analysis ?? null);
  const [labels, setLabels] = useState<unknown>(demos[0]?.labels ?? null);
  const [paste, setPaste] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<number | null>(null);

  // Live mode state
  const [listening, setListening] = useState(false);
  const [speaker, setSpeaker] = useState<Speaker>("coach");
  const [lang, setLang] = useState<"en-US" | "es-US">("en-US");
  const [interim, setInterim] = useState("");
  const [supported, setSupported] = useState(true);
  const recRef = useRef<any>(null);
  const speakerRef = useRef<Speaker>("coach");
  const linesRef = useRef<Line[]>([]);
  const lastAnalyzedRef = useRef(0);

  useEffect(() => setSupported(!!getRecognition()), []);
  useEffect(() => {
    speakerRef.current = speaker;
  }, [speaker]);
  useEffect(() => {
    linesRef.current = lines;
  }, [lines]);

  const labelMap = useMemo(() => toLabelMap(labels), [labels]);

  const analyze = useCallback(async (body: object) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      return data as { lines: Line[]; analysis: Analysis };
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  function pickDemo(id: string) {
    const d = demos.find((x) => x.id === id);
    if (!d) return;
    setDemoId(id);
    setLines(d.lines);
    setAnalysis(d.analysis);
    setLabels(d.labels ?? null);
    setError(null);
  }

  async function runPaste() {
    const out = await analyze({ transcript: paste });
    if (out) {
      setLines(out.lines);
      setAnalysis(out.analysis);
      setLabels(null);
    }
  }

  const analyzeLive = useCallback(async () => {
    const current = linesRef.current;
    if (!current.length || current.length === lastAnalyzedRef.current) return;
    lastAnalyzedRef.current = current.length;
    const out = await analyze({ lines: current });
    if (out) setAnalysis(out.analysis);
  }, [analyze]);

  function startLive() {
    const Rec = getRecognition();
    if (!Rec) return setSupported(false);
    setLines([]);
    setAnalysis(null);
    setLabels(null);
    setError(null);
    lastAnalyzedRef.current = 0;
    const rec = new Rec();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e: any) => {
      let partial = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const text = r[0].transcript.trim();
        if (r.isFinal && text) {
          setLines((prev) => {
            const next = [...prev, { line_number: prev.length + 1, speaker: speakerRef.current, text }];
            linesRef.current = next;
            if (next.length - lastAnalyzedRef.current >= 4) void analyzeLive();
            return next;
          });
        } else partial += text + " ";
      }
      setInterim(partial.trim());
    };
    rec.onerror = (e: any) => {
      if (e.error !== "no-speech") setError(`Microphone error: ${e.error}`);
    };
    rec.onend = () => {
      // Chrome stops after silence; restart while the user still wants to listen.
      if (recRef.current === rec) {
        try {
          rec.start();
        } catch {
          /* already started */
        }
      }
    };
    recRef.current = rec;
    rec.start();
    setListening(true);
  }

  function stopLive() {
    const rec = recRef.current;
    recRef.current = null;
    rec?.stop();
    setListening(false);
    setInterim("");
    void analyzeLive();
  }

  useEffect(() => {
    if (!listening) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && (e.target as HTMLElement)?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setSpeaker((s) => (s === "coach" ? "participant" : "coach"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [listening]);

  useEffect(() => () => recRef.current?.stop(), []);

  function jump(n: number) {
    setHighlight(n);
    document.getElementById(`line-${n}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => setHighlight(null), 2000);
  }

  const tab = (m: Mode, label: string, Icon: typeof Mic) => (
    <button
      onClick={() => {
        if (listening) stopLive();
        setMode(m);
        if (m === "demo" && demoId) pickDemo(demoId);
        // Live and paste start on a blank screen, not the last demo's transcript.
        if (m === "live" || m === "paste") {
          setLines([]);
          setAnalysis(null);
          setLabels(null);
          setError(null);
          setInterim("");
        }
        if (m === "paste") setPaste("");
      }}
      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm ${
        mode === m ? "bg-teal-700 text-white" : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      <Icon size={15} /> {label}
    </button>
  );

  const current = demos.find((d) => d.id === demoId);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          {tab("demo", "Demo calls", PlayCircle)}
          {tab("live", "Live call", Mic)}
          {tab("paste", "Paste a transcript", ClipboardPaste)}
          {loading && (
            <span className="ml-auto flex items-center gap-1.5 text-sm text-slate-500">
              <Loader2 size={15} className="animate-spin" /> Reviewing the call
            </span>
          )}
        </div>

        <div className="mt-3">
          {mode === "demo" &&
            (demos.length ? (
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={demoId}
                  onChange={(e) => pickDemo(e.target.value)}
                  className="min-w-0 max-w-full flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  {demos.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title ?? d.id}
                      {d.language ? ` (${d.language})` : ""}
                    </option>
                  ))}
                </select>
                {current?.source && <span className="text-xs text-slate-500">Source: {current.source}</span>}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Demo calls are being prepared. Try pasting a transcript meanwhile.</p>
            ))}

          {mode === "paste" && (
            <div className="space-y-2">
              <textarea
                value={paste}
                onChange={(e) => setPaste(e.target.value)}
                rows={7}
                className="w-full rounded-md border border-slate-300 p-3 font-mono text-sm"
                placeholder={"Paste your transcript here, for example:\nCoach: How did your walks go this week?\nParticipant: Better than last week."}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  One line per turn, starting with Coach: or Participant: (Spanish works too).
                </span>
                <button
                  onClick={runPaste}
                  disabled={loading || !paste.trim()}
                  className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50"
                >
                  Review this call
                </button>
              </div>
            </div>
          )}

          {mode === "live" &&
            (supported ? (
              <div className="flex flex-wrap items-center gap-3">
                {!listening ? (
                  <button
                    onClick={startLive}
                    className="flex items-center gap-1.5 rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
                  >
                    <Mic size={15} /> Start listening
                  </button>
                ) : (
                  <button
                    onClick={stopLive}
                    className="flex items-center gap-1.5 rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
                  >
                    <MicOff size={15} /> Stop and review
                  </button>
                )}
                <div className="flex overflow-hidden rounded-md border border-slate-300 text-sm">
                  {(["coach", "participant"] as Speaker[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeaker(s)}
                      className={`px-3 py-1.5 capitalize ${speaker === s ? "bg-slate-800 text-white" : "bg-white text-slate-700"}`}
                    >
                      {s} speaking
                    </button>
                  ))}
                </div>
                <select
                  value={lang}
                  disabled={listening}
                  onChange={(e) => setLang(e.target.value as "en-US" | "es-US")}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
                >
                  <option value="en-US">English</option>
                  <option value="es-US">Español</option>
                </select>
                <span className="text-xs text-slate-500">Press space to switch speaker. Reviews every 4 new lines.</span>
                {listening && (
                  <span className="flex items-center gap-1.5 text-sm text-rose-600">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-rose-600" /> Listening
                    {interim && <span className="italic text-slate-500">&ldquo;{interim}&rdquo;</span>}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-600">
                Live listening needs a browser with speech recognition, such as Chrome or Edge. You can still paste a
                transcript.
              </p>
            ))}
        </div>
        {error && <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
            <h2 className="text-sm font-semibold text-slate-800">Transcript</h2>
            <span className="text-xs text-slate-500">
              {lines.length} lines{labelMap ? " · ticks compare to expert labels" : ""}
            </span>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            <Transcript lines={lines} analysis={analysis} labels={labelMap} highlight={highlight} />
          </div>
        </section>
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50 lg:max-h-[calc(70vh+42px)] lg:overflow-y-auto">
          <div className="border-b border-slate-100 bg-white px-4 py-2.5">
            <h2 className="text-sm font-semibold text-slate-800">Supervisor review</h2>
          </div>
          <Scorecard analysis={analysis} lines={lines} onJump={jump} />
        </section>
      </div>
    </div>
  );
}
