import express from 'express';

const router = express.Router();

// ─── Keyword detection ────────────────────────────────────────────────────────
const CRISIS_KEYWORDS = [
  "can't handle", "cannot handle", "giving up", "give up", "end it",
  "no point", "worthless", "hopeless", "can't go on", "want to die",
  "kill myself", "hurt myself", "self harm", "suicide", "not worth living",
  "disappear forever", "better off without me", "can't do this anymore",
  "done with everything", "nothing matters", "no reason to live",
  "everyone would be better", "can't keep going", "ending my life"
];

const DISTRESS_KEYWORDS = [
  "overwhelmed", "breaking down", "falling apart", "exhausted", "burned out",
  "can't cope", "too much", "stressed", "anxiety", "panic", "crying",
  "alone", "scared", "lost", "empty", "numb", "shaking", "can't breathe",
  "heart racing", "chest tight", "spiraling", "out of control",
  "can't focus", "can't think", "mind racing", "thoughts racing",
  "feel like shit", "feel terrible", "feel awful", "hate myself", "hate my life",
  "everything is wrong", "i'm a mess", "falling behind", "drowning", "sinking",
  "suffocating", "no energy", "zero motivation", "can't get up", "stuck", "frozen",
  "dissociated", "not real", "disconnected from myself", "dark thoughts"
];

const WORK_KEYWORDS = [
  "deadline", "code", "bug", "project", "manager", "boss", "job", "work",
  "commit", "deploy", "meeting", "sprint", "ticket", "review", "fired",
  "layoff", "performance", "github", "pull request", "overtime", "crunch",
  "imposter syndrome", "not good enough at work", "behind on tasks",
  "too many tickets", "tech debt", "bad review", "performance review",
  "toxic workplace", "micromanaged", "no work life balance", "working weekends"
];

const SLEEP_KEYWORDS = [
  "can't sleep", "insomnia", "awake", "3am", "2am", "1am", "4am", "5am",
  "tired", "no sleep", "sleep", "midnight", "wide awake", "brain won't stop",
  "lying awake", "tossing and turning", "nightmares", "bad dreams",
  "sleep deprived", "haven't slept", "not sleeping well"
];

const LONELY_KEYWORDS = [
  "alone", "lonely", "nobody", "no one", "isolated", "disconnected",
  "no one understands", "no one cares", "by myself", "no support",
  "no one to talk to", "feel invisible", "feel ignored", "left out",
  "excluded", "abandoned", "rejected", "ghosted", "no friends",
  "nobody checks on me", "broke up", "breakup", "divorce"
];

const ANGER_KEYWORDS = [
  "so angry", "furious", "rage", "pissed off", "frustrated", "fed up",
  "can't take it", "want to scream", "losing my temper", "so mad",
  "livid", "seething", "resentful", "bitter", "hate everything",
  "want to quit", "want to walk out", "snapping at people"
];

const GRIEF_KEYWORDS = [
  "lost someone", "someone died", "death", "passed away", "funeral",
  "grieving", "grief", "miss them", "miss him", "miss her",
  "can't believe they're gone", "lost my", "mourning", "heartbroken",
  "diagnosed", "terminal", "sick", "hospital"
];

const MONEY_KEYWORDS = [
  "money", "broke", "debt", "bills", "rent", "can't afford", "financial",
  "loan", "credit card", "overdraft", "no savings", "paycheck to paycheck",
  "eviction", "can't pay", "financial stress", "losing my house"
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
  if (GRIEF_KEYWORDS.some(k => lower.includes(k))) return 'grief';
  if (ANGER_KEYWORDS.some(k => lower.includes(k))) return 'anger';
  if (MONEY_KEYWORDS.some(k => lower.includes(k))) return 'money';
  if (SLEEP_KEYWORDS.some(k => lower.includes(k))) return 'sleep';
  if (LONELY_KEYWORDS.some(k => lower.includes(k))) return 'lonely';
  if (WORK_KEYWORDS.some(k => lower.includes(k))) return 'work';
  if (DISTRESS_KEYWORDS.some(k => lower.includes(k))) return 'distress';
  return 'general';
}

// ─── Response Bank ────────────────────────────────────────────────────────────
const RESPONSES = {
  crisis: [
    "I hear you, and I'm really glad you're here talking to me instead of being alone with this. What you're feeling is real — and it won't always feel this heavy. Can you tell me what's been building up?",
    "You reached out, and that took something. I'm not going anywhere. Right now, in this moment, you're not alone. Breathe with me — slow in, slow out.",
    "That kind of pain is exhausting to carry. iCall (9152987821) has real people available right now. You deserve that support. And I'm here too — tell me what's going on.",
  ],
  grief: [
    "Losing someone changes everything. There's no right way to grieve and no timeline you have to follow. I'm so sorry you're carrying this. Do you want to tell me about them?",
    "Grief doesn't move in a straight line — it comes in waves, sometimes when you least expect it. Whatever you're feeling right now is valid. I'm here. What's hitting hardest today?",
    "That kind of loss leaves a hole nothing else can fill. I'm not going to tell you it gets easier overnight — but you don't have to sit with it completely alone right now. What's going on?",
  ],
  anger: [
    "That anger makes complete sense. Sometimes things are genuinely unfair and rage is the right response. You don't have to calm down before talking to me — what happened?",
    "Anger that big usually has something underneath it — hurt, or exhaustion, or feeling like no one's listening. I'm listening. Tell me what's going on.",
    "Feeling that fed up is a signal that something has gone too far for too long. You're not overreacting. What's been building up?",
  ],
  money: [
    "Financial stress is one of the most crushing kinds — it follows you everywhere and touches everything. You're not failing. You're in a hard situation. What's the most pressing thing right now?",
    "Money stress at this level is genuinely overwhelming — it's not just about numbers, it affects your sleep, your relationships, your whole nervous system. I hear you. What's going on?",
    "Being under that kind of financial pressure is exhausting in a way most people don't understand unless they've been there. What's the immediate thing you're dealing with?",
  ],
  sleep: [
    "Being awake at this hour when everything feels louder — that's one of the hardest places to be. You're not weak for struggling. What's keeping your mind going tonight?",
    "The middle of the night makes everything feel permanent. It's not. Your brain is just tired and scared. Try resting your hands flat on your legs and feeling the warmth. What's going on?",
    "Late nights alone with your thoughts are brutal. I'm here. You don't have to figure everything out right now — just talk to me. What's the loudest thing in your head?",
    "That exhaustion that's too tired to sleep — your whole system is overloaded. You don't have to fix anything right now. What's been keeping you up?",
  ],
  lonely: [
    "Feeling unseen is one of the deepest kinds of pain. The fact that you reached out even here — that matters. I see you right now. What's been making you feel disconnected?",
    "You're not as alone as it feels right now. Loneliness lies — it tells you nobody would understand, but that's the loneliness talking, not the truth. What's been going on?",
    "That kind of isolation — where you're surrounded by people but still feel completely alone — is one of the hardest things. What happened?",
    "Feeling like nobody would notice or nobody cares — that's a really heavy thing to carry. I notice. I'm here. Tell me what's been going on.",
  ],
  work: [
    "Developer burnout is real and brutal — the kind that creeps in through a thousand tiny cuts. You're not failing. You're overextended. What's been the hardest part lately?",
    "The work pressure never really turns off, does it? Even when you close the laptop, it follows you. That's exhausting. What happened today?",
    "Sometimes the code isn't the problem — it's just where the pain shows up. What's really going on underneath all of it?",
    "Imposter syndrome at this level isn't a personality flaw — it's what happens when you're working in a high-pressure environment without enough support. What's been triggering it?",
    "Feeling like you're constantly behind and can never catch up is one of the most demoralizing things. You're not lazy — you're depleted. What does your day actually look like right now?",
  ],
  distress: [
    "That sounds genuinely overwhelming. You don't have to have it together right now. Take one slow breath with me. What's been piling up?",
    "Feeling like everything is too much is your nervous system asking for a break — not a sign you're broken. I'm here. Tell me more.",
    "You came here instead of sitting with it alone — that was the right call. I'm listening. What's the hardest thing right now?",
    "It makes sense that you feel this way given what you're dealing with. What do you need most right now — to vent, or to feel calmer?",
    "That feeling of being stuck and frozen — it's your brain trying to protect you from something overwhelming. You're not lazy or weak. What's got you locked up?",
  ],
  general: [
    "I'm here. Tell me what's going on.",
    "You don't have to have the right words. Just tell me what you're feeling — even if it doesn't make sense.",
    "I'm listening. Whatever it is, you can say it here.",
    "This is a safe place. What's on your mind tonight?",
    "Take your time. I'm not going anywhere. What's been happening?",
    "Something brought you here. I'm glad you came. What's going on?",
  ],
  followup_normal: [
    "I hear you. That makes a lot of sense given what you've been carrying. What would feel helpful right now?",
    "Thank you for trusting me with that. You don't have to figure out what to do right now. What's weighing on you the most?",
    "Keep going — I'm with you. Sometimes just getting it out of your head makes it a little lighter.",
    "You're doing the right thing by talking about it. What else comes up when you think about all of this?",
    "That took courage to say. What else is going on?",
    "I'm still here. What happened next?",
    "That makes a lot of sense. Have you been able to talk to anyone else about this?",
  ],
  followup_high: [
    "That's a lot to be carrying. Is your breathing feeling tight right now? Try placing one hand on your chest — just notice the rise and fall. What else?",
    "I'm still here with you. None of what you're feeling is too much for this space. What happened right before things felt this intense?",
    "It sounds like you've been pushing through this alone for a while. You don't have to do that right now. What made things tip over today?",
    "Your body is trying to tell you something. Can you feel your feet on the floor right now? Just notice that for a second. Then tell me more.",
  ],
  followup_crisis: [
    "I'm still here. You reached out and that was brave. Please also reach out to iCall right now — 9152987821. They're real people and they want to hear you.",
    "You deserve more support than I can give you here. iCall (9152987821) and Vandrevala (1860-2662-345) are available tonight. Can you reach out to one of them?",
    "I want you to be safe. Is there someone physically near you right now — a friend, family member, anyone — who you could reach out to?",
  ],
  suggest_breathing: [
    "While you're talking — try this: breathe in for 4 counts, hold for 4, breathe out for 4. Your body needs to know it's safe. I'll be here.",
    "The breathing guide on the left is there for you. Even one round can take the edge off. What else is going on?",
    "Before you say more — take one slow breath with me. In through your nose for 4 counts... hold... out through your mouth. Then keep going.",
  ],
  suggest_grounding: [
    "Try this while you talk to me: name 3 things you can see right now. Just out loud or in your head. Then tell me what's going on.",
    "Can you feel the surface beneath you right now — chair, floor, bed? Just press down slightly and notice it. You're here. You're real. Now tell me more.",
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
    // Alternate breathing and grounding suggestions
    if (messageCount % 4 === 0) return pick(RESPONSES.suggest_breathing, messageCount);
    if (messageCount % 6 === 0) return pick(RESPONSES.suggest_grounding, messageCount);
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
    const reply               = buildReply(userMessage, messageCount, intensity, topic);

    setTimeout(() => {
      res.json({ reply, intensity, showCrisisResources });
    }, 600 + Math.random() * 800);

  } catch (err) {
    console.error('Support chat error:', err?.message);
    res.json({
      reply: "I'm here with you. Take a slow breath — in for 4, hold for 4, out for 4. You don't have to face this alone.",
      intensity: 'normal',
      showCrisisResources: false,
    });
  }
});

export default router;