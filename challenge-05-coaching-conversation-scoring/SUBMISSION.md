# Submission (eMerge AI Hackathon 2026, Healthcare track, Challenge 5)

Track: Healthcare
Project Name: Reflect: an AI supervisor for every health-coaching call
Demo URL: https://reflect-seven-theta.vercel.app
GitHub Repository: https://github.com/sinteticoai/reflect
Pitch Deck URL: https://reflect-seven-theta.vercel.app/pitch
Tech Stack: Next.js 15, TypeScript, Tailwind CSS 4, Anthropic Claude (Haiku 5.5, Sonnet 5.5), Web Speech API, Vercel
Screenshots: supervisor queue, safety call review, validation page

## Description (paste into the form)
Health coaching programs for cancer survivors run on conversations, but supervisors can review only a handful of the thousands of calls they record. Reflect reviews every one, like a supervisor would.

Feed it a call, live from the microphone, a pasted transcript, or a text thread, in English or Spanish. Reflect:
- Tags every line with the motivational interviewing code an expert would use (open or closed question, simple or complex reflection, affirmation, autonomy, permission, information, persuasion) and the participant's change, sustain or neutral talk.
- Scores the coach on the supervisor's rubric: empathy, partnership and overall (1 to 5, calibrated to supervisor ratings), the seven-step call checklist, and MITI 4.2 proficiency metrics.
- Flags what a person must see today (fever during chemo, chest pain, a fall, food insecurity, hopelessness) and poor practice, each tied to the exact line with a concrete coaching tip.
- Supervisor queue: every reviewed call ranked worst first. On 219 Sylvester calls, the 21 that need a person today rise to the top.

Validated, not just demoed:
- Real AnnoMI sessions, 10-expert lines: 83.3% agreement with the expert majority on coach moves (kappa 0.77, n=216), on par with the 83.9% the experts reach with each other.
- Safety: caught 20 of 20 calls and 17 of 17 texts where a person must act today, with zero false alarms.
- Supervisor scores: calibrated overall score vs Supervisor A r=0.74 (97% within one point), higher than Supervisor A vs Supervisor B (r=0.68). n=200 calls, cross-validated.
- Separates good from poor real MI sessions (AUC 0.93) and works in Spanish (81% vs 85% English coach-move accuracy).
- Honest weak spot: simple vs complex reflections (71%) and open vs closed questions (70%).

Data: AnnoMI (Wu et al. 2022), UIC health coaching text corpus (Gupta et al., SIGDIAL 2020), Sylvester Crane Lab synthetic coaching program. Built by Sintetico with Claude.
