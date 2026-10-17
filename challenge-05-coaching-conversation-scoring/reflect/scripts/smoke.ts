import { readFileSync } from "fs";
import { analyzeCall, MODEL_FAST } from "../src/lib/mi";
const d = JSON.parse(readFileSync("../data/synthetic_data/synthetic_300_calls.json", "utf8"));
const c = d.calls[1];
const lines = c.lines.map((l: any) => ({ line_number: l.line_number, speaker: l.speaker, text: l.text }));
const t0 = Date.now();
analyzeCall(lines, { model: process.argv[2] ?? MODEL_FAST }).then((a) => {
  let ok = 0, n = 0;
  for (const l of c.lines) { const t = a.tags.find((x) => x.line_number === l.line_number); if (l.coach_move) { n++; if (t?.coach_move === l.coach_move) ok++; } }
  console.log(c.call_id, c.language, "lines", lines.length, "secs", (Date.now() - t0) / 1000, "coach move acc", ok, "/", n);
  console.log(JSON.stringify(a.score), JSON.stringify(a.metrics), JSON.stringify(a.flags));
});
