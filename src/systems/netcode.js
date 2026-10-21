// Fungsi murni untuk multiplayer: validasi data dari pemain lain dan prediksi gerak.
export const MAX_PEERS = 8; // batas pemain lain yang ditampilkan (hemat kuota pesan)

export const normalizeCode = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
export const validCode = (c) => typeof c === 'string' && c.length >= 3 && c.length <= 12;
export const cleanText = (s, n) => String(s ?? '').replace(/[^\p{L}\p{N} _.\-]/gu, '').trim().slice(0, n);

const clamp = (v, lo, hi) => (Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : null);

// Data dari jaringan tidak dipercaya: bersihkan dan batasi nilainya.
export function sanitizePacket(p, W, H, hatIds) {
  if (!p || typeof p !== 'object') return null;
  const x = clamp(p.x, 0, W), y = clamp(p.y, 0, H);
  if (typeof p.i !== 'string' || p.i.length < 4 || p.i.length > 40 || x === null || y === null) return null;
  return {
    i: p.i,
    n: cleanText(p.n, 16) || 'Siswa',
    t: cleanText(p.t, 20),
    a: p.a === 1 ? 1 : 0,
    h: hatIds.includes(p.h) ? p.h : '',
    x, y,
    vx: clamp(p.vx, -200, 200) ?? 0,
    vy: clamp(p.vy, -200, 200) ?? 0,
    f: p.f ? 1 : 0,
    m: p.m ? 1 : 0,
  };
}

// Dead reckoning: perkirakan posisi sekarang dari paket terakhir (paket jarang, gerak tetap halus).
export function predictPos(d, now, W, H) {
  const dt = Math.min(0.6, Math.max(0, (now - d.at) / 1000));
  return { x: clamp(d.x + d.vx * dt, 0, W), y: clamp(d.y + d.vy * dt, 0, H) };
}
