"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
  onClose?: () => void;
}

export function RecordTab({ onNoteCreated, onClose }: RecordTabProps) {
  const { user, profile } = useAuth();
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const { isRecording, recordingDuration, startRecording, stopRecording } = useAudioRecorder();

  const initials = profile?.name
    ? profile.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const handlePointerDown = useCallback(
    async (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      if (recordState !== "idle") return;
      try {
        await startRecording();
        setRecordState("recording");
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setErrorMsg(msg);
        setRecordState("error");
        setTimeout(() => setRecordState("idle"), 4000);
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
        if (durationMs < 500) { setRecordState("idle"); return; }
        setRecordState("transcribing");
        let transcript = "";
        try {
          transcript = await transcribeAudio(blob);
        } catch (transcribeErr) {
          const msg = transcribeErr instanceof Error ? transcribeErr.message : String(transcribeErr);
          transcript = `[Transcription error: ${msg}]`;
        }
        const metadata: NoteMetadata = {
          id: crypto.randomUUID(),
          transcript,
          createdAt: new Date().toISOString(),
          durationMs,
        };
        await onNoteCreated(metadata, blob);
        setRecordState("idle");
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setErrorMsg(msg);
        setRecordState("error");
        setTimeout(() => setRecordState("idle"), 4000);
      }
    },
    [recordState, stopRecording, onNoteCreated]
  );

  const isIdle = recordState === "idle";
  const isTranscribing = recordState === "transcribing";
  const isError = recordState === "error";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-8 pb-32 pt-16 relative overflow-hidden select-none">
      {/* Background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-fixed/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tertiary-fixed/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Header with close button */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-surface/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 h-16">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-surface-container/50 transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface">close</span>
          </button>
          <span className="text-lg font-bold text-primary tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>
            Bolkar
          </span>
          <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary text-on-primary font-bold text-xs">
                {initials}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Waveform visualizer — teal colored when recording */}
      <div className="w-full max-w-md h-48 flex items-center justify-center gap-1.5 mb-10">
        {[12, 20, 32, 16, 24, 40, 28, 14, 20].map((h, i) => (
          <div
            key={i}
            className={`w-1.5 rounded-full transition-all duration-300 ${
              isRecording
                ? "wave-bar"
                : "bg-outline-variant/40"
            }`}
            style={{
              height: `${h}px`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: `${0.6 + i * 0.08}s`,
              backgroundColor: isRecording
                ? `rgba(0, 106, 98, ${0.2 + i * 0.08})`
                : undefined,
            }}
          />
        ))}
      </div>

      {/* Timer */}
      <div className="text-center mb-14">
        <span className="block font-extrabold text-7xl tracking-tighter text-primary" style={{ fontFamily: "Manrope, sans-serif" }}>
          {isRecording
            ? formatDuration(recordingDuration)
            : isTranscribing
            ? "···"
            : isError
            ? "!"
            : "00:00"}
        </span>
        <span className="block text-sm font-semibold uppercase tracking-[0.2em] text-outline mt-2">
          {isRecording
            ? "Capturing Voice"
            : isTranscribing
            ? "Transcribing…"
            : isError
            ? (errorMsg || "Something went wrong")
            : "Hold to Record"}
        </span>
      </div>

      {/* Pulse button */}
      <div className="relative flex items-center justify-center">
        {/* Outer glow ring */}
        <div className={`absolute w-48 h-48 rounded-full transition-all duration-500 ${isRecording ? "bg-primary/8 scale-125 breathe" : "bg-surface-container-low scale-100"}`} />
        <div className={`absolute w-40 h-40 rounded-full transition-all duration-500 ${isRecording ? "bg-primary/15 scale-110" : "bg-surface-container-high/50 scale-100"}`} />

        {/* Main button */}
        <button
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          disabled={isTranscribing}
          style={{ touchAction: "none", userSelect: "none" }}
          className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all duration-300 border-4 border-white/20 ${
            isRecording
              ? "bg-primary scale-105"
              : isTranscribing
              ? "bg-surface-container-high cursor-not-allowed"
              : isError
              ? "bg-error/10"
              : "bg-primary hover:brightness-110"
          }`}
        >
          {isTranscribing ? (
            <svg className="w-10 h-10 animate-spin text-outline" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <span
              className={`material-symbols-outlined text-5xl ${isError ? "text-error" : "text-white"}`}
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48" }}
            >
              mic
            </span>
          )}
        </button>
      </div>

      {/* Instruction dots */}
      {isIdle && (
        <div className="mt-14 text-center space-y-3 fade-in">
          <p className="text-on-surface-variant text-lg font-medium">
            Hold to record, release to save
          </p>
          <div className="flex gap-2 justify-center">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="w-2 h-2 rounded-full bg-primary/30" />
            <span className="w-2 h-2 rounded-full bg-primary/15" />
          </div>
        </div>
      )}

      {isRecording && (
        <div className="mt-14 fade-in">
          <p className="text-primary/70 text-sm font-semibold text-center">Release to stop</p>
        </div>
      )}

      {/* Contextual Controls — Delete & Pause (bottom) */}
      {isRecording && (
        <div className="fixed bottom-32 left-0 right-0 z-30 flex items-center justify-center gap-6 fade-in">
          <button className="bg-surface-container-highest/90 backdrop-blur-xl border border-white/50 rounded-2xl p-4 hover:bg-error-container/30 transition-colors active:scale-95">
            <span className="material-symbols-outlined text-on-surface-variant text-2xl">delete</span>
          </button>
          <button className="bg-surface-container-highest/90 backdrop-blur-xl border border-white/50 rounded-2xl p-4 hover:bg-primary-container/30 transition-colors active:scale-95">
            <span className="material-symbols-outlined text-on-surface-variant text-2xl">pause</span>
          </button>
        </div>
      )}
    </div>
  );
}
