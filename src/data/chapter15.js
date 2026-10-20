// Konten Bab 15. Materi mengacu pada Godot Engine 4.x (GDScript).
export const chapter15 = {
  id: 15,
  keys: { read: 'read15', sim: 'sim15', quiz: 'quiz15' },
  badge: 'Penerbit Gim',
  title: 'Export dan Proyek Akhir',
  story:
    'Ruang Final Project terang benderang. Di dinding, deretan kristal berkilau menandai perjalananmu dari awal. Kepala Akademi tersenyum: "Gim yang hanya hidup di laptop pembuatnya belum selesai. Saatnya membawanya ke dunia: export, uji, dokumentasikan, lalu presentasikan."',
  goals: [
    'Menyusun proyek yang rapi dan mendokumentasikannya.',
    'Mengatur konfigurasi tampilan dan mengekspor gim, termasuk ke Web.',
    'Menguji hasil build, memeriksa kompatibilitas browser, dan menyiapkan presentasi proyek.',
  ],
  pages: [
    {
      title: 'Struktur proyek dan dokumentasi',
      text: [
        'Proyek yang rapi memakai folder yang jelas (scenes, scripts, assets) dan nama file snake_case. Tambahkan README yang berisi judul, cara bermain, kontrol, dan cara membangun proyek.',
        'Di GDScript, komentar yang diawali ## adalah komentar dokumentasi dan muncul sebagai bantuan di editor. Jika memakai Git, abaikan folder .godot/ lewat file .gitignore.',
      ],
      analogy: 'Seperti buku panduan yang menyertai mainan: orang lain bisa memakainya tanpa harus bertanya ke pembuatnya.',
      figure: ['scenes/', 'scripts/', 'assets/', 'README.md'],
      code: {
        src: `## Mengatur nyawa pemain.
## Dipakai oleh HUD dan sistem game over.
class_name NyawaPemain
extends Node

## Dipancarkan saat nyawa habis.
signal nyawa_habis

## Jumlah nyawa awal.
@export var nyawa_awal: int = 3`,
        lines: [
          ['## Mengatur nyawa pemain.', 'Komentar dokumentasi untuk kelas ini.'],
          ['class_name NyawaPemain', 'Memberi nama tipe agar mudah dipakai.'],
          ['## Dipancarkan saat nyawa habis.', 'Dokumentasi untuk signal di bawahnya.'],
          ['@export var nyawa_awal: int = 3', 'Properti yang dapat diubah di Inspector, lengkap dengan dokumentasinya.'],
        ],
        input: 'Tidak ada input.',
        output: 'Dokumentasi muncul sebagai bantuan saat kelas, signal, dan properti ini dipakai di editor.',
        mistake: 'Tidak mendokumentasikan kode dan proyek sehingga anggota tim sulit memahaminya.',
        fix: 'Tulis komentar ##, README, dan susun folder dengan konsisten.',
      },
    },
    {
      title: 'Konfigurasi tampilan',
      text: [
        'Atur ukuran jendela dan cara gim menyesuaikan layar di Project Settings > Display > Window. Stretch Mode canvas_items atau viewport membuat gim tetap proporsional di berbagai ukuran layar.',
        'Untuk pixel art, atur filter tekstur bawaan menjadi Nearest agar gambar tetap tajam. Kamu juga dapat mengganti mode layar penuh lewat kode dengan DisplayServer.',
      ],
      analogy: 'Seperti bingkai foto yang bisa menyesuaikan ukuran dinding: gambarnya tetap proporsional, bukan ikut melar.',
      figure: ['Ukuran viewport', 'Stretch Mode', 'Aspect', 'Filter Nearest'],
      code: {
        src: `func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("layar_penuh"):
		var mode := DisplayServer.window_get_mode()
		if mode == DisplayServer.WINDOW_MODE_FULLSCREEN:
			DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
		else:
			DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_FULLSCREEN)`,
        lines: [
          ['event.is_action_pressed("layar_penuh")', 'Mendeteksi aksi yang dibuat di Input Map.'],
          ['DisplayServer.window_get_mode()', 'Membaca mode jendela saat ini.'],
          ['DisplayServer.window_set_mode(...)', 'Mengganti mode jendela antara layar penuh dan jendela biasa.'],
        ],
        input: 'Aksi layar_penuh sudah dibuat di Input Map.',
        output: 'Setiap penekanan menukar antara layar penuh dan jendela.',
        mistake: 'Stretch Mode tidak diatur sehingga UI tampak terlalu kecil atau terlalu besar di layar yang berbeda.',
        fix: 'Atur Stretch Mode (canvas_items atau viewport) dan Aspect pada Project Settings. Pada Web, layar penuh perlu dipicu oleh aksi pemain.',
      },
    },
    {
      title: 'Export gim',
      text: [
        'Buka Project > Export, tambahkan preset untuk platform tujuan (Windows, Linux, Android, Web, dan lainnya), atur lokasi file, lalu pilih Export Project.',
        'Sebelum export pertama, instal Export Templates sesuai versi Godot melalui Editor > Manage Export Templates. Tanpa itu, export akan gagal.',
      ],
      analogy: 'Seperti mengemas kue ke dalam kotak sebelum dikirim: isinya sama, tetapi kemasannya disesuaikan dengan tujuan.',
      figure: ['Instal Export Templates', 'Tambah Preset', 'Export Project'],
      code: {
        src: `func _ready() -> void:
	if OS.has_feature("web"):
		print("Berjalan di browser")
	elif OS.has_feature("editor"):
		print("Berjalan di editor")`,
        lines: [
          ['OS.has_feature("web")', 'True jika gim berjalan sebagai versi Web.'],
          ['OS.has_feature("editor")', 'True jika gim dijalankan dari editor Godot.'],
          ['print(...)', 'Menampilkan pesan sesuai tempat gim berjalan.'],
        ],
        input: 'Tidak ada input.',
        output: 'Pesan berbeda muncul tergantung gim berjalan di browser atau di editor.',
        mistake: 'Belum menginstal Export Templates sehingga export gagal dengan pesan template tidak ditemukan.',
        fix: 'Instal lewat Editor > Manage Export Templates sesuai versi Godot yang dipakai.',
      },
    },
    {
      title: 'Export ke Web',
      text: [
        'Export Web menghasilkan beberapa file: index.html, file JavaScript, file WebAssembly (.wasm), dan file data (.pck). Semuanya harus berada dalam satu folder.',
        'File index.html tidak berfungsi jika dibuka langsung dari komputer (file://). Ia harus dilayani lewat server web, misalnya server lokal, GitHub Pages, itch.io, atau Vercel. Periksa dokumentasi Godot untuk versi yang kamu pakai, karena persyaratan hosting (misalnya dukungan thread) dapat berbeda.',
      ],
      analogy: 'Seperti memutar film: filmnya sudah jadi, tetapi butuh bioskop (server) untuk menayangkannya, bukan sekadar menyalakan file di lorong.',
      figure: ['Export Web', 'index.html + .wasm + .pck', 'Server web', 'Pemain di browser'],
      code: {
        src: `func _ready() -> void:
	if OS.has_feature("web"):
		$TombolKeluar.hide()`,
        lines: [
          ['OS.has_feature("web")', 'Memeriksa apakah gim berjalan di browser.'],
          ['$TombolKeluar.hide()', 'Menyembunyikan tombol Keluar karena tidak berguna di browser.'],
        ],
        input: 'Node TombolKeluar sudah ada di scene.',
        output: 'Tombol Keluar hanya tampil pada versi desktop.',
        mistake: 'Membuka index.html langsung lewat file:// sehingga gim tidak mau berjalan.',
        fix: 'Jalankan lewat server web atau unggah ke layanan hosting.',
      },
    },
    {
      title: 'Pengujian build, kompatibilitas, dan presentasi',
      text: [
        'Uji hasil build, bukan hanya proyek di editor: coba di beberapa browser (misalnya Chrome dan Firefox), di perangkat siswa yang sebenarnya, periksa ukuran file dan waktu muat, dan pastikan penyimpanan progres berfungsi setelah refresh.',
        'Browser membatasi pemutaran suara otomatis, jadi mulai musik setelah pemain mengklik sesuatu. Untuk presentasi proyek, siapkan: masalah yang diselesaikan, demo singkat, bagian tersulit, dan pelajaran yang didapat.',
      ],
      analogy: 'Seperti gladi resik sebelum pementasan: dicoba di panggung sebenarnya, bukan hanya di ruang latihan.',
      figure: ['Uji di browser lain', 'Uji di perangkat sasaran', 'README', 'Presentasi'],
      code: {
        src: `func _on_tombol_mulai_pressed() -> void:
	# Musik dimulai setelah klik pemain agar sesuai aturan browser
	$Musik.play()
	$Menu.hide()`,
        lines: [
          ['func _on_tombol_mulai_pressed() -> void:', 'Dipanggil saat pemain menekan tombol Mulai.'],
          ['$Musik.play()', 'Memutar musik setelah ada interaksi pemain.'],
          ['$Menu.hide()', 'Menyembunyikan menu untuk memulai gim.'],
        ],
        input: 'Pemain menekan tombol Mulai.',
        output: 'Musik terputar dan menu menghilang tanpa terhalang aturan autoplay browser.',
        mistake: 'Memutar musik otomatis saat halaman dimuat sehingga browser memblokirnya dan pemain tidak mendengar apa pun.',
        fix: 'Mulai audio setelah interaksi pemain, misalnya dari tombol Mulai.',
      },
    },
  ],
  sim: {
    title: 'Simulasi: urutan export gim ke Web',
    intro: 'Klik langkah sesuai urutan mengekspor dan menerbitkan gim ke Web. Ini simulasi edukasi, bukan editor Godot yang sesungguhnya.',
    steps: [
      { t: 'Instal Export Templates lewat Editor > Manage Export Templates', why: 'Tanpa template, export tidak dapat berjalan.' },
      { t: 'Buka Project > Export dan tambahkan preset Web', why: 'Preset menentukan platform tujuan dan pengaturannya.' },
      { t: 'Atur lokasi dan nama file hasil export (misalnya index.html)', why: 'Lokasi harus jelas sebelum export dijalankan.' },
      { t: 'Pilih Export Project untuk menghasilkan file build', why: 'Langkah ini membuat index.html, .wasm, .pck, dan file pendukung.' },
      { t: 'Uji build lewat server web (bukan file://) di beberapa browser', why: 'Build harus diuji di lingkungan yang sama seperti pemain.' },
      { t: 'Unggah folder hasil export ke layanan hosting', why: 'Gim baru dapat dimainkan orang lain setelah terbit di hosting.' },
    ],
  },
  quiz: [
    {
      q: 'Apa yang perlu dipasang sebelum export pertama di Godot?',
      a: ['Export Templates', 'Plugin warna', 'Font tambahan', 'Antivirus'],
      c: 0,
      why: 'Export Templates adalah paket yang dipakai Godot untuk membangun gim pada tiap platform.',
    },
    {
      q: 'File apa saja yang umumnya dihasilkan oleh export Web?',
      a: ['index.html, JavaScript, WebAssembly (.wasm), dan data (.pck)', 'Hanya satu file .gd', 'Hanya gambar PNG', 'Hanya file teks README'],
      c: 0,
      why: 'Export Web terdiri dari beberapa file yang harus berada dalam satu folder.',
    },
    {
      q: 'Benar atau salah: membuka index.html hasil export Web langsung dari komputer (file://) biasanya tidak berfungsi, sehingga perlu server web.',
      a: ['Benar', 'Salah'],
      c: 0,
      why: 'Gim Web harus dilayani lewat server web, baik lokal maupun layanan hosting.',
    },
    {
      q: 'Cara memeriksa apakah gim berjalan di browser lewat kode adalah...',
      a: ['OS.has_feature("web")', 'OS.is_browser()', 'Engine.is_web = true', 'print("web")'],
      c: 0,
      why: 'OS.has_feature() memeriksa fitur platform, misalnya "web" atau "editor".',
    },
    {
      q: 'Apa fungsi Stretch Mode pada pengaturan tampilan?',
      a: ['Membuat gim menyesuaikan diri dengan ukuran layar yang berbeda', 'Menambah volume suara', 'Mengubah nama proyek', 'Menghapus scene yang tidak dipakai'],
      c: 0,
      why: 'Stretch Mode mengatur bagaimana tampilan gim diperbesar atau diperkecil mengikuti jendela.',
    },
    {
      q: 'Awalan apa yang dipakai untuk komentar dokumentasi di GDScript?',
      a: ['##', '//', '--', '/*'],
      c: 0,
      why: 'Komentar yang diawali ## ditampilkan sebagai dokumentasi di editor.',
    },
  ],
  passScore: 4,
  mini: 'Mini project: ekspor gim buatanmu ke Web, uji di dua browser berbeda, tulis README (judul, cara bermain, kontrol, cara membangun), dan siapkan presentasi 3 menit berisi masalah, demo, bagian tersulit, dan pelajaran.',
  summary: [
    'Susun proyek dengan folder jelas, README, dan komentar dokumentasi ##.',
    'Atur Stretch Mode dan filter tekstur; instal Export Templates sebelum export.',
    'Gim Web terdiri dari beberapa file dan harus dilayani lewat server web.',
    'Uji build di banyak browser dan perangkat; mulai audio setelah interaksi pemain; siapkan presentasi proyek.',
  ],
  indicators: [
    ['read15', 'Membaca seluruh materi Bab 15'],
    ['sim15', 'Mengurutkan enam langkah export dan penerbitan ke Web'],
    ['quiz15', 'Lulus kuis dengan minimal 4 dari 6 jawaban benar'],
  ],
};
