# Mobile setup (Android & iOS)

Panduan singkat untuk membangun aplikasi mobile QRD Storage yang dibungkus dengan Capacitor.

Prerequisites
- Node.js 18+, pnpm
- Android build: `JAVA_HOME`, Android SDK, platform-tools, dan Gradle (Linux/Codespaces)
- iOS build: macOS + Xcode + CocoaPods

Workflow (shared)
1. Dari root repo, install dependency:

```bash
pnpm install
```

2. Build web assets yang akan digunakan Capacitor:

```bash
cd apps/web
pnpm export
```

Capacitor sync

```bash
pnpm exec cap sync
```

Android (Linux / Codespaces)

1. Pastikan `JAVA_HOME` dan `ANDROID_SDK_ROOT` ter-set di environment Anda.
2. Dari `apps/web`:

```bash
pnpm exec cap sync android
cd android
./gradlew assembleDebug
```

3. Hasil APK (debug):

```
apps/web/android/app/build/outputs/apk/debug/app-debug.apk
```

Catatan:
- Jika ingin push notifications via Firebase, drop `google-services.json` ke `apps/web/android/app/` sebelum build.

iOS (macOS)

1. Dari `apps/web` jalankan:

```bash
pnpm exec cap sync ios
```

2. Buka Xcode:

```bash
open ios/App/App.xcworkspace
```

3. Jalankan `pod install` di `ios/App` jika diperlukan, lalu build/archive dari Xcode.

Catatan:
- iOS memerlukan akun/signing certificate untuk meng-archive dan men-generate IPA.

Troubleshooting
- Jika plugin Capacitor tidak ditemukan di Android build, jalankan `pnpm install` dan ulang `pnpm exec cap sync`.
- Pastikan `pnpm export` berhasil menghasilkan folder `out/` (lihat `capacitor.config.ts`).

Security & signing
- Jangan commit keystore, keystore passwords, atau credential signing ke repo.

--
Dokumentasi ini dimaksudkan sebagai panduan onboarding developer mobile. Untuk instruksi lebih lengkap, jalankan workflow build di CI atau tanyakan untuk tambahan contoh konfigurasi Gradle/NDK.
