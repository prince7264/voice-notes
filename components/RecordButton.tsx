"use client";

import { useCallback, useRef } from "react";
import type { NoteMetadata, RecordState } from "@/types";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { transcribeAudio } from "@/lib/transcribe";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

interface RecordButtonProps {
  recordState: RecordState;
  setRecordState: (s: RecordState) => void;
  onNoteCreated: (note: NoteMetadata, blob: Blob) => void;
}

export function RecordButton({ recordState, setRecordState, onNoteCreated }: RecordButtonProps) {
  const { isRecording, recordingDuration, startRecording, stopRecording } =
    useAudioRecorder();
  const blobRef = useRef<Blob | null>(null);
  const durationRef = useRef<number>(0);

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
        setTimeout(() => setRecordState("idle"), 2000);
      }
    },
    [recordState, startRecording, setRecordState]
  );

  const handlePointerUp = useCallback(
    async (e: React.PointerEvent) => {
      e.preventDefault();
      if (recordState !== "recording") return;
      try {
        const { blob, durationMs } = await stopRecording();
        blobRef.current = blob;
        durationRef.current = durationMs;

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

        onNoteCreated(metadata, blob);
        setRecordState("idle");
      } catch {
        setRecordState("error");
        setTimeout(() => setRecordState("idle"), 2000);
      }
    },
    [recordState, stopRecording, setRecordState, onNoteCreated]
  );

  const isIdle = recordState === "idle";
  const isTranscribing = recordState === "transcribing";
  const isError = recordState === "error";

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {/* Label */}
      <span className="text-xs font-medium tracking-widest uppercase text-[#8E8E93]">
        {isRecording
          ? formatDuration(recordingDuration)
          : isTranscribing
          ? "Transcribing…"
          : isError
          ? "Try again"
          : "Hold to record"}
      </span>

      {/* Button */}
      <button
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        disabled={isTranscribing}
        style={{ touchAction: "none", userSelect: "none" }}
        className={[
          "relative w-20 h-20 rounded-full flex items-center justify-center",
          "transition-all duration-200 focus:outline-none",
          isRecording
            ? "bg-[#FF453A] scale-110"
            : isTranscribing
            ? "bg-[#2A2A2E] cursor-not-allowed"
            : isError
            ? "bg-[#FF453A]/30"
            : "bg-[#6366F1] hover:bg-[#5254CC] active:scale-95",
        ].join(" ")}
      >
        {/* Pulse ring during recording */}
        {isRecording && (
          <>
            <span className="absolute inset-0 rounded-full bg-[#FF453A] animate-ping opacity-30" />
            <span className="absolute -inset-3 rounded-full border border-[#FF453A]/40 animate-pulse" />
          </>
        )}

        {/* Spinner during transcribing */}
        {isTranscribing && (
          <svg
            className="w-8 h-8 animate-spin text-[#6366F1]"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}

        {/* Mic icon */}
        {!isTranscribing && (
          <svg
            className={`w-8 h-8 ${isRecording ? "text-white" : isError ? "text-[#FF453A]" : "text-white"}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 1a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v7a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zm-1 17.93V22h2v-1.07A8.001 8.001 0 0 0 20 13h-2a6 6 0 0 1-12 0H4a8.001 8.001 0 0 0 7 7.93z" />
          </svg>
        )}
      </button>
    </div>
  );
}
