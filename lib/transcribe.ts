export async function transcribeAudio(blob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("audio", blob, "recording.webm");

  const res = await fetch("/api/transcribe", {
    method: "POST",
    body: formData,
  });

  const data = await res.json() as { transcript?: string; error?: string; detail?: string };

  if (!res.ok) {
    throw new Error(data.detail || data.error || `Transcription failed: ${res.status}`);
  }

  if (!data.transcript) {
    throw new Error("No transcript returned");
  }

  return data.transcript;
}
