import { NextRequest, NextResponse } from "next/server";

/* ═══════════════════════════════════════════════════════════════
   Smart Built-in AI Engine — No API key required
   Uses advanced NLP-like text analysis for:
   • Extractive summarization (sentence scoring)
   • Action item detection
   • Key topic extraction (TF-IDF inspired)
   • Sentiment analysis (lexicon-based)
   • Auto-tagging
   ═══════════════════════════════════════════════════════════════ */

// ── Sentiment lexicons ──
const POSITIVE_WORDS = new Set([
  "good", "great", "excellent", "amazing", "wonderful", "fantastic", "love",
  "happy", "excited", "awesome", "brilliant", "perfect", "beautiful", "best",
  "success", "successful", "achieve", "achieved", "progress", "improve",
  "improved", "improvement", "win", "won", "opportunity", "opportunities",
  "enjoy", "enjoyed", "helpful", "positive", "grow", "growth", "nice",
  "impressed", "inspiring", "inspiration", "celebrate", "proud", "grateful",
  "thankful", "appreciate", "appreciated", "benefit", "beneficial", "optimistic",
  "confident", "productive", "efficient", "effective", "innovative", "creative",
  "solution", "resolved", "accomplish", "accomplished", "milestone", "reward",
]);

const NEGATIVE_WORDS = new Set([
  "bad", "terrible", "awful", "horrible", "hate", "angry", "sad", "worried",
  "problem", "problems", "issue", "issues", "difficult", "hard", "fail",
  "failed", "failure", "wrong", "mistake", "mistakes", "error", "errors",
  "concern", "concerns", "concerned", "risk", "risks", "delay", "delayed",
  "stress", "stressed", "frustrate", "frustrated", "frustrating", "annoying",
  "annoyed", "disappoint", "disappointed", "disappointing", "struggle",
  "struggling", "trouble", "crisis", "critical", "urgent", "unfortunately",
  "complaint", "complain", "worse", "worst", "broken", "bug", "bugs",
  "overdue", "overwhelmed", "burnout", "conflict", "confusing", "confused",
  "deadline", "blocked", "blocker", "lacking", "missing", "lost",
]);

// ── Action item patterns ──
const ACTION_PATTERNS = [
  /\b(?:need to|needs to|have to|has to)\s+(.{10,80}?)(?:\.|,|$)/gi,
  /\b(?:should|must|gotta|gonna)\s+(.{10,80}?)(?:\.|,|$)/gi,
  /\b(?:will|going to)\s+(.{10,80}?)(?:\.|,|$)/gi,
  /\b(?:todo|to-do|to do)[:;]?\s*(.{10,80}?)(?:\.|,|$)/gi,
  /\b(?:remember to|don't forget to|make sure to)\s+(.{10,80}?)(?:\.|,|$)/gi,
  /\b(?:follow up|follow-up)\s+(?:on|with)\s+(.{10,80}?)(?:\.|,|$)/gi,
  /\b(?:schedule|plan|organize|arrange|set up|prepare)\s+(.{10,80}?)(?:\.|,|$)/gi,
  /\b(?:buy|get|pick up|order)\s+(.{10,80}?)(?:\.|,|$)/gi,
  /\b(?:call|email|text|contact|reach out to)\s+(.{10,80}?)(?:\.|,|$)/gi,
  /\b(?:finish|complete|submit|send|deliver)\s+(.{10,80}?)(?:\.|,|$)/gi,
];

// ── Stop words for topic extraction ──
const STOP_WORDS = new Set([
  "the", "a", "an", "is", "was", "are", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "need", "dare", "ought",
  "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
  "as", "into", "through", "during", "before", "after", "above", "below",
  "between", "out", "off", "over", "under", "again", "further", "then",
  "once", "here", "there", "when", "where", "why", "how", "all", "each",
  "every", "both", "few", "more", "most", "other", "some", "such", "no",
  "nor", "not", "only", "own", "same", "so", "than", "too", "very",
  "just", "because", "but", "and", "or", "if", "while", "that", "this",
  "it", "i", "me", "my", "we", "you", "your", "he", "she", "they",
  "them", "his", "her", "its", "our", "their", "what", "which", "who",
  "whom", "these", "those", "am", "been", "being", "about", "also",
  "like", "think", "know", "going", "really", "actually", "basically",
  "something", "thing", "things", "gonna", "gotta", "wanna", "yeah",
  "okay", "well", "right", "still", "much", "many", "even", "back",
  "get", "got", "make", "made", "take", "took", "come", "came", "give",
  "want", "say", "said", "tell", "told", "look", "see", "find", "put",
]);

// ── Tag categories ──
const TAG_RULES: { tag: string; words: string[] }[] = [
  { tag: "work", words: ["work", "office", "project", "client", "team", "manager", "boss", "colleague", "report", "task", "sprint", "deliverable", "stakeholder", "company", "business", "corporate", "professional"] },
  { tag: "meeting", words: ["meeting", "call", "discussion", "agenda", "minutes", "attendees", "conference", "sync", "standup", "retrospective", "huddle", "review"] },
  { tag: "personal", words: ["family", "home", "dinner", "birthday", "vacation", "weekend", "exercise", "gym", "doctor", "appointment", "personal", "friend", "friends", "grocery", "shopping"] },
  { tag: "idea", words: ["idea", "concept", "brainstorm", "innovation", "creative", "inspiration", "explore", "possibility", "imagine", "what if", "prototype", "experiment"] },
  { tag: "health", words: ["health", "doctor", "medicine", "exercise", "gym", "diet", "sleep", "mental", "wellness", "therapy", "meditation", "yoga", "running", "fitness"] },
  { tag: "finance", words: ["money", "budget", "cost", "price", "payment", "salary", "invest", "investment", "savings", "expense", "revenue", "profit", "financial", "bank"] },
  { tag: "learning", words: ["learn", "study", "course", "book", "read", "research", "tutorial", "practice", "training", "education", "skill", "knowledge", "understand"] },
  { tag: "planning", words: ["plan", "schedule", "organize", "timeline", "roadmap", "strategy", "goal", "goals", "target", "priority", "priorities", "milestone"] },
  { tag: "travel", words: ["travel", "trip", "flight", "hotel", "vacation", "destination", "airport", "booking", "passport", "luggage", "sightseeing"] },
  { tag: "tech", words: ["code", "coding", "software", "app", "application", "website", "database", "server", "deploy", "debug", "api", "programming", "developer", "tech", "technology"] },
];

// ── Helper functions ──

function splitSentences(text: string): string[] {
  return text
    .replace(/([.!?])\s+/g, "$1|SPLIT|")
    .split("|SPLIT|")
    .map((s) => s.trim())
    .filter((s) => s.length > 15);
}

function getWords(text: string): string[] {
  return text.toLowerCase().match(/[a-z']+/g) || [];
}

function scoreSentence(sentence: string, wordFreq: Map<string, number>, totalSentences: number, sentenceIndex: number): number {
  const words = getWords(sentence);
  if (words.length < 4) return 0;

  // Word importance score (TF-IDF inspired)
  let importanceScore = 0;
  const uniqueWords = Array.from(new Set(words.filter((w) => !STOP_WORDS.has(w) && w.length > 3)));
  for (let ui = 0; ui < uniqueWords.length; ui++) {
    importanceScore += wordFreq.get(uniqueWords[ui]) || 0;
  }
  importanceScore = uniqueWords.length > 0 ? importanceScore / uniqueWords.length : 0;

  // Position bonus — first and second sentences are usually more important
  const positionBonus = sentenceIndex === 0 ? 2.0 : sentenceIndex === 1 ? 1.5 : sentenceIndex < 3 ? 1.2 : 1.0;

  // Length penalty — too short or too long sentences are less ideal for summaries
  const lengthFactor = words.length >= 8 && words.length <= 35 ? 1.2 : 1.0;

  return importanceScore * positionBonus * lengthFactor;
}

function generateSummary(transcript: string): string {
  const sentences = splitSentences(transcript);
  if (sentences.length === 0) return transcript.slice(0, 150);
  if (sentences.length <= 2) return sentences.join(" ");

  // Build word frequency map
  const allWords = getWords(transcript);
  const wordFreq = new Map<string, number>();
  for (const w of allWords) {
    if (!STOP_WORDS.has(w) && w.length > 3) {
      wordFreq.set(w, (wordFreq.get(w) || 0) + 1);
    }
  }

  // Score each sentence
  const scored = sentences.map((s, i) => ({
    text: s,
    index: i,
    score: scoreSentence(s, wordFreq, sentences.length, i),
  }));

  // Pick top 2-3 sentences, maintain original order
  const topCount = Math.min(3, Math.max(2, Math.ceil(sentences.length * 0.25)));
  const topSentences = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topCount)
    .sort((a, b) => a.index - b.index);

  return topSentences.map((s) => s.text).join(" ");
}

function extractActionItems(transcript: string): string[] {
  const items: string[] = [];
  const seen = new Set<string>();

  for (const pattern of ACTION_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(transcript)) !== null) {
      const fullMatch = match[0].trim();
      // Clean up the action item
      let item = fullMatch
        .replace(/^(i |we |you |he |she |they )/i, "")
        .replace(/[.!?,;]+$/, "")
        .trim();

      // Capitalize first letter
      item = item.charAt(0).toUpperCase() + item.slice(1);

      const key = item.toLowerCase();
      if (!seen.has(key) && item.length > 10 && item.length < 120) {
        seen.add(key);
        items.push(item);
      }
    }
  }

  return items.slice(0, 8); // Max 8 action items
}

function extractKeyTopics(transcript: string): string[] {
  const words = getWords(transcript);
  const freq = new Map<string, number>();

  // Count word frequencies (excluding stop words)
  for (const w of words) {
    if (!STOP_WORDS.has(w) && w.length > 3) {
      freq.set(w, (freq.get(w) || 0) + 1);
    }
  }

  // Also look for 2-word phrases (bigrams)
  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i], w2 = words[i + 1];
    if (!STOP_WORDS.has(w1) && !STOP_WORDS.has(w2) && w1.length > 3 && w2.length > 3) {
      const bigram = `${w1} ${w2}`;
      freq.set(bigram, (freq.get(bigram) || 0) + 2); // Weight bigrams higher
    }
  }

  // Sort by frequency and return top topics
  const sorted = Array.from(freq.entries())
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word]) => word.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "));

  return sorted.length > 0 ? sorted : ["General Note"];
}

function analyzeSentiment(transcript: string): "positive" | "neutral" | "negative" | "mixed" {
  const words = getWords(transcript);
  let positive = 0, negative = 0;

  for (const w of words) {
    if (POSITIVE_WORDS.has(w)) positive++;
    if (NEGATIVE_WORDS.has(w)) negative++;
  }

  const total = positive + negative;
  if (total === 0) return "neutral";

  const posRatio = positive / total;
  const negRatio = negative / total;

  if (posRatio > 0.65) return "positive";
  if (negRatio > 0.65) return "negative";
  if (total >= 4 && Math.abs(posRatio - negRatio) < 0.3) return "mixed";
  if (positive > negative) return "positive";
  if (negative > positive) return "negative";
  return "neutral";
}

function generateTags(transcript: string): string[] {
  const lower = transcript.toLowerCase();
  const tags: { tag: string; score: number }[] = [];

  for (const rule of TAG_RULES) {
    const score = rule.words.filter((w) => lower.includes(w)).length;
    if (score >= 1) {
      tags.push({ tag: rule.tag, score });
    }
  }

  // Sort by score and take top 3-5
  const result = tags
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((t) => t.tag);

  return result.length > 0 ? result : ["note"];
}

// ── Main API handler ──

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json();

    if (!transcript || transcript.length < 10) {
      return NextResponse.json({
        summary: "Note too short to generate a summary.",
        insights: {
          actionItems: [],
          keyTopics: ["Short Note"],
          sentiment: "neutral" as const,
          tags: ["short-note"],
        },
      });
    }

    // Run all analyses
    const summary = generateSummary(transcript);
    const actionItems = extractActionItems(transcript);
    const keyTopics = extractKeyTopics(transcript);
    const sentiment = analyzeSentiment(transcript);
    const tags = generateTags(transcript);

    return NextResponse.json({
      summary,
      insights: {
        actionItems,
        keyTopics,
        sentiment,
        tags,
      },
    });
  } catch (error) {
    console.error("AI insights error:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
