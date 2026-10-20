import { chapters } from './chapters.js';

export const COIN_IDS = ['c1', 'c2', 'c3', 'k1', 'k2', 'l1', 'l2', 'p1', 'p2', 'a1', 'a2', 'n1', 'n2', 'b1', 'b2', 't1', 't2', 'i1', 'i2', 'o1', 'o2', 'v1', 'v2', 'x1', 'x2'];
const ROOM_FLAGS = ['classroom', 'lab', 'codeRoom', 'arena', 'animRoom', 'libRoom', 'levelRoom', 'aiRoom', 'audioRoom', 'serverRoom', 'testRoom'];

// Setiap prestasi punya syarat nyata yang dihitung dari data pemain.
export const achievements = [
  { id: 'first', title: 'Langkah Pertama', desc: 'Temui Profesor Pixel.', test: (s) => !!s.flags.met },
  { id: 'coin3', title: 'Pengumpul Koin', desc: 'Temukan 3 Koin Akademi.', test: (s) => s.collected.length >= 3 },
  { id: 'coinall', title: 'Pemburu Harta', desc: `Temukan semua ${COIN_IDS.length} koin tersembunyi.`, test: (s) => COIN_IDS.every((id) => s.collected.includes(id)) },
  { id: 'rooms', title: 'Penjelajah Akademi', desc: 'Kunjungi semua ruangan yang tersedia.', test: (s) => ROOM_FLAGS.every((r) => s.flags[r]) },
  ...chapters.map((c) => ({
    id: 'ch' + c.id, title: `Lulus Bab ${c.id}`, desc: `Lulus kuis Bab ${c.id}: ${c.title}.`, test: (s) => !!s.flags[c.keys.quiz],
  })),
  { id: 'perfect', title: 'Nilai Sempurna', desc: 'Jawab semua soal kuis sebuah bab dengan benar.', test: (s) => chapters.some((c) => s.scores['ch' + c.id] === c.quiz.length) },
  { id: 'lv5', title: 'Siswa Teladan', desc: 'Capai Level 5.', test: (s) => s.xp >= 400 },
  { id: 'cr3', title: 'Penjaga Kristal', desc: 'Kumpulkan 3 Godot Crystal.', test: (s) => s.crystals >= 3 },
  { id: 'cr6', title: 'Master Kristal', desc: 'Kumpulkan 6 Godot Crystal.', test: (s) => s.crystals >= 6 },
];
