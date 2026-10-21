// SaveManager: baca/tulis LocalStorage dengan validasi dan versi struktur data.
const KEY = 'godot-adventure-academy:save';
const AUDIO_KEY = 'godot-adventure-academy:audio';
export const SAVE_VERSION = 1;

export const defaultSave = () => ({
  version: SAVE_VERSION,
  name: 'Siswa',
  avatar: 0,
  xp: 0,
  coins: 0,
  crystals: 0,
  location: 'school',
  pos: null,
  flags: {},
  collected: [],
  scores: {},
  badges: [],
  cosmetic: 'none',
  bugs: 0,
  owned: [],
  equip: { hat: '', pet: '', title: 'pemula' },
  daily: { last: '', streak: 0 },
  dq: { date: '', prog: { bugs: 0, coins: 0, rooms: [], quiz: 0, water: 0 }, claimed: {} },
  farm: { plots: Array.from({ length: 8 }, () => ({ c: 0, last: '', n: 0 })), harvests: 0 },
  settings: { audio: true },
});

const num = (v) => (Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0);

// Mengembalikan data bersih atau null jika rusak.
export function validate(raw) {
  if (!raw || typeof raw !== 'object' || typeof raw.version !== 'number') return null;
  const d = defaultSave();
  const isObj = (o) => o && typeof o === 'object' && !Array.isArray(o);
  const strs = (a) => (Array.isArray(a) ? a.filter((s) => typeof s === 'string') : []);
  const flags = {};
  if (isObj(raw.flags)) for (const [k, v] of Object.entries(raw.flags)) if (typeof v === 'boolean') flags[k] = v;
  const scores = {};
  if (isObj(raw.scores)) for (const [k, v] of Object.entries(raw.scores)) scores[k] = num(v);
  return {
    version: SAVE_VERSION, // titik migrasi: ubah struktur lama ke versi terbaru di sini
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim().slice(0, 16) : d.name,
    avatar: raw.avatar === 1 ? 1 : 0,
    xp: num(raw.xp),
    coins: num(raw.coins),
    crystals: num(raw.crystals),
    location: typeof raw.location === 'string' ? raw.location : d.location,
    pos: isObj(raw.pos) && Number.isFinite(raw.pos.x) && Number.isFinite(raw.pos.y) ? { x: raw.pos.x, y: raw.pos.y } : null,
    flags,
    collected: strs(raw.collected),
    scores,
    badges: strs(raw.badges),
    bugs: num(raw.bugs),
    farm: {
      plots: Array.from({ length: 8 }, (_, i) => {
        const p = raw.farm?.plots?.[i];
        return { c: p?.c === 1 ? 1 : 0, last: typeof p?.last === 'string' ? p.last : '', n: Math.min(3, num(p?.n)) };
      }),
      harvests: num(raw.farm?.harvests),
    },
    owned: strs(raw.owned),
    equip: {
      hat: typeof raw.equip?.hat === 'string' ? raw.equip.hat : '',
      pet: typeof raw.equip?.pet === 'string' ? raw.equip.pet : '',
      title: typeof raw.equip?.title === 'string' && raw.equip.title ? raw.equip.title : 'pemula',
    },
    daily: { last: typeof raw.daily?.last === 'string' ? raw.daily.last : '', streak: num(raw.daily?.streak) },
    dq: {
      date: typeof raw.dq?.date === 'string' ? raw.dq.date : '',
      prog: { bugs: num(raw.dq?.prog?.bugs), coins: num(raw.dq?.prog?.coins), quiz: num(raw.dq?.prog?.quiz), water: num(raw.dq?.prog?.water), rooms: strs(raw.dq?.prog?.rooms) },
      claimed: Object.fromEntries(Object.entries(isObj(raw.dq?.claimed) ? raw.dq.claimed : {}).filter(([, v]) => v === true)),
    },
    cosmetic: ['none', 'green', 'orange', 'gold'].includes(raw.cosmetic) ? raw.cosmetic : 'none',
    settings: { audio: !(isObj(raw.settings) && raw.settings.audio === false) },
  };
}

export function load() {
  try {
    const s = localStorage.getItem(KEY);
    return s ? validate(JSON.parse(s)) : null;
  } catch {
    return null; // data rusak atau LocalStorage tidak tersedia
  }
}
export function persist(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}
export const hasSave = () => load() !== null;
export function clearSave() {
  try { localStorage.removeItem(KEY); } catch { /* abaikan */ }
}
export const getAudioPref = () => {
  try { return localStorage.getItem(AUDIO_KEY) !== 'off'; } catch { return true; }
};
export const setAudioPref = (on) => {
  try { localStorage.setItem(AUDIO_KEY, on ? 'on' : 'off'); } catch { /* abaikan */ }
};
