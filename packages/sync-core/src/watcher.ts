import { enqueue, SyncJob } from './queue';

// Simple watcher API placeholder: in real apps this integrates with filesystem events (Node) or File System Access (browser)
export async function discoveredFile(filePath: string, fileSize: number) {
  const job: SyncJob = { filePath, fileSize, state: 'discovered' };
  const id = await enqueue(job as SyncJob);
  return id;
}
