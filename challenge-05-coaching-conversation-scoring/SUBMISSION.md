# Submission draft (eMerge AI Hackathon 2026, Healthcare track, Challenge 5)

Track: Healthcare
Project Name: Reflect: an AI supervisor for every health-coaching call
Demo URL: TBD (Vercel)
GitHub: TBD (github.com/sinteticoai/reflect)
Pitch Deck URL: TBD
Tech Stack: Next.js 15, TypeScript, Tailwind CSS 4, Anthropic Claude (Sonnet 5.5, Haiku 5.5), Web Speech API, Vercel

## Description
Health coaching programs for cancer survivors run on conversations, but supervisors can review only a handful of the thousands of calls they record. Reflect reviews every one.

Feed it a call (live from the microphone, a recorded transcript, or a text thread, in English or Spanish) and Reflect:
- Tags every line with the motivational interviewing code an expert would use: open or closed question, simple or complex reflection, affirmation, autonomy, permission, information, persuasion, and the participant's change or sustain talk.
- Scores the coach the way a supervisor does: empathy, partnership, overall, the seven-step call checklist, and MITI 4.2 proficiency metrics (percent open questions, percent complex reflections, reflection-to-question ratio).
- Flags what a person must see today: fever during chemo, chest pain, a fall, food insecurity, hopelessness. It also flags poor practice, like lecturing or missed change talk, with the line number and a specific coaching tip.

Validated, not just demoed (numbers TBD from validation.json):
- AnnoMI 10-expert benchmark (428 lines): Reflect X% vs 84% expert-to-expert agreement.
- Sylvester synthetic program: coach-move accuracy X%, safety recall X of 20.
- Supervisor ratings: Reflect agrees with supervisors about as often as they agree with each other (X vs Y).

Data: AnnoMI (Wu et al. 2022), UIC health coaching text corpus (Gupta et al., SIGDIAL 2020), Sylvester Crane Lab synthetic coaching program.
