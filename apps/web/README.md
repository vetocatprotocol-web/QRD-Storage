# QRD Storage — Mobile (Android & iOS)

Dokumentasi ringkas khusus untuk scaffold mobile yang dibuat dari `apps/web` menggunakan Capacitor.

Quick start (dari `apps/web`)

```bash
pnpm install
pnpm export
pnpm exec cap sync
```

Android

```bash
pnpm exec cap sync android
cd android
./gradlew assembleDebug
```

iOS

```bash
pnpm exec cap sync ios
open ios/App/App.xcworkspace
# lalu build dari Xcode
```

Konfigurasi penting
- `capacitor.config.ts` menunjuk `webDir: 'out'` — pastikan `pnpm export` berjalan sebelum `cap sync`.
- `apps/web/android` menyertakan pengecekan `google-services.json` untuk mengaktifkan plugin Google services.

Debugging
- Gunakan Android Studio untuk membuka `apps/web/android` dan jalankan emulator.
- Untuk iOS, buka workspace di Xcode.
