# Godot Adventure Academy

Game adventure edukasi berbasis web untuk belajar **Godot Engine 4.x** (siswa kelas XII SMK RPL).
Dibangun dengan **Phaser 3 + JavaScript (ES Modules) + Vite**. Game ini adalah simulasi edukasi,
**bukan** Godot Engine dan bukan editor Godot.

## Menjalankan

```bash
npm install
npm run dev       # server pengembangan
npm run build     # build produksi ke folder dist
npm run preview   # uji build lokal
```

## Status (Fase 1 + seluruh 15 bab, 12 ruangan, Ujian Akhir, sertifikat, teleport peta, prestasi, jurnal, profil)

Sudah berfungsi: menu utama (New Game dengan konfirmasi, Continue, pilih karakter, pengaturan, credit),
Halaman Sekolah dengan collision, kamera halus, animasi idle/jalan, lari (Shift), kontrol sentuh,
NPC Profesor Pixel, dialog bertahap, 3 quest dengan kondisi selesai nyata, Bab 1 lengkap
(materi, kode GDScript + penjelasan + tombol salin, simulasi Game Loop, kuis 5 soal dengan feedback),
XP/level, koin, Godot Crystal, badge, peta sekolah, progres bab, minimap, musik & SFX sintetis
(bisa dimatikan), autosave ke LocalStorage dengan validasi dan versi data.

Belum ada (Fase 2 dst.): Bab 2-15, Ruang Kelas dan area lain, inventaris, jurnal, skill tree,
achievement, kosmetik, area rahasia. Peta menandai area tersebut sebagai terkunci/belum tersedia.

## Struktur

```
src/
  main.js                konfigurasi Phaser
  scenes/                Boot, Preload, MainMenu, School
  systems/               GameState, SaveManager, QuestManager, LearningManager, AudioManager, UIManager
  ui/panels.js           quest log, peta, progres, jeda
  data/                  chapter1.js, quests.js, curriculum.js  (edit di sini untuk memperbarui materi)
  assets/textures.js     aset pixel art prosedural
  core/                  bus (UI <-> Phaser), util
```

Input: UI HTML dan Phaser berbagi satu alur. Saat dialog/panel terbuka, `ui.blocked` menghentikan
gerak pemain, dan pengetikan di kolom input tidak ditangkap game.

## Deploy ke Vercel

1. Buat repositori GitHub lalu `git init && git add . && git commit -m "Fase 1" && git branch -M main`,
   `git remote add origin <url-repo>` dan `git push -u origin main`.
2. Di vercel.com pilih **Add New > Project**, impor repositori tersebut.
3. Framework preset: **Vite**. Build command `npm run build`, output directory `dist` (terdeteksi otomatis).
4. Klik **Deploy**. Tidak perlu `vercel.json` karena tidak ada routing sisi klien.

Catatan: progres tersimpan di LocalStorage per browser/perangkat, tidak lintas perangkat.
Font memakai Google Fonts dan akan turun ke font sistem bila offline.

## Kontrol

| Perangkat | Gerak | Aksi | Serang | Lari |
|---|---|---|---|---|
| Keyboard | W A S D / panah | E atau Spasi | F | Shift |
| HP / tablet | Geser di sisi kiri layar (joystick melayang) | Tombol Aksi | Tombol Serang | Tombol Lari (toggle) |

Menu Jeda (Esc atau tombol Jeda) memuat pilihan layar penuh dan "Kontrol layar sentuh: Otomatis / Selalu tampil".

## Musuh

Setiap ruangan berisi bug yang berpatroli dan mengejar saat pemain dekat. Hati pemain tidak disimpan; jika habis, pemain kembali ke pintu masuk ruangan tanpa kehilangan progres. Bug yang kalah muncul lagi setelah 25 detik.
