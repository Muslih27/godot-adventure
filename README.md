# Godot Adventure Academy

Game adventure edukasi berbasis web untuk belajar **Godot Engine 4.x**, ditujukan bagi siswa kelas XII SMK RPL.

Dibangun menggunakan **Phaser 3, JavaScript ES Modules, dan Vite**. Game ini merupakan simulasi edukasi untuk mempelajari konsep Godot, bukan Godot Engine itu sendiri atau editor Godot.

## Menjalankan Proyek

Pastikan Node.js dan npm sudah terinstal.

```bash
npm install
npm run dev
```

Perintah lainnya:

```bash
npm run build
npm run preview
```

- `npm run dev`: menjalankan server pengembangan.
- `npm run build`: membuat build produksi ke folder `dist`.
- `npm run preview`: menguji hasil build secara lokal.

## Status Proyek — Fase 1: Prototype

### Fitur yang sudah tersedia

- Menu utama, pemilihan karakter, pengaturan, dan kredit.
- Eksplorasi lingkungan sekolah dengan collision, kamera, animasi, dan kontrol lari.
- Kontrol sentuh untuk perangkat yang mendukungnya.
- NPC Profesor Pixel dan dialog interaktif.
- Tiga quest dengan kondisi penyelesaian.
- Bab 1 berisi materi, contoh kode GDScript, penjelasan, dan fitur salin kode.
- Simulasi Game Loop dan kuis lima soal dengan umpan balik.
- Sistem XP, level, koin, Godot Crystal, dan badge.
- Peta sekolah, progres bab, dan minimap.
- Musik dan efek suara sintetis yang dapat dimatikan.
- Autosave menggunakan LocalStorage dengan validasi dan versi data.

### Fitur yang direncanakan

Fase selanjutnya mencakup Bab 2–15, ruang kelas, area tambahan, inventaris, jurnal, skill tree, achievement, kosmetik, dan area rahasia.

Area yang belum tersedia ditampilkan sebagai area terkunci.

## Struktur Proyek

```text
src/
  main.js
  scenes/
    Boot
    Preload
    MainMenu
    School
  systems/
    GameState
    SaveManager
    QuestManager
    LearningManager
    AudioManager
    UIManager
  ui/
    panels.js
  data/
    chapter1.js
    quests.js
    curriculum.js
  assets/
    textures.js
  core/
    bus
    util
```

Struktur di atas merupakan gambaran komponen utama. Nama dan lokasi berkas aktual mengikuti struktur yang ada di repositori.

**Catatan input