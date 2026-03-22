export interface NoteInsights {
  actionItems: string[];
  keyTopics: string[];
  sentiment: "positive" | "neutral" | "negative" | "mixed";
  tags: string[];
}

export interface NoteMetadata {
  id: string;
  transcript: string;
  createdAt: string; // ISO 8601
  durationMs: number;
  audioUrl?: string;
  category?: string;
  summary?: string;
  insights?: NoteInsights;
  aiStatus?: "pending" | "completed" | "failed";
}

export interface Note extends NoteMetadata {
  audioBlob?: Blob;
}

export type RecordState = "idle" | "recording" | "transcribing" | "error";

export interface UserProfile {
  name: string;
  age: number;
  profession: string;
}
