// Konten Bab 8. Materi mengacu pada Godot Engine 4.x (GDScript).
export const chapter8 = {
  id: 8,
  keys: { read: 'read8', sim: 'sim8', quiz: 'quiz8' },
  badge: 'Perancang Antarmuka',
  title: 'UI dan Sistem Permainan',
  story:
    'Ruang Desain Level dipenuhi papan rancangan berisi kotak-kotak tombol dan bar. Seorang desainer mengetuk papan itu: "Gim sebagus apa pun akan membingungkan kalau pemain tidak tahu skornya, nyawanya, atau cara menjedanya. Mari kita rancang antarmukanya."',
  goals: [
    'Memakai node Control seperti Label dan Button serta Container untuk menata tampilan.',
    'Membuat HUD yang menampilkan skor dan nyawa dengan CanvasLayer, Label, dan ProgressBar.',
    'Membuat menu utama, daftar inventaris, dan menu jeda yang berfungsi.',
  ],
  pages: [
    {
      title: 'Node Control, Label, dan Button',
      text: [
        'Control adalah node dasar untuk antarmuka (UI). Label menampilkan teks, Button adalah tombol yang bisa ditekan, dan keduanya turunan Control.',
        'Node Control memakai anchor untuk menempel pada sisi layar sehingga tampilan tetap rapi saat ukuran jendela berubah. Teks diubah lewat properti text.',
      ],
      analogy: 'Node Control seperti stiker pada kaca jendela: menempel pada sisi tertentu, sehingga tetap di tempatnya walau jendela membesar atau mengecil.',
      figure: ['Control', 'Label (teks)', 'Button (tombol)'],
      code: {
        src: `extends Control

func _ready() -> void:
	$Judul.text = "Godot Adventure"
	$TombolMulai.text = "Mulai"
	$TombolMulai.pressed.connect(_on_mulai_pressed)

func _on_mulai_pressed() -> void:
	print("Gim dimulai")`,
        lines: [
          ['$Judul.text = "Godot Adventure"', 'Mengubah teks pada node Label bernama Judul.'],
          ['$TombolMulai.text = "Mulai"', 'Mengubah tulisan pada tombol.'],
          ['$TombolMulai.pressed.connect(_on_mulai_pressed)', 'Menghubungkan signal pressed ke fungsi penerima (Bab 7).'],
          ['print("Gim dimulai")', 'Menampilkan pesan ketika tombol ditekan.'],
        ],
        input: 'Scene punya child Label bernama Judul dan Button bernama TombolMulai.',
        output: 'Label dan tombol menampilkan teks yang diatur, dan menekan tombol mencetak Gim dimulai.',
        mistake: 'Nama node pada $ salah ketik sehingga hasilnya null dan muncul error saat dipakai.',
        fix: 'Samakan nama dengan yang ada di panel Scene (huruf besar dan kecil berpengaruh).',
      },
    },
    {
      title: 'Container: penataan otomatis',
      text: [
        'Container menata child-nya secara otomatis. VBoxContainer menyusun ke bawah, HBoxContainer ke samping, GridContainer dalam kisi, dan MarginContainer memberi jarak tepi.',
        'Karena penataan diatur container, posisi dan ukuran child ditentukan olehnya. Atur tampilan lewat container, size flags, atau custom_minimum_size.',
      ],
      analogy: 'Container seperti rak berpetak: kamu tinggal memasukkan barang, dan petaknya yang menentukan letaknya.',
      figure: ['VBoxContainer: atas ke bawah', 'HBoxContainer: kiri ke kanan', 'GridContainer: kisi'],
      code: {
        src: `extends VBoxContainer

func _ready() -> void:
	for nama in ["Mulai", "Opsi", "Keluar"]:
		var tombol := Button.new()
		tombol.text = nama
		add_child(tombol)`,
        lines: [
          ['extends VBoxContainer', 'Skrip dipasang pada container vertikal.'],
          ['for nama in ["Mulai", "Opsi", "Keluar"]:', 'Mengulang untuk setiap nama tombol.'],
          ['var tombol := Button.new()', 'Membuat tombol baru lewat kode.'],
          ['add_child(tombol)', 'Memasukkan tombol; container otomatis menatanya.'],
        ],
        input: 'Tidak ada input.',
        output: 'Tiga tombol Mulai, Opsi, dan Keluar tersusun dari atas ke bawah.',
        mistake: 'Mengatur position child di dalam container sehingga nilainya tertimpa oleh container.',
        fix: 'Atur posisi container itu sendiri, atau pakai size flags dan custom_minimum_size pada child.',
      },
    },
    {
      title: 'HUD: skor dan nyawa',
      text: [
        'HUD adalah informasi yang selalu tampil: skor, nyawa, atau quest aktif. Letakkan di CanvasLayer agar tetap menempel di layar walau kamera bergerak.',
        'Label cocok untuk skor dan ProgressBar untuk nyawa (properti value dan max_value). Saat menggabungkan teks dan angka, ubah angka menjadi teks dengan str().',
      ],
      analogy: 'HUD seperti dasbor mobil: selalu terlihat oleh pengemudi, tidak peduli jalan yang dilalui.',
      figure: ['CanvasLayer', 'Label: skor', 'ProgressBar: nyawa'],
      code: {
        src: `extends CanvasLayer

@onready var label_skor: Label = $LabelSkor
@onready var bar_nyawa: ProgressBar = $BarNyawa

func perbarui(skor: int, nyawa: int) -> void:
	label_skor.text = "Skor: " + str(skor)
	bar_nyawa.value = nyawa`,
        lines: [
          ['@onready var label_skor: Label = $LabelSkor', 'Mengambil node Label setelah scene siap.'],
          ['@onready var bar_nyawa: ProgressBar = $BarNyawa', 'Mengambil node ProgressBar.'],
          ['label_skor.text = "Skor: " + str(skor)', 'Menggabungkan teks dengan angka yang sudah diubah menjadi String.'],
          ['bar_nyawa.value = nyawa', 'Mengisi bar sesuai nilai nyawa (maksimal bawaan 100).'],
        ],
        input: 'Pemanggilan perbarui(150, 80).',
        output: 'Label menampilkan Skor: 150 dan bar terisi 80 persen.',
        mistake: 'Menulis "Skor: " + skor langsung, padahal skor bertipe int, sehingga muncul error operator.',
        fix: 'Ubah dengan str(skor), atau pakai format seperti "Skor: %d" % skor.',
      },
    },
    {
      title: 'Menu utama dan inventaris',
      text: [
        'Tombol Mulai pada menu utama berpindah scene dengan get_tree().change_scene_to_file("res://...").',
        'Inventaris dapat ditampilkan dari data (Array). Buat Label untuk setiap item lalu tambahkan ke sebuah container.',
      ],
      analogy: 'Menu utama seperti lobi bioskop: dari sana kamu menuju ruang yang tepat. Inventaris seperti etalase yang menampilkan isi tasmu.',
      figure: ['Menu utama', 'change_scene_to_file()', 'Level 1'],
      code: {
        src: `extends Control

var inventaris: Array[String] = ["pedang", "ramuan"]

func _on_mulai_pressed() -> void:
	get_tree().change_scene_to_file("res://scenes/level_1.tscn")

func tampilkan_inventaris() -> void:
	for item in inventaris:
		var label := Label.new()
		label.text = item
		$DaftarItem.add_child(label)`,
        lines: [
          ['var inventaris: Array[String] = [...]', 'Daftar item bertipe String.'],
          ['get_tree().change_scene_to_file("res://scenes/level_1.tscn")', 'Memuat dan berpindah ke scene level 1.'],
          ['for item in inventaris:', 'Mengulang untuk setiap item.'],
          ['$DaftarItem.add_child(label)', 'Menambahkan label ke container daftar.'],
        ],
        input: 'Tombol Mulai ditekan, dan node DaftarItem berupa container.',
        output: 'Gim berpindah ke level 1, dan item inventaris muncul sebagai daftar label.',
        mistake: 'Alamat scene salah atau file tidak ada sehingga perpindahan scene gagal.',
        fix: 'Periksa alamat di panel FileSystem dan pastikan penulisannya sama persis.',
      },
    },
    {
      title: 'Menu jeda',
      text: [
        'Gim dijeda dengan get_tree().paused = true. Saat itu, node yang berjalan normal akan berhenti, termasuk menu jeda jika tidak diatur.',
        'Agar menu tetap berfungsi, atur process_mode = Node.PROCESS_MODE_ALWAYS pada node menu.',
      ],
      analogy: 'Seperti menjeda film: semua pemain berhenti, tetapi tombol remote tetap harus bisa dipakai.',
      figure: ['Tekan Esc', 'paused = true', 'Menu tetap aktif'],
      code: {
        src: `extends CanvasLayer

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	visible = false

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_cancel"):
		get_tree().paused = not get_tree().paused
		visible = get_tree().paused`,
        lines: [
          ['process_mode = Node.PROCESS_MODE_ALWAYS', 'Membuat menu tetap berjalan walau gim dijeda.'],
          ['visible = false', 'Menu tersembunyi saat awal.'],
          ['if event.is_action_pressed("ui_cancel"):', 'Memeriksa apakah tombol Esc ditekan.'],
          ['get_tree().paused = not get_tree().paused', 'Membalik status jeda.'],
        ],
        input: 'Tombol Esc (aksi ui_cancel).',
        output: 'Esc menjeda gim dan menampilkan menu; Esc lagi melanjutkan dan menyembunyikannya.',
        mistake: 'Lupa process_mode ALWAYS sehingga menu ikut berhenti dan tidak bisa ditutup.',
        fix: 'Atur process_mode = Node.PROCESS_MODE_ALWAYS pada node menu jeda.',
      },
    },
  ],
  sim: {
    type: 'bug',
    title: 'Simulasi: perbaiki bug antarmuka',
    intro: 'Baca gejalanya, klik baris yang menjadi penyebab, lalu pilih perbaikan yang tepat. Ini simulasi edukasi, bukan menjalankan kode GDScript sungguhan.',
    rounds: [
      {
        symptom: 'Muncul error saat label skor diperbarui.',
        code: [
          'func perbarui(skor: int) -> void:',
          '    label_skor.text = "Skor: " + skor',
        ],
        bug: 1,
        fixes: [
          { t: 'Hapus label_skor', ok: false },
          { t: 'Ubah menjadi "Skor: " + str(skor)', ok: true },
          { t: 'Ganti + menjadi -', ok: false },
        ],
        why: 'Teks (String) tidak bisa digabung langsung dengan angka (int). Ubah angka menjadi teks dengan str().',
      },
      {
        symptom: 'Setelah gim dijeda, menu tidak bereaksi dan tidak bisa ditutup.',
        code: [
          'extends CanvasLayer',
          'func _ready() -> void:',
          '    visible = false',
          'func _unhandled_input(event: InputEvent) -> void:',
          '    if event.is_action_pressed("ui_cancel"):',
          '        get_tree().paused = not get_tree().paused',
          '        visible = get_tree().paused',
        ],
        bug: 1,
        fixes: [
          { t: 'Hapus baris get_tree().paused', ok: false },
          { t: 'Tambahkan process_mode = Node.PROCESS_MODE_ALWAYS di _ready()', ok: true },
          { t: 'Ganti ui_cancel menjadi ui_accept', ok: false },
        ],
        why: 'Saat gim dijeda, node tidak berjalan kecuali process_mode-nya ALWAYS. Karena itu menu ikut berhenti.',
      },
      {
        symptom: 'Tombol tidak muncul di posisi (300, 200); letaknya selalu diatur otomatis.',
        code: [
          'extends VBoxContainer',
          'func _ready() -> void:',
          '    var tombol := Button.new()',
          '    tombol.text = "Mulai"',
          '    tombol.position = Vector2(300, 200)',
          '    add_child(tombol)',
        ],
        bug: 4,
        fixes: [
          { t: 'Hapus pengaturan posisi, lalu atur tampilan lewat container, size flags, atau custom_minimum_size', ok: true },
          { t: 'Panggil position dua kali', ok: false },
          { t: 'Ganti Button menjadi Label', ok: false },
        ],
        why: 'Container mengatur posisi dan ukuran child-nya sendiri sehingga position manual ditimpa.',
      },
    ],
  },
  quiz: [
    {
      q: 'Node dasar apa yang dipakai untuk membangun antarmuka (UI) di Godot?',
      a: ['Control', 'CharacterBody2D', 'AudioStreamPlayer', 'Camera2D'],
      c: 0,
      why: 'Control adalah node dasar UI. Label dan Button adalah turunannya.',
    },
    {
      q: 'Container mana yang menyusun child dari atas ke bawah?',
      a: ['VBoxContainer', 'HBoxContainer', 'Area2D', 'Timer'],
      c: 0,
      why: 'VBoxContainer menyusun vertikal, sedangkan HBoxContainer menyusun horizontal.',
    },
    {
      q: 'Benar atau salah: posisi child di dalam Container ditentukan otomatis oleh container.',
      a: ['Benar', 'Salah'],
      c: 0,
      why: 'Itulah fungsi container. Pengaturan position manual pada child akan tertimpa.',
    },
    {
      q: 'Skor bertipe int. Baris mana yang benar untuk menampilkannya di Label?',
      a: ['label.text = "Skor: " + str(skor)', 'label.text = "Skor: " + skor', 'label.text = Skor + str', 'label = "Skor: " * skor'],
      c: 0,
      why: 'GDScript tidak menggabungkan String dengan int secara langsung. Ubah int dengan str().',
    },
    {
      q: 'Node apa yang menjaga HUD tetap menempel di layar walau kamera bergerak?',
      a: ['CanvasLayer', 'StaticBody2D', 'Sprite2D', 'AnimationPlayer'],
      c: 0,
      why: 'CanvasLayer menggambar isinya terpisah dari kamera sehingga tetap diam di layar.',
    },
    {
      q: 'Agar menu jeda tetap berfungsi saat get_tree().paused = true, apa yang harus diatur?',
      a: ['process_mode = Node.PROCESS_MODE_ALWAYS', 'visible = true', 'queue_free()', 'position = Vector2.ZERO'],
      c: 0,
      why: 'Node dengan PROCESS_MODE_ALWAYS tetap berjalan walau gim dijeda.',
    },
  ],
  passScore: 4,
  mini: 'Mini project: buat HUD dengan Label skor dan ProgressBar nyawa di CanvasLayer, lalu buat menu jeda sederhana yang muncul dan hilang saat Esc ditekan.',
  summary: [
    'Control adalah dasar UI; Label menampilkan teks dan Button menerima klik.',
    'Container menata child otomatis; jangan mengatur position child secara manual.',
    'HUD ditaruh di CanvasLayer; ubah angka menjadi teks dengan str().',
    'Menu jeda memakai get_tree().paused dan process_mode ALWAYS.',
  ],
  indicators: [
    ['read8', 'Membaca seluruh materi Bab 8'],
    ['sim8', 'Memperbaiki tiga bug antarmuka'],
    ['quiz8', 'Lulus kuis dengan minimal 4 dari 6 jawaban benar'],
  ],
};
