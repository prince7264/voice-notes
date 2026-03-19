import type { NoteMetadata } from "@/types";

function storageKey(userId: string): string {
  return `voicenotes_metadata:${userId}`;
}

export function getAllMetadata(userId: string): NoteMetadata[] {
  if (typeof window === "undefined" || !userId) return [];
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? (JSON.parse(raw) as NoteMetadata[]) : [];
  } catch {
    return [];
  }
}

export function saveMetadata(notes: NoteMetadata[], userId: string): void {
  if (!userId) return;
  const sorted = [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  localStorage.setItem(storageKey(userId), JSON.stringify(sorted));
}

export function deleteMetadata(id: string, userId: string): void {
  if (!userId) return;
  const notes = getAllMetadata(userId).filter((n) => n.id !== id);
  saveMetadata(notes, userId);
}
