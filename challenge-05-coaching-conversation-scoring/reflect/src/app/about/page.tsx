import Link from "next/link";
import { Proof } from "@/components/Proof";

export const metadata = { title: "About | Reflect" };

const BLOCKS = [
  ["Problem", "Coaching programs record thousands of calls. Supervisors review a handful, and safety cues go unheard."],
  ["Solution", "tags every line, scores the coach, and flags what needs a person today. Live or recorded, English or Spanish."],
];

export default function About() {
  return (
    <article className="max-w-4xl py-10">
      <h1 className="text-4xl font-semibold tracking-tight text-slate-900">About <span className="text-teal-700">Reflect</span></h1>
      <dl className="mt-10 space-y-8">
        {BLOCKS.map(([k, v]) => (
          <div key={k}>
            <dt className="text-sm font-medium uppercase tracking-widest text-teal-700">{k}</dt>
            <dd className="mt-2 text-xl leading-relaxed text-slate-700">
              {k === "Solution" && <span className="font-semibold text-teal-700">Reflect </span>}
              {v}
            </dd>
          </div>
        ))}
      </dl>
      <section className="mt-12">
        <h2 className="text-sm font-medium uppercase tracking-widest text-teal-700">Proof</h2>
        <div className="mt-4">
          <Proof size="md" />
        </div>
        <p className="mt-4 text-sm text-slate-500">
          AnnoMI 10-expert lines, Sylvester synthetic program, 200 supervisor-rated calls.{" "}
          <Link href="/validation" className="underline">Details</Link>
        </p>
      </section>
      <p className="mt-12 text-sm text-slate-500">
        Data: AnnoMI (Wu et al., 2022), UIC coaching texts (Gupta et al., 2020), Sylvester Crane Lab synthetic&nbsp;program.
        eMerge AI Hackathon, Miami, October 17, 2026. Healthcare track, Challenge&nbsp;5. Built by&nbsp;Sintetico.
      </p>
    </article>
  );
}
