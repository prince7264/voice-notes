"use client";

import { useState, useCallback, useRef } from "react";
import type { NoteMetadata, RecordState } from "@/types";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { transcribeAudio } from "@/lib/transcribe";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

interface RecordTabProps {
  onNoteCreated: (metadata: NoteMetadata, blob: Blob) => Promise<void>;
}

export function RecordTab({ onNoteCreated }: RecordTabProps) {
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const { isRecording, recordingDuration, startRecording, stopRecording } =
    useAudioRecorder();
  const blobRef = useRef<Blob | null>(null);

  const handlePointerDown = useCallback(
    async (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      if (recordState !== "idle") return;
      try {
        await startRecording();
        setRecordState("recording");
      } catch {
        setRecordState("error");
        setTimeout(() => setRecordState("idle"), 2500);
      }
    },
    [recordState, startRecording]
  );

  const handlePointerUp = useCallback(
    async (e: React.PointerEvent) => {
      e.preventDefault();
      if (recordState !== "recording") return;
      try {
        const { blob, durationMs } = await stopRecording();
        blobRef.current = blob;

        if (durationMs < 500) {
          setRecordState("idle");
          return;
        }

        setRecordState("transcribing");
        const transcript = await transcribeAudio(blob);

        const metadata: NoteMetadata = {
          id: crypto.randomUUID(),
          transcript,
          createdAt: new Date().toISOString(),
          durationMs,
        };

        await onNoteCreated(metadata, blob);
        setRecordState("idle");
      } catch {
        setRecordState("error");
        setTimeout(() => setRecordState("idle"), 2500);
      }
    },
    [recordState, stopRecording, onNoteCreated]
  );

  const isIdle = recordState === "idle";
  const isTranscribing = recordState === "transcribing";
  const isError = recordState === "error";

  const statusText = isRecording
    ? formatDuration(recordingDuration)
    : isTranscribing
    ? "Transcribing…"
    : isError
    ? "Something went wrong"
    : "Hold to record";

  const statusColor = isError
    ? "text-[#EF4444]"
    : isRecording
    ? "text-[#EF4444]"
    : isTranscribing
    ? "text-[#6366F1]"
    : "text-[#4A4A65]";

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 select-none">
      {/* Title */}
      <h2 className="text-xl font-bold text-[#F1F1FA] mb-2">New Recording</h2>
      <p className={`text-sm mb-12 transition-colors ${statusColor}`}>
        {statusText}
      </p>

      {/* Record Button */}
      <div className="relative flex items-center justify-center mb-12">
        {/* Outer ripple rings */}
        {isRecording && (
          <>
            <span className="absolute w-40 h-40 rounded-full border border-[#EF4444]/20 animate-ping" style={{ animationDuration: "1.5s" }} />
            <span className="absolute w-52 h-52 rounded-full border border-[#EF4444]/10 animate-ping" style={{ animationDuration: "2s" }} />
          </>
        )}

        {/* Button */}
        <button
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          disabled={isTranscribing}
          style={{ touchAction: "none", userSelect: "none" }}
          className={[
            "relative w-28 h-28 rounded-full flex items-center justify-center",
            "transition-all duration-200 focus:outline-none shadow-2xl",
            isRecording
              ? "bg-[#EF4444] scale-110 shadow-[#EF4444]/40"
              : isTranscribing
              ? "bg-[#252538] cursor-not-allowed shadow-none"
              : isError
              ? "bg-[#EF4444]/20 border-2 border-[#EF4444]/40"
              : "bg-[#6366F1] hover:bg-[#5153D8] active:scale-95 shadow-[#6366F1]/30",
          ].join(" ")}
        >
          {/* Transcribing spinner */}
          {isTranscribing ? (
            <svg className="w-10 h-10 animate-spin text-[#6366F1]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            /* Mic icon */
            <svg
              className={`w-11 h-11 ${isError ? "text-[#EF4444]" : "text-white"}`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 1a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v7a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zm-1 17.93V22h2v-1.07A8.001 8.001 0 0 0 20 13h-2a6 6 0 0 1-12 0H4a8.001 8.001 0 0 0 7 7.93z" />
            </svg>
          )}
        </button>
      </div>

      {/* Hint */}
      {isIdle && (
        <p className="text-xs text-[#4A4A65] text-center max-w-[200px] leading-relaxed">
          Press and hold the button to start recording your voice note
        </p>
      )}

      {isRecording && (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
          <p className="text-xs text-[#EF4444]">Recording — release to stop</p>
        </div>
      )}
    </div>
  );
}
