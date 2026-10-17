import Link from "next/link";
import validation from "@/data/validation.json";

export const metadata = { title: "Reflect | Pitch" };

type Headline = string | { label?: string; value?: string | number; reference?: string; note?: string };

function headlines(): Headline[] {
  const v = validation as { headline?: Headline[]; headlines?: Headline[] };
  return v.headline ?? v.headlines ?? [];
}

function Slide({ kicker, title, children }: { kicker: string; title: string; children: React.ReactNode }) {
  return (
    <section className="flex min-h-[calc(100vh-8rem)] snap-start flex-col justify-center border-b border-slate-200 py-12">
      <p className="text-sm font-medium uppercase tracking-widest text-teal-700">{kicker}</p>
      <h2 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">{title}</h2>
      <div className="mt-8 max-w-4xl text-lg leading-relaxed text-slate-700">{children}</div>
    </section>
  );
}

export default function Pitch() {
  const h = headlines();
  return (
    <div className="h-[calc(100vh-5rem)] snap-y snap-mandatory overflow-y-auto">
      <Slide kicker="eMerge AI Hackathon 2026 · Sylvester Challenge 5" title="Reflect: every coaching call, reviewed like a supervisor would">
        <p>
          An AI co-pilot that follows a health-coaching conversation, live or recorded, spoken or texted, in English or
          Spanish. It tags what is happening, scores the coach, and flags what a person must see today.
        </p>
      </Slide>

      <Slide kicker="The problem" title="Thousands of coaching calls, a handful of reviews">
        <ul className="list-disc space-y-3 pl-6">
          <li>Lifestyle programs for cancer survivors run on motivational interviewing: open questions and listening back, not lecturing.</li>
          <li>Quality slips quietly. Supervisors can review only a few recorded calls, so coaches get feedback weeks late or never.</li>
          <li>The calls that matter most, a fever during chemo, a fall, an empty fridge, can sit unheard in a recording.</li>
        </ul>
      </Slide>

      <Slide kicker="What Reflect does" title="Tag, score, flag, in seconds per call">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Tag", "Every line gets the MI code an expert would use: open or closed question, simple or complex reflection, affirmation, autonomy, permission, information, persuasion, and the participant's change or sustain talk."],
            ["Score", "Empathy, partnership and overall on the supervisor's 1 to 5 scale, the seven-step call checklist, and MITI 4.2 proficiency metrics with fair and good thresholds."],
            ["Flag", "Urgent: safety issues that need a person today. Review: lecturing, missed change talk, missed cues, each with the line number and a concrete coaching tip."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xl font-semibold text-teal-800">{t}</p>
              <p className="mt-2 text-base text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      </Slide>

      <Slide kicker="Validated, not just demoed" title="Measured against the experts">
        {h.length ? (
          <ul className="space-y-4">
            {h.map((x, i) =>
              typeof x === "string" ? (
                <li key={i} className="rounded-xl border border-slate-200 bg-white p-5">{x}</li>
              ) : (
                <li key={i} className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-sm text-slate-500">{x.label}</p>
                  <p className="text-3xl font-semibold text-slate-900">{x.value}</p>
                  {x.reference && <p className="text-sm text-slate-500">Reference: {x.reference}</p>}
                  {x.note && <p className="mt-1 text-base text-slate-600">{x.note}</p>}
                </li>
              ),
            )}
          </ul>
        ) : (
          <p>Benchmarks: AnnoMI 10-expert lines, the Sylvester synthetic program labels, and two supervisors&apos; ratings.</p>
        )}
        <p className="mt-6 text-base">
          <Link href="/validation" className="font-medium text-teal-700 underline">Full validation tables</Link>
        </p>
      </Slide>

      <Slide kicker="How it works" title="One model pass, a supervisor's rubric">
        <ol className="list-decimal space-y-3 pl-6">
          <li>Input: microphone (Web Speech API, coach and participant toggle), a pasted transcript, or a text thread.</li>
          <li>Claude reads the whole conversation with an MI supervisor&apos;s codebook and returns structured labels, scores and flags.</li>
          <li>MITI metrics are computed deterministically from the labels, so the numbers are auditable line by line.</li>
          <li>Live mode re-reviews every few lines, so an urgent flag can surface while the call is still happening.</li>
        </ol>
      </Slide>

      <Slide kicker="Why it matters" title="Better coaching, safer survivors, at program scale">
        <ul className="list-disc space-y-3 pl-6">
          <li>Every call reviewed, not one in a hundred. Supervisors spend time on the calls Reflect flags.</li>
          <li>Coaches get specific feedback the same day, tied to the exact line.</li>
          <li>Safety cues reach a person today instead of at the next scheduled call.</li>
          <li>Next: pilot on de-identified Sylvester coaching recordings, calibrate to the program&apos;s supervisors, add audio diarization.</li>
        </ul>
      </Slide>

      <Slide kicker="Try it" title="Live demo">
        <p>
          Open <Link href="/" className="font-medium text-teal-700 underline">Analyze</Link>, pick a demo call, or switch to Live
          call and read a conversation aloud. Data: AnnoMI (Wu et al. 2022), UIC health coaching text corpus (Gupta et al.,
          SIGDIAL 2020), Sylvester Crane Lab synthetic coaching program. Built by Sintetico with Claude.
        </p>
      </Slide>
    </div>
  );
}
