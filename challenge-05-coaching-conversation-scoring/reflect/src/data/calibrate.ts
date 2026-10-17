import { mitiMetrics, type Analysis, type Line } from "@/lib/mi";
import cal from "./calibration.json";

// Same features scripts/calibrate.ts was fitted on; keep in sync.
export function features(lines: Line[], a: Analysis): number[] {
  const m = mitiMetrics(lines, a.tags);
  const coach = lines.filter((l) => l.speaker === "coach").length || 1;
  const moves = a.tags.filter((t) => t.coach_move).map((t) => t.coach_move);
  const per10 = (k: string) => (10 * moves.filter((x) => x === k).length) / coach;
  const ck = Object.values(a.score.checklist ?? {}).filter(Boolean).length;
  return [a.score.overall_1_to_5, a.score.empathy_1_to_5, a.score.partnership_1_to_5, ck, (m.open_question_pct ?? 50) / 100, Math.min(m.reflection_to_question ?? 0, 4), per10("persuade"), per10("complex reflection"), per10("affirm") + per10("emphasize autonomy") + per10("seek collaboration") + per10("ask permission"), (m.change_talk_pct ?? 50) / 100];
}

type Model = { intercept: number; mean: number[]; sd: number[]; weights: number[] };
const predict = (m: Model, x: number[]) =>
  Math.min(5, Math.max(1, Math.round(m.intercept + x.reduce((s, v, j) => s + (m.weights[j] * (v - m.mean[j])) / m.sd[j], 0))));

// Supervisor-calibrated 1-5 scores (fitted on 200 supervisor-rated synthetic calls).
export function calibratedScores(lines: Line[], a: Analysis) {
  const x = features(lines, a);
  return {
    overall_1_to_5: predict(cal.overall_1_to_5.model, x),
    empathy_1_to_5: predict(cal.empathy_1_to_5.model, x),
    partnership_1_to_5: predict(cal.partnership_1_to_5.model, x),
  };
}
