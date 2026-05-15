import { openDB, IDBPDatabase } from 'idb';

export type SyncJobState = 'discovered' | 'encrypting' | 'uploading' | 'verifying' | 'synced' | 'failed';

export interface SyncJob {
  id?: number;
  filePath: string;
  fileSize: number;
  state: SyncJobState;
  attempts?: number;
  lastError?: string | null;
}

const DB_NAME = 'qrd-sync-db';
const STORE_JOBS = 'jobs';

let dbPromise: Promise<IDBPDatabase> | null = null;

async function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_JOBS)) {
          db.createObjectStore(STORE_JOBS, { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }
  return dbPromise;
}

export async function enqueue(job: SyncJob): Promise<number> {
  const db = await getDb();
  const tx = db.transaction(STORE_JOBS, 'readwrite');
  const store = tx.objectStore(STORE_JOBS);
  const id = await store.add(job);
  await tx.done;
  return id as number;
}

export async function getPending(limit = 50): Promise<SyncJob[]> {
  const db = await getDb();
  const tx = db.transaction(STORE_JOBS, 'readonly');
  const store = tx.objectStore(STORE_JOBS);
  const all = await store.getAll();
  return all.filter((j: SyncJob) => j.state !== 'synced');
}

export async function updateJob(job: SyncJob): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(STORE_JOBS, 'readwrite');
  const store = tx.objectStore(STORE_JOBS);
  await store.put(job);
  await tx.done;
}

export async function deleteJob(id: number): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(STORE_JOBS, 'readwrite');
  tx.objectStore(STORE_JOBS).delete(id);
  await tx.done;
}
