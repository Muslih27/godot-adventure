// Konten Bab 2. Materi mengacu pada Godot Engine 4.x.
export const chapter2 = {
  id: 2,
  keys: { read: 'read2', sim: 'sim2', quiz: 'quiz2' },
  badge: 'Penjelajah Editor',
  title: 'Mengenal Godot Editor',
  story:
    'Di Ruang Kelas, Kak Syntax menyalakan layar besar: "Editor Godot itu seperti dapur kerja kita. Kalau kamu tahu letak semua alatnya, membuat gim jadi jauh lebih cepat. Ayo kenali dulu."',
  goals: [
    'Menjelaskan perbedaan Node dan Scene serta cara kerja Scene Tree.',
    'Menyebutkan fungsi panel Scene, FileSystem, Inspector, dan Output.',
    'Memahami struktur proyek (res://) dan cara menjalankan proyek.',
  ],
  pages: [
    {
      title: 'Node dan Scene',
      text: [
        'Node adalah unit dasar di Godot. Setiap node punya tugas tertentu: Sprite2D menampilkan gambar, Camera2D mengatur kamera, Label menampilkan teks, AudioStreamPlayer memutar suara.',
        'Scene adalah kumpulan node yang tersusun dan bisa disimpan sebagai file (.tscn). Sebuah scene bisa berupa karakter, level, atau menu.',
      ],
      analogy: 'Node seperti balok Lego, dan scene adalah bangunan yang sudah kamu rakit dari balok-balok itu.',
      figure: ['Node (balok)', 'Scene (bangunan)', 'Gim (kota)'],
    },
    {
      title: 'Scene Tree: pohon hierarki node',
      text: [
        'Node di dalam scene disusun seperti pohon. Node paling atas disebut root. Node di bawahnya adalah child, dan node yang membawahi disebut parent.',
        'Pada node 2D, child ikut berpindah, berputar, dan berskala mengikuti parent. Contoh: kamera yang menjadi child pemain akan ikut bergerak bersama pemain.',
        'Dalam skrip, node anak dapat diambil dengan $NamaNode (singkatan dari get_node).',
      ],
      analogy: 'Seperti struktur folder: folder induk membawa isinya. Memindahkan folder induk berarti memindahkan semua isinya.',
      figure: ['Main (Node2D)', 'Player (Sprite2D)', 'Camera2D'],
      code: {
        src: `extends Node2D

func _ready() -> void:
	var player: Sprite2D = $Player
	print(player.name)`,
        lines: [
          ['extends Node2D', 'Skrip dipasang pada node root bertipe Node2D.'],
          ['func _ready() -> void:', 'Dipanggil sekali saat node dan child-nya siap.'],
          ['var player: Sprite2D = $Player', 'Mengambil child bernama "Player" bertipe Sprite2D ke dalam variabel.'],
          ['print(player.name)', 'Menampilkan nama node di panel Output.'],
        ],
        input: 'Scene harus punya child bernama Player (Sprite2D) di bawah node root.',
        output: 'Panel Output menampilkan: Player',
        mistake: 'Nama node salah ketik atau beda huruf besar/kecil (Godot membedakannya), sehingga hasilnya null dan muncul error saat dipakai.',
        fix: 'Samakan nama persis dengan yang ada di panel Scene. Bisa juga seret node dari panel Scene ke skrip agar penulisannya otomatis.',
      },
    },
    {
      title: 'Mengenal antarmuka Godot Editor',
      text: [
        'Panel Scene (kiri atas) menampilkan Scene Tree. Panel FileSystem (kiri bawah) menampilkan seluruh file proyek.',
        'Panel Inspector (kanan) menampilkan dan mengubah properti node yang sedang dipilih, misalnya posisi atau tekstur. Di sebelahnya ada tab Node untuk melihat signal.',
        'Bagian tengah adalah area kerja (2D, 3D, Script). Panel bawah berisi Output (hasil print) dan Debugger (error).',
      ],
      analogy: 'Seperti dasbor mobil: setiap panel punya fungsi sendiri, dan kamu perlu tahu mana yang dilihat saat ada masalah.',
      figure: ['Scene', 'FileSystem', 'Inspector', 'Viewport', 'Output'],
    },
    {
      title: 'Struktur proyek dan res://',
      text: [
        'Setiap proyek Godot punya file project.godot di folder utamanya. Folder utama itu dikenali Godot dengan alamat res://.',
        'Susun file ke dalam folder, misalnya scenes, scripts, dan assets. Nama file disarankan memakai snake_case, contoh player.gd dan main_menu.tscn.',
      ],
      analogy: 'res:// seperti alamat rumah utama proyek. Semua file di dalamnya dicari dari alamat itu.',
      figure: ['project.godot', 'scenes/', 'scripts/', 'assets/'],
      code: {
        src: `extends Sprite2D

const PLAYER_TEXTURE: Texture2D = preload("res://assets/player.png")

func _ready() -> void:
	texture = PLAYER_TEXTURE`,
        lines: [
          ['extends Sprite2D', 'Skrip dipasang pada node Sprite2D.'],
          ['const PLAYER_TEXTURE: Texture2D = preload("res://assets/player.png")', 'Memuat gambar dari folder assets proyek saat skrip dibaca.'],
          ['texture = PLAYER_TEXTURE', 'Memasang gambar tersebut sebagai tekstur sprite.'],
        ],
        input: 'File player.png harus ada di folder assets pada proyek.',
        output: 'Sprite menampilkan gambar player.png saat scene berjalan.',
        mistake: 'Alamat file salah (typo atau file sudah dipindah lewat File Explorer), sehingga muncul error file tidak ditemukan.',
        fix: 'Periksa alamat di panel FileSystem. Pindahkan atau ganti nama file lewat panel FileSystem agar referensi ikut diperbarui.',
      },
    },
    {
      title: 'Menjalankan proyek',
      text: [
        'Tekan tombol Play atau F5 untuk menjalankan proyek dari Main Scene. Jika belum ada, Godot akan meminta kamu memilihnya.',
        'Tekan F6 untuk menjalankan scene yang sedang dibuka saja. Ini berguna untuk menguji satu karakter atau satu level tanpa menjalankan seluruh gim. (Di macOS, tombolnya berbeda.)',
        'Gunakan print() untuk memeriksa nilai, lalu lihat hasilnya di panel Output.',
      ],
      analogy: 'Seperti tombol Play pada pemutar video: bisa memutar seluruh film (F5) atau hanya adegan yang sedang dibuka (F6).',
      figure: ['Pilih Main Scene', 'Tekan F5', 'Lihat jendela gim', 'Cek Output'],
    },
  ],
  sim: {
    type: 'match',
    title: 'Simulasi: pasangkan Node dengan fungsinya',
    intro: 'Pilih node di kolom kiri, lalu klik fungsinya di kolom kanan. Ini simulasi edukasi, bukan editor Godot yang sesungguhnya.',
    pairs: [
      { t: 'Node2D', d: 'Node dasar objek 2D: punya posisi, rotasi, dan skala', why: 'Node2D adalah induk dasar bagi banyak node 2D karena menyediakan transformasi.' },
      { t: 'Sprite2D', d: 'Menampilkan gambar (tekstur) 2D', why: 'Sprite2D dipakai untuk menampilkan gambar karakter, item, atau dekorasi.' },
      { t: 'Camera2D', d: 'Menentukan bagian dunia 2D yang terlihat di layar', why: 'Camera2D menentukan sudut pandang, misalnya mengikuti pemain.' },
      { t: 'Label', d: 'Menampilkan teks di antarmuka', why: 'Label adalah node Control untuk menampilkan teks seperti skor.' },
      { t: 'AudioStreamPlayer', d: 'Memutar musik atau efek suara', why: 'AudioStreamPlayer memutar file audio, misalnya musik latar.' },
    ],
  },
  quiz: [
    {
      q: 'Apa itu scene di Godot?',
      a: ['Kumpulan node tersusun yang bisa disimpan sebagai file (.tscn)', 'Satu file gambar saja', 'Sebuah skrip GDScript', 'Tampilan menu bawaan Windows'],
      c: 0,
      why: 'Scene adalah susunan node yang disimpan dan dapat dipakai ulang, misalnya karakter atau level.',
    },
    {
      q: 'Panel mana yang dipakai untuk melihat dan mengubah properti node yang sedang dipilih?',
      a: ['Inspector', 'FileSystem', 'Output', 'Debugger'],
      c: 0,
      why: 'Inspector menampilkan properti node terpilih, misalnya position atau texture.',
    },
    {
      q: 'Benar atau salah: pada node 2D, jika parent digeser maka child ikut berpindah.',
      a: ['Benar', 'Salah'],
      c: 0,
      why: 'Child mengikuti transformasi parent. Itulah alasan kamera sering dijadikan child pemain.',
    },
    {
      q: 'Dalam skrip, apa arti $Player?',
      a: ['Mengambil node anak bernama Player', 'Membuat node baru bernama Player', 'Menghapus node Player', 'Mengganti nama proyek menjadi Player'],
      c: 0,
      why: '$NamaNode adalah singkatan untuk get_node("NamaNode") dan mengambil node child.',
    },
    {
      q: 'res:// menunjuk ke mana?',
      a: ['Folder utama proyek Godot', 'Folder Documents di Windows', 'Alamat situs web', 'Memori RAM komputer'],
      c: 0,
      why: 'res:// adalah akar proyek. Semua file proyek dialamati dari sana.',
    },
    {
      q: 'Kamu ingin menguji satu scene yang sedang dibuka tanpa menjalankan seluruh gim. Tombol apa yang dipakai (Windows/Linux)?',
      a: ['F6', 'F5', 'F1', 'Esc'],
      c: 0,
      why: 'F6 menjalankan scene yang sedang dibuka, sedangkan F5 menjalankan proyek dari Main Scene.',
    },
  ],
  passScore: 4,
  mini: 'Mini project: gambar di kertas (atau tulis) Scene Tree untuk karakter gim: root Node2D bernama Player dengan child Sprite2D dan Camera2D. Lalu rancang struktur folder proyek: scenes, scripts, assets.',
  summary: [
    'Node adalah unit dasar; scene adalah susunan node yang disimpan sebagai file.',
    'Scene Tree berbentuk hierarki; child mengikuti transformasi parent.',
    'Inspector mengubah properti node; FileSystem mengelola file; Output menampilkan hasil print.',
    'res:// adalah akar proyek; F5 menjalankan proyek, F6 menjalankan scene yang dibuka.',
  ],
  indicators: [
    ['read2', 'Membaca seluruh materi Bab 2'],
    ['sim2', 'Memasangkan lima node dengan fungsinya'],
    ['quiz2', 'Lulus kuis dengan minimal 4 dari 6 jawaban benar'],
  ],
};
