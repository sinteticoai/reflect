"use client";
import { AlertTriangle, Check, X } from "lucide-react";
import type { Analysis, Line } from "@/lib/mi";
import { tagStyle, type LabelMap } from "./tags";

export function Transcript({
  lines,
  analysis,
  labels,
  highlight,
}: {
  lines: Line[];
  analysis: Analysis | null;
  labels: LabelMap | null;
  highlight: number | null;
}) {
  const tags = new Map((analysis?.tags ?? []).map((t) => [t.line_number, t]));
  const flagged = new Map((analysis?.flags ?? []).map((f) => [f.line_number, f]));
  if (!lines.length)
    return <p className="p-6 text-sm text-slate-500">No transcript yet. Pick a demo call, paste a transcript, or go live.</p>;
  return (
    <ol className="divide-y divide-slate-100">
      {lines.map((l) => {
        const t = tags.get(l.line_number);
        const label = l.speaker === "coach" ? t?.coach_move : t?.participant_talk;
        const truth = labels?.get(l.line_number);
        const truthLabel = l.speaker === "coach" ? truth?.coach_move : truth?.participant_talk;
        const f = flagged.get(l.line_number);
        const urgent = t?.needs_human || f?.severity === "urgent";
        return (
          <li
            key={l.line_number}
            id={`line-${l.line_number}`}
            className={`flex gap-3 px-4 py-2.5 transition-colors ${
              highlight === l.line_number ? "bg-yellow-50" : urgent ? "bg-rose-50/60" : ""
            }`}
          >
            <span className="w-6 shrink-0 pt-0.5 text-right font-mono text-xs text-slate-400">{l.line_number}</span>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-1.5">
                <span
                  className={`text-xs font-semibold uppercase tracking-wide ${
                    l.speaker === "coach" ? "text-teal-700" : "text-slate-500"
                  }`}
                >
                  {l.speaker}
                </span>
                {label && (
                  <span className={`rounded-full px-2 py-0.5 text-xs ring-1 ring-inset ${tagStyle(label)}`}>{label}</span>
                )}
                {truthLabel && label && (
                  <span
                    title={`Expert label: ${truthLabel}`}
                    className={`inline-flex items-center gap-0.5 text-xs ${
                      truthLabel === label ? "text-emerald-600" : "text-rose-500"
                    }`}
                  >
                    {truthLabel === label ? <Check size={12} /> : <X size={12} />}
                    {truthLabel !== label && <span className="text-slate-400">expert: {truthLabel}</span>}
                  </span>
                )}
                {urgent && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-2 py-0.5 text-xs font-medium text-white">
                    <AlertTriangle size={11} /> needs a person today
                  </span>
                )}
                {f && !urgent && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">review</span>
                )}
              </div>
              <p className="text-sm leading-relaxed text-slate-800">{l.text}</p>
              {t?.note && <p className="mt-0.5 text-xs text-slate-500">{t.note}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
