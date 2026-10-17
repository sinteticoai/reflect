import { Analyzer, type DemoCall } from "@/components/Analyzer";
import { Proof } from "@/components/Proof";
import demoData from "@/data/demo-calls.json";

// The safety call makes the strongest first impression, so it opens by default.
const FIRST_DEMO = "CALL05423";

export default function Home() {
  const raw: unknown = demoData;
  const demos = (Array.isArray(raw) ? raw : [])
    .filter((d): d is DemoCall => !!d && typeof d === "object" && Array.isArray((d as DemoCall).lines))
    .sort((a, b) => Number(b.id === FIRST_DEMO) - Number(a.id === FIRST_DEMO));
  return (
    <>
      <section className="py-10">
        <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
          Every coaching call, <span className="text-teal-700">reviewed.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-xl text-slate-600">
          Programs record thousands of calls. Supervisors hear a&nbsp;handful. Reflect tags every line, scores the coach, and
          flags what needs a person&nbsp;today.
        </p>
        <div className="mt-10">
          <Proof size="md" />
        </div>
        <a
          href="#demo"
          className="mt-10 inline-block rounded-xl bg-teal-700 px-6 py-3 text-lg font-medium text-white hover:bg-teal-800"
        >
          Try a demo call
        </a>
      </section>
      <div id="demo" className="scroll-mt-4">
        <Analyzer demos={demos} />
      </div>
    </>
  );
}
