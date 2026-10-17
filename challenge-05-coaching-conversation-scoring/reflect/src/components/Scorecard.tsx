"use client";
import { AlertTriangle, CheckCircle2, Circle, Flag as FlagIcon } from "lucide-react";
import type { Analysis, Line } from "@/lib/mi";
import { calibratedScores } from "@/data/calibrate";

const CHECK_LABELS: Record<string, string> = {
  set_agenda: "Set the agenda",
  checked_feelings: "Checked feelings",
  reviewed_last_goal: "Reviewed last goal",
  set_new_goal: "Set a new goal",
  planned_for_barriers: "Planned for barriers",
  summarized: "Summarized",
  set_next_contact: "Set next contact",
};

function Stars({ label, value, raw }: { label: string; value?: number; raw?: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-slate-900">{value ?? "-"}</span>
        <span className="text-xs text-slate-400">/ 5</span>
      </div>
      <div className="mt-1.5 flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${value && i <= value ? "bg-teal-600" : "bg-slate-200"}`} />
        ))}
      </div>
      {raw !== undefined && <div className="mt-1.5 text-[11px] text-slate-400">model raw {raw}</div>}
    </div>
  );
}

function Meter({
  label,
  value,
  fair,
  good,
  max,
  unit = "%",
}: {
  label: string;
  value: number | null;
  fair: number;
  good: number;
  max: number;
  unit?: string;
}) {
  const pct = value == null ? 0 : Math.min(100, (value / max) * 100);
  const color = value == null ? "bg-slate-300" : value >= good ? "bg-emerald-500" : value >= fair ? "bg-amber-400" : "bg-rose-400";
  const verdict = value == null ? "n/a" : value >= good ? "good" : value >= fair ? "fair" : "below fair";
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-slate-700">{label}</span>
        <span className="font-medium text-slate-900">
          {value == null ? "-" : `${value}${unit}`} <span className="text-xs font-normal text-slate-500">{verdict}</span>
        </span>
      </div>
      <div className="relative mt-1 h-2 rounded-full bg-slate-100">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
        <span className="absolute top-[-3px] h-3.5 w-px bg-slate-400" style={{ left: `${(fair / max) * 100}%` }} />
        <span className="absolute top-[-3px] h-3.5 w-px bg-slate-700" style={{ left: `${(good / max) * 100}%` }} />
      </div>
      <div className="mt-0.5 text-[11px] text-slate-400">
        MITI 4.2 fair {fair}
        {unit} / good {good}
        {unit}
      </div>
    </div>
  );
}

export function Scorecard({ analysis, lines, onJump }: { analysis: Analysis | null; lines: Line[]; onJump: (n: number) => void }) {
  if (!analysis) return <p className="p-6 text-sm text-slate-500">The supervisor review appears here.</p>;
  const { score, metrics, flags } = analysis;
  const sorted = [...(flags ?? [])].sort((a, b) =>
    a.severity === b.severity ? a.line_number - b.line_number : a.severity === "urgent" ? -1 : 1,
  );
  const ct = metrics.change_talk + metrics.sustain_talk;
  let cal: ReturnType<typeof calibratedScores> | null = null;
  try {
    if (score?.checklist && lines.length) cal = calibratedScores(lines, analysis);
  } catch {
    cal = null;
  }
  return (
    <div className="space-y-5 p-4">
      {sorted.some((f) => f.severity === "urgent") && (
        <div className="flex items-start gap-2 rounded-lg bg-rose-600 p-3 text-sm text-white">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold">Needs a person today</div>
            {sorted
              .filter((f) => f.severity === "urgent")
              .map((f, i) => (
                <button key={i} onClick={() => onJump(f.line_number)} className="block text-left underline-offset-2 hover:underline">
                  Line {f.line_number}: {f.reason}
                </button>
              ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <Stars label="Overall" value={cal?.overall_1_to_5 ?? score?.overall_1_to_5} raw={cal ? score?.overall_1_to_5 : undefined} />
        <Stars label="Empathy" value={cal?.empathy_1_to_5 ?? score?.empathy_1_to_5} raw={cal ? score?.empathy_1_to_5 : undefined} />
        <Stars label="Partnership" value={cal?.partnership_1_to_5 ?? score?.partnership_1_to_5} raw={cal ? score?.partnership_1_to_5 : undefined} />
      </div>
      {cal && <p className="-mt-3 text-[11px] text-slate-400">Scores calibrated to supervisor ratings (200 rated calls, cross-validated).</p>}

      {score?.summary && <p className="text-sm leading-relaxed text-slate-700">{score.summary}</p>}

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">MI skill (MITI 4.2)</h3>
        <div className="space-y-3">
          <Meter label="Open questions" value={metrics.open_question_pct} fair={50} good={70} max={100} />
          <Meter label="Complex reflections" value={metrics.complex_reflection_pct} fair={40} good={50} max={100} />
          <Meter label="Reflections per question" value={metrics.reflection_to_question} fair={1} good={2} max={3} unit="" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-md bg-emerald-50 px-3 py-2 text-emerald-800">MI-adherent moves: {metrics.mi_adherent}</div>
          <div className="rounded-md bg-rose-50 px-3 py-2 text-rose-800">Persuading: {metrics.mi_non_adherent}</div>
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Participant talk</h3>
        <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
          {ct > 0 && (
            <>
              <div className="bg-emerald-500" style={{ width: `${(metrics.change_talk / ct) * 100}%` }} />
              <div className="bg-amber-400" style={{ width: `${(metrics.sustain_talk / ct) * 100}%` }} />
            </>
          )}
        </div>
        <div className="mt-1 flex justify-between text-xs text-slate-600">
          <span>Change talk {metrics.change_talk}</span>
          <span>Sustain talk {metrics.sustain_talk}</span>
        </div>
      </section>

      {score?.checklist && (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Call structure</h3>
          <ul className="grid grid-cols-2 gap-1 text-sm">
            {Object.entries(CHECK_LABELS).map(([k, label]) => {
              const ok = score.checklist[k as keyof typeof score.checklist];
              return (
                <li key={k} className={`flex items-center gap-1.5 ${ok ? "text-slate-800" : "text-slate-400"}`}>
                  {ok ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Circle size={14} />}
                  {label}
                </li>
              );
            })}
          </ul>
          <p className="mt-1 text-xs text-slate-500">Safety issue handled: {score.safety_issue_handled ?? "n/a"}</p>
        </section>
      )}

      {sorted.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Flags for the supervisor</h3>
          <ul className="space-y-1.5">
            {sorted.map((f, i) => (
              <li key={i}>
                <button
                  onClick={() => onJump(f.line_number)}
                  className="flex w-full items-start gap-2 rounded-md border border-slate-200 bg-white p-2 text-left text-sm hover:border-teal-400"
                >
                  <FlagIcon size={14} className={`mt-0.5 shrink-0 ${f.severity === "urgent" ? "text-rose-600" : "text-amber-500"}`} />
                  <span>
                    <span className="font-medium text-slate-800">
                      Line {f.line_number} · {f.category}
                    </span>
                    <span className="block text-slate-600">{f.reason}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(score?.strengths?.length ?? 0) > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">What went well</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
            {score.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </section>
      )}
      {(score?.coaching_tips?.length ?? 0) > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Coaching tips</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
            {score.coaching_tips.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
