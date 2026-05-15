# QRD Storage

QRD Storage adalah platform sinkronisasi terenkripsi dengan prinsip privasi-pertama. Repositori ini adalah monorepo yang berisi backend API, dashboard web, paket bersama untuk enkripsi dan integrasi Backblaze B2, serta scaffolding mobile (Capacitor).

Ringkasan singkat:
- Zero-trust, client-side encryption
- Upload signed langsung ke Backblaze B2
- Registrasi perangkat dan manajemen sesi unggah

## Struktur repositori

- [apps/api](apps/api) — NestJS backend (auth, device, upload sessions, Prisma)
- [apps/web](apps/web) — Next.js dashboard (App Router)
- [packages/crypto](packages/crypto) — utilitas enkripsi bersama
- [packages/storage-sdk](packages/storage-sdk) — helper Backblaze B2
- [packages/shared-types](packages/shared-types) — tipe bersama untuk DTOs dan payload
- [packages/ui](packages/ui) — komponen UI yang dapat dipakai ulang

## Mobile apps

QRD Storage menyediakan scaffolding aplikasi native menggunakan Capacitor:

- `apps/web/android` — proyek Android (Gradle) yang dibangun dari web assets (`out/`) via Capacitor. Build script mengacu pada `capacitor` dan memeriksa `google-services.json` untuk push notifications.
- `apps/web/ios` — proyek iOS (Xcode workspace + CocoaPods) yang memuat pod `Capacitor` dan `CapacitorCordova`. iOS build memerlukan macOS & Xcode.

Catatan: sebelum menjalankan `cap sync` pastikan menjalankan `pnpm export` dari `apps/web` untuk menghasilkan `out/` yang sesuai dengan `capacitor.config.ts`.

## Penjelasan isi folder (lebih detail)

- `apps/api`: Modul NestJS terpisah untuk `auth`, `devices`, `files`, dan `prisma` (service DB). `main.ts` menggunakan Fastify, global `ValidationPipe`, serta prefix API `/api`.
- `apps/web`: Next.js App Router dengan halaman `login`, `register`, dan `dashboard`. Menggunakan `@qrd/ui` untuk komponen dan `lib/api.ts` untuk komunikasi dengan backend. Token disimpan di `localStorage` oleh `lib/session.ts`.
- `packages/crypto`: Kode enkripsi (Argon2id derivation, AES-256-GCM chunk encryption). Fungsi ini digunakan untuk enkripsi client-side sebelum upload.
- `packages/storage-sdk`: Client ringan untuk Backblaze B2 (authorize + get upload URL). Periksa apakah server menyimpan token berumur pendek atau hanya metadata.
- `packages/shared-types`: Tipe TypeScript yang dibagi antara backend dan frontend (DTOs, responses).
- `packages/ui`: Komponen React (Button, Input, Card, Icon) yang digunakan di `apps/web`.

## Halaman penting untuk pengembang

- `apps/api/src/auth` — endpoint `auth/login`, `auth/register`, dan mekanisme refresh token.
- `apps/api/src/devices` — endpoint pendaftaran perangkat (`devices/register`) yang menghasilkan `deviceKey`.
- `apps/api/src/files` — endpoint pembuatan sesi unggah (`uploads/session`) yang mengembalikan `uploadUrl` dan token untuk unggahan langsung ke Backblaze.
- `apps/web/src/lib/api.ts` — wrapper fetch yang memanggil endpoint API; tambahkan handling 401/refresh jika ingin flow refresh otomatis.

## Catatan onboarding mobile

- Android (Linux/Codespaces): pastikan `JAVA_HOME`, Android SDK, dan platform-tools tersedia. Jalankan `pnpm export` lalu `pnpm exec cap sync android` sebelum `./gradlew assembleDebug`.
- iOS (macOS): jalankan `pnpm export`, `pnpm exec cap sync ios`, lalu buka `apps/web/ios/App.xcworkspace` di Xcode dan jalankan `pod install` bila perlu.

## Kesimpulan singkat

Repositori ini berfungsi sebagai platform end-to-end: backend API untuk pembuatan sesi dan metadata, paket bersama untuk enkripsi dan integrasi storage, dashboard web, dan scaffolding mobile native via Capacitor. Dokumentasi dan script developer dapat ditambahkan lebih lanjut (contoh: `docker-compose` untuk DB, skrip setup Android SDK) untuk memperbaiki pengalaman onboarding.

## Fitur utama

- Autentikasi JWT (access + refresh)
- Registrasi dan manajemen perangkat
- Pembuatan sesi unggah yang mengeluarkan parameter signed untuk Backblaze B2
- Prisma ORM untuk model pengguna, perangkat, file, dan sesi unggah
- Utilitas enkripsi: Argon2id, AES-256-GCM, derivasi kunci

## Prasyarat

- Node.js 18+ (direkomendasikan)
- pnpm
- Postgres untuk pengembangan lokal (atau gunakan SQLite jika dikonfigurasi)
- `JAVA_HOME` + Android SDK untuk build Android (opsional)

## Mulai cepat (lokal)

1. Pasang dependency workspace dari root:

```bash
pnpm install
```

2. Salin environment file dan isi variabel penting:

```bash
cp .env.example .env
# Edit .env sesuai lingkungan Anda (DATABASE_URL, JWT_SECRET, B2_*)
```

3. Jalankan migrasi Prisma dan generate client (dari `apps/api`):

```bash
cd apps/api
pnpm prisma:generate
pnpm prisma:migrate:dev --name init
```

4. Menjalankan layanan pengembangan:

- Dari root (menjalankan semua service developer pipeline jika tersedia):

```bash
pnpm dev
```

- Atau jalankan masing-masing:

```bash
cd apps/api
pnpm dev

cd ../../apps/web
pnpm dev
```

API default tersedia di port yang dikonfigurasi (mis. `http://localhost:4000`) dan web Next.js di port yang dilaporkan oleh Next.

## Perintah penting

- `pnpm -w install` — instal semua dependency workspace
- `pnpm dev` — jalankan pipeline development (dalam workspace)
- `pnpm -w build` — build seluruh workspace
- `pnpm -w format` — jalankan format code (Prettier/ESLint)

Perintah khusus backend (dari `apps/api`):

- `pnpm dev` — run NestJS
- `pnpm build` — build backend
- `pnpm prisma:generate` — generate Prisma client
- `pnpm prisma:migrate:dev` — apply migrations
- `pnpm prisma:studio` — buka Prisma Studio

## Pengembangan mobile (Capacitor)

Scaffold native berada di `apps/web/android` dan `apps/web/ios`.

- Android debug dapat dibangun dari Linux/Codespaces jika toolchain Android terpasang:

```bash
cd apps/web
pnpm export
pnpm exec cap sync android
cd android
./gradlew assembleDebug
```

- iOS memerlukan Mac untuk membangun IPA dan menggunakan Xcode.

## Paket internal

- `packages/crypto` — fungsi-fungsi enkripsi dan derivasi kunci
- `packages/storage-sdk` — integrasi Backblaze B2 untuk signed uploads
- `packages/shared-types` — tipe TypeScript yang dibagikan antara frontend dan backend
- `packages/ui` — primitives UI untuk aplikasi web

Lihat masing-masing paket untuk dokumentasi API lebih detail.

## Variabel lingkungan penting

- `DATABASE_URL` — string koneksi Postgres
- `JWT_SECRET` — secret untuk menandatangani JWT
- `B2_ACCOUNT_ID`, `B2_APPLICATION_KEY`, `B2_BUCKET_ID` — kredensial Backblaze B2

Pastikan `.env` berisi variabel ini sebelum menjalankan migrasi atau server.

## Testing dan linting

- Gunakan perintah workspace untuk menjalankan test/lint jika tersedia (lihat `package.json` di root dan di setiap workspace).

## Kontribusi

1. Fork atau buat branch dari `main`.
2. Buat perubahan kecil, jalankan test dan format.
3. Buka Pull Request dengan deskripsi perubahan.

Silakan tambahkan issue atau diskusi jika Anda ingin mengusulkan fitur besar.

## Kontak

Jika Anda butuh bantuan lebih lanjut, buka issue di repository atau hubungi pemilik proyek.

## Lisensi

Lisensi proyek ada di file lisensi (jika tersedia). Jika belum, tambahkan `LICENSE` yang sesuai.

---

Dokumentasi ini dirancang untuk memudahkan pengembang baru memulai dengan monorepo QRD Storage. Ingin saya tambahkan bagian perintah debug spesifik atau contoh `.env`? 
