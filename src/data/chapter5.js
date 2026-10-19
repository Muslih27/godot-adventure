// Konten Bab 5. Materi mengacu pada Godot Engine 4.x (GDScript).
export const chapter5 = {
  id: 5,
  keys: { read: 'read5', sim: 'sim5', quiz: 'quiz5' },
  badge: 'Pilot Karakter',
  title: 'Karakter dan Gerakan',
  story:
    'Arena Gim berdengung, lantainya bergaris seperti lintasan latihan. Seorang pelatih melambai: "Selamat datang! Gim jadi hidup ketika karakternya bisa bergerak dan menabrak dinding dengan benar. Ayo latihan."',
  goals: [
    'Menyusun karakter dengan CharacterBody2D dan CollisionShape2D.',
    'Membaca input dengan Input Map dan Input.get_vector(), lalu menggerakkan karakter dengan velocity dan move_and_slide().',
    'Membedakan Area2D dan StaticBody2D serta memahami peran delta.',
  ],
  pages: [
    {
      title: 'CharacterBody2D dan CollisionShape2D',
      text: [
        'CharacterBody2D adalah node untuk karakter yang digerakkan lewat kode dan dapat bertabrakan dengan benda lain.',
        'Agar bisa bertabrakan, ia butuh child CollisionShape2D dengan sebuah bentuk (shape), misalnya RectangleShape2D atau CapsuleShape2D. Tanpa shape, editor menampilkan peringatan.',
      ],
      analogy: 'CharacterBody2D seperti pemain di lapangan, sedangkan CollisionShape2D adalah tubuhnya. Tanpa tubuh, ia menembus semua orang.',
      figure: ['Player (CharacterBody2D)', 'Sprite2D (gambar)', 'CollisionShape2D (tubuh)'],
    },
    {
      title: 'Input Map dan Input.get_vector()',
      text: [
        'Input Map (Project > Project Settings > Input Map) memberi nama pada aksi, misalnya "lompat". Godot sudah menyediakan ui_left, ui_right, ui_up, dan ui_down.',
        'Input.get_vector(negatif_x, positif_x, negatif_y, positif_y) mengembalikan Vector2 arah gerak. Diagonal sudah ditangani sehingga tidak lebih cepat. Di 2D, atas bernilai y negatif.',
      ],
      analogy: 'Input Map seperti kamus tombol: kamu menamai fungsinya ("kiri"), bukan memikirkan tombol fisiknya.',
      figure: ['Tombol ditekan', 'Aksi (Input Map)', 'Vector2 arah'],
      code: {
        src: `func _physics_process(delta: float) -> void:
	var arah: Vector2 = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
	print(arah)`,
        lines: [
          ['func _physics_process(delta: float) -> void:', 'Dipanggil pada laju tetap untuk urusan fisika dan gerakan.'],
          ['Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")', 'Membaca empat aksi dan menggabungkannya menjadi satu arah.'],
          ['print(arah)', 'Menampilkan arah di Output.'],
        ],
        input: 'Tombol panah pada keyboard.',
        output: 'Menekan kanan menampilkan (1, 0). Tidak menekan apa pun menampilkan (0, 0).',
        mistake: 'Nama aksi salah ketik atau belum ada di Input Map, sehingga muncul error aksi tidak ditemukan.',
        fix: 'Samakan nama dengan yang ada di Input Map atau pakai aksi bawaan ui_*.',
      },
    },
    {
      title: 'Velocity dan move_and_slide()',
      text: [
        'velocity adalah properti CharacterBody2D yang menyimpan kecepatan dalam piksel per detik. Mengisinya belum menggerakkan apa pun.',
        'move_and_slide() menggerakkan karakter berdasarkan velocity, menangani tabrakan, dan meluncur di sepanjang dinding. Panggil setiap frame fisika.',
      ],
      analogy: 'velocity seperti menekan pedal gas, sedangkan move_and_slide() adalah mesin yang benar-benar menjalankan mobilnya.',
      figure: ['Baca input', 'Isi velocity', 'move_and_slide()'],
      code: {
        src: `extends CharacterBody2D

const SPEED: float = 200.0

func _physics_process(delta: float) -> void:
	var arah: Vector2 = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
	velocity = arah * SPEED
	move_and_slide()`,
        lines: [
          ['extends CharacterBody2D', 'Skrip dipasang pada node karakter.'],
          ['const SPEED: float = 200.0', 'Kecepatan maksimal: 200 piksel per detik.'],
          ['var arah: Vector2 = Input.get_vector(...)', 'Mengambil arah dari input pemain.'],
          ['velocity = arah * SPEED', 'Mengubah arah menjadi kecepatan.'],
          ['move_and_slide()', 'Menggerakkan karakter dan menangani tabrakan.'],
        ],
        input: 'Tombol panah.',
        output: 'Karakter bergerak 200 piksel per detik dan berhenti atau meluncur saat menabrak dinding.',
        mistake: 'Lupa memanggil move_and_slide() sehingga velocity berubah tetapi karakter diam.',
        fix: 'Panggil move_and_slide() di akhir _physics_process.',
      },
    },
    {
      title: 'Delta time dan _physics_process',
      text: [
        '_physics_process berjalan pada laju tetap (bawaan 60 kali per detik) dan cocok untuk gerakan fisika. _process berjalan tiap frame gambar.',
        'move_and_slide() sudah memperhitungkan delta sendiri, jadi jangan mengalikan velocity dengan delta. Delta dipakai saat velocity berubah bertahap, misalnya percepatan gravitasi (piksel per detik kuadrat dikali detik).',
      ],
      analogy: 'Kecepatan seperti 60 km/jam. Jika kamu menaikkan kecepatan 10 km/jam setiap detik, perubahannya dikali lamanya waktu.',
      figure: ['Percepatan', '× delta', 'Perubahan velocity'],
      code: {
        src: `const GRAVITY: float = 900.0

func _physics_process(delta: float) -> void:
	velocity.y += GRAVITY * delta
	move_and_slide()`,
        lines: [
          ['const GRAVITY: float = 900.0', 'Percepatan gravitasi dalam piksel per detik kuadrat.'],
          ['velocity.y += GRAVITY * delta', 'Menambah kecepatan jatuh sedikit demi sedikit tiap frame.'],
          ['move_and_slide()', 'Menggerakkan karakter memakai velocity terbaru.'],
        ],
        input: 'Tidak ada input.',
        output: 'Karakter jatuh makin cepat sampai menabrak lantai.',
        mistake: 'Menulis velocity = arah * SPEED * delta lalu memanggil move_and_slide(), sehingga gerakan menjadi sangat lambat.',
        fix: 'Hapus * delta pada velocity yang dipakai move_and_slide(). Pakai delta hanya untuk perubahan bertahap seperti gravitasi.',
      },
    },
    {
      title: 'Area2D dan StaticBody2D',
      text: [
        'StaticBody2D adalah benda diam yang tidak bisa ditembus, cocok untuk dinding dan lantai.',
        'Area2D tidak menahan benda, tetapi mendeteksi benda yang masuk. Cocok untuk koin, pemicu pintu, dan zona bahaya. Keduanya butuh CollisionShape2D.',
        'Area2D punya signal body_entered yang dapat dihubungkan lewat tab Node di Inspector (signal dibahas lebih dalam di Bab 7).',
      ],
      analogy: 'StaticBody2D seperti tembok. Area2D seperti sensor lantai di pintu otomatis: tidak menghalangi, tetapi tahu ada yang lewat.',
      figure: ['StaticBody2D: menahan', 'Area2D: mendeteksi'],
      code: {
        src: `extends Area2D

func _on_body_entered(body: Node2D) -> void:
	if body.name == "Player":
		print("Koin diambil!")
		queue_free()`,
        lines: [
          ['extends Area2D', 'Skrip dipasang pada node Area2D (koin).'],
          ['func _on_body_entered(body: Node2D) -> void:', 'Dipanggil saat suatu benda masuk ke area. body adalah benda tersebut.'],
          ['if body.name == "Player":', 'Memastikan yang masuk adalah pemain.'],
          ['queue_free()', 'Menghapus node koin dengan aman setelah frame berjalan.'],
        ],
        input: 'Pemain menyentuh area koin (signal body_entered sudah dihubungkan).',
        output: 'Output menampilkan Koin diambil! dan koin menghilang.',
        mistake: 'Area2D tanpa CollisionShape2D, atau signal body_entered belum dihubungkan, sehingga tidak ada yang terjadi.',
        fix: 'Tambahkan CollisionShape2D dengan shape, lalu hubungkan signal body_entered ke skrip.',
      },
    },
  ],
  sim: {
    type: 'bug',
    title: 'Simulasi: temukan bug gerakan',
    intro: 'Baca gejalanya, klik baris yang menjadi penyebab, lalu pilih perbaikan yang tepat. Ini simulasi edukasi, bukan menjalankan kode GDScript sungguhan.',
    rounds: [
      {
        symptom: 'Karakter bergerak sangat pelan, hampir diam.',
        code: [
          'extends CharacterBody2D',
          'const SPEED: float = 200.0',
          'func _physics_process(delta: float) -> void:',
          '    var arah: Vector2 = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")',
          '    velocity = arah * SPEED * delta',
          '    move_and_slide()',
        ],
        bug: 4,
        fixes: [
          { t: 'Ganti SPEED menjadi 1', ok: false },
          { t: 'Hapus * delta karena move_and_slide() sudah memperhitungkan delta', ok: true },
          { t: 'Ganti _physics_process menjadi _ready', ok: false },
        ],
        why: 'velocity dalam piksel per detik. Mengalikannya dengan delta membuatnya sekitar 60 kali lebih kecil.',
      },
      {
        symptom: 'Menekan tombol atas membuat karakter bergerak ke bawah.',
        code: [
          'extends CharacterBody2D',
          'const SPEED: float = 200.0',
          'func _physics_process(delta: float) -> void:',
          '    var arah: Vector2 = Input.get_vector("ui_left", "ui_right", "ui_down", "ui_up")',
          '    velocity = arah * SPEED',
          '    move_and_slide()',
        ],
        bug: 3,
        fixes: [
          { t: 'Tukar urutan menjadi "ui_up", "ui_down" (arah negatif y lebih dulu)', ok: true },
          { t: 'Ganti SPEED menjadi negatif', ok: false },
          { t: 'Hapus move_and_slide()', ok: false },
        ],
        why: 'Argumen get_vector berurutan: negatif x, positif x, negatif y, positif y. Di 2D atas adalah y negatif.',
      },
      {
        symptom: 'Karakter jatuh dengan percepatan yang tidak masuk akal.',
        code: [
          'extends CharacterBody2D',
          'const GRAVITY: float = 900.0',
          'func _physics_process(delta: float) -> void:',
          '    velocity.y += GRAVITY',
          '    move_and_slide()',
        ],
        bug: 3,
        fixes: [
          { t: 'Hapus move_and_slide()', ok: false },
          { t: 'Ganti GRAVITY menjadi 0', ok: false },
          { t: 'Ubah menjadi velocity.y += GRAVITY * delta', ok: true },
        ],
        why: 'Gravitasi adalah percepatan (piksel per detik kuadrat). Dikali delta menghasilkan perubahan kecepatan yang benar tiap frame.',
      },
    ],
  },
  quiz: [
    {
      q: 'Node apa yang cocok untuk karakter yang digerakkan lewat kode dan dapat bertabrakan?',
      a: ['CharacterBody2D', 'Label', 'AudioStreamPlayer', 'Camera2D'],
      c: 0,
      why: 'CharacterBody2D dirancang untuk karakter yang digerakkan dengan velocity dan move_and_slide().',
    },
    {
      q: 'Apa yang dikembalikan oleh Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")?',
      a: ['Vector2 arah gerak', 'Teks nama tombol', 'Nilai bool saja', 'Nomor frame'],
      c: 0,
      why: 'get_vector menggabungkan empat aksi menjadi satu Vector2 arah.',
    },
    {
      q: 'Benar atau salah: move_and_slide() memakai nilai velocity untuk menggerakkan karakter dan menangani tabrakan.',
      a: ['Benar', 'Salah'],
      c: 0,
      why: 'Itu fungsi utamanya. Mengisi velocity saja tidak menggerakkan apa pun.',
    },
    {
      q: 'CharacterBody2D menampilkan peringatan segitiga kuning. Penyebab paling mungkin?',
      a: ['Belum punya CollisionShape2D dengan shape', 'Nama node terlalu panjang', 'Gambarnya terlalu besar', 'Belum diberi skrip'],
      c: 0,
      why: 'Body fisika membutuhkan bentuk tabrakan agar dapat dipakai.',
    },
    {
      q: 'Node apa yang cocok untuk koin yang mendeteksi saat pemain menyentuhnya?',
      a: ['Area2D', 'StaticBody2D', 'Sprite2D saja', 'Label'],
      c: 0,
      why: 'Area2D mendeteksi benda yang masuk tanpa menahannya, sedangkan StaticBody2D menahan benda.',
    },
    {
      q: 'Mengapa velocity = arah * SPEED * delta lalu move_and_slide() sebaiknya dihindari?',
      a: ['move_and_slide() sudah memperhitungkan delta, sehingga gerakan menjadi terlalu pelan', 'delta tidak boleh dipakai di GDScript', 'SPEED harus negatif', 'Karena Input tidak mendukung Vector2'],
      c: 0,
      why: 'velocity dalam piksel per detik. Mengalikannya dengan delta lagi memperkecil gerakan sekitar 60 kali.',
    },
  ],
  passScore: 4,
  mini: 'Mini project: buat scene Player (CharacterBody2D dengan Sprite2D dan CollisionShape2D) yang bergerak dengan tombol panah, lalu tambah StaticBody2D sebagai dinding dan Area2D sebagai koin.',
  summary: [
    'CharacterBody2D butuh CollisionShape2D agar dapat bertabrakan.',
    'Input.get_vector() menghasilkan arah; velocity = arah * SPEED; move_and_slide() menjalankannya.',
    'move_and_slide() sudah memperhitungkan delta; pakai delta untuk perubahan bertahap seperti gravitasi.',
    'StaticBody2D menahan benda; Area2D mendeteksi benda yang masuk.',
  ],
  indicators: [
    ['read5', 'Membaca seluruh materi Bab 5'],
    ['sim5', 'Menemukan dan memperbaiki tiga bug gerakan'],
    ['quiz5', 'Lulus kuis dengan minimal 4 dari 6 jawaban benar'],
  ],
};
