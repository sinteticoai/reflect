import { writeFileSync } from "fs";
import { MODEL_FAST, mitiMetrics, type Analysis, type Line, type LineTag } from "../src/lib/mi";
import { csv, groupBy, analyzeCached, pool, sample, kappa, acc, topErrors } from "./common";

const CONC = 10;
const CHUNK = 80;
const r1 = (x: number) => Math.round(x * 10) / 10;
const r3 = (x: number) => Math.round(x * 1000) / 1000;

// Tag a long transcript in windows, keeping original line numbers.
async function tagChunks(key: string, lines: Line[]): Promise<{ tags: LineTag[]; parts: Analysis[] }> {
  const parts: Analysis[] = [];
  for (let i = 0; i < lines.length; i += CHUNK) {
    const a = await analyzeCached(`${key}_c${i / CHUNK}`, lines.slice(i, i + CHUNK), MODEL_FAST);
    if (a) parts.push(a);
  }
  return { tags: parts.flatMap((p) => p.tags), parts };
}
function corr(x: number[], y: number[]) {
  const n = x.length, mx = x.reduce((a, b) => a + b, 0) / n, my = y.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; }
  return r3(sxy / Math.sqrt(sxx * syy));
}
function agree(x: number[], y: number[]) {
  const n = x.length;
  return { n, exact_pct: r1((100 * x.filter((v, i) => v === y[i]).length) / n), within1_pct: r1((100 * x.filter((v, i) => Math.abs(v - y[i]) <= 1).length) / n), mae: r3(x.reduce((s, v, i) => s + Math.abs(v - y[i]), 0) / n), pearson_r: corr(x, y) };
}
function auc(pos: number[], neg: number[]) {
  let s = 0; for (const p of pos) for (const q of neg) s += p > q ? 1 : p === q ? 0.5 : 0;
  return r3(s / (pos.length * neg.length));
}

// ---------- a. AnnoMI ----------
const toMove = (m: string) => m === "open question" || m === "closed question" ? "question" : m === "simple reflection" || m === "complex reflection" ? "reflection" : m === "give information" || m === "persuade" ? "giving information or advice" : "other";
async function annomi() {
  const mi = csv("coaching_sessions_annomi.csv");
  const sessions = groupBy(mi, (r) => r.session_id);
  const toLines = (rows: any[]): Line[] => rows.map((r, i) => ({ line_number: i + 1, speaker: r.speaker === "counsellor" ? "coach" : "participant", text: r.text }));
  const tenIds = [...sessions.keys()].filter((k) => sessions.get(k)!.some((r) => r.expert_raters === "10"));
  const tenRes = await pool(tenIds, CONC, async (id) => ({ id, rows: sessions.get(id)!, ...(await tagChunks(`annomi_full_${id}`, toLines(sessions.get(id)!))) }));
  const move: [string, string][] = [], qt: [string, string][] = [], rt: [string, string][] = [], ct: [string, string][] = [];
  const detail: any[] = [];
  for (const s of tenRes) s.rows.forEach((r, i) => {
    if (r.expert_raters !== "10") return;
    const t = s.tags.find((x) => x.line_number === i + 1);
    if (r.speaker === "counsellor" && r.counsellor_move) {
      const p = t?.coach_move ?? "missing";
      move.push([r.counsellor_move, toMove(p)]);
      if (r.counsellor_move === "question" && r.question_type) qt.push([r.question_type, p.startsWith("open") ? "open" : p.startsWith("closed") ? "closed" : "not a question"]);
      if (r.counsellor_move === "reflection" && r.reflection_type) rt.push([r.reflection_type, p.startsWith("complex") ? "complex" : p.startsWith("simple") ? "simple" : "not a reflection"]);
      detail.push({ session: s.id, line: i, text: r.text, truth: r.counsellor_move, pred: p, agreement: r.expert_agreement_pct });
    }
    if (r.speaker === "client" && r.client_talk) ct.push([r.client_talk, t?.participant_talk ?? "missing"]);
  });
  const ten = mi.filter((r) => r.expert_raters === "10" && r.expert_agreement_pct);
  const humanAgree = r1(ten.reduce((s, r) => s + +r.expert_agreement_pct, 0) / ten.length);
  writeFileSync("scripts/out/annomi_benchmark_lines.json", JSON.stringify(detail, null, 1));

  // Session level: all low + equal random high, first 160 lines.
  const low = [...sessions.values()].filter((s) => s[0].session_quality === "low");
  const high = sample([...sessions.values()].filter((s) => s[0].session_quality === "high"), low.length);
  const sess = await pool([...low, ...high], CONC, async (rows) => {
    const lines = toLines(rows.slice(0, 160));
    const { tags, parts } = await tagChunks(`annomi_sess_${rows[0].session_id}`, lines);
    const m = mitiMetrics(lines, tags);
    const overall = parts.length ? parts.reduce((s, p) => s + p.score.overall_1_to_5, 0) / parts.length : NaN;
    return { id: rows[0].session_id, quality: rows[0].session_quality, overall, persuade_per_10: (10 * m.mi_non_adherent) / Math.max(1, lines.filter((l) => l.speaker === "coach").length), ...m };
  });
  writeFileSync("scripts/out/annomi_sessions.json", JSON.stringify(sess, null, 1));
  const H = sess.filter((s) => s.quality === "high" && !isNaN(s.overall)), L = sess.filter((s) => s.quality === "low" && !isNaN(s.overall));
  const mean = (xs: number[]) => r1(xs.reduce((a, b) => a + b, 0) / xs.length);
  return {
    description: "AnnoMI real counselling sessions. Line labels compared with the majority label of 10 MI experts.",
    n_sessions: tenIds.length,
    counsellor_move: { n: move.length, accuracy_pct: acc(move), kappa: kappa(move), top_errors: topErrors(move) },
    question_type: { n: qt.length, accuracy_pct: acc(qt), kappa: kappa(qt) },
    reflection_type: { n: rt.length, accuracy_pct: acc(rt), kappa: kappa(rt) },
    client_talk: { n: ct.length, accuracy_pct: acc(ct), kappa: kappa(ct), top_errors: topErrors(ct) },
    human_expert_agreement_pct: humanAgree,
    human_expert_agreement_note: "Mean share of the 10 experts who chose the majority label on these lines (README states about 84%).",
    session_quality: {
      description: "Can Reflect tell good MI practice from poor MI practice? All low-quality sessions vs an equal random sample of high-quality sessions (first 160 lines each).",
      n_high: H.length, n_low: L.length,
      auc_overall_score: auc(H.map((s) => s.overall), L.map((s) => s.overall)),
      mean_overall_high: mean(H.map((s) => s.overall)), mean_overall_low: mean(L.map((s) => s.overall)),
      auc_reflection_to_question: auc(H.map((s) => s.reflection_to_question ?? 0), L.map((s) => s.reflection_to_question ?? 0)),
      auc_low_persuade_rate: auc(H.map((s) => -s.persuade_per_10), L.map((s) => -s.persuade_per_10)),
      mean_reflection_to_question_high: mean(H.map((s) => s.reflection_to_question ?? 0)), mean_reflection_to_question_low: mean(L.map((s) => s.reflection_to_question ?? 0)),
    },
  };
}

// ---------- b + c. Synthetic ----------
async function synthetic() {
  const tr = csv("synthetic_data/synthetic_call_transcripts.csv");
  const byCall = groupBy(tr, (r) => r.call_id);
  const calls = csv("synthetic_data/synthetic_calls.csv");
  const meta = new Map(calls.map((c) => [c.call_id, c]));
  const ratings = groupBy(csv("synthetic_data/synthetic_supervisor_ratings.csv"), (r) => r.call_id);
  const rated = [...ratings.keys()];
  const en = sample(rated.filter((id) => meta.get(id)!.language === "English"), 30, 11);
  const es = sample(rated.filter((id) => meta.get(id)!.language === "Spanish"), 30, 13);
  const safetyIds = [...new Set(tr.filter((r) => r.needs_human === "yes").map((r) => r.call_id))];
  const ids = [...new Set([...en, ...es, ...safetyIds])];
  const res = await pool(ids, CONC, async (id) => {
    const rows = byCall.get(id)!;
    const lines: Line[] = rows.map((r) => ({ line_number: +r.line_number, speaker: r.speaker as any, text: r.text }));
    return { id, rows, a: await analyzeCached(`syn_${id}`, lines, MODEL_FAST) };
  });
  const ok = res.filter((r) => r.a);
  const mv: [string, string][] = [], pt: [string, string][] = [], mvBy: Record<string, [string, string][]> = { English: [], Spanish: [] };
  let tp = 0, fn = 0, fp = 0, callTp = 0, callFn = 0, callFp = 0, callTn = 0;
  const missed: any[] = [];
  for (const { id, rows, a } of ok) {
    const tag = new Map(a!.tags.map((t) => [t.line_number, t]));
    let truthCall = false;
    for (const r of rows) {
      const t = tag.get(+r.line_number);
      if (r.coach_move) { const p: [string, string] = [r.coach_move, t?.coach_move ?? "missing"]; mv.push(p); mvBy[meta.get(id)!.language]?.push(p); }
      if (r.participant_talk) pt.push([r.participant_talk, t?.participant_talk ?? "missing"]);
      if (r.needs_human) {
        const truth = r.needs_human === "yes", pred = !!t?.needs_human;
        if (truth) truthCall = true;
        if (truth && pred) tp++; else if (truth) { fn++; missed.push({ id, line: r.line_number, text: r.text }); } else if (pred) fp++;
      }
    }
    const predCall = a!.flags.some((f) => f.severity === "urgent") || a!.tags.some((t) => t.needs_human);
    if (truthCall && predCall) callTp++; else if (truthCall) callFn++; else if (predCall) callFp++; else callTn++;
  }
  writeFileSync("scripts/out/synthetic_preds.json", JSON.stringify(ok.map((r) => ({ id: r.id, a: r.a })), null, 0));

  // c. supervisor agreement on rated calls we analysed
  const rc = ok.filter((r) => ratings.has(r.id) && ratings.get(r.id)!.length >= 2);
  const field = (f: string) => {
    const A = rc.map((r) => +ratings.get(r.id)!.find((x) => x.rater === "Supervisor A")![f]);
    const B = rc.map((r) => +ratings.get(r.id)!.find((x) => x.rater === "Supervisor B")![f]);
    const key = f as "overall_1_to_5";
    const R = rc.map((r) => (r.a!.score as any)[key] as number);
    const avg = A.map((v, i) => (v + B[i]) / 2);
    return { reflect_vs_A: agree(R, A), reflect_vs_B: agree(R, B), A_vs_B: agree(A, B), reflect_vs_mean_AB_pearson_r: corr(R, avg) };
  };
  const CK = ["set_agenda", "checked_feelings", "reviewed_last_goal", "set_new_goal", "planned_for_barriers", "summarized", "set_next_contact"];
  const checklist: Record<string, any> = {};
  for (const k of CK) {
    let ra = 0, rb = 0, ab = 0;
    for (const r of rc) {
      const rs = ratings.get(r.id)!; const A = rs.find((x) => x.rater === "Supervisor A")![k] === "yes", B = rs.find((x) => x.rater === "Supervisor B")![k] === "yes";
      const R = !!(r.a!.score.checklist as any)?.[k];
      ra += +(R === A); rb += +(R === B); ab += +(A === B);
    }
    checklist[k] = { reflect_vs_A_pct: r1((100 * ra) / rc.length), reflect_vs_B_pct: r1((100 * rb) / rc.length), A_vs_B_pct: r1((100 * ab) / rc.length) };
  }
  const meanOf = (o: Record<string, any>, k: string) => r1(Object.values(o).reduce((s: number, v: any) => s + v[k], 0) / Object.keys(o).length);
  return {
    labelled_calls: {
      description: "Synthetic Sylvester coaching calls (English and Spanish) with supervisor line labels, plus every call that contains a must-act-today line.",
      n_calls: ok.length, n_english: ok.filter((r) => meta.get(r.id)!.language === "English").length, n_spanish: ok.filter((r) => meta.get(r.id)!.language === "Spanish").length,
      coach_move: { n: mv.length, accuracy_pct: acc(mv), kappa: kappa(mv), accuracy_english_pct: acc(mvBy.English), accuracy_spanish_pct: acc(mvBy.Spanish), top_errors: topErrors(mv) },
      participant_talk: { n: pt.length, accuracy_pct: acc(pt), kappa: kappa(pt), top_errors: topErrors(pt) },
      needs_human_lines: { truth_yes: tp + fn, caught: tp, missed: fn, false_alarms: fp, recall_pct: r1((100 * tp) / Math.max(1, tp + fn)), precision_pct: r1((100 * tp) / Math.max(1, tp + fp)), missed_examples: missed.slice(0, 5) },
      needs_human_calls: { calls_with_issue: callTp + callFn, caught: callTp, missed: callFn, false_alarm_calls: callFp, clean_calls_correct: callTn, recall_pct: r1((100 * callTp) / Math.max(1, callTp + callFn)), precision_pct: r1((100 * callTp) / Math.max(1, callTp + callFp)) },
    },
    supervisor_agreement: {
      description: "Reflect's call scores vs two human supervisors who rated the same calls. A vs B shows how much humans agree with each other.",
      n_calls: rc.length,
      overall_1_to_5: field("overall_1_to_5"), empathy_1_to_5: field("empathy_1_to_5"), partnership_1_to_5: field("partnership_1_to_5"),
      checklist, checklist_mean: { reflect_vs_A_pct: meanOf(checklist, "reflect_vs_A_pct"), reflect_vs_B_pct: meanOf(checklist, "reflect_vs_B_pct"), A_vs_B_pct: meanOf(checklist, "A_vs_B_pct") },
    },
  };
}

// ---------- d. texts ----------
async function texts() {
  const t = csv("synthetic_data/synthetic_text_messages.csv").filter((r) => r.labelled === "yes" && r.sender === "participant");
  const yes = t.filter((r) => r.needs_human === "yes");
  const no = sample(t.filter((r) => r.needs_human === "no"), 120, 5);
  const items = [...yes, ...no];
  const chunks: any[][] = []; for (let i = 0; i < items.length; i += 40) chunks.push(sample(items, items.length, 3).slice(i, i + 40));
  const all = sample(items, items.length, 3);
  const res = await pool(chunks.map((_, i) => all.slice(i * 40, i * 40 + 40)), CONC, async (rows, ci) => {
    const lines: Line[] = rows.map((r, i) => ({ line_number: i + 1, speaker: "participant", text: r.text }));
    const a = await analyzeCached(`texts_${ci}`, lines, MODEL_FAST);
    return rows.map((r, i) => ({ truth: r.needs_human === "yes", pred: !!a?.tags.find((x) => x.line_number === i + 1)?.needs_human, text: r.text, intent: r.intent }));
  });
  const flat = res.flat();
  const tp = flat.filter((x) => x.truth && x.pred).length, fn = flat.filter((x) => x.truth && !x.pred).length, fp = flat.filter((x) => !x.truth && x.pred).length;
  return { description: "Participant text messages (independent messages, batched 40 per request). All 'needs a person today' texts plus 120 random ordinary texts.", n: flat.length, truth_yes: tp + fn, caught: tp, missed: fn, false_alarms: fp, recall_pct: r1((100 * tp) / Math.max(1, tp + fn)), precision_pct: r1((100 * tp) / Math.max(1, tp + fp)), false_alarm_examples: flat.filter((x) => !x.truth && x.pred).slice(0, 5).map((x) => ({ text: x.text, intent: x.intent })), missed_examples: flat.filter((x) => x.truth && !x.pred).map((x) => x.text) };
}

(async () => {
  const t0 = Date.now();
  const [a, s, d] = await Promise.all([annomi(), synthetic(), texts()]);
  const out = { status: "ok", generated_at: new Date().toISOString(), models: { line_tagging_and_scoring: MODEL_FAST }, annomi_benchmark: a, synthetic: s.labelled_calls, supervisor_agreement: s.supervisor_agreement, text_messages: d, headline: [] as string[] };
  writeFileSync("scripts/out/validation_raw.json", JSON.stringify(out, null, 1));
  writeFileSync("src/data/validation.json", JSON.stringify(out, null, 1));
  console.log("secs", (Date.now() - t0) / 1000);
  console.log(JSON.stringify(out, (k, v) => (k.endsWith("examples") || k === "top_errors" ? undefined : v), 1));
})();
