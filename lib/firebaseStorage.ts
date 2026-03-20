import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./firebase";

export async function uploadAudio(
  userId: string,
  noteId: string,
  blob: Blob
): Promise<string> {
  const storageRef = ref(storage, `audio/${userId}/${noteId}.webm`);
  await uploadBytes(storageRef, blob);
  return await getDownloadURL(storageRef);
}

export async function getAudioUrl(
  userId: string,
  noteId: string
): Promise<string> {
  const storageRef = ref(storage, `audio/${userId}/${noteId}.webm`);
  return await getDownloadURL(storageRef);
}

export async function deleteAudio(userId: string, noteId: string) {
  try {
    const storageRef = ref(storage, `audio/${userId}/${noteId}.webm`);
    await deleteObject(storageRef);
  } catch {
    // Ignore if file doesn't exist
  }
}
