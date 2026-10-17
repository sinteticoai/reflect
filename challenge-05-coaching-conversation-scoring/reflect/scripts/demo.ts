import { readFileSync, writeFileSync } from "fs";
import { MODEL_SMART, type Line } from "../src/lib/mi";
import { csv, groupBy, analyzeCached, pool, DATA } from "./common";

const calls = JSON.parse(readFileSync(`${DATA}/synthetic_data/synthetic_300_calls.json`, "utf8")).calls as any[];
const ratings = csv("synthetic_data/synthetic_supervisor_ratings.csv");
const avgOverall = new Map<string, number>();
for (const [id, rs] of groupBy(ratings, (r) => r.call_id)) avgOverall.set(id, rs.reduce((s, r) => s + +r.overall_1_to_5, 0) / rs.length);
const labelled = calls.filter((c) => c.lines.some((l: any) => l.coach_move));
console.log("300 calls, labelled:", labelled.length, "rated:", calls.filter((c) => avgOverall.has(c.call_id)).length);

const rated = (c: any) => avgOverall.get(c.call_id);
const en = calls.filter((c) => c.language === "English");
const strong = [...en].filter((c) => rated(c) !== undefined).sort((a, b) => rated(b)! - rated(a)!)[0] ?? labelled.find((c) => c.language === "English");
const weak = [...calls].filter((c) => rated(c) !== undefined && c !== strong).sort((a, b) => rated(a)! - rated(b)!)[0];
const spanish = calls.find((c) => c.language === "Spanish" && c.lines.some((l: any) => l.coach_move) && c !== weak);
let safety = calls.find((c) => c.lines.some((l: any) => l.needs_human === "yes"));
let safetyLines: any[] | null = null;
if (!safety) {
  // Fall back to the full transcripts file.
  const tr = csv("synthetic_data/synthetic_call_transcripts.csv");
  const yes = tr.find((r) => r.needs_human === "yes")!;
  safetyLines = tr.filter((r) => r.call_id === yes.call_id);
  const meta = csv("synthetic_data/synthetic_calls.csv").find((c) => c.call_id === yes.call_id)!;
  safety = { ...meta, lines: safetyLines.map((r) => ({ ...r, line_number: +r.line_number })) };
}
const toLines = (c: any): Line[] => c.lines.map((l: any) => ({ line_number: +l.line_number, speaker: l.speaker, text: l.text, time: l.time_in_call }));
const labels = (c: any) => c.lines.some((l: any) => l.coach_move || l.participant_talk) ? c.lines.map((l: any) => ({ line_number: +l.line_number, coach_move: l.coach_move || null, participant_talk: l.participant_talk || null, needs_human: l.needs_human || null })) : undefined;
const syn = (c: any, title: string) => ({ id: c.call_id, title, language: c.language, source: `Synthetic (Sylvester Crane Lab), ${c.goal_topic}, week ${c.program_week}${rated(c) ? `, supervisor overall ${rated(c)}` : ""}`, lines: toLines(c), labels: labels(c), supervisor_overall: rated(c) ?? null });

const mi = csv("coaching_sessions_annomi.csv");
const sessions = groupBy(mi, (r) => r.session_id);
const pick = (q: string) => [...sessions.values()].filter((s) => s[0].session_quality === q).sort((a, b) => Math.abs(a.length - 50) - Math.abs(b.length - 50))[0];
const annoCounselMap = (r: any) => {
  if (!r.counsellor_move) return null;
  if (r.counsellor_move === "question") return r.question_type === "open" ? "open question" : r.question_type === "closed" ? "closed question" : "question";
  if (r.counsellor_move === "reflection") return r.reflection_type === "complex" ? "complex reflection" : r.reflection_type === "simple" ? "simple reflection" : "reflection";
  return r.counsellor_move;
};
const anno = (s: any[], title: string) => {
  const rows = s.slice(0, 60);
  return { id: `ANNOMI-${s[0].session_id}`, title, language: "English", source: `AnnoMI (real, expert-labelled), ${s[0].topic}, ${s[0].session_quality} quality MI, ${s[0].video_url}`, video_url: s[0].video_url,
    lines: rows.map((r, i) => ({ line_number: i + 1, speaker: (r.speaker === "counsellor" ? "coach" : "participant") as "coach" | "participant", text: r.text, time: r.timestamp })),
    labels: rows.map((r, i) => ({ line_number: i + 1, coach_move: annoCounselMap(r), participant_talk: r.client_talk || null, needs_human: null })) };
};
const items = [
  syn(strong, "Strong coaching call"),
  syn(weak, "Call that needs coaching"),
  syn(spanish, "Spanish-language call"),
  syn(safety, "Safety issue during call"),
  anno(pick("high"), "Real session: good MI practice"),
  anno(pick("low"), "Real session: poor MI practice"),
];
console.log(items.map((i) => `${i.id} ${i.lines.length}`).join(" | "));
pool(items, 6, async (it) => ({ ...it, analysis: await analyzeCached(`demo_${it.id}`, it.lines, MODEL_SMART) })).then((out) => {
  writeFileSync("src/data/demo-calls.json", JSON.stringify(out, null, 1));
  for (const o of out) console.log(o.id, o.analysis ? `overall ${o.analysis.score.overall_1_to_5} flags ${o.analysis.flags.length}` : "FAILED");
});
