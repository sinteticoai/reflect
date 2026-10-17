import validationData from "@/data/validation.json";
import { Loader2 } from "lucide-react";

export const metadata = { title: "Validation | Reflect" };

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };
type Obj = { [k: string]: Json };

const isObj = (v: Json | undefined): v is Obj => !!v && typeof v === "object" && !Array.isArray(v);

function humanize(k: string) {
  return k.replace(/_/g, " ").replace(/\b(pct)\b/i, "%").replace(/^\w/, (c) => c.toUpperCase());
}

function fmt(v: Json): string {
  if (v == null) return "-";
  if (typeof v === "number") return Number.isInteger(v) ? v.toLocaleString() : (Math.round(v * 1000) / 1000).toString();
  if (typeof v === "boolean") return v ? "yes" : "no";
  if (typeof v === "string") return v;
  return JSON.stringify(v);
}

function Headline({ item }: { item: Obj }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-sm text-slate-500">{fmt(item.label ?? "")}</div>
      <div className="mt-1 text-3xl font-semibold text-teal-800">{fmt(item.value ?? null)}</div>
      {item.reference != null && (
        <div className="mt-1 text-xs text-slate-500">Human experts: {fmt(item.reference)}</div>
      )}
      {item.note != null && <p className="mt-2 text-xs text-slate-600">{fmt(item.note)}</p>}
    </div>
  );
}

function Table({ rows }: { rows: Obj[] }) {
  const cols = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            {cols.map((c) => (
              <th key={c} className="px-3 py-2 font-medium">
                {humanize(c)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-slate-100 last:border-0">
              {cols.map((c) => (
                <td key={c} className="px-3 py-2 text-slate-800">
                  {fmt(r[c] ?? null)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Value({ v }: { v: Json }) {
  if (Array.isArray(v)) {
    if (v.length && v.every(isObj)) return <Table rows={v as Obj[]} />;
    return <p className="text-sm text-slate-700">{v.map(fmt).join(", ")}</p>;
  }
  if (isObj(v)) {
    const entries = Object.entries(v);
    const simple = entries.filter(([, x]) => !isObj(x) && !Array.isArray(x));
    const nested = entries.filter(([, x]) => isObj(x) || Array.isArray(x));
    return (
      <div className="space-y-3">
        {simple.length > 0 && (
          <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            {simple.map(([k, x]) => (
              <div key={k} className="flex justify-between gap-3 border-b border-slate-100 py-1">
                <dt className="text-slate-500">{humanize(k)}</dt>
                <dd className="text-right font-medium text-slate-800">{fmt(x)}</dd>
              </div>
            ))}
          </dl>
        )}
        {nested.map(([k, x]) => (
          <div key={k}>
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{humanize(k)}</h4>
            <Value v={x} />
          </div>
        ))}
      </div>
    );
  }
  return <p className="text-sm text-slate-700">{fmt(v)}</p>;
}

function Section({ title, body }: { title: string; body: Json }) {
  const o = isObj(body) ? body : null;
  const desc = o && typeof o.description === "string" ? o.description : null;
  const rest: Json = o ? Object.fromEntries(Object.entries(o).filter(([k]) => k !== "description" && k !== "title")) : body;
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {desc && <p className="mt-1 text-sm text-slate-600">{desc}</p>}
      <div className="mt-4">
        <Value v={rest} />
      </div>
    </section>
  );
}

export default function ValidationPage() {
  const data = validationData as unknown as Obj;
  const pending = data.status === "pending";
  const headline = Array.isArray(data.headline) ? (data.headline.filter(isObj) as Obj[]) : [];
  const claims = Array.isArray(data.headline) ? (data.headline.filter((h) => typeof h === "string") as string[]) : [];
  const sections = Array.isArray(data.sections) ? (data.sections.filter(isObj) as Obj[]) : null;
  const other = Object.entries(data).filter(
    ([k]) => !["status", "headline", "sections", "title", "summary", "generated_at", "model"].includes(k),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Does Reflect label like an expert?</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          We checked Reflect against expert motivational interviewing labels on real counselling sessions (AnnoMI),
          against the labelled part of the Sylvester synthetic coaching program, and against two human supervisors.
          On the 428 AnnoMI lines rated by ten experts, experts agree with each other about 84% of the time. That is
          the bar.
        </p>
        {typeof data.summary === "string" && <p className="mt-2 max-w-3xl text-sm text-slate-800">{data.summary}</p>}
        {(data.model != null || data.generated_at != null) && (
          <p className="mt-1 text-xs text-slate-500">
            {data.model != null && <>Model: {fmt(data.model)} </>}
            {data.generated_at != null && <>Run: {fmt(data.generated_at)}</>}
          </p>
        )}
      </div>

      {pending ? (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
          <Loader2 className="animate-spin" size={18} /> Validation running. Results appear here when the run finishes.
        </div>
      ) : (
        <>
          {headline.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {headline.map((h, i) => (
                <Headline key={i} item={h} />
              ))}
            </div>
          )}
          {claims.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {claims.map((c, i) => (
                <div key={i} className="rounded-xl border border-teal-200 bg-teal-50/60 p-4 text-sm leading-relaxed text-slate-800">
                  {c}
                </div>
              ))}
            </div>
          )}
          {sections
            ? sections.map((s, i) => <Section key={i} title={fmt(s.title ?? `Section ${i + 1}`)} body={s} />)
            : other.map(([k, v]) => <Section key={k} title={humanize(k)} body={v} />)}
        </>
      )}
    </div>
  );
}
