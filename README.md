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

## Status (Fase 1 + seluruh 15 bab, 12 ruangan, Ujian Akhir, sertifikat, toko, peliharaan, misi harian, emote, teleport peta, prestasi, jurnal, profil)

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

## Sistem gaya Roblox (tanpa backend, tanpa uang sungguhan)

- **Menu dropdown:** semua menu ada di tombol Menu; titik merah berarti ada hadiah harian atau misi yang bisa diambil. Kotak quest dapat dilipat dengan mengetuknya.
- **Toko Akademi:** topi dan peliharaan dibeli dengan Koin Akademi (hanya kosmetik). Gelar dibuka lewat prestasi.
- **Layar:** ukuran game otomatis mengikuti perangkat; tombol kotak di HUD (dan di menu judul) memasuki layar penuh jika didukung browser.
- **Peliharaan** mengikuti pemain; **nama dan gelar** tampil di atas karakter.
- **Misi Harian dan hadiah login:** streak 7 hari, tiga misi acak per hari, reset mengikuti jam perangkat.
- **Emote:** tombol 1-6 di keyboard atau Menu > Emote.
- Belum ada: papan peringkat dan fitur sosial lintas pemain (butuh backend).

## Mode Online (multiplayer)

Pemain dengan **kode kelas** yang sama di **ruangan yang sama** saling terlihat (nama, gelar, topi, gerakan, emote). Tidak ada chat bebas.
Buka Menu > Online, isi kode kelas, lalu Aktifkan.

- **Tanpa pengaturan server** game memakai *mode uji lokal*: pemain hanya terlihat antar tab pada perangkat yang sama (cocok untuk mencoba fiturnya).
- **Agar lintas perangkat**, pakai Supabase Realtime (Broadcast), gratis untuk kelas kecil:
  1. Buat proyek di supabase.com. Salin *Project URL* dan *anon public key* (Settings > API).
  2. Salin `.env.example` menjadi `.env.local` dan isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`.
  3. Di Vercel tambahkan dua variabel yang sama (Settings > Environment Variables) lalu deploy ulang.
  4. Di dasbor Supabase buka Realtime Settings dan pastikan akses publik untuk Broadcast diizinkan.
- **Batas:** paket gratis Supabase Realtime dibatasi 100 pesan per detik per proyek. Game mengirim paket jarang (maks. 2 per detik saat bergerak) dan hanya menampilkan 8 pemain lain per ruangan, sehingga cocok untuk kelompok kecil (sekitar 8 sampai 10 siswa per kode kelas). Kelas yang lebih besar perlu paket berbayar atau beberapa kode kelas.
- Bug dan musuh dihitung di perangkat masing-masing (tidak disinkronkan). Progres tetap milik masing-masing pemain.
- Privasi: data yang dikirim hanya nama panggilan, gelar, topi, posisi, dan emote. Sebaiknya guru membagikan kode kelas hanya kepada siswanya.

## Kebun Akademi (terinspirasi Harvest Moon)

Pintu di sisi timur halaman sekolah. Tanam benih di petak tanah, siram **sekali per hari** dengan menjawab satu soal ulasan dari bab yang sudah dibaca (latihan mengingat berkala), dan panen kristal setelah 3 hari disiram (+20 koin). Tanaman tidak layu. Tanggal mengikuti jam perangkat.

### Menyiapkan Supabase (langkah singkat)

1. Daftar di supabase.com, buat proyek baru (pilih region terdekat, misalnya Singapore).
2. Buka Project Settings > API. Salin **Project URL** dan **anon public key** (atau publishable key; jika koneksi gagal dengan publishable key, coba anon key lama di bagian Legacy API Keys).
3. Di folder proyek: `copy .env.example .env.local`, lalu isi dua nilai itu memakai Notepad.
4. **Hentikan dan jalankan ulang** `npm run dev` (variabel hanya dibaca saat Vite mulai).
5. Di dasbor Supabase cari Realtime Settings dan pastikan akses publik (public access) diizinkan.
6. Di game: Menu > Online. Status koneksi harus berubah menjadi "tersambung". Uji dengan dua perangkat atau dua jendela.
7. Untuk versi online: tambahkan variabel yang sama di Vercel (Settings > Environment Variables, untuk Production dan Preview), lalu **Redeploy** (perubahan variabel baru berlaku pada deployment berikutnya).

## Persahabatan dan barang (terinspirasi Harvest Moon)

Panen di Kebun Akademi menghasilkan **Buah Kristal** (selain 20 koin). Setelah bercakap-cakap dengan seorang mentor, pemain ditawari memberikan satu buah sebagai hadiah (maksimal satu per mentor per hari). Persahabatan naik 1 hati sampai 5 hati: 1 hati membuka tips belajar, 3 hati membuka cerita mentor, 5 hati memberi 30 koin. Lihat di Profil > Teman. Ada quest "Teman Baru", dua prestasi, dan gelar "Sahabat Mentor".

## Diagnosis performa dan kontrol

- Menu Jeda > **Info performa: Nyala** menampilkan FPS, mode efek, status online, jumlah pemain lain, serta pesan terkirim dan terima per detik.
- Jika FPS di bawah 30 selama sekitar 6 detik dan efek visual "Otomatis", game beralih sendiri ke mode hemat.
- Galat JavaScript ditampilkan sebagai toast singkat (maks. satu per 8 detik) agar mudah difoto saat melapor.
