"use client";
import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import type { Analysis, Line } from "@/lib/mi";
import { Transcript } from "@/components/Transcript";
import { Scorecard } from "@/components/Scorecard";

interface QueueItem {
  id: string;
  date: string;
  language: string;
  topic: string;
  coach: string;
  participant: string;
  urgent: number;
  urgent_reason: string;
  review: number;
  overall: number | null;
  summary: string;
}

interface CallDetail {
  id: string;
  title: string;
  lines: Line[];
  analysis: Analysis;
}

export default function Queue() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [open, setOpen] = useState<CallDetail | null>(null);
  const [highlight, setHighlight] = useState<number | null>(null);

  useEffect(() => {
    fetch("/queue/index.json")
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  function openCall(id: string) {
    fetch(`/queue/${id}.json`)
      .then((r) => r.json())
      .then((d: CallDetail) => {
        setOpen(d);
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
  }

  function jump(n: number) {
    setHighlight(n);
    document.getElementById(`line-${n}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => setHighlight(null), 2000);
  }

  const urgent = items.filter((i) => i.urgent > 0).length;

  if (open)
    return (
      <div className="space-y-4">
        <button onClick={() => setOpen(null)} className="text-sm font-medium text-teal-700 hover:underline">
          &larr; Back to queue
        </button>
        <h1 className="text-xl font-semibold text-slate-900">{open.title}</h1>
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="max-h-[75vh] overflow-y-auto">
              <Transcript lines={open.lines} analysis={open.analysis} labels={null} highlight={highlight} />
            </div>
          </section>
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50 lg:max-h-[75vh] lg:overflow-y-auto">
            <Scorecard analysis={open.analysis} lines={open.lines} onJump={jump} />
          </section>
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Supervisor queue</h1>
        <p className="mt-2 text-lg text-slate-600">
          {items.length} calls reviewed. <span className="font-semibold text-rose-600">{urgent} need a person today.</span>{" "}
          Worst first.
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Call</th>
              <th className="hidden px-4 py-2 font-medium md:table-cell">Why</th>
              <th className="px-4 py-2 font-medium">Coach score</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr
                key={i.id}
                onClick={() => openCall(i.id)}
                className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
              >
                <td className="px-4 py-3">
                  {i.urgent > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-2 py-0.5 text-xs font-medium text-white">
                      <AlertTriangle size={12} /> Urgent
                    </span>
                  ) : i.review > 0 ? (
                    <span className="rounded-full border border-amber-300 px-2 py-0.5 text-xs text-amber-700">Review</span>
                  ) : (
                    <span className="text-xs text-slate-400">OK</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">
                    {i.coach} with {i.participant}
                  </div>
                  <div className="text-xs text-slate-500">
                    {i.date} · {i.language} · {i.topic}
                  </div>
                </td>
                <td className="hidden max-w-xl px-4 py-3 text-slate-600 md:table-cell">
                  <span className="line-clamp-2">{i.urgent_reason || i.summary}</span>
                </td>
                <td className="px-4 py-3 tabular-nums text-slate-800">{i.overall ?? "-"} / 5</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
