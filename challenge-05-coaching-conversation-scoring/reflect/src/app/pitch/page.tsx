import Link from "next/link";
import { Proof } from "@/components/Proof";

export const metadata = { title: "Reflect | Pitch" };

function Slide({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex min-h-[calc(100vh-8rem)] snap-start flex-col justify-center border-b border-slate-200 py-12">
      {children}
    </section>
  );
}


export default function Pitch() {
  return (
    <div className="h-[calc(100vh-5rem)] snap-y snap-mandatory overflow-y-auto">
      <Slide>
        <p className="text-sm font-medium uppercase tracking-widest text-teal-700">Sylvester Challenge 5</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-tight text-slate-900 sm:text-7xl">
          Every coaching call, reviewed.
        </h1>
        <dl className="mt-8 max-w-2xl space-y-4">
          <div>
            <dt className="text-sm font-medium uppercase tracking-widest text-slate-500">Problem</dt>
            <dd className="mt-1 text-2xl text-slate-600">Programs record thousands of calls. Supervisors hear a&nbsp;handful.</dd>
          </div>
          <div>
            <dt className="text-sm font-medium uppercase tracking-widest text-teal-700">Solution</dt>
            <dd className="mt-1 text-2xl font-medium text-slate-900">
              <span className="text-teal-700">Reflect</span> reviews every one, and flags the few that need a&nbsp;supervisor.
            </dd>
          </div>
        </dl>
        <div className="mt-10">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-teal-700">Proof</p>
          <Proof />
        </div>
        <p className="mt-6 text-sm text-slate-500">
          AnnoMI 10-expert lines, Sylvester synthetic program, 200 supervisor-rated calls.{" "}
          <Link href="/validation" className="underline">Details</Link>
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
