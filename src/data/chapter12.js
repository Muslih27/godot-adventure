// Konten Bab 12. Materi mengacu pada Godot Engine 4.x (GDScript).
export const chapter12 = {
  id: 12,
  keys: { read: 'read12', sim: 'sim12', quiz: 'quiz12' },
  badge: 'Sound Designer',
  title: 'Audio dan Efek Visual',
  story:
    'Ruang Audio bergetar pelan. Deretan bar di dinding naik turun mengikuti irama, dan seorang teknisi suara melepas headphone-nya: "Gim tanpa suara dan efek terasa hampa. Satu bunyi kecil saat koin diambil bisa membuat pemain tersenyum. Ayo kita hidupkan gimmu."',
  goals: [
    'Memutar musik dan efek suara dengan AudioStreamPlayer dan AudioStreamPlayer2D.',
    'Mengatur volume lewat Audio Bus dan memahami skala desibel.',
    'Membuat efek visual dengan Particles, Tween, dan transisi layar.',
  ],
  pages: [
    {
      title: 'AudioStreamPlayer dan AudioStreamPlayer2D',
      text: [
        'AudioStreamPlayer memutar suara yang terdengar sama di mana pun pemain berada, cocok untuk musik latar dan efek antarmuka. AudioStreamPlayer2D memutar suara berposisi: makin dekat sumbernya, makin keras.',
        'Isi properti Stream dengan file audio, lalu panggil play() untuk memutar dan stop() untuk menghentikan.',
      ],
      analogy: 'AudioStreamPlayer seperti speaker ruangan yang terdengar merata. AudioStreamPlayer2D seperti radio di pojok: makin dekat, makin jelas.',
      figure: ['Stream (file audio)', 'AudioStreamPlayer', 'play()'],
      code: {
        src: `extends Node

@onready var musik: AudioStreamPlayer = $Musik
@onready var sfx_koin: AudioStreamPlayer = $SfxKoin

func _ready() -> void:
	musik.play()

func bunyi_koin() -> void:
	sfx_koin.play()`,
        lines: [
          ['@onready var musik: AudioStreamPlayer = $Musik', 'Mengambil node pemutar musik.'],
          ['@onready var sfx_koin: AudioStreamPlayer = $SfxKoin', 'Mengambil node pemutar efek koin.'],
          ['musik.play()', 'Memutar musik saat scene siap.'],
          ['sfx_koin.play()', 'Memutar efek suara sekali saat dipanggil.'],
        ],
        input: 'Node Musik dan SfxKoin sudah punya file audio pada properti Stream.',
        output: 'Musik terputar saat scene mulai, dan efek koin terdengar saat bunyi_koin() dipanggil.',
        mistake: 'Properti Stream belum diisi sehingga play() tidak menghasilkan suara.',
        fix: 'Isi Stream pada Inspector dengan file audio, atau muat lewat kode dengan load().',
      },
    },
    {
      title: 'Audio Bus dan volume',
      text: [
        'Audio Bus adalah jalur pencampur suara. Biasanya dibuat bus Music dan SFX sehingga volume musik dan efek dapat diatur terpisah di panel Audio.',
        'Volume memakai skala desibel (dB), bukan 0 sampai 1. Ubah nilai slider 0 sampai 1 menjadi dB dengan linear_to_db().',
      ],
      analogy: 'Bus seperti papan mixer: tiap kelompok suara punya pengatur volumenya sendiri.',
      figure: ['Slider 0–1', 'linear_to_db()', 'Volume bus'],
      code: {
        src: `func atur_volume_musik(nilai: float) -> void:
	var idx: int = AudioServer.get_bus_index("Music")
	AudioServer.set_bus_volume_db(idx, linear_to_db(nilai))`,
        lines: [
          ['AudioServer.get_bus_index("Music")', 'Mencari nomor bus berdasarkan namanya.'],
          ['linear_to_db(nilai)', 'Mengubah skala 0–1 menjadi desibel.'],
          ['AudioServer.set_bus_volume_db(idx, ...)', 'Mengatur volume bus tersebut.'],
        ],
        input: 'Nilai dari slider antara 0.0 dan 1.0, dan bus bernama Music sudah dibuat.',
        output: 'Volume musik berubah sesuai slider tanpa mempengaruhi efek suara.',
        mistake: 'Mengisi volume_db dengan 0.5 karena mengira itu setengah volume. Satuannya dB, sehingga hasilnya tidak sesuai.',
        fix: 'Pakai linear_to_db(0.5). Pastikan juga nama bus ada; jika tidak, get_bus_index mengembalikan -1.',
      },
    },
    {
      title: 'Particles: percikan dan ledakan',
      text: [
        'Particles membuat efek seperti percikan, asap, atau debu. Ada GPUParticles2D (lebih bertenaga) dan CPUParticles2D (lebih kompatibel, cocok untuk perangkat lemah dan Web).',
        'Untuk efek sekali pakai, aktifkan one_shot lalu nyalakan emitting saat kejadian terjadi. GPUParticles2D membutuhkan process material agar partikelnya terlihat.',
      ],
      analogy: 'Seperti kembang api: sekali sulut, ia memercikkan banyak titik, lalu selesai sendiri.',
      figure: ['Kejadian', 'emitting = true', 'Partikel menyebar'],
      code: {
        src: `extends GPUParticles2D

func _ready() -> void:
	one_shot = true
	emitting = false

func ledakkan(posisi: Vector2) -> void:
	global_position = posisi
	emitting = true`,
        lines: [
          ['one_shot = true', 'Partikel dipancarkan sekali per aktivasi.'],
          ['emitting = false', 'Awalnya tidak memancarkan.'],
          ['global_position = posisi', 'Memindahkan efek ke lokasi kejadian.'],
          ['emitting = true', 'Menyalakan efek.'],
        ],
        input: 'Pemanggilan ledakkan(posisi_koin).',
        output: 'Percikan partikel muncul sekali di posisi koin.',
        mistake: 'GPUParticles2D tanpa Process Material sehingga tidak ada partikel yang terlihat.',
        fix: 'Buat ParticleProcessMaterial pada properti Process Material, atau pakai CPUParticles2D.',
      },
    },
    {
      title: 'Tween: animasi lewat kode',
      text: [
        'Tween mengubah sebuah properti secara halus dari satu nilai ke nilai lain selama waktu tertentu. Cocok untuk fade, bergeser, atau membesar tanpa membuat animasi di editor.',
        'Buat dengan create_tween(), lalu tween_property(objek, "nama_properti", nilai_akhir, durasi). Sub-properti ditulis dengan titik dua, misalnya "modulate:a" untuk transparansi.',
      ],
      analogy: 'Seperti memutar tombol volume pelan-pelan dari sunyi ke keras, bukan melompat tiba-tiba.',
      figure: ['Nilai awal', 'tween_property()', 'Nilai akhir'],
      code: {
        src: `func muncul() -> void:
	modulate.a = 0.0
	var tween: Tween = create_tween()
	tween.tween_property(self, "modulate:a", 1.0, 0.5)`,
        lines: [
          ['modulate.a = 0.0', 'Mulai dari sepenuhnya transparan.'],
          ['var tween: Tween = create_tween()', 'Membuat tween baru.'],
          ['tween.tween_property(self, "modulate:a", 1.0, 0.5)', 'Mengubah transparansi menjadi 1 selama 0,5 detik.'],
        ],
        input: 'Pemanggilan muncul() pada node yang punya properti modulate.',
        output: 'Node memudar masuk dalam setengah detik.',
        mistake: 'Nama properti pada tween_property salah ketik sehingga tidak ada yang berubah dan muncul error.',
        fix: 'Tulis nama properti persis, misalnya "modulate:a" atau "position".',
      },
    },
    {
      title: 'Transisi dan feedback visual',
      text: [
        'Transisi layar memberi jeda halus saat berpindah scene. Buat ColorRect gelap di CanvasLayer, pudarkan dengan Tween, tunggu selesai dengan await, lalu ganti scene.',
        'Feedback visual lain: kilatan warna saat terkena damage (ubah modulate), getaran kamera, dan partikel. Efek kecil membuat aksi pemain terasa berdampak.',
      ],
      analogy: 'Seperti tirai panggung: ditutup perlahan, ganti dekorasi, lalu dibuka lagi.',
      figure: ['Layar memudar gelap', 'Ganti scene', 'Layar terbuka'],
      code: {
        src: `extends CanvasLayer

@onready var layar: ColorRect = $ColorRect

func pindah_scene(path: String) -> void:
	var tween: Tween = create_tween()
	tween.tween_property(layar, "modulate:a", 1.0, 0.4)
	await tween.finished
	get_tree().change_scene_to_file(path)`,
        lines: [
          ['@onready var layar: ColorRect = $ColorRect', 'Mengambil persegi penutup layar.'],
          ['tween.tween_property(layar, "modulate:a", 1.0, 0.4)', 'Menggelapkan layar selama 0,4 detik.'],
          ['await tween.finished', 'Menunggu tween selesai sebelum lanjut.'],
          ['get_tree().change_scene_to_file(path)', 'Berpindah scene setelah layar gelap.'],
        ],
        input: 'ColorRect berwarna gelap dengan transparansi awal 0.',
        output: 'Layar memudar gelap lalu gim berpindah ke scene tujuan.',
        mistake: 'ColorRect menutupi layar dan menangkap klik (Mouse Filter bawaan) sehingga tombol di bawahnya tidak bisa ditekan.',
        fix: 'Atur Mouse Filter pada ColorRect menjadi Ignore.',
      },
    },
  ],
  sim: {
    title: 'Simulasi: urutan transisi scene',
    intro: 'Klik langkah sesuai urutan transisi layar yang benar saat berpindah scene. Ini simulasi edukasi, bukan eksekusi kode sungguhan.',
    steps: [
      { t: 'Tween menaikkan transparansi layar penutup ke 1 (layar gelap)', why: 'Layar harus tertutup dulu agar pergantian scene tidak terlihat.' },
      { t: 'await tween.finished menunggu animasi gelap selesai', why: 'Kode harus menunggu layar benar-benar gelap sebelum lanjut.' },
      { t: 'get_tree().change_scene_to_file() mengganti scene', why: 'Scene baru dimuat saat layar tertutup sehingga perpindahannya mulus.' },
      { t: 'Scene baru dimulai dengan layar masih gelap', why: 'Scene baru muncul di balik layar penutup.' },
      { t: 'Tween menurunkan transparansi layar ke 0 (fade in)', why: 'Layar dibuka perlahan untuk menampilkan scene baru.' },
    ],
  },
  quiz: [
    {
      q: 'Node apa yang tepat untuk musik latar yang terdengar sama di mana pun pemain berada?',
      a: ['AudioStreamPlayer', 'AudioStreamPlayer2D', 'Label', 'Camera2D'],
      c: 0,
      why: 'AudioStreamPlayer memutar suara tanpa posisi sehingga volumenya merata.',
    },
    {
      q: 'Node apa yang membuat suara makin keras saat pemain mendekati sumbernya?',
      a: ['AudioStreamPlayer2D', 'AudioStreamPlayer', 'Timer', 'ColorRect'],
      c: 0,
      why: 'AudioStreamPlayer2D memutar suara berposisi dengan pelemahan jarak.',
    },
    {
      q: 'Benar atau salah: volume_db memakai skala desibel, bukan skala 0 sampai 1.',
      a: ['Benar', 'Salah'],
      c: 0,
      why: 'Satuannya dB. Untuk slider 0 sampai 1, gunakan linear_to_db().',
    },
    {
      q: 'Fungsi apa yang mengubah nilai slider 0 sampai 1 menjadi desibel?',
      a: ['linear_to_db(nilai)', 'db_to_slider(nilai)', 'str(nilai)', 'abs(nilai)'],
      c: 0,
      why: 'linear_to_db() mengubah skala linear menjadi desibel untuk AudioServer.',
    },
    {
      q: 'Untuk efek percikan sekali pakai saat koin diambil, node apa yang dipakai?',
      a: ['GPUParticles2D atau CPUParticles2D dengan one_shot', 'Label', 'AudioStreamPlayer', 'StaticBody2D'],
      c: 0,
      why: 'Particles dengan one_shot memancarkan percikan sekali setiap diaktifkan.',
    },
    {
      q: 'Baris mana yang membuat sebuah node memudar menjadi transparan selama 0,5 detik?',
      a: ['create_tween().tween_property(self, "modulate:a", 0.0, 0.5)', 'modulate.a = 0.5', 'tween.play(0.5)', 'fade(0.5)'],
      c: 0,
      why: 'tween_property mengubah properti secara bertahap: objek, nama properti, nilai akhir, lalu durasi.',
    },
  ],
  passScore: 4,
  mini: 'Mini project: buat Autoload AudioManager yang memutar musik latar dan efek koin, dengan slider volume memakai linear_to_db(). Tambahkan partikel saat koin diambil dan fade layar saat berpindah scene.',
  summary: [
    'AudioStreamPlayer untuk suara merata, AudioStreamPlayer2D untuk suara berposisi.',
    'Atur volume lewat Audio Bus dan ubah skala 0–1 dengan linear_to_db().',
    'Particles membuat percikan; aktifkan one_shot untuk efek sekali pakai.',
    'Tween mengubah properti secara halus; await tween.finished membantu transisi scene.',
  ],
  indicators: [
    ['read12', 'Membaca seluruh materi Bab 12'],
    ['sim12', 'Mengurutkan langkah transisi scene'],
    ['quiz12', 'Lulus kuis dengan minimal 4 dari 6 jawaban benar'],
  ],
};
