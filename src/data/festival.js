// Festival mingguan: tema bergilir tiap pekan (4 tema), dihitung dari tanggal perangkat tanpa server.
export const THEMES = [
  { id: 'panen', name: 'Pekan Panen', mod: 'Setiap panen memberi +10 koin tambahan.', goal: { key: 'harvest', n: 3, text: 'Panen 3 tanaman' } },
  { id: 'bug', name: 'Pekan Pembasmi', mod: 'Setiap bug yang dikalahkan memberi +1 koin tambahan.', goal: { key: 'bug', n: 15, text: 'Kalahkan 15 bug' } },
  { id: 'kilat', name: 'Pekan Kilat', mod: 'Koin harian Tantangan Kilat dilipatgandakan.', goal: { key: 'blitz', n: 3, text: 'Selesaikan Tantangan Kilat 3 kali' } },
  { id: 'teman', name: 'Pekan Sahabat', mod: 'Setiap hadiah untuk mentor memberi +10 koin tambahan.', goal: { key: 'gift', n: 3, text: 'Beri hadiah kepada mentor 3 kali' } },
];
export const REWARD = { coins: 50 };

const EPOCH = new Date(2024, 0, 1); // Senin
export const dayIndex = (d = new Date()) => Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - EPOCH) / 86400000);

export function festivalNow(d = new Date()) {
  const day = dayIndex(d);
  const week = Math.floor(day / 7);
  return { week, daysLeft: 7 - (((day % 7) + 7) % 7), theme: THEMES[((week % 4) + 4) % 4] };
}
// Tambahan koin dari tema pekan ini.
export function festBonus(kind) {
  const id = festivalNow().theme.id;
  if (kind === 'harvest' && id === 'panen') return 10;
  if (kind === 'bug' && id === 'bug') return 1;
  if (kind === 'gift' && id === 'teman') return 10;
  return 0;
}
export const blitzMultiplier = () => (festivalNow().theme.id === 'kilat' ? 2 : 1);
