import express from 'express';

const router = express.Router();

// ─── Crisis keyword detection ─────────────────────────────────────────────────
const CRISIS_KEYWORDS = [
  "can't handle", "cannot handle", "giving up", "give up", "end it",
  "no point", "worthless", "hopeless", "can't go on", "want to die",
  "kill myself", "hurt myself", "self harm", "suicide", "not worth living",
  "disappear forever", "better off without me", "can't do this anymore",
  "done with everything", "nothing matters", "no reason to live",
  "everyone would be better", "can't keep going", "ending my life",
  "don't want to be here", "want to disappear"
];

const DISTRESS_KEYWORDS = [
  "overwhelmed", "breaking down", "falling apart", "exhausted", "burned out",
  "can't cope", "too much", "stressed", "anxiety", "panic", "crying",
  "alone", "scared", "lost", "empty", "numb", "shaking", "can't breathe",
  "heart racing", "chest tight", "spiraling", "out of control",
  "can't focus", "mind racing", "thoughts racing", "dark thoughts",
  "feel like shit", "feel terrible", "hate myself", "hate my life",
  "i'm a mess", "falling behind", "drowning", "sinking", "suffocating",
  "no energy", "zero motivation", "stuck", "frozen", "dissociated"
];

function detectIntensity(message) {
  const lower = message.toLowerCase();
  if (CRISIS_KEYWORDS.some(k => lower.includes(k))) return 'crisis';
  if (DISTRESS_KEYWORDS.some(k => lower.includes(k))) return 'high';
  return 'normal';
}

// ─── Build system prompt with user's burnout context ─────────────────────────
function buildSystemPrompt(burnoutContext) {
  const contextBlock = burnoutContext ? `
You have access to this user's real data from BurnoutScope:
- Burnout Score: ${burnoutContext.burnoutScore ?? 'unknown'} / 100
- Risk Level: ${burnoutContext.riskLevel ?? 'unknown'}
- Late Night Commits (after 11pm): ${burnoutContext.lateNightCommits ?? 'unknown'}
- Weekend Commits: ${burnoutContext.weekendCommits ?? 'unknown'}
- Total Commits (last 90 days): ${burnoutContext.totalCommits ?? 'unknown'}
- Longest Streak: ${burnoutContext.longestStreak ?? 'unknown'} days
- Meeting Overload Days: ${burnoutContext.overloadDays ?? 'unknown'}
- Total Meeting Hours: ${burnoutContext.meetingHours ?? 'unknown'}hrs
- Focus Hours Available: ${burnoutContext.focusHours ?? 'unknown'}hrs
- AI Insight: "${burnoutContext.insight ?? ''}"

Use this context naturally — don't recite it like a list. If burnout score is high (70+), you already know they're struggling. Reference it only when it feels genuinely helpful, like a friend who already knows what's been going on.
` : `
You don't have specific burnout data for this user. Just be present with what they share.
`;

  return `You are the 2AM Support companion inside BurnoutScope — a mental health tool built for developers and people who push themselves too hard.

${contextBlock}

YOUR ROLE:
You are NOT a therapist. You are NOT a crisis line. You are a warm, present, emotionally intelligent companion — like a friend who understands burnout, tech culture, and the specific loneliness of 3am when everything feels too heavy.

HOW YOU SPEAK:
- Warm, calm, unhurried. Never clinical or robotic.
- Short to medium responses. Never lecture. Never use bullet points.
- Ask ONE question at a time, not three.
- Don't open with "I understand" or "That sounds difficult" — show you understand through what you say.
- Don't use the word "boundaries." Avoid "self-care" repeatedly. No corporate wellness language.
- Match the user's energy. If they're casual, you can be too. If they're raw, slow down.

WHAT YOU DO WELL:
- Acknowledge the specific reality of developer burnout — late nights, imposter syndrome, always-on culture
- Sit with someone in their pain without rushing to fix it
- Offer grounding techniques naturally in conversation, not as a prescription
- Know when something is bigger than you and gently point toward real help
- Make people feel genuinely less alone at 2am

CRISIS PROTOCOL:
If someone expresses suicidal ideation or self-harm intent:
1. Acknowledge their pain directly and warmly
2. Tell them you're glad they're talking instead of being alone with it
3. Gently mention iCall (9152987821) and Vandrevala Foundation (1860-2662-345) as real humans available right now
4. Stay with them — don't just offload to resources
5. Ask if there's someone physically near them

WHAT YOU NEVER DO:
- Make medical diagnoses
- Promise things will be okay
- Be dismissive of how hard things are
- Respond with a wall of text
- Give specific medical or psychiatric advice

Keep responses concise — 2 to 4 sentences usually. This person came here at 2am. Be real with them.`;
}

// ─── Call Gemini API ──────────────────────────────────────────────────────────
async function callGemini(systemPrompt, conversationHistory) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const model = 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  // Gemini format: system goes in systemInstruction, history in contents
  const contents = conversationHistory.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const body = {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents,
    generationConfig: {
      maxOutputTokens: 300,
      temperature: 0.85,
      topP: 0.9,
    },
    safetySettings: [
      // Loosen so it doesn't refuse mental health conversations
      { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH",       threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
    ],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Gemini API error:', response.status, errText);
    throw new Error(`Gemini API returned ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No text in Gemini response');
  return text.trim();
}

// ─── POST /api/support/chat ───────────────────────────────────────────────────
router.post('/chat', async (req, res) => {
  try {
    const { messages = [], userMessage, burnoutContext } = req.body;

    if (!userMessage || typeof userMessage !== 'string') {
      return res.status(400).json({ error: 'userMessage is required.' });
    }

    const intensity           = detectIntensity(userMessage);
    const showCrisisResources = intensity === 'crisis';

    // Build conversation history for Gemini
    const conversationHistory = [
      ...messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .slice(-12)
        .map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage },
    ];

    const systemPrompt = buildSystemPrompt(burnoutContext);
    const reply = await callGemini(systemPrompt, conversationHistory);

    res.json({ reply, intensity, showCrisisResources });

  } catch (err) {
    console.error('Support chat error:', err?.message);
    res.json({
      reply: "I'm here with you. Take a slow breath — in for 4, hold for 4, out for 4. You don't have to face this alone. What's going on?",
      intensity: 'normal',
      showCrisisResources: false,
    });
  }
});

export default router;