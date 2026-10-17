import { writeFileSync, readFileSync } from "fs";
import { MODEL_FAST, type Line, type Analysis } from "../src/lib/mi";
import { features } from "../src/data/calibrate";
import { csv, groupBy, analyzeCached, pool, sample } from "./common";

const r3 = (x: number) => Math.round(x * 1000) / 1000, r1 = (x: number) => Math.round(x * 10) / 10;
const tr = groupBy(csv("synthetic_data/synthetic_call_transcripts.csv"), (r) => r.call_id);
const ratings = groupBy(csv("synthetic_data/synthetic_supervisor_ratings.csv"), (r) => r.call_id);
const meta = new Map(csv("synthetic_data/synthetic_calls.csv").map((c) => [c.call_id, c]));
const rated = [...ratings.keys()].filter((id) => ratings.get(id)!.length >= 2);
const en = sample(rated.filter((id) => meta.get(id)!.language === "English"), 30, 11);
const es = sample(rated.filter((id) => meta.get(id)!.language === "Spanish"), 30, 13);
const extra = sample(rated.filter((id) => !en.includes(id) && !es.includes(id)), 140, 21);
const ids = [...new Set([...en, ...es, ...extra])];

export const FEATURE_NAMES = ["llm_overall", "llm_empathy", "llm_partnership", "checklist_count", "open_question_share", "reflection_to_question", "persuade_per_10_coach_lines", "complex_reflection_per_10", "mi_adherent_per_10", "change_talk_share"];

function ridge(X: number[][], y: number[], lambda = 1) {
  const n = X.length, p = X[0].length;
  const mu = Array.from({ length: p }, (_, j) => X.reduce((s, r) => s + r[j], 0) / n);
  const sd = Array.from({ length: p }, (_, j) => Math.sqrt(X.reduce((s, r) => s + (r[j] - mu[j]) ** 2, 0) / n) || 1);
  const Z = X.map((r) => r.map((v, j) => (v - mu[j]) / sd[j]));
  const ym = y.reduce((a, b) => a + b, 0) / n;
  const A = Array.from({ length: p }, (_, i) => Array.from({ length: p }, (_, j) => Z.reduce((s, r) => s + r[i] * r[j], 0) + (i === j ? lambda : 0)));
  const b = Array.from({ length: p }, (_, i) => Z.reduce((s, r, k) => s + r[i] * (y[k] - ym), 0));
  for (let i = 0; i < p; i++) { // Gauss-Jordan
    let mx = i; for (let k = i + 1; k < p; k++) if (Math.abs(A[k][i]) > Math.abs(A[mx][i])) mx = k;
    [A[i], A[mx]] = [A[mx], A[i]]; [b[i], b[mx]] = [b[mx], b[i]];
    for (let k = 0; k < p; k++) if (k !== i) { const f = A[k][i] / A[i][i]; for (let j = i; j < p; j++) A[k][j] -= f * A[i][j]; b[k] -= f * b[i]; }
  }
  const w = b.map((v, i) => v / A[i][i]);
  return { mu, sd, w, intercept: ym, predict: (x: number[]) => ym + x.reduce((s, v, j) => s + w[j] * (v - mu[j]) / sd[j], 0) };
}
function corr(x: number[], y: number[]) {
  const n = x.length, mx = x.reduce((a, b) => a + b, 0) / n, my = y.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; }
  return r3(sxy / Math.sqrt(sxx * syy));
}
const agree = (x: number[], y: number[]) => ({ n: x.length, exact_pct: r1((100 * x.filter((v, i) => v === y[i]).length) / x.length), within1_pct: r1((100 * x.filter((v, i) => Math.abs(v - y[i]) <= 1).length) / x.length), mae: r3(x.reduce((s, v, i) => s + Math.abs(v - y[i]), 0) / x.length), pearson_r: corr(x, y) });

(async () => {
  const res = await pool(ids, 10, async (id) => {
    const lines: Line[] = tr.get(id)!.map((r) => ({ line_number: +r.line_number, speaker: r.speaker as any, text: r.text }));
    const a = await analyzeCached(`syn_${id}`, lines, MODEL_FAST);
    return a ? { id, lines, a } : null;
  });
  const ok = res.filter(Boolean) as { id: string; lines: Line[]; a: Analysis }[];
  const sup = (id: string, r: string, f: string) => +ratings.get(id)!.find((x) => x.rater === r)![f];
  const out: any = { n_calls: ok.length, feature_names: FEATURE_NAMES, method: "Ridge regression from Reflect's own line tags and LLM scores to the mean of the two supervisors, 10-fold cross-validated (every call scored by a model that never saw it), rounded to 1-5." };
  for (const f of ["overall_1_to_5", "empathy_1_to_5", "partnership_1_to_5"]) {
    const X = ok.map((o) => features(o.lines, o.a));
    const y = ok.map((o) => (sup(o.id, "Supervisor A", f) + sup(o.id, "Supervisor B", f)) / 2);
    const pred: number[] = new Array(ok.length);
    for (let k = 0; k < 10; k++) {
      const tr_ = ok.map((_, i) => i).filter((i) => i % 10 !== k), te = ok.map((_, i) => i).filter((i) => i % 10 === k);
      const m = ridge(tr_.map((i) => X[i]), tr_.map((i) => y[i]));
      for (const i of te) pred[i] = Math.min(5, Math.max(1, Math.round(m.predict(X[i]))));
    }
    const A = ok.map((o) => sup(o.id, "Supervisor A", f)), B = ok.map((o) => sup(o.id, "Supervisor B", f));
    const raw = ok.map((o) => (o.a.score as any)[f] as number);
    const full = ridge(X, y);
    out[f] = { raw_llm: { vs_A: agree(raw, A), vs_B: agree(raw, B) }, calibrated_cv: { vs_A: agree(pred, A), vs_B: agree(pred, B), vs_mean_AB_pearson_r: corr(pred, y) }, A_vs_B: agree(A, B), model: { intercept: r3(full.intercept), mean: full.mu.map(r3), sd: full.sd.map(r3), weights: full.w.map(r3) } };
  }
  writeFileSync("src/data/calibration.json", JSON.stringify(out, null, 1));
  for (const f of ["overall_1_to_5", "empathy_1_to_5", "partnership_1_to_5"]) console.log(f, JSON.stringify({ raw: out[f].raw_llm, cal: out[f].calibrated_cv, ab: out[f].A_vs_B }));
})();
