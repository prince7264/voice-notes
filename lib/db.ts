const DB_NAME = "voicenotes_db";
const DB_VERSION = 1;
const STORE_NAME = "audio_blobs";

function dbKey(userId: string, noteId: string): string {
  return `${userId}:${noteId}`;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveAudio(userId: string, noteId: string, blob: Blob): Promise<void> {
  if (!userId) return;
  const arrayBuffer = await blob.arrayBuffer();
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(arrayBuffer, dbKey(userId, noteId));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAudio(userId: string, noteId: string): Promise<Blob | null> {
  if (!userId) return null;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(dbKey(userId, noteId));
    req.onsuccess = () => {
      if (req.result) {
        resolve(new Blob([req.result as ArrayBuffer], { type: "audio/webm" }));
      } else {
        resolve(null);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteAudio(userId: string, noteId: string): Promise<void> {
  if (!userId) return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(dbKey(userId, noteId));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
