// Konten Bab 1. Materi mengacu pada Godot Engine 4.x.
export const chapter1 = {
  id: 1,
  title: 'Dasar Pengembangan Gim',
  story:
    'Lampu di halaman sekolah berkedip. Profesor Pixel berlari menghampirimu: "Sistem akademi rusak karena Godot Crystal pertama retak. Untuk memperbaikinya, kamu harus paham bagaimana sebuah gim dibuat dari nol."',
  goals: [
    'Membedakan game engine dan bahasa pemrograman.',
    'Menyebutkan tahapan pengembangan gim dan fungsi Game Design Document.',
    'Menjelaskan game loop serta fungsi _ready() dan _process(delta) di Godot 4.',
  ],
  pages: [
    {
      title: 'Game engine dan bahasa pemrograman',
      text: [
        'Game engine adalah kerangka kerja yang menyediakan fitur umum pembuatan gim: menggambar grafis, memutar audio, menghitung fisika, membaca input, dan mengelola scene.',
        'Godot Engine adalah game engine open source untuk gim 2D dan 3D. Aturan gim ditulis dengan bahasa pemrograman, misalnya GDScript (bahasa bawaan Godot) atau C#.',
      ],
      analogy: 'Game engine seperti dapur restoran lengkap (kompor, oven, peralatan). Bahasa pemrograman adalah resepnya. Gim adalah hidangan akhirnya.',
      figure: ['Engine (dapur)', 'Bahasa (resep)', 'Gim (hidangan)'],
    },
    {
      title: 'Genre dan tahapan pengembangan',
      text: [
        'Genre mengelompokkan gim berdasarkan cara bermain: platformer, puzzle, RPG, adventure, balapan, dan lainnya.',
        'Gim dibuat bertahap: ide, perancangan (GDD), prototype, produksi, pengujian, lalu rilis. Prototype dibuat cepat untuk menguji apakah ide terasa menyenangkan.',
      ],
      analogy: 'Seperti membangun rumah: ide, denah, model kecil, pembangunan, pemeriksaan, baru ditempati.',
      figure: ['Ide', 'GDD', 'Prototype', 'Produksi', 'Pengujian', 'Rilis'],
    },
    {
      title: 'Game Design Document (GDD)',
      text: [
        'GDD adalah dokumen yang merangkum rancangan gim: judul, genre, cerita singkat, mekanik inti, kontrol, target pemain, daftar aset, dan jadwal.',
        'Dengan GDD, semua anggota tim punya acuan yang sama sehingga tidak saling menebak.',
      ],
      analogy: 'GDD seperti denah rumah. Tukang, listrik, dan interior bekerja dari denah yang sama.',
      figure: ['Judul & genre', 'Mekanik inti', 'Kontrol', 'Aset', 'Jadwal'],
    },
    {
      title: 'Game loop: jantung gim',
      text: [
        'Gim berjalan dalam siklus yang terus berulang: baca input, perbarui logika, gambar layar. Satu putaran disebut satu frame.',
        'Di Godot 4, fungsi _ready() dipanggil sekali saat node siap. Fungsi _process(delta) dipanggil setiap frame, dengan delta berupa detik sejak frame sebelumnya.',
      ],
      analogy: 'Game loop seperti buku flipbook: tiap lembar sedikit berbeda, dibalik cepat sehingga tampak bergerak.',
      figure: ['Input', 'Update', 'Render', 'Ulangi'],
      code: {
        src: `extends Node2D

func _ready() -> void:
	print("Gim dimulai!")

func _process(delta: float) -> void:
	print("Waktu antar frame: ", delta)`,
        lines: [
          ['extends Node2D', 'Skrip ini memakai kemampuan node 2D.'],
          ['func _ready() -> void:', 'Dipanggil sekali saat node masuk Scene Tree dan siap.'],
          ['print("Gim dimulai!")', 'Menampilkan teks di panel Output.'],
          ['func _process(delta: float) -> void:', 'Dipanggil setiap frame. delta = detik sejak frame sebelumnya.'],
        ],
        input: 'Tidak ada input pemain. Nilai delta diberikan oleh engine.',
        output: 'Teks "Gim dimulai!" muncul sekali, lalu angka delta (sekitar 0.016 pada 60 FPS) muncul berulang.',
        mistake: 'Indentasi tidak konsisten (campuran tab dan spasi), sehingga Godot menampilkan error indentasi.',
        fix: 'Pakai satu gaya indentasi saja. Editor Godot secara bawaan memakai tab.',
      },
    },
    {
      title: 'Kode pertama: menggerakkan Sprite2D',
      text: [
        'Kita gunakan _process(delta) untuk menggeser gambar (Sprite2D) ke kanan. Perhatikan perkalian dengan delta.',
      ],
      analogy: 'Berjalan 1 meter per detik berarti jaraknya bergantung pada lamanya waktu, bukan pada banyaknya langkah.',
      code: {
        src: `extends Sprite2D

var speed: float = 100.0

func _process(delta: float) -> void:
	position.x += speed * delta`,
        lines: [
          ['extends Sprite2D', 'Skrip dipasang pada node Sprite2D.'],
          ['var speed: float = 100.0', 'Variabel bertipe float: kecepatan 100 piksel per detik.'],
          ['position.x += speed * delta', 'Menggeser sprite ke kanan. Dikali delta agar kecepatan sama di komputer cepat maupun lambat.'],
        ],
        input: 'Tidak ada. Pergerakan otomatis setiap frame.',
        output: 'Sprite bergerak ke kanan sekitar 100 piksel per detik.',
        mistake: 'Menulis position.x += speed tanpa delta, sehingga kecepatan bergantung pada FPS.',
        fix: 'Kalikan perubahan posisi dengan delta: position.x += speed * delta.',
      },
    },
  ],
  sim: {
    title: 'Simulasi: urutan Game Loop',
    intro: 'Klik langkah sesuai urutan yang benar (secara konseptual). Ini simulasi edukasi, bukan editor Godot yang sesungguhnya.',
    steps: [
      { t: 'Gim dimulai: _ready() dipanggil sekali', why: 'Persiapan awal dilakukan satu kali sebelum loop berjalan.' },
      { t: 'Gim membaca input pemain', why: 'Gim perlu tahu tombol apa yang ditekan sebelum menentukan apa yang berubah.' },
      { t: '_process(delta) memperbarui logika dan posisi', why: 'Setelah input diketahui, kondisi gim dihitung ulang, misalnya posisi karakter.' },
      { t: 'Engine menggambar frame ke layar', why: 'Hasil perhitungan baru ditampilkan setelah logika selesai diperbarui.' },
      { t: 'Kembali ke langkah membaca input untuk frame berikutnya', why: 'Loop terus berulang sampai gim ditutup. Inilah yang membuat gerakan tampak halus.' },
    ],
  },
  quiz: [
    {
      q: 'Apa fungsi utama game engine seperti Godot?',
      a: ['Menyediakan fitur umum seperti grafis, audio, fisika, dan input', 'Menggantikan ide dan desain gim', 'Hanya untuk mengedit gambar', 'Hanya untuk menyimpan skor'],
      c: 0,
      why: 'Engine menyediakan fitur umum agar developer fokus pada aturan dan isi gim.',
    },
    {
      q: 'Benar atau salah: Godot adalah game engine, sedangkan GDScript adalah bahasa pemrograman yang dapat dipakai di dalamnya.',
      a: ['Benar', 'Salah'],
      c: 0,
      why: 'Engine dan bahasa adalah dua hal berbeda. GDScript dipakai untuk menulis logika di dalam Godot.',
    },
    {
      q: 'Kapan fungsi _process(delta) dipanggil?',
      a: ['Sekali saat gim ditutup', 'Setiap frame', 'Hanya saat tombol ditekan', 'Tidak pernah dipanggil otomatis'],
      c: 1,
      why: '_process(delta) berjalan setiap frame. Untuk menanggapi input tertentu, kita memeriksa input di dalamnya.',
    },
    {
      q: 'Dokumen mana yang merangkum judul, genre, mekanik inti, kontrol, dan target pemain?',
      a: ['Game Design Document (GDD)', 'File project.godot', 'Sprite sheet', 'Laporan keuangan'],
      c: 0,
      why: 'GDD adalah acuan rancangan yang dipakai seluruh tim.',
    },
    {
      q: 'Pada kode position.x += speed * delta, mengapa speed dikali delta?',
      a: ['Agar sprite menjadi lebih besar', 'Agar kecepatan konsisten dan tidak bergantung pada FPS', 'Agar kode lebih pendek', 'Agar variabel speed menjadi konstanta'],
      c: 1,
      why: 'delta adalah waktu antar frame. Dengan mengalikannya, gerakan per detik tetap sama di komputer cepat maupun lambat.',
    },
  ],
  passScore: 3,
  mini: 'Mini project: tulis GDD satu halaman untuk gim sederhana buatanmu (judul, genre, mekanik inti, kontrol, target pemain, 3 aset utama).',
  summary: [
    'Game engine menyediakan fitur umum; bahasa pemrograman menulis aturan gim.',
    'Pengembangan gim bertahap: ide, GDD, prototype, produksi, pengujian, rilis.',
    'Game loop berulang tiap frame; _ready() sekali, _process(delta) setiap frame.',
    'Kalikan perubahan dengan delta agar gerakan tidak bergantung pada FPS.',
  ],
  indicators: [
    ['read', 'Membaca seluruh materi Bab 1'],
    ['sim', 'Menyusun urutan game loop dengan benar'],
    ['quiz', 'Lulus kuis dengan minimal 3 dari 5 jawaban benar'],
  ],
};
