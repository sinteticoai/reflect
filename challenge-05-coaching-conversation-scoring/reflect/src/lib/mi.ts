import Anthropic from "@anthropic-ai/sdk";

// Taxonomy mirrors the Sylvester synthetic labels (MITI-style), which map onto AnnoMI.
export const COACH_MOVES = [
  "open question",
  "closed question",
  "simple reflection",
  "complex reflection",
  "affirm",
  "emphasize autonomy",
  "seek collaboration",
  "ask permission",
  "give information",
  "persuade",
  "other",
] as const;
export const PARTICIPANT_TALK = ["change", "sustain", "neutral"] as const;
export const CHECKLIST = [
  "set_agenda",
  "checked_feelings",
  "reviewed_last_goal",
  "set_new_goal",
  "planned_for_barriers",
  "summarized",
  "set_next_contact",
] as const;

export type CoachMove = (typeof COACH_MOVES)[number];
export type ParticipantTalk = (typeof PARTICIPANT_TALK)[number];
export type Speaker = "coach" | "participant";

export interface Line {
  line_number: number;
  speaker: Speaker;
  text: string;
  time?: string;
}

export interface LineTag {
  line_number: number;
  coach_move?: CoachMove;
  participant_talk?: ParticipantTalk;
  needs_human?: boolean;
  note?: string;
}

export interface Flag {
  line_number: number;
  severity: "urgent" | "review";
  category: string;
  reason: string;
}

export interface CallScore {
  empathy_1_to_5: number;
  partnership_1_to_5: number;
  overall_1_to_5: number;
  checklist: Record<(typeof CHECKLIST)[number], boolean>;
  safety_issue_handled: "yes" | "no" | "n/a";
  summary: string;
  strengths: string[];
  coaching_tips: string[];
}

export interface Analysis {
  tags: LineTag[];
  flags: Flag[];
  score: CallScore;
  metrics: MitiMetrics;
}

export interface MitiMetrics {
  questions: number;
  open_question_pct: number | null;
  reflections: number;
  complex_reflection_pct: number | null;
  reflection_to_question: number | null;
  mi_adherent: number;
  mi_non_adherent: number;
  change_talk: number;
  sustain_talk: number;
  change_talk_pct: number | null;
}

export const MODEL_FAST = "claude-haiku-5-5";
export const MODEL_SMART = "claude-sonnet-5-5";

const SYSTEM = `You are an expert motivational interviewing (MI) supervisor reviewing health-coaching conversations with cancer survivors. Conversations may be in English or Spanish.

Label EVERY coach line with exactly one coach_move:
- open question: invites elaboration ("What would help?", "¿Cómo le fue?")
- closed question: yes/no or short-answer ("Did you walk today?")
- simple reflection: repeats or lightly rephrases what the participant said
- complex reflection: adds meaning, feeling, or ambivalence beyond what was said ("Part of you wants to, and part of you is worried")
- affirm: genuine recognition of the participant's strengths or efforts
- emphasize autonomy: stresses the participant's choice and control
- seek collaboration: invites partnership in deciding ("Shall we figure it out together?")
- ask permission: asks before giving information or advice
- give information: neutral facts, education, or suggestions given without pressure
- persuade: argues, warns, lectures, or pushes advice without permission (MI non-adherent)
- other: greetings, logistics, scheduling, fillers, structuring

Label EVERY participant line with participant_talk:
- change: desire, ability, reasons, need, commitment or steps toward the behavior change
- sustain: reasons to stay the same, against change
- neutral: neither

Set needs_human=true on a participant line only when a person must act today: fever during chemo, chest pain, shortness of breath, a fall, a swollen or painful leg, bleeding, food insecurity, hopelessness, self-harm, abuse. Minor symptoms do not count.

Then score the coach as a supervisor would (1-5, 5 best) for empathy, partnership and overall; mark which call-structure steps happened; note whether any safety issue was handled. Flags: one per thing a supervisor should see (urgent = safety today; review = poor practice such as repeated persuading, missed change talk, or a missed safety cue). Keep summary to 2 sentences; strengths and coaching_tips are short, specific, and quote the line number. Write summary, strengths and tips in English.

Always respond by calling the record_analysis tool exactly once, with a tag for every line.`;

const TOOL: Anthropic.Tool = {
  name: "record_analysis",
  description: "Record the line-by-line MI labels and call-level supervisor review.",
  input_schema: {
    type: "object",
    required: ["tags", "flags", "score"],
    properties: {
      tags: {
        type: "array",
        items: {
          type: "object",
          required: ["line_number"],
          properties: {
            line_number: { type: "integer" },
            coach_move: { type: "string", enum: [...COACH_MOVES] },
            participant_talk: { type: "string", enum: [...PARTICIPANT_TALK] },
            needs_human: { type: "boolean" },
            note: { type: "string", description: "Optional, under 12 words" },
          },
        },
      },
      flags: {
        type: "array",
        items: {
          type: "object",
          required: ["line_number", "severity", "category", "reason"],
          properties: {
            line_number: { type: "integer" },
            severity: { type: "string", enum: ["urgent", "review"] },
            category: { type: "string" },
            reason: { type: "string" },
          },
        },
      },
      score: {
        type: "object",
        required: [
          "empathy_1_to_5",
          "partnership_1_to_5",
          "overall_1_to_5",
          "checklist",
          "safety_issue_handled",
          "summary",
          "strengths",
          "coaching_tips",
        ],
        properties: {
          empathy_1_to_5: { type: "integer", minimum: 1, maximum: 5 },
          partnership_1_to_5: { type: "integer", minimum: 1, maximum: 5 },
          overall_1_to_5: { type: "integer", minimum: 1, maximum: 5 },
          checklist: {
            type: "object",
            required: [...CHECKLIST],
            properties: Object.fromEntries(CHECKLIST.map((k) => [k, { type: "boolean" }])),
          },
          safety_issue_handled: { type: "string", enum: ["yes", "no", "n/a"] },
          summary: { type: "string" },
          strengths: { type: "array", items: { type: "string" } },
          coaching_tips: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
};

let client: Anthropic | null = null;
function anthropic() {
  client ??= new Anthropic();
  return client;
}

export function formatTranscript(lines: Line[]): string {
  return lines
    .map((l) => `[${l.line_number}] ${l.speaker.toUpperCase()}: ${l.text}`)
    .join("\n");
}

export async function analyzeCall(
  lines: Line[],
  opts: { model?: string; context?: string } = {},
): Promise<Analysis> {
  const res = await anthropic().messages.create({
    model: opts.model ?? MODEL_SMART,
    max_tokens: 16000,
    system: SYSTEM,
    tools: [TOOL],
    // Forced tool_choice is not supported on every model; auto plus an explicit instruction works on all.
    tool_choice: { type: "auto" },
    messages: [
      {
        role: "user",
        content: `${opts.context ? opts.context + "\n\n" : ""}Transcript:\n${formatTranscript(lines)}`,
      },
    ],
  });
  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") throw new Error("No analysis returned");
  // Models occasionally return nested fields as JSON strings.
  const raw = block.input as Record<string, unknown>;
  const parse = <T>(v: unknown, fallback: T): T =>
    typeof v === "string" ? (JSON.parse(v) as T) : ((v as T) ?? fallback);
  const tags = parse<LineTag[]>(raw.tags, []);
  const flags = parse<Flag[]>(raw.flags, []);
  const score = parse<CallScore>(raw.score, {} as CallScore);
  return { tags, flags, score, metrics: mitiMetrics(lines, tags) };
}

const ADHERENT: CoachMove[] = ["affirm", "emphasize autonomy", "seek collaboration", "ask permission"];

export function mitiMetrics(lines: Line[], tags: LineTag[]): MitiMetrics {
  const coach = new Set(lines.filter((l) => l.speaker === "coach").map((l) => l.line_number));
  const moves = tags.filter((t) => coach.has(t.line_number) && t.coach_move).map((t) => t.coach_move!);
  const talk = tags.filter((t) => !coach.has(t.line_number) && t.participant_talk).map((t) => t.participant_talk!);
  const n = (m: string) => moves.filter((x) => x === m).length;
  const pct = (a: number, b: number) => (b ? Math.round((100 * a) / b) : null);
  const oq = n("open question");
  const q = oq + n("closed question");
  const cr = n("complex reflection");
  const r = cr + n("simple reflection");
  const change = talk.filter((t) => t === "change").length;
  const sustain = talk.filter((t) => t === "sustain").length;
  return {
    questions: q,
    open_question_pct: pct(oq, q),
    reflections: r,
    complex_reflection_pct: pct(cr, r),
    reflection_to_question: q ? Math.round((r / q) * 100) / 100 : null,
    mi_adherent: moves.filter((m) => ADHERENT.includes(m)).length,
    mi_non_adherent: n("persuade"),
    change_talk: change,
    sustain_talk: sustain,
    change_talk_pct: pct(change, change + sustain),
  };
}
