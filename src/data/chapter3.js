// Konten Bab 3. Materi mengacu pada Godot Engine 4.x (GDScript).
export const chapter3 = {
  id: 3,
  keys: { read: 'read3', sim: 'sim3', quiz: 'quiz3' },
  badge: 'Penulis Skrip',
  title: 'Dasar GDScript',
  story:
    'Di Laboratorium Komputer, layar-layar menampilkan baris kode yang berkedip. Kak Syntax mengetuk meja: "Sekarang kita belajar bahasa yang membuat node hidup. GDScript mudah dibaca, tapi sangat teliti soal indentasi."',
  goals: [
    'Menulis sintaks dasar GDScript: komentar, indentasi, dan fungsi.',
    'Mendeklarasikan variabel dan konstanta dengan tipe data yang tepat.',
    'Memakai operator dan membuat fungsi dengan parameter dan nilai kembalian.',
  ],
  pages: [
    {
      title: 'Sintaks, komentar, dan indentasi',
      text: [
        'GDScript adalah bahasa bawaan Godot yang sintaksnya mirip Python. Blok kode ditandai dengan indentasi (menjorok ke dalam), bukan kurung kurawal.',
        'Komentar ditulis dengan tanda # dan diabaikan oleh Godot. Pakai komentar untuk menjelaskan maksud kode.',
      ],
      analogy: 'Indentasi seperti poin bersarang pada catatan: baris yang menjorok adalah isi dari baris di atasnya.',
      figure: ['Skrip (.gd)', 'Fungsi', 'Baris kode'],
      code: {
        src: `# Ini komentar
extends Node

func _ready() -> void:
	print("Halo, Godot!")  # tampil di Output`,
        lines: [
          ['# Ini komentar', 'Baris ini diabaikan oleh Godot.'],
          ['extends Node', 'Skrip memakai kemampuan node bertipe Node.'],
          ['func _ready() -> void:', 'Mendefinisikan fungsi yang dipanggil sekali saat node siap.'],
          ['print("Halo, Godot!")', 'Menampilkan teks di panel Output. Baris ini menjorok karena isi fungsi.'],
        ],
        input: 'Tidak ada input.',
        output: 'Panel Output menampilkan: Halo, Godot!',
        mistake: 'Baris isi fungsi tidak menjorok, atau tab dan spasi bercampur, sehingga muncul error indentasi.',
        fix: 'Jorokkan isi fungsi satu tingkat dan pakai satu gaya saja (tab adalah bawaan editor Godot).',
      },
    },
    {
      title: 'Variabel dan konstanta',
      text: [
        'Variabel menyimpan nilai yang bisa berubah, dibuat dengan var. Konstanta menyimpan nilai tetap, dibuat dengan const.',
        'Tipe data dapat ditulis eksplisit (var nyawa: int = 3) atau disimpulkan otomatis dengan := (var nama := "Pemain").',
      ],
      analogy: 'Variabel seperti kotak berlabel yang isinya boleh diganti. Konstanta seperti label yang sudah dilem permanen.',
      figure: ['var nyawa', '= 3', 'bisa diubah'],
      code: {
        src: `const MAX_NYAWA: int = 5
var nyawa: int = 3
var nama := "Pemain"

func _ready() -> void:
	print(nama, " punya ", nyawa, " nyawa")`,
        lines: [
          ['const MAX_NYAWA: int = 5', 'Konstanta bertipe int. Nama konstanta biasanya huruf kapital.'],
          ['var nyawa: int = 3', 'Variabel bertipe int dengan nilai awal 3.'],
          ['var nama := "Pemain"', 'Tipe String disimpulkan otomatis dari nilainya.'],
          ['print(nama, " punya ", nyawa, " nyawa")', 'Menggabungkan beberapa nilai dalam satu baris Output.'],
        ],
        input: 'Tidak ada input.',
        output: 'Panel Output menampilkan: Pemain punya 3 nyawa',
        mistake: 'Mengubah konstanta, misalnya MAX_NYAWA = 10, sehingga muncul error.',
        fix: 'Gunakan var jika nilainya perlu berubah, dan const hanya untuk nilai yang tetap.',
      },
    },
    {
      title: 'Tipe data dasar',
      text: [
        'Tipe yang paling sering dipakai: int (bilangan bulat), float (bilangan desimal), String (teks), bool (true atau false), dan Vector2 (pasangan x dan y untuk posisi 2D).',
        'Variabel bertipe hanya boleh diisi nilai yang cocok. Ini membantu Godot menangkap kesalahan lebih awal.',
      ],
      analogy: 'Seperti wadah khusus: botol untuk cairan, kotak untuk benda padat. Memasukkan benda ke wadah yang salah akan ditolak.',
      figure: ['int', 'float', 'String', 'bool', 'Vector2'],
      code: {
        src: `var skor: int = 100
var kecepatan: float = 150.5
var nama: String = "Rani"
var hidup: bool = true
var posisi: Vector2 = Vector2(10, 20)`,
        lines: [
          ['var skor: int = 100', 'Bilangan bulat.'],
          ['var kecepatan: float = 150.5', 'Bilangan desimal.'],
          ['var nama: String = "Rani"', 'Teks ditulis dalam tanda kutip.'],
          ['var hidup: bool = true', 'Nilai benar atau salah.'],
          ['var posisi: Vector2 = Vector2(10, 20)', 'Posisi dengan x = 10 dan y = 20.'],
        ],
        input: 'Tidak ada input.',
        output: 'Tidak ada output. Nilai disimpan di variabel.',
        mistake: 'Mengisi variabel int dengan teks, misalnya skor = "seratus", sehingga muncul error ketidakcocokan tipe.',
        fix: 'Isi dengan tipe yang sesuai, atau ubah tipe nilainya, misalnya int("100").',
      },
    },
    {
      title: 'Operator',
      text: [
        'Operator aritmatika: +, -, *, /, dan % (sisa bagi). Penugasan singkat: +=, -=. Perbandingan: ==, !=, <, >, <=, >=. Logika: and, or, not.',
        'Perhatikan: jika kedua angka bertipe int, pembagian menghasilkan bilangan bulat (7 / 2 hasilnya 3). Jadikan salah satu float untuk hasil desimal (7 / 2.0 hasilnya 3.5).',
      ],
      analogy: 'Seperti kalkulator: tombolnya jelas, tetapi hasilnya bergantung pada jenis angka yang kamu masukkan.',
      figure: ['7 / 2 = 3', '7 / 2.0 = 3.5', '7 % 2 = 1'],
      code: {
        src: `var a: int = 7
var b: int = 2

func _ready() -> void:
	print(a + b)
	print(a / b)
	print(a % b)
	print(a / 2.0)`,
        lines: [
          ['var a: int = 7', 'Variabel pertama.'],
          ['print(a + b)', 'Penjumlahan.'],
          ['print(a / b)', 'Pembagian dua int menghasilkan bilangan bulat.'],
          ['print(a % b)', 'Sisa pembagian.'],
          ['print(a / 2.0)', 'Salah satu angka float sehingga hasilnya desimal.'],
        ],
        input: 'Tidak ada input.',
        output: 'Panel Output menampilkan: 9, 3, 1, 3.5 (satu per baris).',
        mistake: 'Mengira a / b menghasilkan 3.5.',
        fix: 'Ubah salah satu angka menjadi float, misalnya a / 2.0 atau float(a) / b.',
      },
    },
    {
      title: 'Fungsi: parameter dan nilai kembalian',
      text: [
        'Fungsi adalah blok kode bernama yang dapat dipakai berulang. Parameter adalah masukan, dan return mengembalikan hasil ke pemanggil.',
        'Tanda -> int berarti fungsi mengembalikan int. Gunakan -> void jika tidak mengembalikan apa pun.',
      ],
      analogy: 'Fungsi seperti mesin pembuat jus: masukkan buah (parameter), keluar jus (return).',
      figure: ['Parameter', 'Fungsi', 'Return'],
      code: {
        src: `func tambah(a: int, b: int) -> int:
	return a + b

func _ready() -> void:
	var hasil: int = tambah(3, 4)
	print(hasil)`,
        lines: [
          ['func tambah(a: int, b: int) -> int:', 'Fungsi menerima dua int dan mengembalikan int.'],
          ['return a + b', 'Mengirim hasil penjumlahan ke pemanggil.'],
          ['var hasil: int = tambah(3, 4)', 'Memanggil fungsi dan menyimpan hasilnya.'],
          ['print(hasil)', 'Menampilkan hasil di Output.'],
        ],
        input: 'Argumen 3 dan 4 dikirim ke parameter a dan b.',
        output: 'Panel Output menampilkan: 7',
        mistake: 'Lupa menulis return pada fungsi yang dijanjikan mengembalikan int, sehingga Godot menampilkan error karena tidak semua jalur mengembalikan nilai.',
        fix: 'Tambahkan return nilai_yang_sesuai, atau ubah tipe kembalian menjadi void.',
      },
    },
  ],
  sim: {
    code: true,
    title: 'Simulasi: susun kode GDScript yang teracak',
    intro: 'Klik baris kode sesuai urutan yang benar agar fungsi valid. Ini simulasi edukasi, bukan editor Godot yang sesungguhnya (tidak ada parsing GDScript penuh).',
    steps: [
      { t: '# Menghitung total skor', why: 'Komentar di awal menjelaskan tujuan fungsi.' },
      { t: 'func hitung_total(poin: int, bonus: int) -> int:', why: 'Deklarasi fungsi harus lebih dulu: nama, parameter, dan tipe kembalian.' },
      { t: '    var total: int = poin + bonus', why: 'Isi fungsi menjorok satu tingkat. Hitung dulu hasilnya.' },
      { t: '    return total', why: 'return ditulis terakhir karena mengirim hasil perhitungan ke pemanggil.' },
    ],
  },
  quiz: [
    {
      q: 'Simbol apa yang dipakai untuk komentar satu baris di GDScript?',
      a: ['//', '#', '--', '/* */'],
      c: 1,
      why: 'GDScript memakai # untuk komentar, seperti Python.',
    },
    {
      q: 'Apa arti var nyawa: int = 3?',
      a: ['Konstanta bernama nyawa bernilai 3', 'Variabel bertipe int bernama nyawa dengan nilai awal 3', 'Fungsi bernama nyawa', 'Komentar tentang nyawa'],
      c: 1,
      why: 'var membuat variabel, : int menetapkan tipe, dan = 3 mengisi nilai awal.',
    },
    {
      q: 'Benar atau salah: nilai yang dibuat dengan const dapat diubah saat gim berjalan.',
      a: ['Benar', 'Salah'],
      c: 1,
      why: 'Konstanta bernilai tetap. Jika nilai perlu berubah, gunakan var.',
    },
    {
      q: 'Apa hasil print(7 / 2) di GDScript (Godot 4)?',
      a: ['3.5', '3', '4', '3.0'],
      c: 1,
      why: 'Pembagian dua int menghasilkan bilangan bulat. Untuk 3.5 gunakan 7 / 2.0.',
    },
    {
      q: 'Baris mana yang benar untuk fungsi yang menerima dua int dan mengembalikan int?',
      a: ['func tambah(a: int, b: int) -> int:', 'function tambah(a, b) int {', 'def tambah(a: int, b: int): int', 'fn tambah(a, b) => int'],
      c: 0,
      why: 'GDScript memakai func, parameter bertipe, tanda -> untuk tipe kembalian, dan titik dua di akhir.',
    },
    {
      q: 'Kode berikut error: var skor: int = 10, lalu skor = "tinggi". Apa penyebabnya?',
      a: ['Nama skor tidak boleh dipakai', 'Teks (String) tidak cocok dengan variabel bertipe int', 'Angka 10 terlalu kecil', 'Kurang tanda kurung'],
      c: 1,
      why: 'Variabel int hanya menerima bilangan bulat. Mengisinya dengan String menimbulkan ketidakcocokan tipe.',
    },
  ],
  passScore: 4,
  mini: 'Mini project: tulis skrip dengan tiga variabel (nama, skor, hidup) dan satu fungsi yang mencetak ketiganya memakai print(). Jalankan di Godot dan cocokkan hasilnya dengan Output.',
  summary: [
    'GDScript memakai indentasi untuk blok kode dan # untuk komentar.',
    'var untuk nilai yang berubah, const untuk nilai tetap; tipe dapat ditulis eksplisit.',
    'Dua int dibagi menghasilkan int; pakai float untuk hasil desimal.',
    'Fungsi memakai func, parameter, dan return; -> void jika tidak mengembalikan nilai.',
  ],
  indicators: [
    ['read3', 'Membaca seluruh materi Bab 3'],
    ['sim3', 'Menyusun kode fungsi dengan urutan benar'],
    ['quiz3', 'Lulus kuis dengan minimal 4 dari 6 jawaban benar'],
  ],
};
