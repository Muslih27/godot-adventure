// OnlineManager: koneksi multiplayer. Server online (Supabase Realtime Broadcast) jika dikonfigurasi,
// jika tidak memakai mode uji lokal (BroadcastChannel: hanya antar tab pada perangkat yang sama).
import { bus } from '../core/bus.js';
import { normalizeCode, validCode } from './netcode.js';

const URL = import.meta.env?.VITE_SUPABASE_URL;
const KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY;
const SKEY = 'gaa.online';
const genId = () => (globalThis.crypto?.randomUUID ? crypto.randomUUID() : 'p' + Math.random().toString(36).slice(2) + Date.now().toString(36)).slice(0, 36);

function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem(SKEY) || '{}');
    return { on: s.on === true, code: normalizeCode(s.code) };
  } catch { return { on: false, code: '' }; }
}

let rt = null; // klien realtime, dibuat saat pertama dibutuhkan
async function cloudTransport(name, onMsg, onStatus) {
  if (!rt) {
    const { RealtimeClient } = await import('@supabase/realtime-js');
    rt = new RealtimeClient(URL.replace(/^http/, 'ws').replace(/\/$/, '') + '/realtime/v1', { params: { apikey: KEY, eventsPerSecond: 10 } });
  }
  const ch = rt.channel(name, { config: { broadcast: { self: false, ack: false } } });
  ['pos', 'emote', 'bye'].forEach((ev) => ch.on('broadcast', { event: ev }, (m) => onMsg(ev, m?.payload)));
  ch.subscribe((status) => onStatus(status));
  return {
    send: (event, payload) => { const p = ch.send({ type: 'broadcast', event, payload }); p?.catch?.(() => {}); },
    close: () => { try { rt.removeChannel(ch); } catch { /* abaikan */ } },
  };
}
function localTransport(name, onMsg) {
  const bc = new BroadcastChannel(name);
  bc.onmessage = (e) => onMsg(e.data?.event, e.data?.payload);
  return { send: (event, payload) => bc.postMessage({ event, payload }), close: () => bc.close() };
}

export const OnlineManager = {
  id: genId(),
  hasCloud: !!(URL && KEY),
  settings: loadSettings(),
  status: 'off', // off | connecting | ok | error
  token: 0, t: null, ready: false, owner: null,

  active() { return this.settings.on && validCode(this.settings.code); },
  setSettings(patch) {
    this.settings = { on: patch.on ?? this.settings.on, code: normalizeCode(patch.code ?? this.settings.code) };
    try { localStorage.setItem(SKEY, JSON.stringify(this.settings)); } catch { /* abaikan */ }
    bus.emit('online:changed');
  },
  setStatus(s) { this.status = s; bus.emit('online:status', s); },

  async join(room, onMsg, owner) {
    this.leave();
    this.owner = owner;
    if (!this.active()) { this.setStatus('off'); return; }
    const token = ++this.token;
    const name = `gaa:${this.settings.code}:${room}`;
    this.setStatus('connecting');
    try {
      const status = (s) => {
        if (token !== this.token) return;
        if (s === 'SUBSCRIBED') { this.ready = true; this.setStatus('ok'); }
        else if (['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED'].includes(s)) { this.ready = false; this.setStatus('error'); }
      };
      const t = this.hasCloud ? await cloudTransport(name, onMsg, status) : localTransport(name, onMsg);
      if (token !== this.token) { t.close(); return; }
      this.t = t;
      if (!this.hasCloud) status('SUBSCRIBED');
    } catch { if (token === this.token) this.setStatus('error'); }
  },
  send(event, payload) { if (this.t && this.ready) this.t.send(event, payload); },
  // Jika owner diberikan, hanya pemilik koneksi yang boleh menutupnya.
  leave(owner) {
    if (owner && this.owner !== owner) return;
    this.token++;
    this.ready = false;
    if (this.t) { this.t.close(); this.t = null; }
  },
};
