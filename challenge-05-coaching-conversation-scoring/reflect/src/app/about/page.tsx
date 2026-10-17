export const metadata = { title: "About | Reflect" };

const BLOCKS = [
  ["Why", "Coaching programs record thousands of calls. Supervisors review a handful. Reflect reviews every one."],
  ["How", "Claude tags each line with its motivational interviewing move, scores the coach on the supervisor's rubric, and flags what needs a person today."],
  ["Data", "AnnoMI (Wu et al., 2022), UIC coaching texts (Gupta et al., 2020), Sylvester Crane Lab synthetic program."],
];

export default function About() {
  return (
    <article className="max-w-2xl py-10">
      <h1 className="text-4xl font-semibold tracking-tight text-slate-900">About Reflect</h1>
      <dl className="mt-10 space-y-8">
        {BLOCKS.map(([k, v]) => (
          <div key={k}>
            <dt className="text-sm font-medium uppercase tracking-widest text-teal-700">{k}</dt>
            <dd className="mt-2 text-xl leading-relaxed text-slate-700">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-12 text-sm text-slate-500">
        eMerge AI Hackathon, Miami, October 17, 2026. Healthcare track, Challenge&nbsp;5. Built by Sintetico with&nbsp;Claude.
      </p>
    </article>
  );
}
