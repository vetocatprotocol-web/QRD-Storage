# QRD Storage

QRD STORAGE is a privacy-first encrypted sync ecosystem built around local encryption, direct object storage uploads, and smart device storage optimization.

## Workspace structure

- `apps/api` — NestJS backend skeleton for authentication, signed upload sessions, and metadata APIs.
- `apps/web` — Next.js web dashboard starting point for user and device interfaces.
- `packages/crypto` — Shared client-side encryption utilities with AES-256-GCM and Argon2id key derivation.
- `packages/storage-sdk` — Backblaze B2 upload client for signed direct uploads.
- `packages/shared-types` — Typed contracts for upload sessions, file metadata, and shared API payloads.
- `packages/ui` — Reusable UI primitives for React apps.

## Goals

This repo is scaffolded to support the QRD STORAGE product vision:

- Zero-trust, client-side encryption
- Direct signed uploads to Backblaze B2
- Modular sync engine and secure backend
- Monorepo architecture for web, backend, and shared libraries

## Getting started

```bash
pnpm install
pnpm dev
```

Then open the API at `http://localhost:4000/api` and the web app at the port provided by Next.js.

## Next roadmap

1. Add Prisma schema and database migrations for users, devices, files, and upload sessions.
2. Implement NestJS auth, device registration, and token rotation.
3. Extend `packages/crypto` with hierarchical key management and chunk encryption.
4. Build the `apps/web` dashboard to register devices and generate upload sessions.
5. Add background sync engine, upload verification workers, and observability.
