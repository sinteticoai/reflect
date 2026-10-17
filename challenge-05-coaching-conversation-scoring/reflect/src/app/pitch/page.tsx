import Link from "next/link";

export const metadata = { title: "Reflect | Pitch" };

function Slide({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex min-h-[calc(100vh-8rem)] snap-start flex-col justify-center border-b border-slate-200 py-12">
      {children}
    </section>
  );
}

const PROOF = [
  ["83%", "agreement with MI experts on real sessions", "Experts agree with each other 84%"],
  ["37 / 37", "urgent safety issues caught", "Zero false alarms"],
  ["r 0.74", "match to supervisor scores", "Supervisors match each other at 0.68"],
];

export default function Pitch() {
  return (
    <div className="h-[calc(100vh-5rem)] snap-y snap-mandatory overflow-y-auto">
      <Slide>
        <p className="text-sm font-medium uppercase tracking-widest text-teal-700">Sylvester Challenge 5</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-tight text-slate-900 sm:text-7xl">
          Every coaching call, reviewed.
        </h1>
        <p className="mt-6 max-w-2xl text-2xl text-slate-600">
          Programs record thousands of calls. Supervisors hear a&nbsp;handful.
        </p>
      </Slide>

      <Slide>
        <h2 className="text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl"><span className="text-teal-700">Reflect</span> listens and&nbsp;tells you:</h2>
        <ul className="mt-10 space-y-5 text-3xl text-slate-700">
          <li><span className="font-semibold text-teal-700">Tag</span> every line, like an MI&nbsp;expert</li>
          <li><span className="font-semibold text-teal-700">Score</span> the coach, like a&nbsp;supervisor</li>
          <li><span className="font-semibold text-rose-600">Flag</span> what needs a person&nbsp;today</li>
        </ul>
        <p className="mt-10 text-xl text-slate-500">Live or recorded. Spoken or texted. English or&nbsp;Spanish.</p>
      </Slide>

      <Slide>
        <h2 className="text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl">As good as the&nbsp;experts.</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {PROOF.map(([n, what, ref]) => (
            <div key={n}>
              <p className="text-6xl font-semibold tracking-tight text-teal-700">{n}</p>
              <p className="mt-3 text-xl text-slate-800">{what}</p>
              <p className="mt-1 text-base text-slate-500">{ref}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-base text-slate-500">
          AnnoMI 10-expert lines, Sylvester synthetic program, 200 supervisor-rated calls.{" "}
          <Link href="/validation" className="underline">Details</Link>
        </p>
      </Slide>

      <Slide>
        <h2 className="text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl">Try it.</h2>
        <Link
          href="/"
          className="mt-10 inline-block w-fit rounded-xl bg-teal-700 px-8 py-4 text-2xl font-medium text-white hover:bg-teal-800"
        >
          Review a call
        </Link>
        <p className="mt-10 text-base text-slate-500">Built by&nbsp;Sintetico.</p>
      </Slide>
    </div>
  );
}
