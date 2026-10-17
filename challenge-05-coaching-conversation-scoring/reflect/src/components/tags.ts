import type { LineTag } from "@/lib/mi";

export function tagStyle(label?: string): string {
  switch (label) {
    case "affirm":
    case "emphasize autonomy":
    case "seek collaboration":
    case "ask permission":
      return "bg-emerald-50 text-emerald-800 ring-emerald-200";
    case "simple reflection":
    case "complex reflection":
      return "bg-sky-50 text-sky-800 ring-sky-200";
    case "open question":
    case "closed question":
      return "bg-indigo-50 text-indigo-800 ring-indigo-200";
    case "persuade":
      return "bg-rose-50 text-rose-800 ring-rose-200";
    case "give information":
      return "bg-violet-50 text-violet-800 ring-violet-200";
    case "change":
      return "bg-emerald-50 text-emerald-800 ring-emerald-200";
    case "sustain":
      return "bg-amber-50 text-amber-800 ring-amber-200";
    default:
      return "bg-slate-50 text-slate-600 ring-slate-200";
  }
}

export type LabelMap = Map<number, LineTag>;

// Ground-truth labels may arrive as an array of tags or a record keyed by line number.
export function toLabelMap(labels: unknown): LabelMap | null {
  if (!labels) return null;
  const m: LabelMap = new Map();
  const add = (t: unknown, key?: string) => {
    if (!t || typeof t !== "object") return;
    const tag = t as LineTag;
    const n = Number(tag.line_number ?? key);
    if (!Number.isFinite(n)) return;
    const nh = (tag as { needs_human?: unknown }).needs_human;
    m.set(n, { ...tag, line_number: n, needs_human: nh === true || nh === "yes" });
  };
  if (Array.isArray(labels)) labels.forEach((t) => add(t));
  else if (typeof labels === "object") Object.entries(labels as Record<string, unknown>).forEach(([k, v]) => add(v, k));
  return m.size ? m : null;
}
