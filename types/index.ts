export interface NoteMetadata {
  id: string;
  transcript: string;
  createdAt: string; // ISO 8601
  durationMs: number;
}

export interface Note extends NoteMetadata {
  audioBlob?: Blob;
}

export type RecordState = "idle" | "recording" | "transcribing" | "error";
