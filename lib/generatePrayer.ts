/**
 * generatePrayer.ts
 * Server-only — uses OpenAI to write a short personalised bedtime prayer.
 */

import OpenAI from "openai";

export interface PrayerInput {
  firstName:        string;
  prayerFocus:      string;
  tone:             string;
  optionalRequest?: string;
}

export interface PrayerOutput {
  subject:    string;
  prayerText: string;
}

const FOCUS_DESCRIPTIONS: Record<string, string> = {
  peace:       "peace and calm at the end of a long day",
  protection:  "protection and safety through the night",
  gratitude:   "gratitude and thankfulness for today's blessings",
  healing:     "healing — physical, emotional, or spiritual",
  forgiveness: "forgiveness, release, and letting go",
  family:      "family, loved ones, and meaningful relationships",
  strength:    "strength, hope, and courage for tomorrow",
};

const TONE_DESCRIPTIONS: Record<string, string> = {
  /* original signup values */
  gentle:       "gentle, soft, and tender — like a quiet lullaby",
  traditional:  "traditional and reverent, drawing on classic prayer language",
  contemporary: "contemporary and conversational, warm and relatable",
  poetic:       "poetic and literary, with beautiful imagery",
  /* manage page values */
  peaceful:     "short, simple, and peacefully direct — under 80 words",
  emotional:    "deep and emotional, heartfelt and sincere",
  faith:        "faith-filled and scripture-inspired",
};

/* ── SMS-specific short prayer ── */

export interface SmsPrayerOutput {
  prayerText: string;
}

export async function generateSmsPrayer(
  input: Pick<PrayerInput, "firstName" | "prayerFocus" | "tone">,
): Promise<SmsPrayerOutput> {
  const { firstName, prayerFocus, tone } = input;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("[generateSmsPrayer] Missing env var: OPENAI_API_KEY");

  const client = new OpenAI({ apiKey });

  const focusDesc = FOCUS_DESCRIPTIONS[prayerFocus] ?? prayerFocus;
  const toneDesc  = TONE_DESCRIPTIONS[tone]         ?? tone;

  const system = `You write extremely short, calming bedtime prayers for SMS delivery.
Rules:
- 30 to 45 words total — this is a strict limit
- Use the person's first name naturally, once
- Do NOT start with a greeting or "Dear Lord" preamble — begin the prayer directly
- Comforting, sincere, and deeply peaceful
- Tone: ${toneDesc}
- Always end with "Amen."
Respond with JSON only: { "prayerText": "..." }`;

  const user = `Write a bedtime prayer for ${firstName}. Focus: ${focusDesc}.`;

  const response = await client.chat.completions.create({
    model:           "gpt-4o-mini",
    messages:        [{ role: "system", content: system }, { role: "user", content: user }],
    max_tokens:      120,
    temperature:     0.85,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content ?? "{}";

  let parsed: { prayerText?: string };
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`[generateSmsPrayer] Could not parse OpenAI response: ${raw}`);
  }

  if (!parsed.prayerText) {
    throw new Error("[generateSmsPrayer] OpenAI returned an empty prayer");
  }

  return { prayerText: parsed.prayerText };
}

/* ── Full-length email prayer ── */

export async function generatePrayer(input: PrayerInput): Promise<PrayerOutput> {
  const { firstName, prayerFocus, tone, optionalRequest } = input;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("[generatePrayer] Missing env var: OPENAI_API_KEY");

  const client = new OpenAI({ apiKey });

  const focusDesc = FOCUS_DESCRIPTIONS[prayerFocus] ?? prayerFocus;
  const toneDesc  = TONE_DESCRIPTIONS[tone]         ?? tone;

  const system = `You are a compassionate bedtime prayer writer.
You write short, warm, deeply personal prayers that help people end their day with peace.
Rules:
- Under 180 words
- Use the person's first name naturally, once
- Never preachy or judgmental
- Comforting, emotional, sincere
- Style: ${toneDesc}
- Always end with "Amen."
Respond with JSON only: { "subject": "...", "prayerText": "..." }`;

  const user = `Write a bedtime prayer for ${firstName}.
Focus: ${focusDesc}.${optionalRequest ? `\nPersonal request: ${optionalRequest}` : ""}
Subject line should be warm and specific (e.g. "Your nightly prayer for peace").`;

  const response = await client.chat.completions.create({
    model:           "gpt-4o-mini",
    messages:        [{ role: "system", content: system }, { role: "user", content: user }],
    max_tokens:      450,
    temperature:     0.85,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content ?? "{}";

  let parsed: { subject?: string; prayerText?: string };
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`[generatePrayer] Could not parse OpenAI response: ${raw}`);
  }

  if (!parsed.prayerText) {
    throw new Error("[generatePrayer] OpenAI returned an empty prayer");
  }

  return {
    subject:    parsed.subject    ?? "Your nightly prayer",
    prayerText: parsed.prayerText,
  };
}
