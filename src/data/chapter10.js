// Konten Bab 10. Materi mengacu pada Godot Engine 4.x (GDScript).
export const chapter10 = {
  id: 10,
  keys: { read: 'read10', sim: 'sim10', quiz: 'quiz10' },
  badge: 'Arsitek Gameplay',
  title: 'Arsitektur Gameplay',
  story:
    'Laboratorium AI dipenuhi diagram kotak dan panah di dinding. Seorang peneliti menunjuk satu robot kecil yang bolak-balik di panggung: "Gim kecil bisa ditulis asal jadi. Gim besar butuh arsitektur: perilaku yang teratur, data yang tidak hilang, dan sistem yang bisa dikembangkan. Mari kita bangun fondasinya."',
  goals: [
    'Membuat Finite State Machine sederhana dengan enum dan match.',
    'Memakai Autoload (singleton) untuk data yang bertahan antar scene.',
    'Menyusun sistem quest dan inventaris modular serta mengelola perpindahan scene.',
  ],
  pages: [
    {
      title: 'Finite State Machine',
      text: [
        'Finite State Machine (FSM) membuat sebuah objek selalu berada di tepat satu state pada satu waktu, misalnya IDLE atau WALK. Perpindahan antar state diatur oleh aturan transisi.',
        'Di GDScript, state mudah dibuat dengan enum, dan perilaku tiap state dipilih dengan match. Cara ini mencegah kode if yang berantakan.',
      ],
      analogy: 'Seperti lampu lalu lintas: hanya satu warna menyala, dan perpindahannya mengikuti aturan yang jelas.',
      figure: ['IDLE', 'ada input → WALK', 'tidak ada input → IDLE'],
      code: {
        src: `extends CharacterBody2D

enum State { IDLE, WALK }

var state: State = State.IDLE

func _physics_process(delta: float) -> void:
	var arah: Vector2 = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
	match state:
		State.IDLE:
			if arah != Vector2.ZERO:
				state = State.WALK
		State.WALK:
			velocity = arah * 150.0
			move_and_slide()
			if arah == Vector2.ZERO:
				state = State.IDLE`,
        lines: [
          ['enum State { IDLE, WALK }', 'Mendefinisikan daftar state yang mungkin.'],
          ['var state: State = State.IDLE', 'State awal adalah IDLE.'],
          ['match state:', 'Memilih blok sesuai state saat ini.'],
          ['state = State.WALK', 'Transisi: pindah ke WALK saat ada input.'],
          ['state = State.IDLE', 'Transisi: kembali ke IDLE saat input berhenti.'],
        ],
        input: 'Tombol panah.',
        output: 'Karakter diam di IDLE, bergerak di WALK, dan berpindah state otomatis sesuai input.',
        mistake: 'Lupa menulis transisi sehingga state tidak pernah berubah dan karakter terjebak pada satu perilaku.',
        fix: 'Pastikan setiap state punya syarat untuk pindah ke state lain.',
      },
    },
    {
      title: 'Autoload (singleton)',
      text: [
        'Autoload adalah skrip atau scene yang dimuat otomatis saat gim mulai dan tetap hidup selama gim berjalan, walau scene diganti. Daftarkan di Project Settings pada tab Globals > Autoload.',
        'Setelah didaftarkan dengan nama tertentu (misalnya GameData), skrip itu dapat dipanggil dari mana saja memakai namanya. Cocok untuk skor, nyawa, dan pengaturan.',
      ],
      analogy: 'Autoload seperti papan pengumuman sekolah: semua kelas bisa melihat dan memperbaruinya, dan papan itu tidak hilang saat kelas berganti.',
      figure: ['GameData (Autoload)', 'Scene A', 'Scene B'],
      code: {
        src: `# game_data.gd (didaftarkan sebagai Autoload bernama GameData)
extends Node

var skor: int = 0
var nyawa: int = 3

func tambah_skor(jumlah: int) -> void:
	skor += jumlah

# Dipakai dari skrip lain:
# GameData.tambah_skor(10)`,
        lines: [
          ['extends Node', 'Autoload umumnya berupa Node biasa.'],
          ['var skor: int = 0', 'Data yang akan dibagikan ke seluruh gim.'],
          ['func tambah_skor(jumlah: int) -> void:', 'Fungsi untuk mengubah data dengan aturan yang rapi.'],
          ['GameData.tambah_skor(10)', 'Contoh pemanggilan dari skrip mana pun.'],
        ],
        input: 'Skrip didaftarkan sebagai Autoload dengan nama GameData.',
        output: 'skor bertambah 10 dan nilainya tetap ada setelah berpindah scene.',
        mistake: 'Skrip belum didaftarkan sebagai Autoload, atau namanya berbeda, sehingga muncul error nama tidak dikenal.',
        fix: 'Daftarkan di Project Settings > Globals > Autoload dan samakan nama saat dipanggil.',
      },
    },
    {
      title: 'Sistem quest sederhana',
      text: [
        'Sistem quest dapat dibuat dari Dictionary data dan beberapa fungsi pengelola. Letakkan di Autoload agar bisa dipakai semua scene.',
        'Gunakan signal untuk mengumumkan quest selesai, sehingga UI dan sistem lain dapat bereaksi tanpa terikat erat (Bab 7).',
      ],
      analogy: 'Seperti daftar tugas di papan kelas: ada target, ada centang, dan guru diberi tahu saat semua tugas selesai.',
      figure: ['Data quest', 'tambah_progres()', 'quest_selesai'],
      code: {
        src: `extends Node

signal quest_selesai(id: String)

var quest: Dictionary = {
	"kumpul_koin": {"target": 5, "progres": 0, "selesai": false}
}

func tambah_progres(id: String, jumlah: int = 1) -> void:
	if not quest.has(id) or quest[id]["selesai"]:
		return
	quest[id]["progres"] += jumlah
	if quest[id]["progres"] >= quest[id]["target"]:
		quest[id]["selesai"] = true
		quest_selesai.emit(id)`,
        lines: [
          ['signal quest_selesai(id: String)', 'Signal dengan satu parameter: id quest.'],
          ['var quest: Dictionary = {...}', 'Menyimpan target dan progres tiap quest.'],
          ['if not quest.has(id) or quest[id]["selesai"]:', 'Berhenti jika quest tidak ada atau sudah selesai.'],
          ['quest[id]["progres"] += jumlah', 'Menambah progres.'],
          ['quest_selesai.emit(id)', 'Mengumumkan bahwa quest selesai.'],
        ],
        input: 'Pemanggilan tambah_progres("kumpul_koin") setiap koin diambil.',
        output: 'Setelah 5 pemanggilan, quest ditandai selesai dan signal quest_selesai dipancarkan.',
        mistake: 'Tidak memeriksa apakah kunci quest ada sehingga muncul error saat id salah ketik.',
        fix: 'Periksa dengan quest.has(id) sebelum mengaksesnya.',
      },
    },
    {
      title: 'Inventaris modular',
      text: [
        'Inventaris sederhana dapat berupa Dictionary berisi nama item dan jumlahnya. Pisahkan ke Autoload sendiri sehingga UI, quest, dan toko memakai sumber data yang sama.',
        'Dictionary.get(kunci, nilai_awal) mengembalikan nilai bawaan jika kunci belum ada, sehingga menambah item pertama kali tidak error.',
      ],
      analogy: 'Seperti tas dengan kantong berlabel: kamu cek label, lalu tambah isinya, dan semua orang membaca dari tas yang sama.',
      figure: ['tambah_item()', 'Dictionary item', 'inventaris_berubah'],
      code: {
        src: `extends Node

signal inventaris_berubah

var item: Dictionary = {}

func tambah_item(nama: String, jumlah: int = 1) -> void:
	item[nama] = item.get(nama, 0) + jumlah
	inventaris_berubah.emit()

func punya_item(nama: String, minimal: int = 1) -> bool:
	return item.get(nama, 0) >= minimal`,
        lines: [
          ['var item: Dictionary = {}', 'Awalnya kosong. Kunci adalah nama item, nilai adalah jumlah.'],
          ['item.get(nama, 0) + jumlah', 'Jika item belum ada, dianggap 0 lalu ditambah.'],
          ['inventaris_berubah.emit()', 'Memberi tahu UI agar memperbarui tampilan.'],
          ['return item.get(nama, 0) >= minimal', 'Mengecek apakah jumlah item cukup.'],
        ],
        input: 'Pemanggilan tambah_item("ramuan", 2).',
        output: 'item menjadi {"ramuan": 2} dan signal inventaris_berubah dipancarkan.',
        mistake: 'Menulis item[nama] += jumlah untuk item yang belum ada sehingga muncul error kunci tidak ditemukan.',
        fix: 'Gunakan item[nama] = item.get(nama, 0) + jumlah.',
      },
    },
    {
      title: 'Manajemen scene dan data antarscene',
      text: [
        'Saat scene diganti, semua node scene lama dibebaskan, termasuk variabelnya. Data yang harus bertahan, seperti nomor level, simpan di Autoload.',
        'Buat fungsi pengelola perpindahan scene di satu tempat agar seluruh gim memakai cara yang sama dan mudah ditambah efek transisi.',
      ],
      analogy: 'Berpindah ruangan boleh meninggalkan barang di ruang lama. Barang yang harus ikut dititipkan ke penitipan pusat (Autoload).',
      figure: ['Scene lama dibebaskan', 'Data di Autoload tetap', 'Scene baru membaca data'],
      code: {
        src: `extends Node

var level_sekarang: int = 1

func ganti_level(nomor: int) -> void:
	level_sekarang = nomor
	get_tree().change_scene_to_file("res://scenes/level_%d.tscn" % nomor)`,
        lines: [
          ['var level_sekarang: int = 1', 'Data yang harus bertahan antar scene.'],
          ['level_sekarang = nomor', 'Mencatat level tujuan sebelum berpindah.'],
          ['"res://scenes/level_%d.tscn" % nomor', 'Menyusun alamat scene dengan format angka.'],
          ['get_tree().change_scene_to_file(...)', 'Berpindah ke scene tujuan.'],
        ],
        input: 'Pemanggilan ganti_level(2).',
        output: 'Gim berpindah ke level_2.tscn dan level_sekarang bernilai 2 di scene baru.',
        mistake: 'Menyimpan data penting pada variabel node scene sehingga hilang saat scene diganti.',
        fix: 'Simpan data yang harus bertahan pada Autoload atau Resource.',
      },
    },
  ],
  sim: {
    type: 'match',
    title: 'Simulasi: pasangkan masalah dengan solusi arsitektur',
    intro: 'Pilih masalah di kolom kiri, lalu klik solusi yang paling tepat di kolom kanan. Ini simulasi edukasi, bukan editor Godot yang sesungguhnya.',
    pairs: [
      { t: 'Skor harus tetap ada saat pindah dari level 1 ke level 2', d: 'Autoload (singleton)', why: 'Autoload tetap hidup saat scene diganti sehingga datanya tidak hilang.' },
      { t: 'Karakter punya perilaku IDLE, WALK, dan JUMP yang tidak boleh aktif bersamaan', d: 'Finite State Machine', why: 'FSM memastikan hanya satu state aktif dan perpindahannya diatur transisi.' },
      { t: 'Menyimpan daftar item beserta jumlahnya, misalnya ramuan x3', d: 'Dictionary', why: 'Dictionary memetakan nama item ke jumlahnya.' },
      { t: 'UI perlu tahu inventaris berubah tanpa memeriksa terus-menerus', d: 'Signal', why: 'Signal mengumumkan perubahan sehingga UI bereaksi hanya saat diperlukan.' },
      { t: 'Berpindah dari menu utama ke level pertama', d: 'change_scene_to_file()', why: 'Fungsi ini memuat dan mengganti scene aktif.' },
    ],
  },
  quiz: [
    {
      q: 'Apa ciri utama Finite State Machine?',
      a: ['Objek berada di tepat satu state pada satu waktu dan berpindah lewat aturan transisi', 'Objek selalu berada di semua state sekaligus', 'State hanya boleh berubah satu kali', 'FSM hanya dipakai untuk UI'],
      c: 0,
      why: 'FSM membatasi perilaku ke satu state aktif dan mengatur kapan boleh berpindah.',
    },
    {
      q: 'Struktur GDScript mana yang cocok untuk memilih perilaku sesuai state saat ini?',
      a: ['match', 'const', 'extends', 'signal'],
      c: 0,
      why: 'match membandingkan nilai (misalnya enum state) lalu menjalankan blok yang cocok.',
    },
    {
      q: 'Benar atau salah: skrip Autoload tetap hidup ketika scene diganti.',
      a: ['Benar', 'Salah'],
      c: 0,
      why: 'Autoload dimuat saat gim mulai dan tetap ada selama gim berjalan.',
    },
    {
      q: 'Autoload bernama GameData punya fungsi tambah_skor(jumlah). Bagaimana memanggilnya dari skrip lain?',
      a: ['GameData.tambah_skor(10)', 'tambah_skor.GameData(10)', 'call(GameData, 10)', 'GameData[tambah_skor] = 10'],
      c: 0,
      why: 'Autoload dipanggil memakai namanya yang didaftarkan, diikuti fungsi atau variabelnya.',
    },
    {
      q: 'item[nama] += jumlah error saat item belum ada. Perbaikan yang benar adalah...',
      a: ['item[nama] = item.get(nama, 0) + jumlah', 'item.add(nama)', 'item.clear()', 'Hapus tanda +='],
      c: 0,
      why: 'get(nama, 0) memberi nilai awal 0 jika kunci belum ada sehingga penjumlahan aman.',
    },
    {
      q: 'Data yang harus bertahan saat scene diganti sebaiknya disimpan di mana?',
      a: ['Autoload atau Resource', 'Variabel pada node scene yang akan dibebaskan', 'Nama file scene', 'Komentar kode'],
      c: 0,
      why: 'Node scene lama dibebaskan saat scene diganti, sedangkan Autoload tetap ada.',
    },
  ],
  passScore: 4,
  mini: 'Mini project: buat Autoload GameData berisi skor dan nyawa, FSM IDLE dan WALK untuk pemain, serta inventaris dengan fungsi tambah_item() yang memancarkan signal inventaris_berubah.',
  summary: [
    'FSM: satu state aktif, perilaku dipilih dengan match, perpindahan lewat transisi.',
    'Autoload adalah singleton yang bertahan antar scene; daftarkan di Project Settings > Globals.',
    'Quest dan inventaris dapat dibuat dari Dictionary di Autoload, dengan signal untuk memberi tahu UI.',
    'Data yang harus bertahan antar scene disimpan di Autoload atau Resource.',
  ],
  indicators: [
    ['read10', 'Membaca seluruh materi Bab 10'],
    ['sim10', 'Memasangkan lima masalah dengan solusi arsitektur'],
    ['quiz10', 'Lulus kuis dengan minimal 4 dari 6 jawaban benar'],
  ],
};
