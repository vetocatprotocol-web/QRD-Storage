# sync-core

Provides a lightweight IndexedDB-backed queue and state machine for file sync jobs.

API:

- `enqueue(job)` - add a job
- `getPending()` - list pending jobs
- `processJob(job, handlers)` - run state machine for a job
- `discoveredFile(path, size)` - convenience to enqueue discovered file
