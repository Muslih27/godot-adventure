// Toko Akademi: dibeli dengan Koin Akademi (hasil bermain, bukan uang sungguhan). Hanya kosmetik.
export const shopItems = [
  { id: 'hat_blue', cat: 'hat', name: 'Topi Biru', price: 30, tex: 'hat_blue' },
  { id: 'hat_orange', cat: 'hat', name: 'Topi Oranye', price: 50, tex: 'hat_orange' },
  { id: 'hat_crown', cat: 'hat', name: 'Mahkota Emas', price: 150, tex: 'hat_crown' },
  { id: 'pet_slime', cat: 'pet', name: 'Slime Hijau', price: 60, tex: 'pet_slime' },
  { id: 'pet_robo', cat: 'pet', name: 'Robo Mini', price: 100, tex: 'pet_robo' },
  { id: 'pet_cat', cat: 'pet', name: 'Kucing Piksel', price: 140, tex: 'pet_cat' },
  // Barang rahasia: gratis, tetapi hanya terbuka lewat tantangan di Ruang Rahasia.
  { id: 'hat_wizard', cat: 'hat', name: 'Topi Penyihir Kode', price: 0, tex: 'hat_wizard', req: { flag: 'kilatTop', hint: 'skor 7 atau lebih di Tantangan Kilat (Ruang Rahasia)' } },
  { id: 'pet_dragon', cat: 'pet', name: 'Naga Mini', price: 0, tex: 'pet_dragon', req: { flag: 'ach_shards', hint: 'kumpulkan 5 pecahan kristal di Ruang Rahasia' } },
];
