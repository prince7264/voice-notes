import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  // Auth guard — only signed-in users can transcribe
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        transcript:
          "[Transcription unavailable — add OPENAI_API_KEY to .env.local]",
      });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const transcript = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      response_format: "json",
    });

    return NextResponse.json({ transcript: transcript.text });
  } catch (err) {
    console.error("Transcription error:", err);
    return NextResponse.json(
      { error: "Transcription failed" },
      { status: 500 }
    );
  }
}
