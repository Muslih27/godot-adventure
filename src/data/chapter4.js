// Konten Bab 4. Materi mengacu pada Godot Engine 4.x (GDScript).
export const chapter4 = {
  id: 4,
  keys: { read: 'read4', sim: 'sim4', quiz: 'quiz4' },
  badge: 'Ahli Logika',
  title: 'Logika Pemrograman',
  story:
    'Di Ruang Pemrograman, lampu hijau berkedip dan sebuah robot berdiri tegak: "BEEP. Aku RoboGuard. Sistem keamanan sekolah hanya mau menurut pada logika yang benar. Buktikan kamu bisa memutuskan, mengulang, dan menyimpan data."',
  goals: [
    'Memakai if, elif, else dan operator perbandingan serta logika.',
    'Membuat perulangan for dan while dengan aman.',
    'Menyimpan data dengan Array dan Dictionary serta membuat fungsi dengan parameter dan return.',
  ],
  pages: [
    {
      title: 'Percabangan: if, elif, else',
      text: [
        'Percabangan membuat gim mengambil keputusan. Godot memeriksa kondisi dari atas ke bawah dan menjalankan blok pertama yang kondisinya benar.',
        'if untuk kondisi pertama, elif untuk kondisi tambahan, else untuk sisanya. Setiap kondisi diakhiri titik dua dan isinya menjorok.',
      ],
      analogy: 'Seperti penjaga gerbang: jika bawa kartu, boleh masuk; jika tidak, tanya tamu; jika tidak ada, tolak.',
      figure: ['Periksa kondisi', 'Benar? jalankan blok', 'Salah? lanjut ke berikutnya'],
      code: {
        src: `var nilai: int = 80

func _ready() -> void:
	if nilai >= 90:
		print("A")
	elif nilai >= 75:
		print("B")
	else:
		print("Perlu belajar lagi")`,
        lines: [
          ['var nilai: int = 80', 'Data yang akan diperiksa.'],
          ['if nilai >= 90:', 'Kondisi pertama. Salah, sehingga dilewati.'],
          ['elif nilai >= 75:', 'Kondisi kedua. Benar, sehingga blok ini dijalankan.'],
          ['else:', 'Dijalankan hanya jika semua kondisi di atasnya salah.'],
        ],
        input: 'Nilai variabel nilai = 80.',
        output: 'Panel Output menampilkan: B',
        mistake: 'Memakai = (penugasan) di dalam kondisi, misalnya if nilai = 80:, atau lupa titik dua, sehingga muncul error.',
        fix: 'Pakai == untuk membandingkan dan jangan lupa titik dua di akhir baris kondisi.',
      },
    },
    {
      title: 'Operator logika dan perbandingan',
      text: [
        'Perbandingan menghasilkan true atau false: ==, !=, <, >, <=, >=.',
        'Operator logika menggabungkan kondisi: and (keduanya harus benar), or (salah satu cukup benar), dan not (membalik nilai).',
      ],
      analogy: 'and seperti pintu dengan dua gembok: kedua kunci harus ada. or seperti pintu dengan dua jalan masuk: salah satu cukup.',
      figure: ['A and B: keduanya benar', 'A or B: salah satu benar', 'not A: kebalikan'],
      code: {
        src: `var punya_kunci: bool = true
var level: int = 3

func _ready() -> void:
	if punya_kunci and level >= 3:
		print("Pintu terbuka")
	if not punya_kunci or level < 3:
		print("Pintu terkunci")`,
        lines: [
          ['if punya_kunci and level >= 3:', 'Benar hanya jika punya kunci dan level minimal 3.'],
          ['print("Pintu terbuka")', 'Dijalankan karena kedua syarat terpenuhi.'],
          ['if not punya_kunci or level < 3:', 'not false menjadi true, tetapi level < 3 salah. Hasil akhirnya salah, jadi dilewati.'],
        ],
        input: 'punya_kunci = true, level = 3.',
        output: 'Panel Output menampilkan: Pintu terbuka',
        mistake: 'Tertukar antara and dan or sehingga pintu terbuka padahal salah satu syarat belum terpenuhi.',
        fix: 'Tulis tabel kebenaran sederhana atau uji tiap kombinasi nilai sebelum menyimpulkan.',
      },
    },
    {
      title: 'Perulangan: for dan while',
      text: [
        'for mengulang kode untuk jumlah tertentu atau untuk setiap isi koleksi. range(3) menghasilkan 0, 1, 2.',
        'while mengulang selama kondisinya benar. Pastikan ada bagian yang membuat kondisi akhirnya menjadi salah.',
      ],
      analogy: 'for seperti berlari 3 putaran lintasan. while seperti mengisi ember sampai penuh: berhenti saat kondisinya terpenuhi.',
      figure: ['Mulai', 'Cek kondisi', 'Jalankan blok', 'Ulangi atau berhenti'],
      code: {
        src: `func _ready() -> void:
	for i in range(3):
		print("Putaran ", i)

	var hitung: int = 3
	while hitung > 0:
		print("Mundur: ", hitung)
		hitung -= 1`,
        lines: [
          ['for i in range(3):', 'Mengulang tiga kali dengan i = 0, 1, 2.'],
          ['var hitung: int = 3', 'Variabel penghitung untuk while.'],
          ['while hitung > 0:', 'Mengulang selama hitung masih lebih dari 0.'],
          ['hitung -= 1', 'Mengurangi hitung setiap putaran agar loop akhirnya berhenti.'],
        ],
        input: 'Tidak ada input.',
        output: 'Putaran 0, Putaran 1, Putaran 2, lalu Mundur: 3, Mundur: 2, Mundur: 1.',
        mistake: 'Lupa mengubah variabel di dalam while sehingga kondisi selalu benar, perulangan tidak pernah berhenti, dan gim membeku.',
        fix: 'Pastikan setiap putaran mendekatkan kondisi ke salah, misalnya hitung -= 1.',
      },
    },
    {
      title: 'Array dan Dictionary',
      text: [
        'Array menyimpan daftar nilai berurutan dan diakses dengan indeks yang dimulai dari 0. Dictionary menyimpan pasangan kunci dan nilai.',
        'Array cocok untuk inventaris. Dictionary cocok untuk data berlabel seperti statistik karakter.',
      ],
      analogy: 'Array seperti rak bernomor dari 0. Dictionary seperti buku kontak: cari nama (kunci) untuk mendapat nomor (nilai).',
      figure: ['Array: 0, 1, 2', 'Dictionary: kunci → nilai'],
      code: {
        src: `var inventaris: Array = ["pedang", "perisai"]
var statistik: Dictionary = {"nyawa": 3, "skor": 100}

func _ready() -> void:
	inventaris.append("ramuan")
	print(inventaris[0])
	print(inventaris.size())
	print(statistik["skor"])
	for item in inventaris:
		print(item)`,
        lines: [
          ['var inventaris: Array = [...]', 'Daftar berisi dua teks.'],
          ['var statistik: Dictionary = {...}', 'Pasangan kunci dan nilai.'],
          ['inventaris.append("ramuan")', 'Menambah elemen di akhir array.'],
          ['print(inventaris[0])', 'Mengambil elemen pertama (indeks 0).'],
          ['for item in inventaris:', 'Mengulang untuk setiap isi array.'],
        ],
        input: 'Tidak ada input.',
        output: 'pedang, 3, 100, lalu pedang, perisai, ramuan.',
        mistake: 'Mengakses indeks di luar jangkauan, misalnya inventaris[5] pada array berisi 3 elemen, sehingga muncul error.',
        fix: 'Periksa size() dulu, ingat indeks terakhir adalah size() - 1.',
      },
    },
    {
      title: 'Fungsi dengan logika',
      text: [
        'Fungsi dapat memakai percabangan dan mengembalikan hasilnya. Ini membuat aturan gim rapi dan bisa dipakai ulang, misalnya menghitung damage.',
      ],
      analogy: 'Seperti kasir yang menghitung kembalian: ada rumus, ada aturan khusus, lalu hasilnya diberikan.',
      figure: ['Parameter', 'Cek aturan', 'Return hasil'],
      code: {
        src: `func hitung_damage(serangan: int, pertahanan: int) -> int:
	var damage: int = serangan - pertahanan
	if damage < 0:
		damage = 0
	return damage

func _ready() -> void:
	print(hitung_damage(10, 4))
	print(hitung_damage(3, 8))`,
        lines: [
          ['func hitung_damage(...) -> int:', 'Fungsi menerima serangan dan pertahanan, mengembalikan int.'],
          ['var damage: int = serangan - pertahanan', 'Hitung selisih.'],
          ['if damage < 0:', 'Jika negatif, damage dijadikan 0 agar musuh tidak malah sembuh.'],
          ['return damage', 'Mengirim hasil ke pemanggil.'],
        ],
        input: 'Pemanggilan pertama: 10 dan 4. Kedua: 3 dan 8.',
        output: 'Panel Output menampilkan: 6, lalu 0.',
        mistake: 'Tidak membatasi hasil negatif sehingga serangan lemah justru menambah nyawa musuh.',
        fix: 'Tambahkan percabangan seperti di atas, atau pakai max(0, serangan - pertahanan).',
      },
    },
  ],
  sim: {
    type: 'logic',
    title: 'Simulasi: kondisi pintu',
    intro: 'Hitung sendiri hasil kondisinya, lalu pilih apakah pintu terbuka atau terkunci. Ini simulasi edukasi, bukan eksekusi GDScript sungguhan.',
    rounds: [
      {
        rule: 'if punya_kunci and level >= 3:\n    pintu_terbuka()',
        cases: [
          { v: { punya_kunci: true, level: 3 }, open: true, why: 'Punya kunci benar dan 3 >= 3 benar. Pada and, keduanya benar sehingga terbuka.' },
          { v: { punya_kunci: true, level: 2 }, open: false, why: '2 >= 3 salah. Pada and, satu syarat salah membuat hasilnya salah.' },
          { v: { punya_kunci: false, level: 5 }, open: false, why: 'punya_kunci bernilai false, jadi walau level cukup, hasil and tetap salah.' },
          { v: { punya_kunci: true, level: 10 }, open: true, why: 'Kunci ada dan 10 >= 3, keduanya benar.' },
        ],
      },
      {
        rule: 'if punya_kunci or level >= 3:\n    pintu_terbuka()',
        cases: [
          { v: { punya_kunci: false, level: 3 }, open: true, why: 'Pada or, cukup satu syarat benar. 3 >= 3 benar, jadi terbuka.' },
          { v: { punya_kunci: false, level: 2 }, open: false, why: 'Kedua syarat salah, jadi or bernilai salah.' },
          { v: { punya_kunci: true, level: 0 }, open: true, why: 'punya_kunci benar, itu sudah cukup untuk or.' },
        ],
      },
    ],
  },
  quiz: [
    {
      q: 'Struktur apa yang cocok untuk memilih satu dari tiga kemungkinan kondisi?',
      a: ['if, elif, else', 'for saja', 'const', 'extends'],
      c: 0,
      why: 'if memeriksa kondisi pertama, elif kondisi tambahan, dan else menangani sisanya.',
    },
    {
      q: 'Kode if nilai = 80: menimbulkan error. Perbaikan yang benar adalah...',
      a: ['if nilai == 80:', 'if nilai := 80:', 'if (nilai -> 80):', 'if nilai is = 80:'],
      c: 0,
      why: '= adalah penugasan, sedangkan == adalah perbandingan.',
    },
    {
      q: 'Benar atau salah: kondisi A and B bernilai true hanya jika A dan B sama-sama true.',
      a: ['Benar', 'Salah'],
      c: 0,
      why: 'and menuntut kedua kondisi benar. Untuk salah satu saja, gunakan or.',
    },
    {
      q: 'Apa yang dicetak oleh for i in range(3): print(i)?',
      a: ['0, 1, 2', '1, 2, 3', '0, 1, 2, 3', '3, 2, 1'],
      c: 0,
      why: 'range(3) menghasilkan 0, 1, 2 (tiga angka, dimulai dari 0).',
    },
    {
      q: 'Apa risiko kode while hitung > 0: print(hitung) tanpa mengurangi hitung?',
      a: ['Perulangan tidak pernah berhenti dan gim membeku', 'Kode dilewati sama sekali', 'hitung otomatis menjadi 0', 'Tidak ada risiko'],
      c: 0,
      why: 'Kondisi tidak pernah menjadi salah, jadi loop terus berulang.',
    },
    {
      q: 'Jika statistik = {"nyawa": 3, "skor": 100}, apa hasil statistik["skor"]?',
      a: ['100', '3', '"skor"', 'Error'],
      c: 0,
      why: 'Dictionary diakses dengan kunci dan mengembalikan nilai yang berpasangan.',
    },
  ],
  passScore: 4,
  mini: 'Mini project: tulis fungsi cek_pintu(punya_kunci: bool, level: int) -> String yang mengembalikan "Terbuka" atau "Terkunci", lalu uji dengan tiga kombinasi nilai dan cetak hasilnya.',
  summary: [
    'if, elif, else memilih blok kode berdasarkan kondisi; gunakan == untuk membandingkan.',
    'and butuh kedua kondisi benar, or cukup satu, not membalik nilai.',
    'for mengulang jumlah tertentu atau isi koleksi; while harus punya cara berhenti.',
    'Array diakses dengan indeks dari 0; Dictionary dengan kunci; fungsi mengembalikan hasil lewat return.',
  ],
  indicators: [
    ['read4', 'Membaca seluruh materi Bab 4'],
    ['sim4', 'Menjawab semua kasus kondisi pintu dengan benar'],
    ['quiz4', 'Lulus kuis dengan minimal 4 dari 6 jawaban benar'],
  ],
};
