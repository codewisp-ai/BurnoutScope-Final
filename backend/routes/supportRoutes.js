import express from 'express';

const router = express.Router();

// ─── Intensity Detection ──────────────────────────────────────────────────────
const CRISIS_KEYWORDS = [
  "can't handle", "cannot handle", "giving up", "give up", "end it",
  "no point", "worthless", "hopeless", "can't go on", "don't want to be here",
  "want to die", "kill myself", "hurt myself", "self harm", "suicide",
  "ending my life", "not worth living", "disappear"
];

const DISTRESS_KEYWORDS = [
  "overwhelmed", "breaking down", "falling apart", "exhausted", "burned out",
  "can't cope", "too much", "stressed", "anxiety", "panic", "crying",
  "alone", "scared", "lost", "empty", "numb", "can't breathe", "shaking",
  "failing", "mess", "disaster", "hate myself", "useless", "terrible"
];

const WORK_KEYWORDS = [
  "deadline", "code", "bug", "project", "manager", "boss", "job", "work",
  "commit", "deploy", "meeting", "sprint", "ticket", "review", "fired",
  "layoff", "performance", "github", "pull request", "overtime", "hours"
];

const SLEEP_KEYWORDS = [
  "can't sleep", "insomnia", "awake", "3am", "2am", "1am", "4am", "night",
  "tired", "no sleep", "sleep", "midnight"
];

const LONELY_KEYWORDS = [
  "alone", "lonely", "nobody", "no one", "friends", "isolated", "disconnected",
  "no one understands", "no one cares", "by myself"
];

function detectIntensity(message) {
  const lower = message.toLowerCase();
  if (CRISIS_KEYWORDS.some(k => lower.includes(k))) return 'crisis';
  if (DISTRESS_KEYWORDS.some(k => lower.includes(k))) return 'high';
  return 'normal';
}

function detectTopic(message) {
  const lower = message.toLowerCase();
  if (CRISIS_KEYWORDS.some(k => lower.includes(k))) return 'crisis';
  if (SLEEP_KEYWORDS.some(k => lower.includes(k))) return 'sleep';
  if (LONELY_KEYWORDS.some(k => lower.includes(k))) return 'lonely';
  if (WORK_KEYWORDS.some(k => lower.includes(k))) return 'work';
  if (DISTRESS_KEYWORDS.some(k => lower.includes(k))) return 'distress';
  return 'general';
}

// ─── Response Bank ────────────────────────────────────────────────────────────
const RESPONSES = {
  crisis: [
    "I hear you, and I'm really glad you're here right now talking to me instead of being alone with this. What you're feeling is real — and it won't always feel this heavy. Can you tell me what's been building up?",
    "You reached out, and that took something. I'm not going anywhere. Right now, in this moment, you're not alone. Breathe with me — slow in, slow out. I want to understand what's going on for you.",
    "That kind of pain is exhausting to carry. Please know — iCall (9152987821) has real people available right now who are trained to sit with exactly this. You deserve that support. And I'm here too.",
  ],
  sleep: [
    "Being awake at this hour when everything feels louder — that's one of the hardest places to be. You're not weak for struggling. What's keeping your mind going tonight?",
    "The middle of the night has a way of making everything feel permanent. It's not. Your brain is just tired and scared. Try resting your hands flat on your legs and feeling the warmth for a moment. What's going on?",
    "Late nights alone with your thoughts are brutal. I'm here. You don't have to figure everything out right now — just talk to me. What's the loudest thing in your head?",
  ],
  lonely: [
    "Feeling unseen is one of the deepest kinds of pain. The fact that you reached out even here — that matters. I see you right now. What's been making you feel disconnected?",
    "You're not as alone as it feels right now. Loneliness lies — it tells you nobody would understand, but that's the loneliness talking, not the truth. What's been going on?",
    "I'm here with you. Tell me what's been happening — I want to actually understand, not just throw words at you.",
  ],
  work: [
    "Developer burnout is real and it's brutal — the kind that creeps in through a thousand tiny cuts. You're not failing. You're overextended. What's been the hardest part lately?",
    "The work pressure never really turns off, does it? Even when you close the laptop, it follows you. That's exhausting. What happened today that brought you here?",
    "I see your burnout scores — your data has been telling a story. But data doesn't capture how it actually feels. What's it been like for you?",
    "Sometimes the code isn't the problem. The code is just where it shows up. What's really going on underneath all of it?",
  ],
  distress: [
    "That sounds genuinely overwhelming. You don't have to have it together right now — that's not why you're here. Take one slow breath with me. What's been piling up?",
    "Feeling like everything is too much is your nervous system saying it needs a break, not that you're broken. I'm here. Tell me more about what's going on.",
    "You came here instead of sitting with it alone — that was the right call. I'm listening. What's the hardest thing right now?",
    "It makes sense that you feel this way given what you're dealing with. Let's just sit here for a second. What do you need most right now — to vent, or to feel calmer?",
  ],
  general: [
    "I'm here. Tell me what's going on.",
    "You don't have to have the right words. Just tell me what you're feeling — even if it doesn't make sense.",
    "I'm listening. Whatever it is, you can say it here.",
    "This is a safe place. What's on your mind tonight?",
    "Take your time. I'm not going anywhere. What's been happening?",
  ],
  followup_normal: [
    "I hear you. That makes a lot of sense given what you've been carrying. What would feel helpful right now — talking through it more, or trying something to calm your body down a bit?",
    "Thank you for trusting me with that. You don't have to figure out what to do right now. Just being here and letting yourself feel it is enough. Is there anything specific weighing on you the most?",
    "Keep going — I'm with you. Sometimes just getting it out of your head and into words makes it a little lighter.",
    "You're doing the right thing by talking about it. What's the next thing that comes up when you think about all of this?",
    "That took courage to say. You don't have to carry all of this alone. What else is going on?",
  ],
  followup_high: [
    "That's a lot to be carrying. Your breathing — is it feeling tight right now? Try placing one hand on your chest. Just notice the rise and fall. You're still here. What else?",
    "I'm still here with you. None of what you're feeling is too much for this space. What happened right before things started feeling this intense?",
    "It sounds like you've been pushing through this alone for a while. You don't have to do that anymore — not right now. Is there one specific moment today that made things tip over?",
  ],
  followup_crisis: [
    "I'm still here. You reached out and that was brave. Please also reach out to iCall right now — 9152987821. They're real people and they want to hear you. Will you call them?",
    "You deserve more support than I can give you here. iCall (9152987821) and Vandrevala (1860-2662-345) are available right now, tonight. Can you reach out to one of them?",
  ],
  suggest_breathing: [
    "While you're talking — try this: breathe in for 4 counts, hold for 4, breathe out for 4. Your body needs to know it's safe. I'll be here when you're done.",
    "The breathing guide on the left is there for you. Even one round can take the edge off. What else is going on?",
  ],
};

function pick(arr, index) {
  return arr[index % arr.length];
}

function buildReply(userMessage, messageCount, intensity, topic) {
  const isFollowUp = messageCount > 1;

  if (isFollowUp) {
    if (intensity === 'crisis') return pick(RESPONSES.followup_crisis, messageCount);
    if (intensity === 'high')   return pick(RESPONSES.followup_high, messageCount);
    if (messageCount % 3 === 0) return pick(RESPONSES.suggest_breathing, messageCount);
    return pick(RESPONSES.followup_normal, messageCount);
  }

  return pick(RESPONSES[topic] || RESPONSES.general, 0);
}

// ─── POST /api/support/chat ───────────────────────────────────────────────────
router.post('/chat', (req, res) => {
  try {
    const { messages = [], userMessage } = req.body;

    if (!userMessage || typeof userMessage !== 'string') {
      return res.status(400).json({ error: 'userMessage is required.' });
    }

    const intensity           = detectIntensity(userMessage);
    const topic               = detectTopic(userMessage);
    const showCrisisResources = intensity === 'crisis';
    const messageCount        = messages.length;

    const reply = buildReply(userMessage, messageCount, intensity, topic);

    // Human-like typing delay
    setTimeout(() => {
      res.json({ reply, intensity, showCrisisResources });
    }, 600 + Math.random() * 800);

  } catch (err) {
    console.error('Support chat error:', err?.message);
    res.json({
      reply: "I'm here with you. Take a slow breath — in for 4, hold for 4, out for 4. Whatever's going on, you don't have to face it alone right now.",
      intensity: 'normal',
      showCrisisResources: false,
    });
  }
});

export default router;