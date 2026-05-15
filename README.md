# QRD STORAGE

> Your encrypted data, your ownership, your control.

QRD STORAGE adalah privacy-first encrypted sync platform yang dirancang untuk:
- sinkronisasi otomatis
- backup terenkripsi
- optimasi storage perangkat
- cloud storage usage-based
- seamless background sync

QRD STORAGE bukan cloud drive tradisional.

QRD STORAGE adalah:
- encrypted sync ecosystem
- smart storage offloading platform
- personal encrypted cloud vault
- zero-trust storage infrastructure

---

# Core Philosophy

QRD STORAGE dibangun berdasarkan prinsip:

## 1. User Ownership First

Pengguna harus:
- memiliki kontrol penuh terhadap data
- mengontrol file dan perilaku sinkronisasi
- memiliki ownership terhadap encryption keys
- bebas dari lock-in storage package

---

## 2. Zero-Trust Architecture

QRD STORAGE mengasumsikan:
- object storage tidak trusted
- backend tidak trusted
- plaintext tidak boleh keluar dari device

Karena itu:
- semua file dienkripsi sebelum upload
- backend tidak pernah menerima plaintext file
- object storage hanya menyimpan encrypted blobs

---

## 3. Privacy-First Storage

QRD STORAGE memprioritaskan:
- end-to-end encryption
- minimal metadata collection
- no behavioral tracking
- no content inspection
- transparent billing

---

# Product Vision

QRD STORAGE dirancang menjadi:
- personal encrypted cloud vault
- intelligent storage optimization platform
- seamless encrypted sync ecosystem
- scalable storage infrastructure layer

QRD STORAGE membantu pengguna:

> menyimpan lebih banyak data tanpa membebani storage perangkat.

---

# Main User Experience

QRD STORAGE dirancang agar terasa seperti:

> silent encrypted storage layer untuk semua device pengguna.

Workflow utama:

```text
User selects folders
        ↓
Background watcher monitors changes
        ↓
Files encrypted locally
        ↓
Encrypted chunks uploaded directly to B2
        ↓
Metadata persisted
        ↓
Upload verified
        ↓
User notified safely backed up
        ↓
App recommends local cleanup
```

---

# Core Features

## Storage & Sync

- automatic folder sync
- background uploads
- resumable uploads
- chunked uploads
- offline queue persistence
- cloud-only file architecture
- restore-on-demand
- selective sync
- device sync management

---

## Security

- AES-256-GCM encryption
- Argon2id key derivation
- local-first encryption
- signed upload sessions
- JWT authentication
- refresh token rotation
- device registration
- integrity verification

---

## Storage Optimization

- automatic cleanup recommendations
- cloud-backed storage
- smart local file removal
- storage usage estimation
- restore anytime

---

# Architecture Overview

## High-Level Architecture

```text
Frontend Apps
    ↓
API Gateway
    ↓
Backend API
    ↓
Auth + Metadata Services
    ↓
PostgreSQL

Client Device
    ↓
Local Encryption Layer
    ↓
Chunk Upload Engine
    ↓
Signed Upload URLs
    ↓
Backblaze B2
```

---

# Sync Engine Architecture

QRD STORAGE dibangun di atas event-driven sync architecture.

```text
Filesystem Watcher
        ↓
Sync Queue
        ↓
Chunk Splitter
        ↓
Local Encryption
        ↓
Upload Scheduler
        ↓
Direct Upload
        ↓
Verification
        ↓
Metadata Reconciliation
```

---

# File Lifecycle

QRD STORAGE menggunakan explicit sync state machine.

```text
DISCOVERED
HASHING
ENCRYPTING
QUEUED
UPLOADING
VERIFYING
SYNCED
FAILED
CONFLICTED
RESTORING
```

Pendekatan ini membantu:
- resumable uploads
- crash recovery
- offline sync
- retry orchestration
- distributed reliability

---

# Storage Model

QRD STORAGE menggunakan:
- usage-based pricing
- flexible storage billing
- no forced quota packages

Philosophy:

> Use what you need. Pay only for what you use.

Pricing:
- Rp210 / GB / month

Download policy:
- free downloads up to 3× active storage usage
- speed throttling after limit
- downloads never blocked

---

# Repository Structure

```text
apps/
  api/
  web/

packages/
  crypto/
  storage-sdk/
  shared-types/
  ui/
  sync-core/        (planned)
  local-db/         (planned)
```

---

# Applications

## apps/api

NestJS backend:
- authentication
- device management
- upload session generation
- metadata persistence
- upload verification
- billing logic

Stack:
- NestJS
- Fastify
- Prisma
- PostgreSQL
- BullMQ
- Redis

---

## apps/web

Next.js dashboard:
- login/register
- storage dashboard
- sync monitoring
- billing estimation
- cloud file browsing
- restore management

Stack:
- Next.js App Router
- React
- TailwindCSS
- shadcn/ui
- TypeScript strict mode

---

# Shared Packages

## packages/crypto

Shared cryptographic utilities:
- Argon2id
- AES-256-GCM
- chunk encryption
- hierarchical key derivation
- secure random generation

Important:
- encryption occurs locally
- plaintext never uploaded

---

## packages/storage-sdk

Backblaze B2 integration:
- authorization
- signed upload URLs
- direct upload payloads
- upload session helpers

Purpose:
- reduce backend bandwidth
- improve scalability
- reduce infrastructure costs

---

## packages/shared-types

Shared TypeScript contracts:
- DTOs
- auth payloads
- upload sessions
- sync metadata
- device registration payloads

---

## packages/ui

Reusable UI components:
- Button
- Input
- Card
- Icons
- shared layout primitives

---

# Mobile Support

QRD STORAGE menggunakan Capacitor untuk mobile scaffolding.

Supported:
- Android
- iOS

Current structure:

```text
apps/web/android
apps/web/ios
```

Future direction:
- React Native sync engine
- native filesystem integrations
- background sync services

---

# Security Model

QRD STORAGE menggunakan zero-trust security architecture.

Backend:
- cannot decrypt files
- cannot inspect content
- cannot access plaintext uploads

Object storage:
- stores encrypted chunks only

Encryption:
- happens locally
- before upload
- automatically in background

---

# Threat Model

QRD STORAGE mengasumsikan:
- storage providers may be compromised
- uploads may fail partially
- devices may disconnect unexpectedly
- network connectivity may be unreliable

Karena itu sistem dirancang untuk:
- resumable uploads
- retry orchestration
- integrity verification
- offline recovery
- crash-safe persistence

---

# Scalability Principles

QRD STORAGE dirancang untuk:
- millions of files
- millions of sync events
- distributed upload workers
- large file uploads
- horizontal backend scaling

Scalability decisions:
- direct signed uploads
- stateless APIs
- chunk-based uploads
- async event-driven architecture
- persistent local queues

---

# Observability

Storage systems sangat sulit di-debug.

QRD STORAGE menggunakan:
- structured logging
- correlation IDs
- sync tracing
- upload diagnostics

Important tracing IDs:

```text
syncId
fileId
chunkId
deviceId
uploadSessionId
```

---

# Development Philosophy

Every engineering decision should prioritize:
- privacy
- user ownership
- sync correctness
- low infrastructure cost
- scalability
- maintainability
- reliability

Never sacrifice:
- encryption
- user control
- transparency

for:
- analytics
- monetization
- convenience

---

# Getting Started

## Install dependencies

```bash
pnpm install
```

---

## Setup environment

```bash
cp .env.example .env
```

Configure:

```env
DATABASE_URL=
JWT_SECRET=

B2_ACCOUNT_ID=
B2_APPLICATION_KEY=
B2_BUCKET_ID=
```

---

## Prisma setup

```bash
cd apps/api

pnpm prisma:generate
pnpm prisma:migrate:dev --name init
```

---

## Run development servers

From root:

```bash
pnpm dev
```

Or run separately:

```bash
cd apps/api
pnpm dev

cd apps/web
pnpm dev
```

---

# Mobile Development

## Android

```bash
cd apps/web

pnpm export
pnpm exec cap sync android

cd android
./gradlew assembleDebug
```

Requirements:
- Android SDK
- JAVA_HOME
- platform-tools

---

## iOS

Requirements:
- macOS
- Xcode
- CocoaPods

Workflow:

```bash
pnpm export
pnpm exec cap sync ios
```

Then open:

```text
apps/web/ios/App.xcworkspace
```

---

# Environment Variables

```env
DATABASE_URL=
JWT_SECRET=

B2_ACCOUNT_ID=
B2_APPLICATION_KEY=
B2_BUCKET_ID=
```

---

# Current Development Status

## Implemented

- monorepo architecture
- NestJS backend
- Prisma schema
- JWT auth
- refresh token rotation
- device registration
- upload session generation
- Backblaze B2 integration
- shared crypto utilities
- Next.js dashboard scaffold
- Capacitor mobile scaffold

---

## In Progress

- sync-core package
- resumable upload engine
- chunk manifest architecture
- persistent local queue
- upload verification
- realtime sync lifecycle

---

## Planned

- cloud-only files
- restore-on-demand
- selective sync
- sync conflict resolution
- chunk deduplication
- storage optimization engine
- distributed workers
- multi-provider storage support

---

# Long-Term Vision

QRD STORAGE aims to become:
- encrypted sync infrastructure
- intelligent cloud storage layer
- privacy-first storage ecosystem
- scalable encrypted storage network

QRD STORAGE is not just cloud storage.

It is:

> your personal encrypted storage layer.

---

# License

Add appropriate LICENSE file before public distribution.
