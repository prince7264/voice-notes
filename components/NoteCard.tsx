"use client";

import { useState } from "react";
import type { NoteMetadata } from "@/types";
import { AudioPlayer } from "./AudioPlayer";

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m === 0) return `${sec}s`;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

interface NoteCardProps {
  note: NoteMetadata;
  userId: string;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, userId, onDelete }: NoteCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(note.transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(note.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const isLong = note.transcript.length > 160;

  return (
    <article className="bg-surface-container-lowest rounded-2xl p-5 shadow-ambient hover:-translate-y-0.5 transition-all duration-300 group">
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-tertiary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-tertiary-container text-lg">mic</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>
              {formatRelativeDate(note.createdAt)}
            </p>
            <p className="text-xs text-on-surface-variant">
              {formatDuration(note.durationMs)} recording
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-primary bg-surface-container-low px-2.5 py-1 rounded-lg">
          {formatDuration(note.durationMs)}
        </span>
      </div>

      {/* Transcript */}
      <div className="mb-4">
        <p className={`text-on-surface-variant leading-relaxed text-sm ${!expanded && isLong ? "line-clamp-3" : ""}`}>
          {note.transcript}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-primary font-semibold mt-1.5 hover:underline transition-colors"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>

      {/* Audio Player */}
      <div className="bg-surface-container-low rounded-xl px-3 py-2.5 mb-3">
        <AudioPlayer userId={userId} noteId={note.id} durationMs={note.durationMs} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary px-3 py-1.5 rounded-xl hover:bg-surface-container-low transition-all font-medium"
        >
          <span className="material-symbols-outlined text-base leading-none">
            {copied ? "check_circle" : "content_copy"}
          </span>
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
        <button
          onClick={handleDelete}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all font-medium ${
            confirmDelete
              ? "text-error bg-error-container/30"
              : "text-on-surface-variant hover:text-error hover:bg-error-container/20"
          }`}
        >
          <span className="material-symbols-outlined text-base leading-none">
            {confirmDelete ? "warning" : "delete"}
          </span>
          <span>{confirmDelete ? "Confirm?" : "Delete"}</span>
        </button>
      </div>
    </article>
  );
}
