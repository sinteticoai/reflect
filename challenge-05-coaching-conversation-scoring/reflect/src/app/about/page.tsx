export const metadata = { title: "About | Reflect" };

const BLOCKS = [
  ["Problem", "Coaching programs record thousands of calls. Supervisors review a handful, and safety cues go unheard."],
  ["Solution", "tags every line, scores the coach, and flags what needs a person today. Live or recorded, English or Spanish."],
  ["Proof", "Matches MI experts 83% of the time (experts agree with each other 84%). Caught 37 of 37 urgent safety issues."],
];

export default function About() {
  return (
    <article className="max-w-2xl py-10">
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
      <p className="mt-12 text-sm text-slate-500">
        Data: AnnoMI (Wu et al., 2022), UIC coaching texts (Gupta et al., 2020), Sylvester Crane Lab synthetic&nbsp;program.
        eMerge AI Hackathon, Miami, October 17, 2026. Healthcare track, Challenge&nbsp;5. Built by&nbsp;Sintetico.
      </p>
    </article>
  );
}
