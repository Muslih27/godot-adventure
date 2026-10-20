// Konten Bab 14. Materi mengacu pada Godot Engine 4.x (GDScript).
export const chapter14 = {
  id: 14,
  keys: { read: 'read14', sim: 'sim14', quiz: 'quiz14' },
  badge: 'Pemburu Bug',
  title: 'Debugging dan Optimasi',
  story:
    'Di Ruang Pengujian, kutu-kutu kecil merah merayap di lantai dan layar penuh pesan peringatan. Seorang teknisi berkacamata menggulung lengan bajunya: "Setiap programmer menghasilkan bug. Bedanya, programmer yang baik tahu cara memburunya. Mari kita belajar membaca error, menyelidiki, dan membuat gim berjalan lancar."',
  goals: [
    'Membaca pesan error dan memakai Debugger serta breakpoint.',
    'Memakai print debugging dan assert untuk memeriksa nilai.',
    'Mengenali masalah performa dan melakukan optimasi dasar dengan Profiler dan Monitors.',
  ],
  pages: [
    {
      title: 'Membaca pesan error',
      text: [
        'Saat gim berjalan, panel Debugger menampilkan error (merah) dan peringatan (kuning). Pesan error menyebutkan jenis masalah, nama skrip, dan nomor baris.',
        'Baca pesan error dari yang paling atas, karena error pertama sering memicu error lain. Kesalahan yang sangat umum adalah mengakses node atau variabel yang masih kosong (null).',
      ],
      analogy: 'Pesan error seperti catatan dokter: ada gejala, ada lokasi, dan petunjuk penyebab. Kamu tinggal membacanya dengan teliti.',
      figure: ['Jenis error', 'Skrip', 'Nomor baris', 'Penyebab'],
      code: {
        src: `extends Node2D

var musuh: Node2D

func _ready() -> void:
	print(musuh.name)`,
        lines: [
          ['var musuh: Node2D', 'Variabel dideklarasikan tetapi belum diisi, sehingga nilainya null.'],
          ['print(musuh.name)', 'Mencoba mengakses properti dari nilai null.'],
        ],
        input: 'Tidak ada. Variabel musuh tidak pernah diisi.',
        output: 'Debugger menampilkan error akses properti pada Nil (null) lengkap dengan nama skrip dan nomor baris.',
        mistake: 'Memakai variabel atau node yang belum diisi, misalnya salah nama node atau lupa meng-assign.',
        fix: 'Pastikan variabel terisi sebelum dipakai, atau periksa dengan if musuh != null: atau is_instance_valid(musuh).',
      },
    },
    {
      title: 'Print debugging',
      text: [
        'Cara paling cepat memeriksa nilai: tampilkan dengan print() lalu lihat di panel Output. Cetak nilai masukan dan hasil di titik-titik penting untuk melihat di mana nilai mulai salah.',
        'Gunakan push_warning() atau push_error() untuk pesan yang perlu menonjol. Hapus atau batasi print setelah selesai agar Output tidak penuh dan performa tidak terganggu.',
      ],
      analogy: 'Seperti menandai peta saat tersesat: tiap titik yang kamu lewati dicatat sampai ketahuan di mana kamu salah belok.',
      figure: ['Masukan', 'print()', 'Hasil', 'Bandingkan dengan harapan'],
      code: {
        src: `func hitung_damage(serangan: int, pertahanan: int) -> int:
	print("serangan=", serangan, " pertahanan=", pertahanan)
	var hasil: int = serangan - pertahanan
	print("hasil=", hasil)
	return hasil`,
        lines: [
          ['print("serangan=", serangan, ...)', 'Menampilkan nilai masukan untuk memastikan datanya benar.'],
          ['var hasil: int = serangan - pertahanan', 'Perhitungan yang sedang diselidiki.'],
          ['print("hasil=", hasil)', 'Menampilkan hasil untuk dibandingkan dengan yang diharapkan.'],
        ],
        input: 'Pemanggilan hitung_damage(3, 8).',
        output: 'Output: serangan=3 pertahanan=8, lalu hasil=-5. Terlihat bahwa hasil negatif belum ditangani.',
        mistake: 'Membiarkan banyak print di versi akhir sehingga Output penuh dan sedikit memperlambat gim.',
        fix: 'Hapus print setelah masalah selesai, atau bungkus dengan if OS.is_debug_build():.',
      },
    },
    {
      title: 'Breakpoint dan Debugger',
      text: [
        'Breakpoint menghentikan gim pada baris tertentu agar kamu bisa memeriksa isi variabel. Klik di sisi kiri nomor baris untuk memasangnya (titik merah), lalu jalankan dengan debug.',
        'Saat berhenti, lihat variabel di panel Debugger dan lanjutkan langkah demi langkah: Step Into (F11), Step Over (F10), dan Continue (F12). Kamu juga dapat menulis kata kunci breakpoint di dalam kode.',
      ],
      analogy: 'Seperti menekan pause saat menonton rekaman kejadian, lalu memeriksa tiap detail pada bingkai itu.',
      figure: ['Pasang breakpoint', 'Gim berhenti', 'Periksa variabel', 'Continue'],
      code: {
        src: `func _physics_process(delta: float) -> void:
	var arah: Vector2 = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
	if arah.x > 0.9:
		breakpoint
	velocity = arah * 200.0
	move_and_slide()`,
        lines: [
          ['var arah: Vector2 = Input.get_vector(...)', 'Membaca input pemain.'],
          ['if arah.x > 0.9:', 'Kondisi agar gim hanya berhenti pada kasus yang diselidiki.'],
          ['breakpoint', 'Kata kunci yang menghentikan gim di baris ini saat dijalankan dengan debugger.'],
        ],
        input: 'Tombol kanan ditekan.',
        output: 'Gim berhenti saat arah.x lebih dari 0.9 dan nilai variabel dapat diperiksa di Debugger.',
        mistake: 'Memasang breakpoint tanpa kondisi di dalam _physics_process sehingga gim berhenti setiap frame dan sulit dilanjutkan.',
        fix: 'Gunakan kondisi (if) atau pasang breakpoint di fungsi yang hanya dipanggil sekali.',
      },
    },
    {
      title: 'Pengujian gameplay',
      text: [
        'Pengujian berarti mencoba gim dengan sengaja untuk menemukan masalah: ulangi langkah yang memunculkan bug, coba nilai ekstrem (0, negatif, kosong), dan minta orang lain bermain.',
        'assert() memeriksa bahwa sebuah kondisi benar selama pengembangan. assert hanya aktif pada build debug dan dihapus pada build rilis, jadi jangan dipakai untuk memvalidasi data pemain.',
      ],
      analogy: 'Seperti uji coba jembatan sebelum dibuka: diberi beban berat dan kondisi ekstrem untuk memastikan aman.',
      figure: ['Ulangi bug', 'Coba nilai ekstrem', 'assert()', 'Playtest'],
      code: {
        src: `func _ready() -> void:
	assert(hitung_damage(10, 4) == 6, "Damage 10-4 harus 6")
	assert(hitung_damage(3, 8) == 0, "Damage tidak boleh negatif")`,
        lines: [
          ['assert(hitung_damage(10, 4) == 6, ...)', 'Memastikan kasus normal menghasilkan 6.'],
          ['assert(hitung_damage(3, 8) == 0, ...)', 'Memastikan kasus ekstrem tidak menghasilkan nilai negatif.'],
        ],
        input: 'Fungsi hitung_damage() sudah ditulis.',
        output: 'Tidak ada pesan jika benar. Jika salah, Godot berhenti dan menampilkan pesan pada build debug.',
        mistake: 'Mengandalkan assert untuk memvalidasi data pemain di versi rilis, padahal assert tidak berjalan di build rilis.',
        fix: 'Pakai if dan penanganan error biasa untuk validasi yang harus tetap berjalan.',
      },
    },
    {
      title: 'Optimasi dan profiling dasar',
      text: [
        'Optimasi dimulai dengan mengukur, bukan menebak. Di panel Debugger, tab Profiler menunjukkan fungsi yang paling memakan waktu, dan tab Monitors menunjukkan FPS, memori, dan jumlah objek.',
        'Prinsip dasar: jangan menjalankan pekerjaan berat setiap frame (gunakan Timer atau signal), bebaskan node yang tidak dipakai dengan queue_free(), dan kecilkan ukuran gambar serta audio yang berlebihan.',
      ],
      analogy: 'Seperti memeriksa pemakaian listrik rumah: ukur dulu alat mana yang boros, baru matikan yang tidak perlu.',
      figure: ['Ukur (Profiler)', 'Temukan yang berat', 'Perbaiki', 'Ukur lagi'],
      code: {
        src: `@onready var timer: Timer = $Timer

func _ready() -> void:
	timer.wait_time = 0.5
	timer.timeout.connect(_perbarui_musuh_terdekat)
	timer.start()

func _perbarui_musuh_terdekat() -> void:
	pass  # hitungan berat berjalan 2 kali per detik, bukan 60 kali`,
        lines: [
          ['timer.wait_time = 0.5', 'Timer berdetak setiap setengah detik.'],
          ['timer.timeout.connect(...)', 'Menghubungkan signal timeout ke fungsi pekerjaan berat.'],
          ['timer.start()', 'Memulai Timer.'],
          ['func _perbarui_musuh_terdekat():', 'Tempat hitungan berat, dijalankan jauh lebih jarang daripada setiap frame.'],
        ],
        input: 'Node Timer sebagai child.',
        output: 'Fungsi berat berjalan 2 kali per detik sehingga beban per frame turun.',
        mistake: 'Menaruh perhitungan berat (misalnya mengulang semua musuh) di _process sehingga FPS turun saat musuh banyak.',
        fix: 'Pindahkan ke Timer atau signal, simpan hasilnya, dan ukur ulang di Profiler.',
      },
    },
  ],
  sim: {
    type: 'match',
    title: 'Simulasi: pasangkan gejala dengan penyebab atau alat',
    intro: 'Pilih gejala di kolom kiri, lalu klik penyebab atau alat yang paling tepat di kolom kanan. Ini simulasi edukasi, bukan editor Godot yang sesungguhnya.',
    pairs: [
      { t: 'Error akses properti pada Nil', d: 'Variabel atau node belum diisi (null)', why: 'Nil berarti tidak ada nilai. Biasanya variabel belum di-assign atau nama node salah.' },
      { t: 'Karakter tidak bergerak walau velocity sudah diisi', d: 'move_and_slide() tidak dipanggil', why: 'velocity hanya menyimpan kecepatan. move_and_slide() yang benar-benar menggerakkan.' },
      { t: 'FPS turun saat banyak musuh di layar', d: 'Pekerjaan berat berjalan setiap frame', why: 'Hitungan berat per frame menumpuk saat objek banyak. Pindahkan ke Timer atau signal.' },
      { t: 'Gim berhenti di baris tertentu agar variabel bisa diperiksa', d: 'Breakpoint', why: 'Breakpoint menghentikan gim pada baris yang dipilih untuk diselidiki.' },
      { t: 'Ingin melihat cepat nilai variabel lewat teks di Output', d: 'Print debugging', why: 'print() menampilkan nilai di Output untuk dibandingkan dengan harapan.' },
    ],
  },
  quiz: [
    {
      q: 'Panel mana di Godot yang menampilkan error dan peringatan saat gim berjalan?',
      a: ['Debugger', 'FileSystem', 'Scene', 'Inspector'],
      c: 0,
      why: 'Panel Debugger menampilkan error, peringatan, stack trace, profiler, dan monitor.',
    },
    {
      q: 'Pesan error tentang akses properti pada Nil biasanya berarti...',
      a: ['Variabel atau node belum diisi (null)', 'Gambar terlalu besar', 'Volume terlalu keras', 'Nama proyek salah'],
      c: 0,
      why: 'Nil adalah nilai kosong. Variabel belum diisi atau node tidak ditemukan.',
    },
    {
      q: 'Benar atau salah: breakpoint menghentikan gim di baris tertentu agar variabel dapat diperiksa.',
      a: ['Benar', 'Salah'],
      c: 0,
      why: 'Saat berhenti, kamu bisa melihat nilai variabel dan melanjutkan langkah demi langkah.',
    },
    {
      q: 'Fungsi mana yang hanya aktif pada build debug dan dihapus pada build rilis?',
      a: ['assert()', 'print()', 'queue_free()', 'move_and_slide()'],
      c: 0,
      why: 'assert() dipakai selama pengembangan dan tidak berjalan di build rilis.',
    },
    {
      q: 'Bagaimana cara mengurangi beban perhitungan berat yang berjalan setiap frame?',
      a: ['Menjalankannya lewat Timer atau signal sehingga lebih jarang', 'Menambah jumlah print', 'Menaikkan volume', 'Memperbesar gambar'],
      c: 0,
      why: 'Mengurangi frekuensi pekerjaan berat menurunkan beban per frame.',
    },
    {
      q: 'Di mana kamu dapat melihat FPS, memori, dan jumlah objek saat gim berjalan?',
      a: ['Tab Monitors dan Profiler di Debugger', 'Panel FileSystem', 'Panel Scene', 'Project Settings'],
      c: 0,
      why: 'Monitors menampilkan metrik seperti FPS dan memori, sedangkan Profiler menunjukkan fungsi yang berat.',
    },
  ],
  passScore: 4,
  mini: 'Mini project: pasang print debugging dan satu breakpoint pada fungsi hitung_damage(), tulis tiga assert untuk kasus normal dan ekstrem, lalu ukur FPS di Monitors sebelum dan sesudah memindahkan perhitungan berat ke Timer.',
  summary: [
    'Baca error dari yang teratas: perhatikan jenis, skrip, dan nomor baris; Nil berarti nilai kosong.',
    'print() dan breakpoint membantu memeriksa nilai; assert() hanya aktif pada build debug.',
    'Uji juga kasus ekstrem dan minta orang lain bermain.',
    'Ukur dulu dengan Profiler dan Monitors; pindahkan pekerjaan berat dari setiap frame ke Timer atau signal.',
  ],
  indicators: [
    ['read14', 'Membaca seluruh materi Bab 14'],
    ['sim14', 'Memasangkan lima gejala dengan penyebab atau alat'],
    ['quiz14', 'Lulus kuis dengan minimal 4 dari 6 jawaban benar'],
  ],
};
