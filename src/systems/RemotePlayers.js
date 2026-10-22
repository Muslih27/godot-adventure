import { OnlineManager } from './OnlineManager.js';
import { sanitizePacket, predictPos, MAX_PEERS } from './netcode.js';
import { state } from './GameState.js';
import { shopItems } from '../data/shop.js';
import { titles, titleUnlocked } from '../data/titles.js';
import { emotes } from '../data/emotes.js';
import { bus } from '../core/bus.js';

const HAT_IDS = shopItems.filter((i) => i.cat === 'hat').map((i) => i.id);
const TAG = { fontFamily: 'Nunito, sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#7ee7ff', align: 'center', stroke: '#06202e', strokeThickness: 3 };

// Menampilkan pemain lain di ruangan yang sama dan mengirim posisi pemain sendiri (hemat paket).
export class RemotePlayers {
  constructor(scene) {
    this.scene = scene;
    this.peers = new Map();
    this.lastSent = -1e9;
    this.wasMoving = false;
    this.last = { vx: 0, vy: 0 };
    this.onChanged = () => this.connect();
    this.onStatus = () => {
      this.label();
      if (OnlineManager.status === 'ok') { OnlineManager.send('hello', { i: OnlineManager.id }); this.sendNow(false); }
    };
    this.hb = setInterval(() => this.sendNow(this.wasMoving), 3000); // tetap hidup walau tab tersembunyi
    bus.on('online:changed', this.onChanged);
    bus.on('online:status', this.onStatus);
    this.connect();
  }

  connect() {
    this.clear();
    OnlineManager.join(this.scene.sys.settings.key, (type, p) => this.onMsg(type, p), this);
    this.label();
  }

  label() {
    const s = OnlineManager.status;
    const text = !OnlineManager.active() ? '' : s === 'ok' ? `Online · ${this.peers.size + 1}` : s === 'error' ? 'Online: gagal' : 'Online: menghubungkan';
    bus.emit('online:label', text);
  }

  onMsg(type, p) {
    if (type === 'pos') {
      const d = sanitizePacket(p, this.scene.W, this.scene.H, HAT_IDS);
      if (!d || d.i === OnlineManager.id) return;
      let peer = this.peers.get(d.i);
      if (!peer) {
        if (this.peers.size >= MAX_PEERS) return;
        peer = this.create(d);
        this.peers.set(d.i, peer);
        this.label();
      }
      peer.data = { ...d, at: Date.now() };
      peer.seen = Date.now();
      this.refresh(peer);
    } else if (type === 'emote') {
      const peer = this.peers.get(typeof p?.i === 'string' ? p.i : '');
      const text = emotes[Number(p?.e)];
      if (peer && text) this.bubble(peer, text);
    } else if (type === 'hello') {
      this.sendNow(this.wasMoving);
    } else if (type === 'bye') {
      this.remove(typeof p?.i === 'string' ? p.i : '');
    }
  }

  create(d) {
    const s = this.scene;
    const sprite = s.add.sprite(d.x, d.y, 'player' + d.a, 'f0').setOrigin(0.5, 1);
    const tag = s.add.text(d.x, d.y - 36, '', TAG).setOrigin(0.5, 1).setDepth(10001);
    return { data: { ...d, at: Date.now() }, seen: Date.now(), sprite, tag, hat: null, hatId: '', bubbleObj: null };
  }

  refresh(peer) {
    const d = peer.data, s = this.scene;
    peer.tag.setText(`${d.n}\n${d.t || 'Murid Baru'}`);
    if (peer.sprite.texture.key !== 'player' + d.a) peer.sprite.setTexture('player' + d.a, 'f0');
    if (d.h !== peer.hatId) {
      if (peer.hat) peer.hat.destroy();
      peer.hat = d.h ? s.add.image(0, 0, shopItems.find((i) => i.id === d.h).tex).setOrigin(0.5, 1) : null;
      peer.hatId = d.h;
    }
  }

  bubble(peer, text) {
    if (peer.bubbleObj) peer.bubbleObj.destroy();
    const b = this.scene.add.text(peer.sprite.x, peer.sprite.y - 62, text, { fontFamily: 'Nunito, sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#06202e', backgroundColor: '#e6fbff', padding: { x: 7, y: 4 } }).setOrigin(0.5, 1).setDepth(10002);
    peer.bubbleObj = b;
    this.scene.time.delayedCall(2200, () => { if (peer.bubbleObj === b) { b.destroy(); peer.bubbleObj = null; } });
  }

  remove(id) {
    const p = this.peers.get(id);
    if (!p) return;
    p.sprite.destroy(); p.tag.destroy();
    if (p.hat) p.hat.destroy();
    if (p.bubbleObj) p.bubbleObj.destroy();
    this.peers.delete(id);
    this.label();
  }

  clear() { [...this.peers.keys()].forEach((id) => this.remove(id)); }

  update(time) {
    const now = Date.now(), { W, H } = this.scene;
    for (const [id, p] of this.peers) {
      if (now - p.seen > 12000) { this.remove(id); continue; }
      const pr = predictPos(p.data, now, W, H);
      const sp = p.sprite;
      sp.x += (pr.x - sp.x) * 0.2;
      sp.y += (pr.y - sp.y) * 0.2;
      const moving = !!p.data.m && now - p.data.at < 1200;
      sp.play((moving ? 'walk' : 'idle') + p.data.a, true).setFlipX(!!p.data.f).setDepth(sp.y);
      const up = p.hat ? 12 : 0;
      p.tag.setPosition(sp.x, sp.y - 36 - up);
      if (p.hat) p.hat.setPosition(sp.x, sp.y - 27).setFlipX(!!p.data.f).setDepth(sp.y + 1);
      if (p.bubbleObj) p.bubbleObj.setPosition(sp.x, sp.y - 62 - up);
    }
    this.broadcastSelf(time);
  }

  // Kirim paket jarang: bergerak 2x per detik, diam hanya detak jantung tiap 4 detik.
  broadcastSelf(time) {
    if (!OnlineManager.active() || !OnlineManager.ready) return;
    const v = this.scene.player.body.velocity;
    const moving = Math.hypot(v.x, v.y) > 5;
    const dirChanged = Math.abs(v.x - this.last.vx) > 30 || Math.abs(v.y - this.last.vy) > 30;
    const since = time - this.lastSent;
    const stopped = this.wasMoving && !moving;
    const send = stopped || (moving ? since > 500 || (dirChanged && since > 200) : since > 4000);
    this.wasMoving = moving;
    if (send) { this.lastSent = time; this.sendNow(moving); }
  }

  sendNow(moving) {
    const pl = this.scene.player;
    if (!OnlineManager.active() || !OnlineManager.ready || !pl || !pl.body) return;
    const v = pl.body.velocity;
    this.last = { vx: v.x, vy: v.y };
    const eq = state.data.equip;
    const title = titles.find((x) => x.id === eq.title && titleUnlocked(x, state.data.flags)) || titles[0];
    OnlineManager.send('pos', {
      i: OnlineManager.id, n: state.data.name, a: state.data.avatar,
      h: eq.hat && state.data.owned.includes(eq.hat) ? eq.hat : '', t: title.name,
      x: Math.round(pl.x), y: Math.round(pl.y), vx: Math.round(v.x), vy: Math.round(v.y),
      f: pl.flipX ? 1 : 0, m: moving ? 1 : 0,
    });
  }

  sendEmote(i) { OnlineManager.send('emote', { i: OnlineManager.id, e: i }); }

  destroy() {
    bus.off('online:changed', this.onChanged);
    bus.off('online:status', this.onStatus);
    clearInterval(this.hb);
    OnlineManager.send('bye', { i: OnlineManager.id });
    this.clear();
    OnlineManager.leave(this);
    bus.emit('online:label', '');
  }
}
