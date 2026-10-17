# Reflect

**Every coaching call, reviewed.** An AI supervisor for health-coaching calls with cancer survivors.

Built for the eMerge AI Hackathon 2026 (Miami, October 17), Healthcare track, Sylvester Challenge 5.

- Live app: https://reflect-seven-theta.vercel.app
- Pitch: https://reflect-seven-theta.vercel.app/pitch
- Validation: https://reflect-seven-theta.vercel.app/validation

## Problem

Coaching programs record thousands of calls. Supervisors can only review a few, so urgent calls slip through.

## Solution

Reflect reviews every call, live or recorded, spoken or texted, in English or Spanish, and flags the few that need a supervisor.

- **Tag** every line with the motivational interviewing (MI) code an expert would use: open or closed question, simple or complex reflection, affirmation, autonomy, permission, information, persuasion, and the participant's change, sustain or neutral talk.
- **Score** the coach on the supervisor's rubric: empathy, partnership and overall (1 to 5, calibrated to supervisor ratings), the seven-step call checklist, and MITI 4.2 proficiency metrics.
- **Flag** what needs a person today (fever during chemo, chest pain, a fall, food insecurity, hopelessness) and poor practice, each tied to the exact line with a coaching tip.
- **Supervisor queue**: every reviewed call ranked worst first. On 219 Sylvester calls, the 21 that need a person today rise to the top.

## Proof

| Benchmark | Reflect | Human reference |
|---|---|---|
| AnnoMI real sessions, coach move vs 10-expert majority (n=216) | 83.3% (kappa 0.77) | Experts agree with each other 83.9% |
| Urgent safety issues, calls and texts | 37 of 37 caught, 0 false alarms | |
| Supervisor overall score, 200 calls, cross-validated | r 0.74 vs Supervisor A | Supervisor A vs B r 0.68 |
| Good vs poor real MI sessions | AUC 0.93 | |
| Coach-move accuracy, English vs Spanish | 85% vs 81% | |

Known limits: simple vs complex reflections (71%) and open vs closed questions (70%). Full tables on the [Validation page](https://reflect-seven-theta.vercel.app/validation).

## How it works

1. A call comes in through the microphone (browser speech recognition, coach and participant toggle), as a pasted transcript, or as a text thread.
2. A large language model reads the whole conversation with an MI supervisor's codebook and returns structured line labels, scores and flags (`src/lib/mi.ts`).
3. MITI metrics are computed deterministically from the labels, and call scores are calibrated to supervisor ratings with a cross-validated ridge regression (`src/data/calibrate.ts`).
4. Live mode re-reviews every few lines, so an urgent flag can surface while the call is still happening.

## Run locally

```bash
cd challenge-05-coaching-conversation-scoring/reflect
pnpm install
echo "ANTHROPIC_API_KEY=your-key" > .env.local
pnpm dev
```

Validation and queue scripts (`scripts/eval.ts`, `scripts/calibrate.ts`, `scripts/build_queue.py`) need the hackathon datasets in `challenge-05-coaching-conversation-scoring/data/`, which are not in this repo.

## Repo layout

- `challenge-05-coaching-conversation-scoring/reflect/`: the app (Next.js 15, TypeScript, Tailwind CSS 4, Anthropic Claude, Web Speech API, Vercel).
- `challenge-05-coaching-conversation-scoring/screenshots/`: submission screenshots.
- `challenge-*/BRIEF.md`: the hackathon challenge briefs.

## Data and credits

- AnnoMI: Wu et al., ICASSP 2022.
- UIC health coaching text corpus: Gupta et al., SIGDIAL 2020.
- Synthetic coaching program by the Crane Lab, Sylvester Comprehensive Cancer Center, made for this hackathon. Nobody in it is real.

Hackathon datasets are not included, per the Participant Agreement.

Built by Christian G. Balbontin.
