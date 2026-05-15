<div align="center">

```
 ██████╗ ██████╗ ██████╗     ███████╗████████╗ ██████╗ ██████╗  █████╗  ██████╗ ███████╗
██╔═══██╗██╔══██╗██╔══██╗    ██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗██╔══██╗██╔════╝ ██╔════╝
██║   ██║██████╔╝██║  ██║    ███████╗   ██║   ██║   ██║██████╔╝███████║██║  ███╗█████╗  
██║▄▄ ██║██╔══██╗██║  ██║    ╚════██║   ██║   ██║   ██║██╔══██╗██╔══██║██║   ██║██╔══╝  
╚██████╔╝██║  ██║██████╔╝    ███████║   ██║   ╚██████╔╝██║  ██║██║  ██║╚██████╔╝███████╗
 ╚══▀▀═╝ ╚═╝  ╚═╝╚═════╝     ╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝
```

**Your encrypted data. Your ownership. Your control.**

[![License](https://img.shields.io/badge/license-proprietary-red.svg?style=flat-square)](./LICENSE)
[![Platform](https://img.shields.io/badge/platform-web%20%7C%20android%20%7C%20ios-blue?style=flat-square)](#)
[![Stack](https://img.shields.io/badge/stack-NestJS%20%2B%20Next.js%20%2B%20Capacitor-informational?style=flat-square)](#)
[![Storage](https://img.shields.io/badge/storage-B2%20%7C%20Wasabi%20%7C%20Cloudflare%20R2-orange?style=flat-square)](#)
[![Encryption](https://img.shields.io/badge/encryption-AES--256--GCM%20%2B%20Argon2id-success?style=flat-square)](#)

</div>

---

## Apa itu QRD Storage?

QRD Storage bukan cloud drive biasa.

QRD Storage adalah **encrypted sync ecosystem** — infrastruktur penyimpanan terenkripsi yang bekerja diam-diam di latar belakang, mengamankan file Anda secara otomatis sebelum meninggalkan perangkat Anda. Backend kami tidak pernah bisa membaca file Anda. Storage provider kami tidak pernah melihat isi data Anda. Hanya Anda yang memegang kuncinya.

> *"Bayangkan iCloud atau Google Photos — tapi dengan enkripsi yang tidak bisa ditembus siapapun, bahkan oleh kami."*

**QRD Storage terasa seperti:**
- Lapisan backup tersembunyi yang bekerja otomatis
- Perpanjangan storage perangkat Anda ke cloud
- Vault pribadi yang hanya Anda yang bisa buka

**QRD Storage bukan:**
- Platform analytics atau surveillance
- Cloud drive yang membaca konten Anda
- Layanan dengan paket storage yang dipaksakan

---

## Fitur Utama

### 🔐 Enkripsi End-to-End yang Sesungguhnya

File dienkripsi **di perangkat Anda** sebelum dikirim ke manapun. Menggunakan AES-256-GCM dengan key derivation Argon2id. Backend kami hanya menerima encrypted blobs — secara arsitektur tidak mungkin membaca isi file Anda.

```
Password Anda
    ↓ Argon2id (600.000 iterasi, 64MB memory)
Master Key (hanya di memory perangkat)
    ↓ HKDF
File Encryption Key
    ↓ AES-256-GCM + random IV per chunk
Encrypted Blob  →  Object Storage
```

### 🗜️ Kompresi Cerdas Sebelum Enkripsi

File dikompres (gzip) **sebelum** dienkripsi — karena data terenkripsi tidak bisa dikompres. Untuk dokumen dan teks ini menghemat 30–70% bandwidth dan storage. File yang sudah terkompresi (JPG, MP4, ZIP) secara otomatis melewati proses ini.

### 🔄 Sinkronisasi Latar Belakang

Pilih folder. Selesai. QRD Storage memantau perubahan file secara otomatis dan menyinkronkan ke cloud tanpa Anda perlu melakukan apapun. Upload berjalan di background, bisa dilanjutkan jika koneksi terputus, dan bertahan dari crash perangkat.

```
Anda menambah file baru
    ↓ (otomatis, tanpa interaksi)
Terdeteksi → Dikompres → Dienkripsi → Antrian upload
    ↓
Upload langsung ke object storage (melewati server kami)
    ↓
Terverifikasi → Notifikasi: "File aman dicadangkan"
    ↓ (opsional)
"Hapus dari perangkat untuk bebaskan 2.4 GB?"
```

### 📱 Web, Android, iOS — Satu Codebase

Tersedia di semua platform utama. Satu akun, semua perangkat tersinkronisasi. Menggunakan Capacitor untuk mobile dengan dukungan background sync native.

### 💰 Bayar Sesuai Penggunaan

Tidak ada paket storage yang dipaksakan. Tidak ada biaya tersembunyi.

| Komponen | Tarif |
|---|---|
| Storage aktif | **Rp 210 / GB / bulan** |
| Download | **Gratis** hingga 3× usage aktif |
| Download setelah limit | Throttling kecepatan (tidak pernah diblokir) |

### 🗑️ Optimalkan Storage Perangkat

Setelah backup terverifikasi, QRD Storage menyarankan penghapusan file lokal. File tetap bisa diakses kapan saja dari cloud. Anda memilih: hapus semua, pilih manual, atau biarkan di perangkat.

---

## Arsitektur

### Zero-Trust Security Model

QRD Storage dirancang dengan asumsi bahwa **tidak ada infrastruktur yang bisa dipercaya** — termasuk backend kami sendiri.

```
┌─────────────────────────────────────────────────────────────┐
│                    PERANGKAT PENGGUNA                       │
│                                                             │
│  File  →  [Compress]  →  [Encrypt AES-256-GCM]  →  Chunk   │
│                              ↑                              │
│                     Key hanya di memory                     │
│                     Tidak pernah dikirim                    │
└──────────────────────────────┬──────────────────────────────┘
                               │  Encrypted chunks only
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                      QRD API SERVER                         │
│                                                             │
│  • Autentikasi & device management                          │
│  • Generate signed upload URL                               │
│  • Simpan metadata (bukan konten)                           │
│  • Billing & usage tracking                                 │
│  • ❌ TIDAK PERNAH menerima file plaintext                  │
└──────────────────────────────┬──────────────────────────────┘
                               │  Signed URL
                               │  (upload langsung)
┌──────────────────────────────▼──────────────────────────────┐
│                    OBJECT STORAGE                           │
│         Backblaze B2 / Wasabi / Cloudflare R2               │
│                                                             │
│  • Hanya menyimpan encrypted blobs                          │
│  • Tidak bisa membaca isi file                              │
│  • /{userId}/{deviceId}/{fileId}/{chunkIndex}.enc           │
└─────────────────────────────────────────────────────────────┘
```

### Upload Architecture

File **tidak pernah melewati server kami**. Client meminta signed URL, lalu mengupload langsung ke object storage. Ini lebih aman, lebih cepat, dan lebih murah.

```
Client                    API Server               Object Storage
  │                           │                          │
  │── POST /uploads/session ──►│                          │
  │                           │── authorize ────────────►│
  │◄── signed URL ────────────│◄── uploadUrl ────────────│
  │                           │                          │
  │── PUT (encrypted) ───────────────────────────────────►│
  │                           │                          │
  │── POST /uploads/verify ───►│                          │
  │                           │── verify checksum ───────►│
  │◄── confirmed ─────────────│                          │
```

### Stack Teknologi

| Layer | Teknologi |
|---|---|
| **Backend** | NestJS + Fastify, TypeScript strict |
| **Database** | PostgreSQL + Prisma ORM |
| **Queue** | Redis + BullMQ |
| **Web Frontend** | Next.js App Router, React, TailwindCSS |
| **Mobile** | Capacitor (Android + iOS) |
| **Enkripsi Client** | Web Crypto API (AES-256-GCM, PBKDF2) |
| **Object Storage** | Backblaze B2, Wasabi, Cloudflare R2 |
| **Realtime** | WebSocket Gateway (NestJS) |
| **Monorepo** | Turborepo + pnpm workspaces |

---

## Struktur Monorepo

```
qrd-storage/
│
├── apps/
│   ├── api/                    # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/           # JWT, refresh token, Argon2id
│   │   │   ├── devices/        # Device registration & management
│   │   │   ├── files/          # Upload sessions, metadata, download URLs
│   │   │   ├── billing/        # Usage tracking, Rp210/GB billing
│   │   │   ├── sync/           # WebSocket gateway, realtime events
│   │   │   └── workers/        # BullMQ: verify, billing, cleanup
│   │   └── prisma/
│   │       └── schema.prisma   # User, Device, File, Chunk, Billing models
│   │
│   └── web/                    # Next.js + Capacitor (Web/Android/iOS)
│       ├── src/
│       │   ├── app/            # App Router pages
│       │   ├── components/     # UI components
│       │   └── lib/            # API client, sync queue, session
│       ├── android/            # Capacitor Android project
│       └── ios/                # Capacitor iOS project
│
├── packages/
│   ├── crypto/                 # ⚠️ Client-side only — enkripsi & kompresi
│   │   ├── src/
│   │   │   ├── keys.ts         # Key derivation (PBKDF2 → AES-256-GCM key)
│   │   │   ├── encrypt.ts      # AES-256-GCM encrypt/decrypt per chunk
│   │   │   ├── compress.ts     # Gzip via CompressionStream API
│   │   │   └── worker.ts       # Web Worker wrapper (non-blocking UI)
│   │
│   ├── storage-sdk/            # Storage provider abstraction
│   │   ├── src/
│   │   │   ├── IStorageProvider.ts
│   │   │   ├── providers/
│   │   │   │   ├── BackblazeB2.ts
│   │   │   │   ├── Wasabi.ts
│   │   │   │   └── CloudflareR2.ts
│   │   │   └── multipart.ts    # Chunked/resumable upload helpers
│   │
│   ├── sync-core/              # Sync engine (filesystem watcher + queue)
│   │   ├── src/
│   │   │   ├── watcher.ts      # File change detection
│   │   │   ├── queue.ts        # IndexedDB sync job queue
│   │   │   ├── state-machine.ts # DISCOVERED → ENCRYPTING → SYNCED
│   │   │   └── background.ts   # Capacitor BackgroundTask integration
│   │
│   ├── shared-types/           # TypeScript contracts (DTOs, events, enums)
│   ├── ui/                     # Shared React components
│   └── api-client/             # Type-safe API client + TanStack Query hooks
│
├── infrastructure/
│   ├── docker/
│   ├── terraform/
│   └── kubernetes/
│
├── docker-compose.yml          # PostgreSQL + Redis untuk development
├── turbo.json
└── pnpm-workspace.yaml
```

---

## Cara Kerja dari Sudut Pandang Pengguna

### 1. Pertama Kali Setup

```
Install app  →  Daftar akun  →  Password Anda digunakan untuk
                                derive encryption key (lokal)
                                    ↓
                                Pilih folder yang ingin disinkronkan
                                    ↓
                                Selesai. QRD Storage bekerja otomatis.
```

### 2. Sehari-hari (Tanpa Interaksi)

Anda bekerja normal. QRD Storage memantau di latar belakang:

- File baru atau berubah → otomatis masuk antrian
- Dikompres + dienkripsi di background thread
- Upload langsung ke cloud saat ada koneksi
- Jika koneksi putus → upload dilanjutkan otomatis saat reconnect
- Notifikasi tenang: *"47 file berhasil dicadangkan"*

### 3. Optimalkan Storage Perangkat

Setelah backup terverifikasi, Anda mendapat saran:

> *"Video dari bulan lalu sudah aman dicadangkan (3.2 GB). Hapus dari perangkat untuk bebaskan ruang?"*

Pilihan: **Hapus semua** · **Pilih manual** · **Biarkan**

File yang dihapus tetap bisa diakses dan diunduh kapan saja.

### 4. Akses &amp; Preview File

Dashboard menampilkan semua file terbacking dalam tampilan galeri:

- Grid atau list view
- Filter: Foto / Video / Dokumen / Semua
- Preview langsung di browser tanpa download penuh
- Download file → didekripsi otomatis di perangkat Anda

---

## Setup Development

### Prasyarat

- Node.js 20+
- pnpm 9+
- Docker &amp; Docker Compose
- (Untuk iOS) macOS + Xcode + CocoaPods

### 1. Clone &amp; Install

```bash
git clone https://github.com/vetocatprotocol/qrd-storage.git
cd qrd-storage
pnpm install
```

### 2. Jalankan Infrastruktur

```bash
# PostgreSQL + Redis
docker compose up -d
```

### 3. Konfigurasi Environment

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/api/.env`:

```env
# Database
DATABASE_URL="postgresql://qrd:qrdpassword@localhost:5432/qrd_dev"

# Auth
JWT_SECRET="ganti-dengan-secret-yang-kuat-minimal-64-karakter"

# Object Storage (pilih salah satu)
STORAGE_PROVIDER="b2"                   # b2 | wasabi | r2

# Backblaze B2
B2_ACCOUNT_ID="your-account-id"
B2_APPLICATION_KEY="your-application-key"
B2_BUCKET_ID="your-bucket-id"

# Wasabi (opsional)
# WASABI_ACCESS_KEY="..."
# WASABI_SECRET_KEY="..."
# WASABI_BUCKET="..."
# WASABI_REGION="ap-southeast-1"

# Cloudflare R2 (opsional)
# R2_ACCOUNT_ID="..."
# R2_ACCESS_KEY_ID="..."
# R2_SECRET_ACCESS_KEY="..."
# R2_BUCKET="..."

# Redis
REDIS_URL="redis://localhost:6379"
```

Edit `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

### 4. Setup Database

```bash
cd apps/api
pnpm prisma:generate
pnpm prisma:migrate:dev --name init
```

### 5. Jalankan

```bash
# Dari root — jalankan semua sekaligus
pnpm dev

# Atau masing-masing
cd apps/api && pnpm dev    # API: http://localhost:4000
cd apps/web && pnpm dev    # Web: http://localhost:3000
```

---

## Build Mobile

### Android

```bash
cd apps/web

# Build Next.js sebagai static export
pnpm build && pnpm export

# Sync ke Capacitor
pnpm exec cap sync android

# Build APK debug
cd android
./gradlew assembleDebug
# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

**Prasyarat:** Android SDK, `JAVA_HOME`, platform-tools di PATH.

### iOS

```bash
cd apps/web

pnpm build && pnpm export
pnpm exec cap sync ios

# Buka di Xcode
open ios/App/App.xcworkspace
```

**Prasyarat:** macOS, Xcode 15+, CocoaPods (`pod install` di dalam `ios/App/`).

---

## API Reference

### Autentikasi

```
POST /api/auth/register     Daftar akun baru
POST /api/auth/login        Login, mendapat access + refresh token
POST /api/auth/refresh      Perbarui access token menggunakan refresh token
```

### Devices

```
POST /api/devices/register  Daftarkan perangkat baru, mendapat deviceKey
GET  /api/devices           List semua perangkat terdaftar
```

### Files &amp; Upload

```
POST /api/uploads/session           Buat upload session (file kecil, single PUT)
POST /api/uploads/multipart/init    Mulai multipart upload (file besar)
POST /api/uploads/multipart/:id/part  Dapatkan signed URL per chunk
POST /api/uploads/multipart/:id/complete  Finalisasi multipart upload
POST /api/uploads/:id/verify        Verifikasi checksum setelah upload

GET  /api/files                     List file (filter, sort, paginasi)
GET  /api/files/:id                 Metadata satu file
GET  /api/files/:id/download-url    Signed download URL (15 menit)
DELETE /api/files/:id               Hapus file dari storage
POST /api/files/:id/local-delete-hint  Tandai file sudah dihapus dari lokal
```

### Billing

```
GET  /api/billing/usage     Usage saat ini (bytes, file count)
GET  /api/billing/estimate  Estimasi tagihan bulan ini
GET  /api/billing/records   Riwayat tagihan
```

---

## Model Keamanan

### Apa yang QRD Storage bisa lihat

| Data | Bisa Dilihat QRD? |
|---|---|
| Isi file Anda | ❌ Tidak |
| Nama file (terenkripsi) | ❌ Tidak |
| Ukuran file terenkripsi | ✅ Ya (metadata billing) |
| Jumlah file | ✅ Ya |
| Kapan Anda upload | ✅ Ya |
| Email Anda | ✅ Ya (untuk akun) |

### Threat Model

QRD Storage didesain tahan terhadap:

- **Kompromi object storage** → Attacker hanya mendapat encrypted blobs tanpa kunci
- **Kompromi backend** → Backend tidak pernah menyimpan atau menerima plaintext
- **Man-in-the-middle** → Upload via HTTPS, file sudah terenkripsi sebelum transmisi
- **Upload partial/crash** → Resumable upload dengan checkpoint per chunk
- **Koneksi tidak stabil** → Offline queue persisten di IndexedDB/SQLite lokal

### Enkripsi Detail

```
Algoritma    : AES-256-GCM (authenticated encryption)
Key Size     : 256 bits
IV           : 96 bits, random per chunk (via crypto.getRandomValues)
Tag          : 128 bits GCM authentication tag
KDF          : PBKDF2-SHA256 (600.000 iterasi) atau Argon2id
Key Storage  : In-memory only, tidak pernah persisted
Kompresi     : gzip via CompressionStream API (sebelum enkripsi)
```

---

## Background Workers (BullMQ)

| Worker | Fungsi | Frekuensi |
|---|---|---|
| `upload-verify` | Verifikasi checksum setelah upload selesai | Per upload |
| `billing-aggregate` | Hitung usage dan generate billing record | Harian |
| `cleanup-suggest` | Kirim notifikasi saran hapus file lokal | Setelah verify |
| `download-track` | Catat bandwidth download untuk throttling | Per download |
| `orphan-cleanup` | Hapus chunk tanpa file referensi di DB | Mingguan |

---

## Pricing

QRD Storage menggunakan model **pay-as-you-go** — tidak ada paket, tidak ada minimum, tidak ada lock-in.

```
Storage aktif      :  Rp 210 / GB / bulan
                      (dihitung rata-rata harian)

Download           :  GRATIS sampai 3× total storage aktif Anda
                      (contoh: punya 10 GB → 30 GB download gratis/bulan)

Setelah batas      :  Throttling kecepatan
                      Download TIDAK PERNAH diblokir
```

**Contoh tagihan:**
- 50 GB foto dan video tersimpan → **Rp 10.500 / bulan**
- 200 GB backup dokumen kerja → **Rp 42.000 / bulan**

---

## Realtime Events (WebSocket)

Terhubung ke `ws://api/sync` setelah autentikasi untuk menerima event live:

```typescript
// Events yang dikirim server ke client
upload:progress     { fileId, chunkIndex, totalChunks, percent }
upload:complete     { fileId, fileName, encryptedSize }
upload:failed       { fileId, reason, retryable }
cleanup:suggestion  { files: FileRef[], totalBytes, freedIfDeleted }
device:online       { deviceId, deviceName }
device:offline      { deviceId }
sync:conflict       { fileId, deviceA, deviceB }
restore:progress    { fileId, percent }
```

---

## Roadmap

### Segera (Q3 2026)
- [x] Auth system (JWT + Argon2id)
- [x] Device registration
- [x] Upload session ke B2
- [x] Web + Android + iOS scaffold
- [ ] `packages/crypto` — AES-256-GCM client encryption
- [ ] Multipart/chunked upload pipeline
- [ ] Sync queue (IndexedDB)
- [ ] File list &amp; gallery UI

### Berikutnya (Q4 2026)
- [ ] Resumable upload dengan checkpoint
- [ ] Background sync (Capacitor BackgroundTask)
- [ ] Download + decrypt client-side
- [ ] WebSocket realtime progress
- [ ] Billing system &amp; dashboard
- [ ] Storage optimization (cleanup suggestion)

### Masa Depan
- [ ] Wasabi &amp; Cloudflare R2 support
- [ ] Selective sync per folder per device
- [ ] Conflict resolution UI
- [ ] Sync history &amp; file versioning
- [ ] Desktop app (Tauri)
- [ ] Self-hosted option
- [ ] End-to-end encrypted sharing (link berbatas waktu)

---

## Kontribusi

QRD Storage adalah produk proprietary. Untuk saat ini tidak menerima kontribusi eksternal.

Jika Anda menemukan vulnerability keamanan, laporkan secara bertanggung jawab ke:
**security@qrdstorage.id**

---

## Lisensi

Proprietary — lihat [LICENSE](./LICENSE) untuk detail lengkap.

---

<div align="center">

**QRD Storage** — Dibangun di atas prinsip:
*privasi bukan fitur, privasi adalah fondasi.*

[Website](https://qrdstorage.id) · [Dokumentasi](https://docs.qrdstorage.id) · [Status](https://status.qrdstorage.id)

</div>
