// Konten Bab 13. Materi mengacu pada Godot Engine 4.x (GDScript).
export const chapter13 = {
  id: 13,
  keys: { read: 'read13', sim: 'sim13', quiz: 'quiz13' },
  badge: 'Penjaga Data',
  title: 'Save System',
  story:
    'Server Room berdengung pelan, lampu rak berkedip hijau dan biru. Seorang admin menunjuk layar penuh baris data: "Bayangkan pemain sudah bermain tiga jam lalu gimnya ditutup. Kalau progresnya hilang, ia tidak akan kembali. Ayo kita belajar menyimpan dan memulihkan data dengan aman."',
  goals: [
    'Membaca dan menulis file dengan FileAccess di folder user://.',
    'Menyimpan data sebagai JSON atau Resource dan memahami kelebihan serta risikonya.',
    'Memvalidasi data saat memuat dan memahami batas penyimpanan lokal dibanding server.',
  ],
  pages: [
    {
      title: 'FileAccess dan folder user://',
      text: [
        'FileAccess membaca dan menulis file. Untuk data simpan gunakan folder user://, yaitu folder khusus yang dapat ditulis oleh gim, bahkan setelah gim diekspor.',
        'Jangan menyimpan ke res://. Folder itu hanya untuk file proyek dan bersifat hanya-baca pada gim hasil ekspor.',
      ],
      analogy: 'user:// seperti loker pribadi pemain di sekolah. res:// seperti isi gedung sekolah yang tidak boleh diubah siswa.',
      figure: ['FileAccess.open()', 'store_string() / get_as_text()', 'user://simpan.txt'],
      code: {
        src: `const PATH_SIMPAN: String = "user://simpan.txt"

func tulis_teks(isi: String) -> void:
	var file := FileAccess.open(PATH_SIMPAN, FileAccess.WRITE)
	file.store_string(isi)

func baca_teks() -> String:
	if not FileAccess.file_exists(PATH_SIMPAN):
		return ""
	var file := FileAccess.open(PATH_SIMPAN, FileAccess.READ)
	return file.get_as_text()`,
        lines: [
          ['const PATH_SIMPAN: String = "user://simpan.txt"', 'Alamat file di folder yang dapat ditulis.'],
          ['FileAccess.open(PATH_SIMPAN, FileAccess.WRITE)', 'Membuka file untuk ditulis. Mengembalikan null jika gagal.'],
          ['file.store_string(isi)', 'Menulis teks ke file.'],
          ['FileAccess.file_exists(PATH_SIMPAN)', 'Memeriksa apakah file sudah ada sebelum dibaca.'],
          ['file.get_as_text()', 'Membaca seluruh isi file sebagai teks.'],
        ],
        input: 'Teks yang akan disimpan.',
        output: 'File simpan.txt dibuat di folder user://, dan baca_teks() mengembalikan isinya.',
        mistake: 'Menyimpan ke res:// sehingga berhasil di editor tetapi gagal setelah gim diekspor.',
        fix: 'Selalu simpan data pemain ke user://.',
      },
    },
    {
      title: 'JSON: format data yang mudah dibaca',
      text: [
        'JSON menyimpan data sebagai teks yang rapi dan mudah dibaca. Ubah Dictionary menjadi teks dengan JSON.stringify(), dan baca kembali dengan JSON.parse_string().',
        'Perhatikan: semua angka dari JSON dibaca sebagai float, sehingga 3 menjadi 3.0. Ubah dengan int() jika perlu bilangan bulat. parse_string() mengembalikan null jika teksnya rusak.',
      ],
      analogy: 'JSON seperti catatan tulisan tangan yang jelas: siapa pun bisa membacanya, tetapi kamu harus memeriksa isinya sebelum mempercayainya.',
      figure: ['Dictionary', 'JSON.stringify()', 'Teks', 'JSON.parse_string()'],
      code: {
        src: `func ke_json(data: Dictionary) -> String:
	return JSON.stringify(data)

func dari_json(teks: String) -> Dictionary:
	var hasil: Variant = JSON.parse_string(teks)
	if hasil is Dictionary:
		return hasil
	return {}`,
        lines: [
          ['JSON.stringify(data)', 'Mengubah Dictionary menjadi teks JSON.'],
          ['JSON.parse_string(teks)', 'Mengubah teks JSON menjadi data. Hasilnya null jika gagal.'],
          ['if hasil is Dictionary:', 'Memastikan hasil benar-benar Dictionary sebelum dipakai.'],
          ['return {}', 'Mengembalikan dictionary kosong jika teks tidak valid.'],
        ],
        input: 'Dictionary berisi data atau teks JSON.',
        output: 'Dictionary berubah menjadi teks, dan teks JSON valid kembali menjadi Dictionary.',
        mistake: 'Memakai angka dari JSON sebagai int tanpa konversi sehingga muncul error tipe (3.0 bukan 3).',
        fix: 'Bungkus dengan int(), misalnya int(hasil["level"]).',
      },
    },
    {
      title: 'Resource sebagai data simpan',
      text: [
        'Resource kustom dapat dipakai sebagai wadah data simpan yang bertipe jelas. Buat skrip dengan class_name dan extends Resource, lalu tandai propertinya dengan @export agar ikut tersimpan.',
        'Simpan dengan ResourceSaver.save() dan muat dengan load(). Hati-hati: file Resource dapat memuat skrip, jadi muat hanya file dari sumber tepercaya. Untuk data dari luar, JSON lebih aman.',
      ],
      analogy: 'Resource seperti formulir cetak dengan kolom tetap: rapi dan jelas, tetapi jangan terima formulir dari orang asing tanpa memeriksanya.',
      figure: ['class_name DataSimpan', '@export properti', 'ResourceSaver.save()'],
      code: {
        src: `# data_simpan.gd
class_name DataSimpan
extends Resource

@export var nama: String = "Siswa"
@export var skor: int = 0

# Dipakai dari skrip lain:
# ResourceSaver.save(data, "user://data.tres")
# var data := load("user://data.tres") as DataSimpan`,
        lines: [
          ['class_name DataSimpan', 'Memberi nama tipe agar dapat dipakai di mana saja.'],
          ['extends Resource', 'Menjadikannya resource yang dapat disimpan.'],
          ['@export var skor: int = 0', 'Properti yang ikut tersimpan ke file.'],
          ['ResourceSaver.save(data, ...)', 'Menyimpan resource ke file.'],
        ],
        input: 'Objek DataSimpan yang sudah diisi.',
        output: 'File data.tres dibuat di user://, dan load() mengembalikan objek yang sama.',
        mistake: 'Lupa menandai properti dengan @export sehingga nilainya tidak ikut tersimpan.',
        fix: 'Tambahkan @export pada setiap properti yang perlu disimpan.',
      },
    },
    {
      title: 'Menyimpan progres, inventaris, dan quest',
      text: [
        'Kumpulkan semua data yang perlu diingat ke dalam satu Dictionary: skor, inventaris, dan status quest. Tambahkan nomor versi agar struktur data dapat diperbarui di masa depan.',
        'Simpan hanya data sederhana (angka, teks, array, dictionary), bukan node atau objek. Gunakan id atau nama untuk merujuk benda.',
      ],
      analogy: 'Seperti mengemas koper sebelum pergi: masukkan hanya barang yang benar-benar perlu, dengan label yang jelas.',
      figure: ['Kumpulkan data', 'Beri versi', 'Simpan ke file'],
      code: {
        src: `func buat_data_simpan() -> Dictionary:
	return {
		"versi": 1,
		"skor": GameData.skor,
		"inventaris": GameData.item,
		"quest": GameData.quest
	}`,
        lines: [
          ['"versi": 1', 'Nomor versi untuk migrasi struktur data.'],
          ['"skor": GameData.skor', 'Mengambil skor dari Autoload (Bab 10).'],
          ['"inventaris": GameData.item', 'Mengambil isi inventaris.'],
          ['"quest": GameData.quest', 'Mengambil status quest.'],
        ],
        input: 'Autoload GameData sudah berisi skor, item, dan quest.',
        output: 'Dictionary siap diubah menjadi JSON dan ditulis ke file.',
        mistake: 'Memasukkan node atau objek ke dalam data simpan sehingga tidak dapat diubah menjadi JSON.',
        fix: 'Simpan hanya data sederhana dan rujuk benda lewat id atau nama.',
      },
    },
    {
      title: 'Validasi data, penyimpanan lokal, dan server',
      text: [
        'Selalu validasi data saat memuat: cek apakah bentuknya benar, kunci yang dibutuhkan ada, dan tipenya sesuai. Jika rusak, kembali ke data awal agar gim tidak crash.',
        'Penyimpanan di user:// bersifat lokal. Pada gim Web, data tersimpan di browser dan hanya untuk perangkat itu. Untuk simpan lintas perangkat atau akun siswa dibutuhkan server dan backend.',
      ],
      analogy: 'Seperti satpam yang memeriksa tas sebelum masuk: tidak semua yang datang boleh langsung dipercaya.',
      figure: ['Baca file', 'Validasi', 'Pakai / data awal'],
      code: {
        src: `func muat_aman(teks: String) -> Dictionary:
	var hasil: Variant = JSON.parse_string(teks)
	if not (hasil is Dictionary):
		return data_awal()
	if not hasil.has("skor") or typeof(hasil["skor"]) != TYPE_FLOAT:
		return data_awal()
	return hasil`,
        lines: [
          ['JSON.parse_string(teks)', 'Membaca teks menjadi data (null jika rusak).'],
          ['if not (hasil is Dictionary):', 'Menolak data yang bukan Dictionary.'],
          ['hasil.has("skor")', 'Memeriksa kunci yang wajib ada.'],
          ['typeof(hasil["skor"]) != TYPE_FLOAT', 'Memeriksa tipe angka (JSON membaca angka sebagai float).'],
          ['return data_awal()', 'Kembali ke data awal jika ada yang tidak sesuai.'],
        ],
        input: 'Teks isi file simpan yang mungkin rusak atau diubah.',
        output: 'Dictionary valid, atau data awal jika file rusak.',
        mistake: 'Langsung memakai data tanpa validasi sehingga gim crash saat file rusak atau diubah pemain.',
        fix: 'Validasi bentuk, kunci, dan tipe sebelum dipakai dan sediakan data_awal().',
      },
    },
  ],
  sim: {
    type: 'bug',
    title: 'Simulasi: perbaiki bug save system',
    intro: 'Baca gejalanya, klik baris yang menjadi penyebab, lalu pilih perbaikan yang tepat. Ini simulasi edukasi, bukan menjalankan kode GDScript sungguhan.',
    rounds: [
      {
        symptom: 'Penyimpanan berhasil di editor tetapi gagal setelah gim diekspor.',
        code: [
          'func simpan(teks: String) -> void:',
          '    var file := FileAccess.open("res://simpan.json", FileAccess.WRITE)',
          '    file.store_string(teks)',
        ],
        bug: 1,
        fixes: [
          { t: 'Ganti alamat menjadi user://simpan.json', ok: true },
          { t: 'Ganti WRITE menjadi READ', ok: false },
          { t: 'Hapus store_string', ok: false },
        ],
        why: 'res:// hanya-baca pada gim hasil ekspor. Data pemain harus disimpan di user://.',
      },
      {
        symptom: 'Gim crash saat file simpan rusak atau kosong.',
        code: [
          'func muat(teks: String) -> void:',
          '    var data = JSON.parse_string(teks)',
          '    print(data["skor"])',
        ],
        bug: 2,
        fixes: [
          { t: 'Ganti print menjadi push_error', ok: false },
          { t: 'Periksa dulu bahwa data adalah Dictionary dan punya kunci "skor"', ok: true },
          { t: 'Ganti parse_string menjadi stringify', ok: false },
        ],
        why: 'parse_string() mengembalikan null untuk teks rusak. Tanpa validasi, mengakses kunci menimbulkan error.',
      },
      {
        symptom: 'Level yang dimuat dari JSON menimbulkan error tipe saat dipakai sebagai bilangan bulat.',
        code: [
          'func muat_level(hasil: Dictionary) -> void:',
          '    var nomor: int = hasil["level"]',
          '    print("Level ", nomor)',
        ],
        bug: 1,
        fixes: [
          { t: 'Ubah menjadi int(hasil["level"])', ok: true },
          { t: 'Ganti int menjadi String', ok: false },
          { t: 'Hapus kunci "level"', ok: false },
        ],
        why: 'Angka dari JSON dibaca sebagai float (3.0). Ubah dengan int() sebelum dipakai sebagai bilangan bulat.',
      },
    ],
  },
  quiz: [
    {
      q: 'Folder mana yang aman untuk menyimpan data pemain dan dapat ditulis setelah gim diekspor?',
      a: ['user://', 'res://', 'C:/Windows', 'Folder proyek sumber'],
      c: 0,
      why: 'user:// adalah folder khusus yang dapat ditulis. res:// bersifat hanya-baca pada gim ekspor.',
    },
    {
      q: 'Fungsi apa yang mengubah Dictionary menjadi teks JSON?',
      a: ['JSON.stringify()', 'JSON.parse_string()', 'FileAccess.open()', 'str_to_var()'],
      c: 0,
      why: 'stringify mengubah data menjadi teks, sedangkan parse_string membalikkannya.',
    },
    {
      q: 'Benar atau salah: angka yang dibaca dari JSON di Godot bertipe float.',
      a: ['Benar', 'Salah'],
      c: 0,
      why: 'JSON tidak membedakan int dan float, sehingga angka dibaca sebagai float. Gunakan int() bila perlu.',
    },
    {
      q: 'Agar properti sebuah Resource kustom ikut tersimpan ke file, apa yang harus dilakukan?',
      a: ['Menandainya dengan @export', 'Menamainya dengan huruf besar', 'Menaruhnya di dalam komentar', 'Menghapus extends Resource'],
      c: 0,
      why: 'Hanya properti yang diekspor yang ikut tersimpan ke file resource.',
    },
    {
      q: 'Mengapa validasi data saat memuat itu penting?',
      a: ['Agar file rusak atau diubah tidak membuat gim crash', 'Agar file lebih kecil', 'Agar gim lebih berwarna', 'Agar skor otomatis naik'],
      c: 0,
      why: 'Data dari file tidak selalu dapat dipercaya. Validasi mencegah crash dan kesalahan tak terduga.',
    },
    {
      q: 'Apa yang dibutuhkan agar progres siswa dapat dilanjutkan dari perangkat yang berbeda?',
      a: ['Server dan backend dengan akun', 'Menyimpan di res://', 'Menambah volume musik', 'Mengganti warna HUD'],
      c: 0,
      why: 'Penyimpanan lokal hanya berlaku pada satu perangkat atau browser. Lintas perangkat butuh server.',
    },
  ],
  passScore: 4,
  mini: 'Mini project: buat Autoload SaveManager yang menyimpan skor, inventaris, dan quest ke user://simpan.json (dengan nomor versi), memuatnya dengan validasi, dan menyediakan tombol Continue serta New Game.',
  summary: [
    'Simpan data pemain di user://, bukan res://.',
    'JSON mudah dibaca tetapi angkanya float; Resource bertipe jelas tetapi muat hanya file tepercaya.',
    'Simpan data sederhana beserta nomor versi, bukan node atau objek.',
    'Validasi saat memuat; lintas perangkat butuh server.',
  ],
  indicators: [
    ['read13', 'Membaca seluruh materi Bab 13'],
    ['sim13', 'Memperbaiki tiga bug save system'],
    ['quiz13', 'Lulus kuis dengan minimal 4 dari 6 jawaban benar'],
  ],
};
