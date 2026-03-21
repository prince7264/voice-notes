import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file" }, { status: 400 });
    }

    if (!process.env.SARVAM_API_KEY) {
      return NextResponse.json({
        transcript: "[Transcription unavailable — SARVAM_API_KEY not set]",
      });
    }

    // Strip codec from MIME type — Sarvam accepts "audio/webm" not "audio/webm;codecs=opus"
    const audioBlob = new Blob([await audioFile.arrayBuffer()], { type: "audio/webm" });

    const sarvamForm = new FormData();
    sarvamForm.append("file", audioBlob, "recording.webm");
    sarvamForm.append("model", "saarika:v2.5");

    const res = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: {
        "api-subscription-key": process.env.SARVAM_API_KEY,
      },
      body: sarvamForm,
    });

    const rawText = await res.text();
    console.log("Sarvam status:", res.status, "body:", rawText);

    let data: Record<string, unknown> = {};
    try { data = JSON.parse(rawText); } catch { /* not json */ }

    if (!res.ok) {
      // Sarvam can return {detail: "string"} or {error: {message: "string"}}
      const errDetail = data.detail;
      const errObj = data.error as Record<string, unknown> | undefined;
      const errMsg =
        (typeof errDetail === "string" ? errDetail : null) ||
        (errObj?.message as string) ||
        rawText ||
        `Sarvam API error: ${res.status}`;
      console.error("Sarvam error:", errMsg);
      return NextResponse.json({ error: "Transcription failed", detail: errMsg }, { status: 500 });
    }

    const transcript = (data.transcript as string) ?? "";
    return NextResponse.json({ transcript });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Transcription error:", message);
    return NextResponse.json(
      { error: "Transcription failed", detail: message },
      { status: 500 }
    );
  }
}
