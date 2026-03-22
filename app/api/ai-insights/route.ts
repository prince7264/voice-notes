import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json();

    if (!transcript || transcript.length < 10) {
      return NextResponse.json({
        summary: "Note too short to generate a summary.",
        insights: {
          actionItems: [],
          keyTopics: [],
          sentiment: "neutral" as const,
          tags: ["short-note"],
        },
      });
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Analyze this voice note transcript and return a JSON object with exactly these fields:

{
  "summary": "A concise 2-3 sentence summary capturing the main points",
  "actionItems": ["array of action items or to-dos mentioned, empty array if none"],
  "keyTopics": ["3-6 main themes or subjects discussed"],
  "sentiment": "one of: positive, neutral, negative, mixed",
  "tags": ["3-5 short category tags like work, personal, idea, meeting, etc"]
}

Return ONLY valid JSON, no markdown, no explanation.

Transcript:
${transcript.slice(0, 4000)}`,
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse the JSON response
    const parsed = JSON.parse(text);

    return NextResponse.json({
      summary: parsed.summary || "Unable to generate summary.",
      insights: {
        actionItems: parsed.actionItems || [],
        keyTopics: parsed.keyTopics || [],
        sentiment: parsed.sentiment || "neutral",
        tags: parsed.tags || [],
      },
    });
  } catch (error) {
    console.error("AI insights error:", error);

    // If API key is missing, return a helpful error
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "YOUR_ANTHROPIC_API_KEY_HERE") {
      return NextResponse.json(
        { error: "Anthropic API key not configured" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
