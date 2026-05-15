import { SyncJob, updateJob } from './queue';

export async function processJob(job: SyncJob, handlers: {
  encrypt: (job: SyncJob) => Promise<SyncJob>;
  upload: (job: SyncJob) => Promise<SyncJob>;
  verify: (job: SyncJob) => Promise<SyncJob>;
}) {
  try {
    if (job.state === 'discovered') {
      job.state = 'encrypting';
      await updateJob(job);
      job = await handlers.encrypt(job);
    }

    if (job.state === 'encrypting') {
      job.state = 'uploading';
      await updateJob(job);
      job = await handlers.upload(job);
    }

    if (job.state === 'uploading') {
      job.state = 'verifying';
      await updateJob(job);
      job = await handlers.verify(job);
    }

    if (job.state === 'verifying') {
      job.state = 'synced';
      await updateJob(job);
    }
  } catch (err: any) {
    job.attempts = (job.attempts || 0) + 1;
    job.lastError = String(err?.message || err);
    job.state = 'failed';
    await updateJob(job);
    throw err;
  }
}
