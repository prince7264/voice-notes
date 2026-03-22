import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { NoteMetadata } from "@/types";

export interface UserProfile {
  name: string;
  age: number;
  profession: string;
  onboardingComplete: boolean;
  email?: string;
  photoURL?: string;
}

export async function saveUserProfile(
  userId: string,
  profile: Partial<UserProfile>
) {
  await setDoc(doc(db, "users", userId), profile, { merge: true });
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", userId));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function saveNote(userId: string, note: NoteMetadata) {
  await setDoc(doc(db, "users", userId, "notes", note.id), note);
}

export async function getNotes(userId: string): Promise<NoteMetadata[]> {
  const q = query(
    collection(db, "users", userId, "notes"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as NoteMetadata);
}

export async function updateNoteFields(userId: string, noteId: string, fields: Partial<NoteMetadata>) {
  await updateDoc(doc(db, "users", userId, "notes", noteId), fields);
}

export async function deleteNote(userId: string, noteId: string) {
  await deleteDoc(doc(db, "users", userId, "notes", noteId));
}
