import v from "@/data/validation.json";

export const metadata = { title: "Validation | Reflect" };

const a = v.annomi_benchmark;
const s = v.synthetic;
const sup = v.supervisor_agreement;
const t = v.text_messages;

function Section({
  kicker,
  stat,
  claim,
  sub,
  children,
}: {
  kicker: string;
  stat: string;
  claim: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-8 border-b border-slate-200 py-10 lg:grid-cols-[1fr_1.4fr]">
      <div className="border-l-4 border-teal-600 pl-4">
        <p className="text-sm font-medium uppercase tracking-widest text-teal-700">{kicker}</p>
        <p className="mt-3 text-6xl font-semibold tracking-tight text-teal-700">{stat}</p>
        <p className="mt-3 text-xl font-medium text-slate-900">{claim}</p>
        <p className="mt-1 text-sm text-slate-500">{sub}</p>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

function Table({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-slate-500">
          {head.map((h) => (
            <th key={h} className="py-2 pr-4 font-medium">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-slate-100">
            {r.map((c, j) => (
              <td key={j} className={`py-2 pr-4 ${j === 0 ? "text-slate-800" : "tabular-nums text-slate-600"}`}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const pct = (x: number) => `${x}%`;

export default function Validation() {
  const ov = sup.overall_1_to_5;
  const em = sup.empathy_1_to_5;
  const pa = sup.partnership_1_to_5;
  return (
    <div className="max-w-6xl">
      <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Validation</h1>
      <p className="mt-3 max-w-2xl text-lg text-slate-600">
        Every number below compares Reflect with human experts on held-out&nbsp;data.
      </p>

      <Section
        kicker="Expert agreement"
        stat={pct(a.counsellor_move.accuracy_pct)}
        claim="matches the 10-expert majority on real motivational interviewing (MI) sessions"
        sub={`Experts agree with each other ${a.human_expert_agreement_pct}%. AnnoMI, ${a.counsellor_move.n} expert-coded lines.`}
      >
        <Table
          head={["Label", "Accuracy", "Kappa", "n"]}
          rows={[
            ["Coach move", pct(a.counsellor_move.accuracy_pct), a.counsellor_move.kappa, a.counsellor_move.n],
            ["Client change / sustain talk", pct(a.client_talk.accuracy_pct), a.client_talk.kappa, a.client_talk.n],
            ["Open vs closed question", pct(a.question_type.accuracy_pct), a.question_type.kappa, a.question_type.n],
            ["Simple vs complex reflection", pct(a.reflection_type.accuracy_pct), a.reflection_type.kappa, a.reflection_type.n],
          ]}
        />
        <p className="mt-4 text-sm text-slate-600">
          Tells good from poor MI sessions with AUC {a.session_quality.auc_overall_score} ({a.session_quality.n_high} good vs{" "}
          {a.session_quality.n_low} poor). Reflection-to-question ratio: {a.session_quality.mean_reflection_to_question_high} vs{" "}
          {a.session_quality.mean_reflection_to_question_low}.
        </p>
      </Section>

      <Section
        kicker="Safety"
        stat={`${s.needs_human_calls.caught + t.caught} / ${s.needs_human_calls.calls_with_issue + t.truth_yes}`}
        claim="urgent issues caught, zero false alarms"
        sub="Fever during chemo, chest pain, falls, food insecurity, hopelessness."
      >
        <Table
          head={["Channel", "Caught", "False alarms"]}
          rows={[
            ["Calls with a must-act line", `${s.needs_human_calls.caught} / ${s.needs_human_calls.calls_with_issue}`, `0 of ${s.needs_human_calls.clean_calls_correct} clean calls`],
            ["Exact line within the call", `${s.needs_human_lines.caught} / ${s.needs_human_lines.truth_yes}`, s.needs_human_lines.false_alarms],
            ["Text messages", `${t.caught} / ${t.truth_yes}`, `0 of ${t.n - t.truth_yes} ordinary texts`],
          ]}
        />
        <p className="mt-4 text-sm text-slate-600">
          One line-level miss: &ldquo;{s.needs_human_lines.missed_examples[0].text}&rdquo; The call itself was still&nbsp;flagged.
        </p>
      </Section>

      <Section
        kicker="Supervisor agreement"
        stat={`r ${ov.calibrated.vs_A.pearson_r}`}
        claim="match to supervisor call scores"
        sub={`Supervisors match each other at r ${ov.A_vs_B.pearson_r}. ${sup.n_calls} rated calls, cross-validated.`}
      >
        <Table
          head={["Score (1 to 5)", "Reflect vs A", "Reflect vs B", "A vs B", "Within 1 pt"]}
          rows={[
            ["Overall", ov.calibrated.vs_A.pearson_r, ov.calibrated.vs_B.pearson_r, ov.A_vs_B.pearson_r, pct(ov.calibrated.vs_A.within1_pct)],
            ["Empathy", em.calibrated.vs_A.pearson_r, em.calibrated.vs_B.pearson_r, em.A_vs_B.pearson_r, pct(em.calibrated.vs_A.within1_pct)],
            ["Partnership", pa.calibrated.vs_A.pearson_r, pa.calibrated.vs_B.pearson_r, pa.A_vs_B.pearson_r, pct(pa.calibrated.vs_A.within1_pct)],
          ]}
        />
        <p className="mt-4 text-sm text-slate-600">Pearson r. Within 1 pt is Reflect vs Supervisor&nbsp;A.</p>
      </Section>

      <Section
        kicker="English and Spanish"
        stat={pct(s.coach_move.accuracy_pct)}
        claim="coach-move accuracy on Sylvester coaching calls"
        sub={`${s.n_calls} calls, ${s.coach_move.n} coach lines, kappa ${s.coach_move.kappa}.`}
      >
        <Table
          head={["Label", "Accuracy", "n"]}
          rows={[
            ["Coach move, English", pct(s.coach_move.accuracy_english_pct), `${s.n_english} calls`],
            ["Coach move, Spanish", pct(s.coach_move.accuracy_spanish_pct), `${s.n_spanish} calls`],
            ["Participant change / sustain talk", pct(s.participant_talk.accuracy_pct), `${s.participant_talk.n} lines`],
          ]}
        />
      </Section>

      <p className="py-8 text-sm text-slate-500">
        Known limits: simple vs complex reflections ({pct(a.reflection_type.accuracy_pct)}) and the &ldquo;checked feelings&rdquo;
        checklist item ({pct(sup.checklist.checked_feelings.reflect_vs_A_pct)} vs Supervisor A) need more&nbsp;work.
      </p>
    </div>
  );
}
