export const metadata = { title: "About | Reflect" };

export default function About() {
  return (
    <article className="max-w-3xl space-y-6 text-slate-700">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">About Reflect</h1>
        <p className="mt-2">
          Health coaching programs for people with cancer run on conversations. Good coaches use motivational
          interviewing: open questions and listening back, not lecturing. Programs record thousands of calls and can
          review only a handful. Reflect reviews every one.
        </p>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">How it works</h2>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm">
          <li>A call comes in live through the microphone, as a pasted transcript, or as a recorded call. English and Spanish both work.</li>
          <li>Every coach line is tagged with its motivational interviewing move (open or closed question, simple or complex reflection, affirming, supporting autonomy, asking permission, informing, persuading). Every participant line is tagged as change, sustain or neutral talk.</li>
          <li>Reflect computes MITI 4.2 summary scores (percent open questions, percent complex reflections, reflections per question) and compares them to proficiency thresholds.</li>
          <li>It scores the coach the way a supervisor would: empathy, partnership, overall, and whether the call set an agenda, reviewed the last goal, planned for barriers and set the next contact.</li>
          <li>It flags anything a person must act on today, such as a fever during chemo, chest pain, a fall or hopelessness, plus moments of poor practice worth a supervisor&apos;s look.</li>
        </ol>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Data sources</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm">
          <li>
            AnnoMI: Wu Z, Balloccu S, Kumar V, Helaoui R, Reiter E, Reforgiato Recupero D, Riboni D. Anno-MI: A Dataset
            of Expert-Annotated Counselling Dialogues. ICASSP 2022. Used as the expert answer key.
          </li>
          <li>
            UIC health coaching text corpus: Gupta I, et al. Human-Human Health Coaching via Text Messages: Corpus,
            Annotation, and Analysis. SIGDIAL 2020.
          </li>
          <li>
            Synthetic coaching program (14 coaches, 1,000 participants, English and Spanish) made by the Crane Lab at
            Sylvester Comprehensive Cancer Center for the eMerge AI Hackathon. Nobody in it is real.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Built with</h2>
        <p className="mt-2 text-sm">
          Claude (Anthropic) for line labelling and supervisor review, Next.js, and the browser speech API for live
          calls. Built at the eMerge AI Hackathon, Miami, October 17, 2026, Healthcare track, Challenge 5.
        </p>
      </section>
    </article>
  );
}
