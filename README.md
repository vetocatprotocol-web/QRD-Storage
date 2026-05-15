# QRD Storage

QRD STORAGE is a privacy-first encrypted sync platform built around local encryption, direct signed uploads, and device storage optimization.

## Vision

QRD STORAGE is not a traditional cloud drive. It is:

- a zero-trust encrypted sync ecosystem
- a client-side encryption vault
- a seamless background backup platform
- a smart storage offloading system

Every architectural decision is aligned with the product principle:

> Your encrypted data, your ownership, your control.

## Repository structure

This monorepo is organized for the QRD STORAGE platform:

- `apps/api` — NestJS backend for auth, device management, upload session generation, and metadata persistence.
- `apps/web` — Next.js dashboard scaffold for user and device workflows.
- `packages/crypto` — Shared encryption utilities: Argon2id, AES-256-GCM, chunk key derivation.
- `packages/storage-sdk` — Backblaze B2 helper for signed direct object uploads.
- `packages/shared-types` — Common contracts for DTOs, auth tokens, upload sessions, and device registration.
- `packages/ui` — Reusable React UI primitives and shared frontend components.

## What is implemented

### Backend

- NestJS + Fastify bootstrap
- Prisma schema for users, devices, files, and upload sessions
- JWT auth and refresh token rotation
- Device registration endpoint
- Upload session generation with Backblaze B2 direct upload payloads
- Global validation pipe and CORS support

### Shared packages

- `@qrd/crypto` with secure random key generation, Argon2id key derivation, AES-256-GCM chunk encryption, and hierarchical key derivation utilities
- `@qrd/storage-sdk` with Backblaze B2 signed upload URL generation
- `@qrd/shared-types` for typed API payloads across frontend and backend

### Web

- Next.js App Router starter project
- Static homepage demonstrating the platform landing experience

## Getting started

1. Install dependencies:

```bash
pnpm install
```

2. Create a local environment file from `.env.example`:

```bash
cp .env.example .env
```

3. Generate Prisma client and run migrations:

```bash
cd apps/api
pnpm prisma:generate
pnpm prisma:migrate:dev --name init
```

4. Start development services:

```bash
pnpm dev
```

5. Open the API at `http://localhost:4000/api` and the web app on the port logged by Next.js.

## API development commands

From `apps/api`:

- `pnpm dev` — run NestJS in development mode
- `pnpm build` — compile the backend
- `pnpm prisma:generate` — generate Prisma client
- `pnpm prisma:migrate:dev` — apply database migrations locally
- `pnpm prisma:studio` — open Prisma Studio

## Workspace commands

From repo root:

- `pnpm install` — install all workspace dependencies
- `pnpm dev` — run all registered dev pipelines in parallel
- `pnpm build` — build all workspaces
- `pnpm format` — run Prettier across the repo
- `pnpm -w run mobile:sync` — export web assets and sync Capacitor native platforms
- `pnpm -w run mobile:android` — build Android debug APK after sync
- `pnpm -w run mobile:ios` — export and sync iOS native assets (build IPA requires macOS)

## Mobile app build

This repository now includes Capacitor native scaffolding in `apps/web/android` and `apps/web/ios`.

### Android

1. From Codespaces, install Android SDK command line tools and platform packages (see your environment setup script).
2. Run:

```bash
cd /workspaces/QRD-Storage/apps/web
pnpm export
pnpm exec cap sync android
cd android
./gradlew assembleDebug
```

3. The debug APK will appear at:

```bash
apps/web/android/app/build/outputs/apk/debug/app-debug.apk
```

### iOS

1. iOS archive and IPA builds require a macOS runner or Mac host.
2. On `macos-latest` or a Mac, run:

```bash
cd /workspaces/QRD-Storage/apps/web
pnpm export
pnpm exec cap sync ios
cd ios/App
xcodebuild -workspace App.xcworkspace -scheme App -configuration Release -sdk iphoneos -archivePath build/App.xcarchive archive
xcodebuild -exportArchive -archivePath build/App.xcarchive -exportPath build/ipa -exportOptionsPlist ExportOptions.plist
```

3. The IPA will be in:

```bash
apps/web/ios/App/build/ipa/
```

### GitHub Actions

A workflow is available at `.github/workflows/build-apps.yml` for automated Android and iOS build artifacts.

## Environment variables

The API uses these variables:

- `DATABASE_URL` — Postgres connection string
- `JWT_SECRET` — secret for signing access and refresh JWTs
- `B2_ACCOUNT_ID` — Backblaze B2 account ID
- `B2_APPLICATION_KEY` — Backblaze B2 application key
- `B2_BUCKET_ID` — Backblaze bucket ID

## Next steps

1. Build the device and file sync frontend in `apps/web`.
2. Add upload verification and post-upload metadata reconciliation.
3. Expand the sync engine with local queues and resumable chunked uploads.
4. Add observability: metrics, tracing, structured logs, and health checks.
5. Harden security: rate limiting, audit logging, stricter JWT claims, and refresh token revocation.
