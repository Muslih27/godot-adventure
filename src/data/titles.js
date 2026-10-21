// Gelar di bawah nama pemain. Dibuka lewat prestasi (gratis, tidak dibeli).
export const titles = [
  { id: 'pemula', name: 'Murid Baru', hint: 'Gelar awal' },
  { id: 'penjelajah', name: 'Penjelajah', ach: 'rooms', hint: 'Kunjungi semua ruangan' },
  { id: 'pembasmi', name: 'Pembasmi Bug', ach: 'bug10', hint: 'Kalahkan 10 bug' },
  { id: 'pemburu', name: 'Pemburu Harta', ach: 'coinall', hint: 'Temukan semua koin tersembunyi' },
  { id: 'master', name: 'Master Kristal', ach: 'cr6', hint: 'Kumpulkan 6 Godot Crystal' },
  { id: 'petani', name: 'Petani Kode', ach: 'harvest5', hint: 'Panen 5 tanaman di Kebun Akademi' },
  { id: 'lulusan', name: 'Lulusan Akademi', ach: 'graduate', hint: 'Lulus Ujian Akhir' },
];
export const titleUnlocked = (t, flags) => !t.ach || !!flags['ach_' + t.ach];
