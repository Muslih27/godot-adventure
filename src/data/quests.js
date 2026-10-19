// Data quest terpisah dari logika agar guru mudah memperbarui.
// Setiap quest punya kondisi selesai yang nyata, dihitung dari state pemain.
const coinsFound = (s) => s.collected.filter((id) => /^c[123]$/.test(id)).length;

export const quests = [
  {
    id: 'q_meet', type: 'Utama', title: 'Temui Profesor Pixel',
    desc: 'Sistem sekolah rusak. Cari Profesor Pixel di halaman sekolah.',
    done: (s) => !!s.flags.met,
    reward: { xp: 10 },
  },
  {
    id: 'q_ch1', type: 'Utama', title: 'Misi Bab 1: Dasar Pengembangan Gim',
    desc: 'Pulihkan Godot Crystal pertama dengan menguasai dasar pengembangan gim.',
    requires: 'q_meet',
    steps: [
      { t: 'Baca materi Bab 1', done: (s) => !!s.flags.read },
      { t: 'Selesaikan simulasi Game Loop', done: (s) => !!s.flags.sim },
      { t: 'Lulus kuis (minimal 3 dari 5 benar)', done: (s) => !!s.flags.quiz },
    ],
    done: (s) => !!(s.flags.read && s.flags.sim && s.flags.quiz),
    reward: { xp: 50, coins: 20, crystals: 1 },
  },
  {
    id: 'q_class', type: 'Utama', title: 'Masuki Ruang Kelas',
    desc: 'Pintu Ruang Kelas sudah terbuka. Masuk dan temui Kak Syntax.',
    requires: 'q_ch1',
    done: (s) => !!s.flags.classroom,
    reward: { xp: 10 },
  },
  {
    id: 'q_ch2', type: 'Utama', title: 'Misi Bab 2: Mengenal Godot Editor',
    desc: 'Pulihkan Godot Crystal kedua dengan memahami Scene, Node, dan antarmuka editor.',
    requires: 'q_class',
    steps: [
      { t: 'Baca materi Bab 2', done: (s) => !!s.flags.read2 },
      { t: 'Selesaikan simulasi pasangan Node', done: (s) => !!s.flags.sim2 },
      { t: 'Lulus kuis (minimal 4 dari 6 benar)', done: (s) => !!s.flags.quiz2 },
    ],
    done: (s) => !!(s.flags.read2 && s.flags.sim2 && s.flags.quiz2),
    reward: { xp: 60, coins: 25, crystals: 1 },
  },
  {
    id: 'q_coins', type: 'Sampingan', title: 'Koin Berserakan',
    desc: 'Temukan 3 Koin Akademi yang tersebar di halaman sekolah.',
    progress: (s) => `${coinsFound(s)}/3 koin`,
    done: (s) => coinsFound(s) >= 3,
    reward: { xp: 20, coins: 10 },
  },
];
