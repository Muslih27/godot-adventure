// Konten Bab 7. Materi mengacu pada Godot Engine 4.x (GDScript).
export const chapter7 = {
  id: 7,
  keys: { read: 'read7', sim: 'sim7', quiz: 'quiz7' },
  badge: 'Perakit Scene',
  title: 'Scene, Instancing, dan Signal',
  story:
    'Rak-rak Perpustakaan Akademi menjulang tinggi, dan di meja tengah terbentang denah berisi kotak-kotak yang saling terhubung. Pustakawan Data menunjuknya: "Gim besar dibangun dari scene kecil yang dirakit dan saling berkomunikasi. Mari pelajari caranya."',
  goals: [
    'Membuat objek dari scene dengan PackedScene, instantiate(), dan add_child().',
    'Memahami hubungan parent dan child saat gim berjalan.',
    'Memakai signal bawaan dan membuat custom signal untuk komunikasi antarnode.',
  ],
  pages: [
    {
      title: 'Scene sebagai cetakan: instancing',
      text: [
        'Scene yang disimpan (.tscn) adalah cetakan. Dari satu scene kamu bisa membuat banyak salinan yang disebut instance, misalnya banyak koin dari satu scene koin.',
        'Di Godot 4: muat scene dengan preload() menjadi PackedScene, buat salinan dengan instantiate(), lalu tambahkan ke scene dengan add_child().',
      ],
      analogy: 'Scene seperti cetakan kue. Satu cetakan bisa menghasilkan banyak kue, dan setiap kue boleh diberi hiasan berbeda.',
      figure: ['PackedScene (cetakan)', 'instantiate()', 'add_child()'],
      code: {
        src: `extends Node2D

const KOIN_SCENE: PackedScene = preload("res://scenes/koin.tscn")

func _ready() -> void:
	var koin: Node2D = KOIN_SCENE.instantiate()
	koin.position = Vector2(200, 100)
	add_child(koin)`,
        lines: [
          ['const KOIN_SCENE: PackedScene = preload("res://scenes/koin.tscn")', 'Memuat scene koin sebagai cetakan.'],
          ['var koin: Node2D = KOIN_SCENE.instantiate()', 'Membuat satu salinan (instance) dari scene itu.'],
          ['koin.position = Vector2(200, 100)', 'Menentukan posisi koin.'],
          ['add_child(koin)', 'Memasukkan koin ke Scene Tree agar tampil dan aktif.'],
        ],
        input: 'File res://scenes/koin.tscn sudah ada dan root-nya bertipe Node2D.',
        output: 'Sebuah koin muncul pada posisi (200, 100).',
        mistake: 'Lupa add_child(). Objek sudah dibuat di memori tetapi tidak masuk Scene Tree sehingga tidak tampil.',
        fix: 'Selalu panggil add_child() pada node yang sudah ada di Scene Tree.',
      },
    },
    {
      title: 'Parent dan child saat gim berjalan',
      text: [
        'Hubungan parent dan child bisa diubah lewat kode: add_child() menambah, remove_child() melepas, dan queue_free() menghapus node dengan aman.',
        'Menghapus parent dengan queue_free() ikut menghapus semua child-nya. get_parent() mengambil parent dan get_child(i) mengambil child ke-i.',
      ],
      analogy: 'Seperti folder: menghapus folder induk menghapus semua isinya, sedangkan memindahkan file berarti mengganti folder induknya.',
      figure: ['Parent', 'Child 0', 'Child 1'],
      code: {
        src: `func _ready() -> void:
	var anak: Node = get_child(0)
	print(anak.name)
	print(get_parent().name)
	anak.queue_free()`,
        lines: [
          ['var anak: Node = get_child(0)', 'Mengambil child pertama dari node ini.'],
          ['print(anak.name)', 'Menampilkan nama child tersebut.'],
          ['print(get_parent().name)', 'Menampilkan nama parent node ini.'],
          ['anak.queue_free()', 'Menghapus child itu setelah frame berjalan.'],
        ],
        input: 'Node ini punya minimal satu child dan satu parent.',
        output: 'Output menampilkan nama child dan nama parent, lalu child dihapus dari scene.',
        mistake: 'Mengakses get_child(0) saat node tidak punya child, atau memakai node setelah queue_free(), sehingga muncul error.',
        fix: 'Periksa get_child_count() terlebih dahulu dan jangan memakai node yang sudah dihapus.',
      },
    },
    {
      title: 'Signal bawaan',
      text: [
        'Signal adalah pengumuman yang dipancarkan node ketika sesuatu terjadi. Contoh: Button punya pressed, Area2D punya body_entered, Timer punya timeout.',
        'Hubungkan signal ke fungsi dengan connect(). Tulis nama fungsinya tanpa tanda kurung, karena kita merujuk ke fungsi, bukan memanggilnya.',
      ],
      analogy: 'Signal seperti bel pintu: tamu menekan bel (signal), dan penghuni yang berlangganan bel itu bergerak membuka pintu.',
      figure: ['Kejadian', 'Signal dipancarkan', 'Fungsi dijalankan'],
      code: {
        src: `extends Node2D

func _ready() -> void:
	$Tombol.pressed.connect(_on_tombol_pressed)

func _on_tombol_pressed() -> void:
	print("Tombol ditekan!")`,
        lines: [
          ['$Tombol.pressed.connect(_on_tombol_pressed)', 'Menghubungkan signal pressed milik node Tombol ke fungsi di bawah.'],
          ['func _on_tombol_pressed() -> void:', 'Fungsi penerima. Dijalankan setiap kali tombol ditekan.'],
          ['print("Tombol ditekan!")', 'Menampilkan pesan di Output.'],
        ],
        input: 'Scene punya child Button bernama Tombol; pemain menekannya.',
        output: 'Output menampilkan: Tombol ditekan! pada setiap penekanan.',
        mistake: 'Menulis connect(_on_tombol_pressed()) dengan tanda kurung sehingga fungsi dipanggil saat itu juga, bukan dihubungkan.',
        fix: 'Tulis connect(_on_tombol_pressed) tanpa tanda kurung.',
      },
    },
    {
      title: 'Custom signal',
      text: [
        'Kamu bisa membuat signal sendiri dengan kata kunci signal, lalu memancarkannya dengan emit().',
        'Dengan custom signal, sebuah node cukup mengumumkan kejadian (misalnya nyawa habis) tanpa perlu tahu siapa yang mendengarkan.',
      ],
      analogy: 'Seperti pengeras suara sekolah: petugas hanya mengumumkan, dan siapa pun yang mendengar boleh bereaksi.',
      figure: ['signal nyawa_habis', '.emit()', 'Penerima bereaksi'],
      code: {
        src: `extends CharacterBody2D

signal nyawa_habis

var nyawa: int = 3

func kena_damage() -> void:
	nyawa -= 1
	if nyawa <= 0:
		nyawa_habis.emit()`,
        lines: [
          ['signal nyawa_habis', 'Mendeklarasikan signal baru bernama nyawa_habis.'],
          ['nyawa -= 1', 'Mengurangi nyawa setiap kena damage.'],
          ['if nyawa <= 0:', 'Memeriksa apakah nyawa sudah habis.'],
          ['nyawa_habis.emit()', 'Memancarkan signal ke semua penerima yang terhubung.'],
        ],
        input: 'Fungsi kena_damage() dipanggil.',
        output: 'Setelah tiga kali dipanggil, signal nyawa_habis dipancarkan.',
        mistake: 'Menulis nyawa_habis tanpa .emit() sehingga signal tidak pernah dipancarkan.',
        fix: 'Gunakan nyawa_habis.emit(), dan pastikan ada penerima yang terhubung.',
      },
    },
    {
      title: 'Koneksi antarnode: call down, signal up',
      text: [
        'Aturan praktis: parent memanggil fungsi milik child (call down), sedangkan child memberi tahu parent lewat signal (signal up).',
        'Dengan cara ini node tidak saling bergantung erat, sehingga scene mudah dipakai ulang dan diuji sendiri-sendiri.',
      ],
      analogy: 'Seperti kelas: guru memberi perintah kepada murid (call down), dan murid mengangkat tangan untuk memberi tahu guru (signal up).',
      figure: ['Parent: call down', 'Child: signal up'],
      code: {
        src: `extends Node2D

@onready var pemain: CharacterBody2D = $Pemain

func _ready() -> void:
	pemain.nyawa_habis.connect(_on_pemain_nyawa_habis)

func _on_pemain_nyawa_habis() -> void:
	print("Game over")`,
        lines: [
          ['@onready var pemain: CharacterBody2D = $Pemain', 'Mengambil node child bernama Pemain.'],
          ['pemain.nyawa_habis.connect(_on_pemain_nyawa_habis)', 'Parent berlangganan signal custom dari child.'],
          ['func _on_pemain_nyawa_habis() -> void:', 'Dijalankan ketika signal dipancarkan.'],
        ],
        input: 'Node Pemain memiliki signal nyawa_habis.',
        output: 'Output menampilkan: Game over saat nyawa pemain habis.',
        mistake: 'Nama signal pada connect() tidak sama dengan yang dideklarasikan, sehingga muncul error.',
        fix: 'Samakan nama signal persis dengan deklarasi signal di skrip node tersebut.',
      },
    },
  ],
  sim: {
    type: 'match',
    title: 'Simulasi: pasangkan signal dengan pemicunya',
    intro: 'Pilih nama signal di kolom kiri, lalu klik kejadian yang memicunya di kolom kanan. Ini simulasi edukasi, bukan editor Godot yang sesungguhnya.',
    pairs: [
      { t: 'pressed (Button)', d: 'Tombol ditekan oleh pemain', why: 'Button memancarkan pressed saat ditekan.' },
      { t: 'body_entered (Area2D)', d: 'Sebuah benda fisika masuk ke dalam area', why: 'Area2D memancarkan body_entered ketika ada body yang masuk.' },
      { t: 'timeout (Timer)', d: 'Waktu hitung mundur pada Timer habis', why: 'Timer memancarkan timeout saat waktunya selesai.' },
      { t: 'animation_finished (AnimationPlayer)', d: 'Sebuah animasi selesai diputar', why: 'AnimationPlayer memancarkan animation_finished setelah animasi berakhir.' },
      { t: 'nyawa_habis (custom signal)', d: 'Kode kita sendiri memanggil nyawa_habis.emit()', why: 'Custom signal hanya dipancarkan saat kode memanggil emit().' },
    ],
  },
  quiz: [
    {
      q: 'Di Godot 4, fungsi mana yang membuat salinan (instance) dari sebuah PackedScene?',
      a: ['instantiate()', 'instance()', 'copy_scene()', 'spawn()'],
      c: 0,
      why: 'Godot 4 memakai instantiate(). Fungsi instance() berasal dari Godot 3.',
    },
    {
      q: 'Setelah instantiate(), apa yang perlu dilakukan agar objek muncul di scene?',
      a: ['Memanggil add_child() pada node yang sudah di Scene Tree', 'Memanggil queue_free()', 'Mengubah nama proyek', 'Tidak perlu apa-apa'],
      c: 0,
      why: 'Objek baru harus dimasukkan ke Scene Tree lewat add_child() agar tampil dan aktif.',
    },
    {
      q: 'Benar atau salah: memanggil queue_free() pada sebuah parent juga menghapus semua child-nya.',
      a: ['Benar', 'Salah'],
      c: 0,
      why: 'Child adalah bagian dari parent sehingga ikut terhapus bersamanya.',
    },
    {
      q: 'Cara yang benar menghubungkan signal pressed pada node Tombol ke fungsi _on_tombol_pressed adalah...',
      a: ['$Tombol.pressed.connect(_on_tombol_pressed)', '$Tombol.pressed.connect(_on_tombol_pressed())', '$Tombol.connect.pressed(_on_tombol_pressed)', 'pressed(_on_tombol_pressed)'],
      c: 0,
      why: 'Tulis nama fungsi tanpa tanda kurung karena kita merujuk ke fungsi, bukan memanggilnya.',
    },
    {
      q: 'Bagaimana memancarkan custom signal bernama nyawa_habis di Godot 4?',
      a: ['nyawa_habis.emit()', 'emit_signal nyawa_habis', 'nyawa_habis()', 'send(nyawa_habis)'],
      c: 0,
      why: 'Signal dipancarkan dengan metode emit().',
    },
    {
      q: 'Apa maksud prinsip "call down, signal up"?',
      a: ['Parent memanggil fungsi child, sedangkan child memberi tahu parent lewat signal', 'Child memanggil fungsi parent secara langsung', 'Semua node harus saling memanggil', 'Signal hanya dipakai untuk menghapus node'],
      c: 0,
      why: 'Dengan begitu child tidak bergantung erat pada parent sehingga mudah dipakai ulang.',
    },
  ],
  passScore: 4,
  mini: 'Mini project: buat scene koin.tscn lalu tulis skrip yang membuat 5 koin di posisi berbeda memakai instantiate() dalam perulangan, dan buat custom signal koin_diambil pada scene koin.',
  summary: [
    'Scene adalah cetakan; preload(), instantiate(), dan add_child() membuat dan menampilkan salinannya.',
    'queue_free() menghapus node (beserta child-nya); get_parent() dan get_child() mengakses hubungan node.',
    'Signal adalah pengumuman kejadian; hubungkan dengan connect() tanpa tanda kurung.',
    'Call down, signal up: parent memanggil child, child memberi tahu parent lewat signal.',
  ],
  indicators: [
    ['read7', 'Membaca seluruh materi Bab 7'],
    ['sim7', 'Memasangkan lima signal dengan pemicunya'],
    ['quiz7', 'Lulus kuis dengan minimal 4 dari 6 jawaban benar'],
  ],
};
