// Konten Bab 6. Materi mengacu pada Godot Engine 4.x (GDScript).
export const chapter6 = {
  id: 6,
  keys: { read: 'read6', sim: 'sim6', quiz: 'quiz6' },
  badge: 'Animator Pemula',
  title: 'Sprite dan Animasi',
  story:
    'Studio Animasi dipenuhi lembar frame dan layar yang berkedip. Seorang animator tersenyum: "Karakter yang bergerak tapi kaku itu membosankan. Hari ini kamu belajar membuatnya terasa hidup: berjalan, diam, bahkan bernapas."',
  goals: [
    'Mengatur Sprite2D dan transformasinya (posisi, rotasi, skala, flip).',
    'Memahami sprite sheet dan membuat animasi idle dan berjalan dengan AnimatedSprite2D.',
    'Mengenal AnimationPlayer dan memilih alat animasi yang tepat.',
  ],
  pages: [
    {
      title: 'Sprite2D dan transformasi',
      text: [
        'Sprite2D menampilkan sebuah gambar (texture). Properti transformasinya: position (posisi), rotation (rotasi), scale (skala), serta flip_h dan flip_v untuk mencerminkan gambar.',
        'Perhatian: rotation memakai radian. Untuk derajat gunakan rotation_degrees.',
      ],
      analogy: 'Sprite seperti stiker di papan: kamu bisa menggeser, memutar, memperbesar, atau membaliknya tanpa mengubah gambar aslinya.',
      figure: ['position', 'rotation', 'scale', 'flip_h'],
      code: {
        src: `extends Sprite2D

func _ready() -> void:
	position = Vector2(100, 50)
	rotation_degrees = 45
	scale = Vector2(2, 2)
	flip_h = true`,
        lines: [
          ['position = Vector2(100, 50)', 'Memindahkan sprite ke koordinat x = 100, y = 50.'],
          ['rotation_degrees = 45', 'Memutar sprite 45 derajat.'],
          ['scale = Vector2(2, 2)', 'Memperbesar sprite dua kali lipat.'],
          ['flip_h = true', 'Mencerminkan gambar secara horizontal.'],
        ],
        input: 'Sprite2D yang sudah punya texture.',
        output: 'Sprite muncul di (100, 50), miring 45 derajat, berukuran dua kali, dan terbalik horizontal.',
        mistake: 'Menulis rotation = 45 dengan harapan 45 derajat, padahal nilainya dibaca sebagai radian sehingga sprite berputar jauh.',
        fix: 'Pakai rotation_degrees = 45, atau rotation = deg_to_rad(45).',
      },
    },
    {
      title: 'Sprite sheet',
      text: [
        'Sprite sheet adalah satu gambar yang berisi banyak frame dalam susunan grid. Satu file untuk banyak frame lebih efisien daripada banyak file kecil.',
        'Pada Sprite2D, atur hframes (jumlah kolom) dan vframes (jumlah baris), lalu pilih frame yang ditampilkan. Nomor frame dimulai dari 0, dari kiri ke kanan lalu atas ke bawah.',
      ],
      analogy: 'Sprite sheet seperti strip film: satu lembar panjang berisi banyak gambar, dan kamu memilih kotak mana yang diperlihatkan.',
      figure: ['Frame 0', 'Frame 1', 'Frame 2', 'Frame 3'],
      code: {
        src: `extends Sprite2D

func _ready() -> void:
	hframes = 4
	vframes = 1
	frame = 2`,
        lines: [
          ['hframes = 4', 'Gambar dibagi menjadi 4 kolom.'],
          ['vframes = 1', 'Gambar hanya punya 1 baris.'],
          ['frame = 2', 'Menampilkan frame ketiga (indeks dimulai dari 0).'],
        ],
        input: 'Sprite sheet berisi 4 frame berjajar horizontal.',
        output: 'Sprite hanya menampilkan frame ke-3 dari sprite sheet.',
        mistake: 'Nilai hframes atau vframes tidak sama dengan jumlah kolom dan baris pada gambar sehingga tampilan terpotong.',
        fix: 'Hitung kolom dan baris pada gambar, lalu isi hframes dan vframes dengan angka tersebut.',
      },
    },
    {
      title: 'AnimatedSprite2D: animasi idle dan berjalan',
      text: [
        'AnimatedSprite2D memutar animasi dari daftar gambar. Daftar itu disimpan di resource SpriteFrames, tempat kamu membuat animasi bernama, misalnya "idle" dan "walk".',
        'Dari skrip, panggil play("nama_animasi"). Ganti animasi sesuai keadaan karakter: diam atau bergerak.',
        '@onready membuat variabel diisi saat node sudah siap, sehingga $NamaNode aman dipakai.',
      ],
      analogy: 'Seperti flipbook dengan beberapa buku: satu untuk berjalan, satu untuk diam. Kamu memilih buku yang sesuai keadaan.',
      figure: ['Diam → "idle"', 'Bergerak → "walk"'],
      code: {
        src: `extends CharacterBody2D

@onready var anim: AnimatedSprite2D = $AnimatedSprite2D

func _physics_process(delta: float) -> void:
	var arah: Vector2 = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
	velocity = arah * 150.0
	move_and_slide()
	if arah != Vector2.ZERO:
		anim.play("walk")
	else:
		anim.play("idle")`,
        lines: [
          ['@onready var anim: AnimatedSprite2D = $AnimatedSprite2D', 'Mengambil node AnimatedSprite2D setelah scene siap.'],
          ['velocity = arah * 150.0', 'Gerakan karakter (lihat Bab 5).'],
          ['if arah != Vector2.ZERO:', 'Memeriksa apakah ada arah gerak.'],
          ['anim.play("walk")', 'Memutar animasi berjalan.'],
          ['anim.play("idle")', 'Memutar animasi diam.'],
        ],
        input: 'Tombol panah dan node AnimatedSprite2D dengan animasi "idle" dan "walk".',
        output: 'Karakter memutar animasi walk saat bergerak dan idle saat berhenti.',
        mistake: 'Nama animasi di play() salah ketik atau berbeda dengan nama di SpriteFrames, sehingga animasi tidak ditemukan.',
        fix: 'Samakan nama persis dengan yang ada di panel SpriteFrames.',
      },
    },
    {
      title: 'AnimationPlayer',
      text: [
        'AnimationPlayer dapat menganimasikan hampir properti apa saja pada waktu tertentu dengan keyframe: posisi, rotasi, transparansi (modulate), bahkan memanggil fungsi.',
        'Cocok untuk animasi yang rumit seperti pintu terbuka sambil memudar, atau transisi menu.',
      ],
      analogy: 'AnimationPlayer seperti sutradara dengan garis waktu: kapan pintu bergeser, kapan lampu menyala, semuanya diatur per detik.',
      figure: ['Track', 'Keyframe', 'Garis waktu', 'play()'],
      code: {
        src: `extends Node2D

@onready var anim_player: AnimationPlayer = $AnimationPlayer

func _ready() -> void:
	anim_player.play("muncul")`,
        lines: [
          ['@onready var anim_player: AnimationPlayer = $AnimationPlayer', 'Mengambil node AnimationPlayer.'],
          ['anim_player.play("muncul")', 'Memutar animasi bernama muncul yang dibuat di editor.'],
        ],
        input: 'Animasi bernama muncul sudah dibuat di AnimationPlayer.',
        output: 'Animasi muncul diputar saat scene siap, misalnya objek memudar masuk.',
        mistake: 'Nama animasi salah atau animasi belum dibuat, sehingga tidak ada yang berjalan.',
        fix: 'Periksa daftar animasi di panel AnimationPlayer dan samakan namanya.',
      },
    },
    {
      title: 'Memilih alat animasi yang tepat',
      text: [
        'Sprite2D dengan frame cocok untuk mengganti gambar secara manual. AnimatedSprite2D cocok untuk animasi frame sederhana seperti idle dan walk.',
        'AnimationPlayer cocok jika banyak properti perlu bergerak bersamaan. Memilih alat yang tepat membuat proyek lebih mudah dirawat.',
      ],
      analogy: 'Seperti memilih alat dapur: pisau kecil untuk bawang, pisau besar untuk daging. Semuanya pisau, tetapi tugasnya berbeda.',
      figure: ['Sprite2D', 'AnimatedSprite2D', 'AnimationPlayer'],
    },
  ],
  sim: {
    title: 'Simulasi: urutan membuat animasi berjalan',
    intro: 'Klik langkah sesuai urutan membuat animasi berjalan dengan AnimatedSprite2D. Ini simulasi edukasi, bukan editor Godot yang sesungguhnya.',
    steps: [
      { t: 'Siapkan file sprite sheet di folder assets proyek', why: 'Gambar harus tersedia di proyek sebelum bisa dipakai.' },
      { t: 'Tambahkan node AnimatedSprite2D ke scene karakter', why: 'Node inilah yang akan memutar animasinya.' },
      { t: 'Buat resource SpriteFrames dan animasi bernama "walk"', why: 'Animasi perlu dibuat dan diberi nama sebelum diisi frame.' },
      { t: 'Seret atau potong frame dari sprite sheet ke animasi "walk"', why: 'Setelah animasinya ada, kamu mengisinya dengan frame gambar.' },
      { t: 'Panggil play("walk") dari skrip saat karakter bergerak', why: 'Langkah terakhir adalah memicu animasi sesuai keadaan gim.' },
    ],
  },
  quiz: [
    {
      q: 'Properti mana yang dipakai untuk memutar sprite dalam satuan derajat?',
      a: ['rotation_degrees', 'rotate_deg', 'angle', 'spin'],
      c: 0,
      why: 'rotation memakai radian, sedangkan rotation_degrees memakai derajat.',
    },
    {
      q: 'Apa arti rotation = 45 pada Sprite2D?',
      a: ['Putaran 45 radian, bukan 45 derajat', 'Putaran 45 derajat', 'Skala 45 kali', 'Frame ke-45'],
      c: 0,
      why: 'Nilai rotation dibaca sebagai radian, sehingga sprite berputar jauh. Gunakan rotation_degrees.',
    },
    {
      q: 'Benar atau salah: sprite sheet adalah satu gambar yang berisi banyak frame animasi.',
      a: ['Benar', 'Salah'],
      c: 0,
      why: 'Sprite sheet memuat banyak frame dalam grid, lalu dipilih lewat frame atau SpriteFrames.',
    },
    {
      q: 'Node mana yang paling sederhana untuk animasi frame-by-frame seperti idle dan walk?',
      a: ['AnimatedSprite2D', 'Label', 'Camera2D', 'AudioStreamPlayer'],
      c: 0,
      why: 'AnimatedSprite2D memutar animasi bernama dari SpriteFrames.',
    },
    {
      q: 'AnimationPlayer paling tepat dipakai untuk...',
      a: ['Menganimasikan banyak properti (posisi, rotasi, transparansi) sepanjang waktu', 'Menyimpan skor pemain', 'Membaca input keyboard', 'Mengubah nama proyek'],
      c: 0,
      why: 'AnimationPlayer memakai keyframe untuk hampir semua properti, cocok untuk animasi kompleks.',
    },
    {
      q: 'Apa fungsi @onready pada @onready var anim = $AnimatedSprite2D?',
      a: ['Variabel diisi saat node sudah siap sehingga $ aman dipakai', 'Menghapus node saat scene mulai', 'Membuat variabel menjadi konstanta', 'Mengganti nama node'],
      c: 0,
      why: '@onready menunda pengisian variabel sampai node masuk Scene Tree dan siap.',
    },
  ],
  passScore: 4,
  mini: 'Mini project: buat karakter dengan AnimatedSprite2D yang punya animasi "idle" dan "walk", lalu ganti animasi sesuai input dan cerminkan gambar saat berjalan ke kiri.',
  summary: [
    'Sprite2D punya position, rotation (radian), scale, dan flip; pakai rotation_degrees untuk derajat.',
    'Sprite sheet berisi banyak frame; hframes dan vframes mengatur grid, frame dimulai dari 0.',
    'AnimatedSprite2D memutar animasi dari SpriteFrames lewat play("nama").',
    'AnimationPlayer memakai keyframe untuk banyak properti sekaligus.',
  ],
  indicators: [
    ['read6', 'Membaca seluruh materi Bab 6'],
    ['sim6', 'Mengurutkan langkah membuat animasi berjalan'],
    ['quiz6', 'Lulus kuis dengan minimal 4 dari 6 jawaban benar'],
  ],
};
