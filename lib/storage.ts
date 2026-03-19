import type { NoteMetadata } from "@/types";

const STORAGE_KEY = "voicenotes_metadata";

export function getAllMetadata(): NoteMetadata[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as NoteMetadata[]) : [];
  } catch {
    return [];
  }
}

export function saveMetadata(notes: NoteMetadata[]): void {
  const sorted = [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
}

export function deleteMetadata(id: string): void {
  const notes = getAllMetadata().filter((n) => n.id !== id);
  saveMetadata(notes);
}
