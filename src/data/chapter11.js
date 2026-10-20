// Konten Bab 11. Materi mengacu pada Godot Engine 4.x (GDScript).
export const chapter11 = {
  id: 11,
  keys: { read: 'read11', sim: 'sim11', quiz: 'quiz11' },
  badge: 'Perancang NPC',
  title: 'AI dan NPC',
  story:
    'Dr. Arsitek menekan sebuah tombol dan robot di panggung mulai bergerak lebih cerdas: berpatroli, berhenti, lalu menoleh ke arahmu. "Fondasi sudah ada. Sekarang kita beri NPC kemampuan memutuskan sendiri: berjaga, mengejar, mencari jalan, bahkan berbicara dengan pilihan jawaban."',
  goals: [
    'Membuat perilaku NPC berbasis state: diam, patroli, dan mengejar berdasarkan jarak.',
    'Memakai NavigationAgent2D untuk pathfinding di sekitar rintangan.',
    'Merancang dialog bercabang dari data Dictionary.',
  ],
  pages: [
    {
      title: 'Perilaku NPC dan deteksi jarak',
      text: [
        'NPC yang hidup perlu mengambil keputusan sendiri. Cara paling sederhana: ukur jarak ke pemain, lalu pilih state berdasarkan jarak itu.',
        'Gunakan distance_to() untuk mengukur jarak. Jika lebih dekat dari batas deteksi, NPC berpindah ke state CHASE; jika tidak, kembali IDLE.',
      ],
      analogy: 'Seperti satpam di gerbang: selama tidak ada orang mendekat ia santai, begitu seseorang masuk jangkauan pandangnya, ia mulai waspada.',
      figure: ['Ukur jarak', 'Dekat? CHASE', 'Jauh? IDLE'],
      code: {
        src: `extends CharacterBody2D

enum State { IDLE, CHASE }

@export var jarak_deteksi: float = 150.0
var state: State = State.IDLE
var pemain: Node2D

func _physics_process(delta: float) -> void:
	if pemain == null:
		return
	var jarak: float = global_position.distance_to(pemain.global_position)
	state = State.CHASE if jarak < jarak_deteksi else State.IDLE`,
        lines: [
          ['@export var jarak_deteksi: float = 150.0', 'Batas deteksi yang bisa diubah di Inspector.'],
          ['if pemain == null:', 'Berhenti jika referensi pemain belum ada.'],
          ['global_position.distance_to(pemain.global_position)', 'Menghitung jarak NPC ke pemain.'],
          ['state = State.CHASE if jarak < jarak_deteksi else State.IDLE', 'Memilih state berdasarkan jarak (bentuk singkat if else).'],
        ],
        input: 'Posisi NPC dan posisi pemain.',
        output: 'state menjadi CHASE saat pemain berjarak kurang dari 150 piksel, dan IDLE jika lebih jauh.',
        mistake: 'Variabel pemain belum diisi sehingga muncul error akses null.',
        fix: 'Isi saat siap, misalnya dengan get_tree().get_first_node_in_group("pemain"), dan tetap periksa null.',
      },
    },
    {
      title: 'Patroli antar titik',
      text: [
        'NPC berpatroli dengan bergerak dari satu titik ke titik berikutnya dalam sebuah daftar. Setelah sampai, ia lanjut ke titik berikutnya dan kembali ke awal di akhir daftar.',
        'Jangan membandingkan posisi dengan == karena bilangan desimal jarang tepat sama. Gunakan toleransi jarak.',
      ],
      analogy: 'Seperti penjaga malam yang berkeliling pos 1, pos 2, pos 3, lalu mulai dari pos 1 lagi.',
      figure: ['Titik 0', 'Titik 1', 'Titik 2', 'Kembali ke 0'],
      code: {
        src: `extends CharacterBody2D

@export var titik: Array[Vector2] = []
var indeks: int = 0
const KECEPATAN: float = 80.0

func _physics_process(delta: float) -> void:
	if titik.is_empty():
		return
	var tujuan: Vector2 = titik[indeks]
	if global_position.distance_to(tujuan) < 4.0:
		indeks = (indeks + 1) % titik.size()
	velocity = global_position.direction_to(tujuan) * KECEPATAN
	move_and_slide()`,
        lines: [
          ['@export var titik: Array[Vector2] = []', 'Daftar titik patroli yang diisi di Inspector.'],
          ['if titik.is_empty():', 'Tidak berpatroli jika daftar kosong.'],
          ['distance_to(tujuan) < 4.0', 'Dianggap sampai jika sudah dekat (toleransi 4 piksel).'],
          ['indeks = (indeks + 1) % titik.size()', 'Pindah ke titik berikutnya dan kembali ke 0 di akhir.'],
          ['direction_to(tujuan) * KECEPATAN', 'Bergerak ke arah titik tujuan.'],
        ],
        input: 'Daftar titik patroli berisi minimal dua posisi.',
        output: 'NPC berjalan bergantian antar titik tanpa berhenti.',
        mistake: 'Memeriksa global_position == tujuan sehingga NPC hampir tidak pernah dianggap sampai dan bergetar di sekitar titik.',
        fix: 'Pakai distance_to(tujuan) dengan toleransi kecil.',
      },
    },
    {
      title: 'Pengejaran',
      text: [
        'Saat CHASE, arah gerak dihitung dengan direction_to() menuju pemain lalu dikalikan kecepatan. NPC sebaiknya berhenti pada jarak tertentu agar tidak menempel atau bergetar.',
        'Kamu bisa menggabungkannya dengan state machine: PATROL saat jauh, CHASE saat dekat, dan kembali PATROL jika pemain hilang.',
      ],
      analogy: 'Seperti anjing penjaga yang mengejar sampai jarak tertentu lalu menggonggong, bukan menabrak.',
      figure: ['PATROL', 'Pemain dekat → CHASE', 'Pemain hilang → PATROL'],
      code: {
        src: `const JARAK_BERHENTI: float = 24.0

func kejar(delta: float) -> void:
	var jarak: float = global_position.distance_to(pemain.global_position)
	if jarak > JARAK_BERHENTI:
		velocity = global_position.direction_to(pemain.global_position) * 110.0
	else:
		velocity = Vector2.ZERO
	move_and_slide()`,
        lines: [
          ['const JARAK_BERHENTI: float = 24.0', 'Jarak minimal sebelum NPC berhenti.'],
          ['if jarak > JARAK_BERHENTI:', 'Masih jauh, jadi lanjut mengejar.'],
          ['direction_to(...) * 110.0', 'Bergerak menuju pemain dengan kecepatan 110.'],
          ['velocity = Vector2.ZERO', 'Berhenti saat sudah cukup dekat.'],
        ],
        input: 'Referensi pemain sudah terisi.',
        output: 'NPC mendekati pemain dan berhenti pada jarak 24 piksel.',
        mistake: 'NPC tidak diberi jarak berhenti sehingga terus menempel pada pemain dan terlihat bergetar.',
        fix: 'Tambahkan jarak berhenti seperti pada contoh.',
      },
    },
    {
      title: 'NavigationAgent2D dan pathfinding',
      text: [
        'Bergerak lurus ke arah pemain akan menabrak dinding. Pathfinding mencari jalur yang menghindari rintangan. Di Godot, siapkan NavigationRegion2D dengan NavigationPolygon (area yang boleh dilalui), lalu pasang NavigationAgent2D pada NPC.',
        'Atur target_position, lalu pada tiap frame fisika ikuti get_next_path_position() sampai is_navigation_finished() bernilai true.',
      ],
      analogy: 'Seperti aplikasi peta: kamu menentukan tujuan, aplikasi memberi belokan demi belokan, dan kamu mengikuti titik berikutnya.',
      figure: ['NavigationRegion2D', 'target_position', 'get_next_path_position()'],
      code: {
        src: `extends CharacterBody2D

@onready var agen: NavigationAgent2D = $NavigationAgent2D

func atur_tujuan(posisi: Vector2) -> void:
	agen.target_position = posisi

func _physics_process(delta: float) -> void:
	if agen.is_navigation_finished():
		return
	var berikut: Vector2 = agen.get_next_path_position()
	velocity = global_position.direction_to(berikut) * 100.0
	move_and_slide()`,
        lines: [
          ['@onready var agen: NavigationAgent2D = $NavigationAgent2D', 'Mengambil node agen navigasi.'],
          ['agen.target_position = posisi', 'Menentukan tujuan akhir.'],
          ['agen.is_navigation_finished()', 'True jika sudah sampai atau tidak ada jalur.'],
          ['agen.get_next_path_position()', 'Titik berikutnya pada jalur yang dihitung.'],
        ],
        input: 'Pemanggilan atur_tujuan(posisi) dan area navigasi yang sudah dibuat.',
        output: 'NPC berjalan mengikuti jalur yang menghindari rintangan menuju tujuan.',
        mistake: 'NavigationRegion2D belum dibuat atau area navigasi belum dibangun (bake), sehingga tidak ada jalur dan NPC tidak bergerak.',
        fix: 'Tambahkan NavigationRegion2D dengan NavigationPolygon lalu bake, dan pastikan rintangan dikecualikan dari area.',
      },
    },
    {
      title: 'Dialog bercabang',
      text: [
        'Dialog bercabang berarti pemain memilih jawaban dan percakapan berlanjut ke bagian berbeda. Simpan sebagai data: setiap simpul punya teks dan daftar pilihan yang menunjuk id simpul berikutnya.',
        'Menyimpan dialog sebagai data (bukan di dalam banyak if) membuatnya mudah ditambah dan diperbarui, bahkan oleh guru atau penulis cerita.',
      ],
      analogy: 'Seperti buku petualangan: "Jika ingin membuka pintu, ke halaman 12. Jika tidak, ke halaman 20."',
      figure: ['Simpul mulai', 'Pilihan Ya / Tidak', 'Simpul berikutnya'],
      code: {
        src: `var dialog: Dictionary = {
	"mulai": {
		"teks": "Mau bantu aku?",
		"pilihan": {"Ya": "setuju", "Tidak": "tolak"}
	},
	"setuju": {"teks": "Terima kasih!", "pilihan": {}},
	"tolak": {"teks": "Baiklah...", "pilihan": {}}
}

func tampilkan(id: String) -> void:
	var simpul: Dictionary = dialog[id]
	print(simpul["teks"])
	for label in simpul["pilihan"]:
		print("- ", label)`,
        lines: [
          ['var dialog: Dictionary = {...}', 'Setiap kunci adalah id simpul dialog.'],
          ['"pilihan": {"Ya": "setuju", ...}', 'Teks pilihan dipetakan ke id simpul berikutnya.'],
          ['var simpul: Dictionary = dialog[id]', 'Mengambil simpul berdasarkan id.'],
          ['for label in simpul["pilihan"]:', 'Mengulang atas kunci dictionary, yaitu teks pilihan.'],
        ],
        input: 'Pemanggilan tampilan("mulai").',
        output: 'Output: Mau bantu aku?, lalu - Ya dan - Tidak.',
        mistake: 'Id tujuan pada pilihan salah ketik sehingga simpul tidak ditemukan dan muncul error.',
        fix: 'Periksa dengan dialog.has(id) dan uji semua id sebelum gim dirilis.',
      },
    },
  ],
  sim: {
    title: 'Simulasi: menyusun algoritma NPC pengejar',
    intro: 'Klik langkah sesuai urutan algoritma NPC yang berjalan setiap frame fisika. Ini simulasi edukasi, bukan eksekusi kode sungguhan.',
    steps: [
      { t: 'Ambil posisi pemain', why: 'NPC perlu tahu di mana pemain berada sebelum memutuskan apa pun.' },
      { t: 'Hitung jarak NPC ke pemain', why: 'Jarak dibutuhkan untuk menentukan apakah pemain sudah terdeteksi.' },
      { t: 'Jika jarak kurang dari batas deteksi, ubah state menjadi CHASE', why: 'State dipilih berdasarkan jarak yang baru dihitung.' },
      { t: 'Jika state CHASE, arahkan velocity ke pemain', why: 'Gerakan hanya dihitung setelah state diketahui.' },
      { t: 'Panggil move_and_slide()', why: 'Langkah terakhir menggerakkan NPC berdasarkan velocity yang sudah ditentukan.' },
    ],
  },
  quiz: [
    {
      q: 'Apa fungsi jarak deteksi pada NPC?',
      a: ['Menentukan kapan NPC berpindah dari IDLE atau PATROL ke CHASE', 'Menentukan warna NPC', 'Mengatur volume suara NPC', 'Menghapus NPC dari scene'],
      c: 0,
      why: 'Jarak deteksi adalah batas yang memicu perubahan state saat pemain terlalu dekat.',
    },
    {
      q: 'Ekspresi mana yang menghasilkan arah dari NPC ke pemain?',
      a: ['global_position.direction_to(pemain.global_position)', 'pemain.name', 'global_position == pemain', 'Vector2.UP.length()'],
      c: 0,
      why: 'direction_to() mengembalikan vektor arah ternormalisasi dari satu posisi ke posisi lain.',
    },
    {
      q: 'Benar atau salah: membandingkan posisi desimal dengan == tidak andal, sehingga sebaiknya memakai jarak dengan toleransi.',
      a: ['Benar', 'Salah'],
      c: 0,
      why: 'Bilangan desimal jarang tepat sama. Jarak dengan toleransi membuat pengecekan lebih stabil.',
    },
    {
      q: 'Node apa yang membuat NPC dapat mencari jalur menghindari rintangan?',
      a: ['NavigationAgent2D (dengan area navigasi)', 'Label', 'AudioStreamPlayer', 'Sprite2D'],
      c: 0,
      why: 'NavigationAgent2D menghitung jalur pada area navigasi yang disiapkan lewat NavigationRegion2D.',
    },
    {
      q: 'Fungsi NavigationAgent2D mana yang memberi titik berikutnya pada jalur?',
      a: ['get_next_path_position()', 'queue_free()', 'play()', 'emit()'],
      c: 0,
      why: 'get_next_path_position() mengembalikan titik berikutnya yang perlu dituju sepanjang jalur.',
    },
    {
      q: 'Struktur data apa yang cocok untuk dialog bercabang?',
      a: ['Dictionary dengan simpul berisi teks dan pilihan menuju id simpul berikutnya', 'Satu String panjang', 'Satu angka int', 'Satu Vector2'],
      c: 0,
      why: 'Dictionary memudahkan memetakan id simpul ke teks dan pilihannya.',
    },
  ],
  passScore: 4,
  mini: 'Mini project: buat NPC yang berpatroli antara dua titik dan berubah mengejar pemain saat jaraknya kurang dari 150 piksel, serta dialog bercabang berisi tiga simpul.',
  summary: [
    'NPC memilih state berdasarkan jarak ke pemain memakai distance_to().',
    'Patroli memakai daftar titik dan toleransi jarak, bukan perbandingan ==.',
    'Pengejaran memakai direction_to() dan jarak berhenti; pathfinding memakai NavigationAgent2D.',
    'Dialog bercabang disimpan sebagai data Dictionary dengan simpul dan pilihan.',
  ],
  indicators: [
    ['read11', 'Membaca seluruh materi Bab 11'],
    ['sim11', 'Mengurutkan algoritma NPC pengejar'],
    ['quiz11', 'Lulus kuis dengan minimal 4 dari 6 jawaban benar'],
  ],
};
