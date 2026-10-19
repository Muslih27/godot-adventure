// Data quest terpisah dari logika agar guru mudah memperbarui.
// Setiap quest punya kondisi selesai yang nyata, dihitung dari state pemain.
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
    id: 'q_coins', type: 'Sampingan', title: 'Koin Berserakan',
    desc: 'Temukan 3 Koin Akademi yang tersebar di halaman sekolah.',
    progress: (s) => `${Math.min(s.collected.length, 3)}/3 koin`,
    done: (s) => s.collected.length >= 3,
    reward: { xp: 20, coins: 10 },
  },
];
