// Persahabatan dengan mentor (terinspirasi Harvest Moon): beri Buah Kristal hasil panen, maksimal 1 per mentor per hari.
import { state } from './GameState.js';
import { dateKey } from './DailyManager.js';
import { AudioManager as A } from './AudioManager.js';
import { mentorById, HEARTS_MAX } from '../data/mentors.js';

// Jalankan percakapan mentor seperti biasa, lalu tawarkan hadiah jika pemain punya Buah Kristal.
export async function talk(ui, id, fn) {
  await fn(ui);
  await offerGift(ui, id);
}

async function offerGift(ui, id) {
  const m = mentorById(id);
  if (!m) return;
  const f = state.data.friends[id] || { h: 0, last: '' };
  const day = dateKey();
  if (state.data.items.fruit < 1 || f.last === day || f.h >= HEARTS_MAX) return;
  const who = { name: m.name, portrait: m.portrait };
  const c = await ui.dialog({
    who,
    pages: [`Kamu membawa Buah Kristal dari Kebun Akademi. Mau memberikannya kepada ${m.name}? Persahabatan saat ini: ${f.h}/${HEARTS_MAX}.`],
    choices: ['Beri hadiah', 'Tidak sekarang'],
  });
  if (c !== 0) return;
  const h = state.giveGift(id, day);
  if (h < 0) return;
  A.sfx('ok');
  const pages = [`${m.name} senang sekali menerima Buah Kristal! Persahabatan naik menjadi ${h}/${HEARTS_MAX}.`];
  if (h === 1) pages.push(`Tips belajar: ${m.tip}`);
  if (h === 3) pages.push(m.story);
  if (h === HEARTS_MAX) {
    state.addCoins(30);
    pages.push('Terima kasih sudah menjadi sahabat baikku. Ini hadiah kecil dariku: 30 koin.');
  }
  await ui.dialog({ who, pages });
}
