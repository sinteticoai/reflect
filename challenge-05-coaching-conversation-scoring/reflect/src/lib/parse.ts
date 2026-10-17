import type { Line, Speaker } from "./mi";

const COACH = /^(coach|counsel+or|counselor|therapist|interviewer|entrenador|entrenadora|coach\/a)\b/i;
const PART = /^(participant|client|patient|paciente|participante|cliente)\b/i;

// Parses "Coach: ..." / "Participant: ..." style transcripts. Unlabelled lines continue the previous speaker.
export function parseTranscript(text: string): Line[] {
  const out: Line[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim().replace(/^\[\d+\]\s*/, "");
    if (!line) continue;
    const m = line.match(/^([^:]{1,30}):\s*(.*)$/);
    let speaker: Speaker | null = null;
    let body = line;
    if (m) {
      if (COACH.test(m[1].trim())) speaker = "coach";
      else if (PART.test(m[1].trim())) speaker = "participant";
      if (speaker) body = m[2];
    }
    if (!speaker) {
      const prev = out[out.length - 1];
      if (prev && !m) {
        prev.text += " " + body;
        continue;
      }
      speaker = prev ? (prev.speaker === "coach" ? "participant" : "coach") : "coach";
    }
    if (body) out.push({ line_number: out.length + 1, speaker, text: body });
  }
  return out;
}
