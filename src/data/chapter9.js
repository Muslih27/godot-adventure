// Konten Bab 9. Materi mengacu pada Godot Engine 4.x (4.3 ke atas untuk TileMapLayer).
export const chapter9 = {
  id: 9,
  keys: { read: 'read9', sim: 'sim9', quiz: 'quiz9' },
  badge: 'Desainer Level',
  title: 'Desain Level dan Interaksi',
  story:
    'Mas Level membentangkan denah besar di meja: "UI sudah beres. Sekarang dunianya. Level yang bagus itu seperti jalan setapak yang memandu pemain: jelas arahnya, ada hadiahnya, dan tidak membuat bingung."',
  goals: [
    'Membuat level berbasis tile dengan TileSet dan TileMapLayer, termasuk collision.',
    'Membuat area pemicu, collectible, dan perpindahan scene dengan Area2D.',
    'Mengatur Camera2D dan menerapkan prinsip dasar desain level.',
  ],
  pages: [
    {
      title: 'TileSet dan TileMapLayer',
      text: [
        'Level 2D sering dibuat dari kotak-kotak kecil (tile) pada grid. Kumpulan tile disimpan dalam resource TileSet, biasanya dari satu gambar tileset.',
        'Mulai Godot 4.3, node untuk melukis tile adalah TileMapLayer (menggantikan TileMap yang lama). Pisahkan tiap lapisan ke node berbeda, misalnya tanah, dinding, dan dekorasi.',
      ],
      analogy: 'TileSet seperti kotak stempel, dan TileMapLayer adalah kertasnya. Kamu menstempel pola yang sama berulang kali untuk membuat lantai atau dinding yang luas.',
      figure: ['Gambar tileset', 'TileSet', 'TileMapLayer', 'Level'],
      code: {
        src: `extends TileMapLayer

func _ready() -> void:
	set_cell(Vector2i(2, 3), 0, Vector2i(0, 0))`,
        lines: [
          ['extends TileMapLayer', 'Skrip dipasang pada node TileMapLayer.'],
          ['set_cell(Vector2i(2, 3), 0, Vector2i(0, 0))', 'Menaruh tile pada sel (2, 3). Argumen kedua adalah nomor sumber di TileSet, dan ketiga adalah koordinat tile pada atlas.'],
        ],
        input: 'TileSet dengan sumber nomor 0 yang punya tile pada koordinat atlas (0, 0).',
        output: 'Sebuah tile muncul pada sel grid kolom 2, baris 3.',
        mistake: 'Memakai bentuk lama yang memakai nomor layer, misalnya set_cell(0, Vector2i(2, 3), 0, Vector2i(0, 0)), sehingga muncul error argumen.',
        fix: 'TileMapLayer tidak punya parameter layer: tulis set_cell(koordinat, sumber, atlas). Pastikan Godot versi 4.3 ke atas.',
      },
    },
    {
      title: 'Collision pada tile',
      text: [
        'Agar tile menjadi dinding yang tidak bisa ditembus, tambahkan Physics Layer pada TileSet, lalu gambar bentuk collision pada tile yang bersifat padat.',
        'Tile dengan collision otomatis menahan CharacterBody2D. Kita juga dapat membaca isi grid lewat kode, misalnya untuk mengetahui tile di bawah pemain.',
      ],
      analogy: 'Seperti pagar: gambar dinding saja belum cukup. Kamu perlu memasang pagar nyata di tempat itu agar tidak bisa dilewati.',
      figure: ['Tile dinding', 'Physics Layer', 'Collision shape', 'Menahan pemain'],
      code: {
        src: `extends Node2D

@onready var tanah: TileMapLayer = $Tanah

func _physics_process(delta: float) -> void:
	var sel: Vector2i = tanah.local_to_map(tanah.to_local(global_position))
	var ada_tile: bool = tanah.get_cell_source_id(sel) != -1
	print(ada_tile)`,
        lines: [
          ['@onready var tanah: TileMapLayer = $Tanah', 'Mengambil node TileMapLayer bernama Tanah.'],
          ['tanah.to_local(global_position)', 'Mengubah posisi dunia menjadi posisi lokal pada layer itu.'],
          ['tanah.local_to_map(...)', 'Mengubah posisi lokal menjadi koordinat sel grid.'],
          ['tanah.get_cell_source_id(sel) != -1', 'Hasil -1 berarti sel kosong, selain itu ada tile.'],
        ],
        input: 'Posisi node ini di dalam level.',
        output: 'Output menampilkan true jika ada tile di bawah node, dan false jika kosong.',
        mistake: 'Memasukkan global_position langsung ke local_to_map sehingga sel yang dibaca salah ketika layer tidak berada di titik asal.',
        fix: 'Ubah dulu dengan to_local(global_position) sebelum local_to_map().',
      },
    },
    {
      title: 'Area trigger dan collectible',
      text: [
        'Area2D cocok sebagai pemicu: koin, checkpoint, atau zona bahaya. Saat pemain masuk, signal body_entered dipancarkan.',
        'Periksa jenis benda dengan kata kunci is, misalnya body is CharacterBody2D, agar hanya pemain yang memicu. Pastikan Collision Layer dan Mask kedua pihak saling cocok.',
      ],
      analogy: 'Seperti sensor di lantai toko: hanya bereaksi kalau yang melangkah memang pelanggan, bukan kucing yang lewat.',
      figure: ['Pemain masuk area', 'body_entered', 'Periksa jenis', 'Beri efek'],
      code: {
        src: `extends Area2D

signal diambil

func _on_body_entered(body: Node2D) -> void:
	if body is CharacterBody2D:
		diambil.emit()
		queue_free()`,
        lines: [
          ['signal diambil', 'Signal custom agar node lain bisa tahu koin diambil (Bab 7).'],
          ['if body is CharacterBody2D:', 'Hanya lanjut jika benda yang masuk bertipe CharacterBody2D.'],
          ['diambil.emit()', 'Mengumumkan bahwa koin diambil.'],
          ['queue_free()', 'Menghapus koin dari scene.'],
        ],
        input: 'Pemain masuk ke area koin, dan signal body_entered sudah terhubung.',
        output: 'Signal diambil dipancarkan dan koin menghilang.',
        mistake: 'Signal tidak pernah terpicu karena Collision Layer atau Mask tidak cocok, atau CollisionShape2D belum ada.',
        fix: 'Periksa Collision Layer dan Mask pada Area2D dan pemain, serta pastikan ada CollisionShape2D dengan shape.',
      },
    },
    {
      title: 'Perpindahan scene dan pintu',
      text: [
        'Pintu antar-level dapat dibuat dari Area2D yang memanggil get_tree().change_scene_to_file().',
        'Variabel dengan @export_file muncul di Inspector sehingga alamat scene tujuan dapat diisi tanpa mengubah kode.',
      ],
      analogy: 'Seperti pintu lift: sensor mendeteksi kamu masuk, lalu membawamu ke lantai yang diatur di panel.',
      figure: ['Pemain masuk pintu', 'change_scene_to_file()', 'Level berikutnya'],
      code: {
        src: `extends Area2D

@export_file("*.tscn") var scene_tujuan: String

func _on_body_entered(body: Node2D) -> void:
	if body is CharacterBody2D and scene_tujuan != "":
		get_tree().change_scene_to_file(scene_tujuan)`,
        lines: [
          ['@export_file("*.tscn") var scene_tujuan: String', 'Menampilkan pilihan file scene di Inspector.'],
          ['if body is CharacterBody2D and scene_tujuan != "":', 'Hanya pindah jika yang masuk pemain dan tujuan sudah diisi.'],
          ['get_tree().change_scene_to_file(scene_tujuan)', 'Memuat dan berpindah ke scene tujuan.'],
        ],
        input: 'Alamat scene tujuan diisi di Inspector, dan pemain masuk ke area pintu.',
        output: 'Gim berpindah ke scene tujuan.',
        mistake: 'Alamat scene kosong atau salah sehingga perpindahan gagal dan muncul error.',
        fix: 'Isi scene_tujuan di Inspector dan periksa alamatnya pada panel FileSystem.',
      },
    },
    {
      title: 'Kamera dan prinsip desain level',
      text: [
        'Camera2D yang menjadi child pemain akan mengikuti pemain. Aktifkan position_smoothing_enabled agar geraknya halus, dan atur limit agar kamera tidak menampilkan area di luar level.',
        'Prinsip desain level: pandu pemain dengan jalur dan penanda yang jelas, perkenalkan mekanik baru di tempat aman, naikkan tantangan bertahap, dan letakkan hadiah sebagai dorongan menjelajah.',
      ],
      analogy: 'Level yang baik seperti pemandu wisata: menunjukkan arah tanpa menarik tanganmu, dan sesekali memberi kejutan menyenangkan.',
      figure: ['Kenalkan mekanik', 'Latihan aman', 'Tantangan naik', 'Hadiah'],
      code: {
        src: `extends Camera2D

func _ready() -> void:
	position_smoothing_enabled = true
	limit_left = 0
	limit_top = 0
	limit_right = 1920
	limit_bottom = 1080`,
        lines: [
          ['position_smoothing_enabled = true', 'Kamera bergerak halus mengikuti pemain.'],
          ['limit_left = 0 dan limit_top = 0', 'Batas kiri dan atas area yang boleh dilihat kamera.'],
          ['limit_right = 1920 dan limit_bottom = 1080', 'Batas kanan dan bawah sesuai ukuran level.'],
        ],
        input: 'Camera2D menjadi child dari node pemain.',
        output: 'Kamera mengikuti pemain dengan halus dan berhenti di tepi level.',
        mistake: 'Camera2D tidak menjadi child pemain dan tidak diaktifkan sehingga kamera tidak mengikuti.',
        fix: 'Jadikan Camera2D child dari pemain dan pastikan opsi Enabled aktif.',
      },
    },
  ],
  sim: {
    title: 'Simulasi: urutan membuat level bertile',
    intro: 'Klik langkah sesuai urutan yang benar saat membuat level berbasis tile. Ini simulasi edukasi, bukan editor Godot yang sesungguhnya.',
    steps: [
      { t: 'Siapkan gambar tileset di folder assets proyek', why: 'Gambar tile harus tersedia sebelum bisa dibuat menjadi TileSet.' },
      { t: 'Buat TileSet dan atur ukuran tile sesuai gambar', why: 'Ukuran tile harus cocok agar potongan gambar tepat.' },
      { t: 'Tambahkan Physics Layer dan gambar collision pada tile dinding', why: 'Collision diatur di TileSet agar semua tile dinding yang dilukis otomatis padat.' },
      { t: 'Tambahkan node TileMapLayer ke scene dan pilih TileSet-nya', why: 'Node inilah yang dipakai untuk melukis tile pada grid.' },
      { t: 'Lukis tanah dan dinding level dengan tile', why: 'Setelah semuanya siap, barulah level dilukis.' },
      { t: 'Tambahkan Area2D untuk koin dan pintu antar-level', why: 'Interaksi ditambahkan terakhir, di atas level yang sudah jadi.' },
    ],
  },
  quiz: [
    {
      q: 'Node apa (Godot 4.3 ke atas) yang dipakai untuk melukis level berbasis tile?',
      a: ['TileMapLayer', 'Label', 'AudioStreamPlayer', 'Timer'],
      c: 0,
      why: 'TileMapLayer menggantikan TileMap yang lama untuk melukis tile pada grid.',
    },
    {
      q: 'Agar tile dinding tidak bisa ditembus pemain, apa yang perlu ditambahkan pada TileSet?',
      a: ['Physics Layer dengan collision shape pada tile dinding', 'Sebuah Label', 'Animasi pada tile', 'Nama baru untuk tile'],
      c: 0,
      why: 'Collision diatur di TileSet melalui Physics Layer dan bentuk collision tiap tile.',
    },
    {
      q: 'Benar atau salah: sejak Godot 4.3, TileMap yang lama digantikan oleh TileMapLayer.',
      a: ['Benar', 'Salah'],
      c: 0,
      why: 'TileMap ditandai usang di Godot 4.3 dan fungsinya dipindah ke node TileMapLayer.',
    },
    {
      q: 'Pada TileMapLayer, baris mana yang menaruh tile atlas (0, 0) dari sumber 0 pada sel (2, 3)?',
      a: ['set_cell(Vector2i(2, 3), 0, Vector2i(0, 0))', 'set_cell(0, Vector2i(2, 3), 0, Vector2i(0, 0))', 'put_tile(2, 3, 0)', 'paint(2, 3)'],
      c: 0,
      why: 'TileMapLayer tidak memakai nomor layer. Bentuk dengan nomor layer adalah milik TileMap yang lama.',
    },
    {
      q: 'Area2D koin tidak bereaksi saat pemain menyentuhnya. Apa yang paling perlu diperiksa?',
      a: ['Collision Layer dan Mask serta keberadaan CollisionShape2D', 'Warna latar belakang', 'Nama proyek', 'Volume musik'],
      c: 0,
      why: 'Signal body_entered hanya terpicu jika layer dan mask cocok dan ada bentuk collision.',
    },
    {
      q: 'Properti mana yang membuat Camera2D bergerak halus saat mengikuti pemain?',
      a: ['position_smoothing_enabled = true', 'visible = true', 'scale = Vector2.ONE', 'process_mode = ALWAYS'],
      c: 0,
      why: 'position_smoothing_enabled menghaluskan gerak kamera.',
    },
  ],
  passScore: 4,
  mini: 'Mini project: lukis level kecil dengan TileMapLayer (tanah dan dinding bercollision), tambahkan koin berupa Area2D, satu pintu pindah scene, dan Camera2D yang mengikuti pemain dengan limit.',
  summary: [
    'TileSet menyimpan tile; TileMapLayer (Godot 4.3+) melukisnya pada grid; collision diatur lewat Physics Layer.',
    'Area2D dengan body_entered dipakai untuk koin, checkpoint, dan pintu; cek jenis benda dengan is.',
    'Pindah scene dengan change_scene_to_file(); @export_file memudahkan mengisi tujuan.',
    'Camera2D mengikuti pemain dan diberi limit; desain level memandu, melatih, menantang, lalu memberi hadiah.',
  ],
  indicators: [
    ['read9', 'Membaca seluruh materi Bab 9'],
    ['sim9', 'Mengurutkan enam langkah membuat level bertile'],
    ['quiz9', 'Lulus kuis dengan minimal 4 dari 6 jawaban benar'],
  ],
};
