// UIManager: lapisan HTML (menu, HUD, dialog, panel) yang berkomunikasi dengan Phaser lewat bus.
import { $, esc } from '../core/util.js';
import { bus } from '../core/bus.js';
import { state } from './GameState.js';
import { QuestManager } from './QuestManager.js';
import { AudioManager as A } from './AudioManager.js';
import { hasSave, setAudioPref } from './SaveManager.js';
import { portraits } from '../assets/textures.js';
import { openQuestLog, openMap, openProgress, openPause } from '../ui/panels.js';

class UIManager {
  constructor() {
    this.root = document.getElementById('ui');
    this.modals = [];
    this.dlg = null;
    this.cool = 0;
    this.touch = { x: 0, y: 0 };
    this.touchAct = false;
    this.inGame = false;
    this.callbacks = {};
    this.root.append(
      (this.screenEl = $('<div class="screen hidden"></div>')),
      (this.hudEl = $('<div class="hud hidden"></div>')),
      (this.dialogEl = $('<div class="dialog hidden"></div>')),
      (this.modalLayer = $('<div class="modal-layer"></div>')),
      (this.toastEl = $('<div class="toasts"></div>')),
    );
    this.buildHud();
    this.buildTouch();
    window.addEventListener('keydown', (e) => this.onKey(e));
    bus.on('state', () => this.refreshHud());
    bus.on('levelup', (lv) => { A.sfx('levelup'); this.toast(`Naik ke Level ${lv}!`, 'good'); });
    bus.on('quest:complete', (q) => {
      A.sfx('quest');
      this.toast(`Quest selesai: ${q.title}`, 'good');
      const r = q.reward || {};
      this.openModal({ title: 'Misi selesai!' }).body.append($(`<div class="reward">
        <div class="burst"></div><h3>${esc(q.title)}</h3>
        <p>${r.xp ? `+${r.xp} XP ` : ''}${r.coins ? `+${r.coins} Koin ` : ''}${r.crystals ? `+${r.crystals} Godot Crystal` : ''}</p></div>`));
    });
  }

  get blocked() {
    return !!this.dlg || this.modals.length > 0 || performance.now() < this.cool || !this.screenEl.classList.contains('hidden');
  }

  /* ---------- Layar utama ---------- */
  showTitle({ onNew, onContinue }) {
    this.inGame = false;
    this.showHud(false);
    this.callbacks = { onNew, onContinue };
    const s = this.screenEl;
    s.classList.remove('hidden');
    s.innerHTML = `<div class="title-card">
      <h1>Godot Adventure Academy</h1>
      <p class="tag">Jelajahi Sekolah, Kuasai Godot, Ciptakan Gim Impianmu!</p>
      <div class="menu">
        <button class="btn primary" data-a="new">New Game</button>
        <button class="btn" data-a="cont" ${hasSave() ? '' : 'disabled title="Belum ada progres tersimpan"'}>Continue</button>
        <button class="btn" data-a="set">Pengaturan</button>
        <button class="btn" data-a="credit">Credit</button>
      </div></div>`;
    s.onclick = (e) => {
      const a = e.target.closest('button')?.dataset.a;
      if (!a) return;
      A.unlock(); A.sfx('click');
      if (a === 'new') this.showCharacterSelect();
      if (a === 'cont') this.start(() => onContinue());
      if (a === 'set') this.showSettings(() => this.showTitle(this.callbacks));
      if (a === 'credit') this.showCredit();
    };
  }
  start(fn) { this.screenEl.classList.add('hidden'); this.screenEl.innerHTML = ''; fn(); }
  showCharacterSelect() {
    const s = this.screenEl;
    const overwrite = hasSave();
    s.innerHTML = `<div class="title-card"><h2>Pilih karakter</h2>
      <div class="avatars">${[0, 1].map((i) => `<label class="avatar"><input type="radio" name="av" value="${i}" ${i === 0 ? 'checked' : ''}><img src="${portraits['player' + i]}" alt="Karakter ${i + 1}"><span>Karakter ${i + 1}</span></label>`).join('')}</div>
      <label class="field">Nama panggilan<input id="pname" maxlength="16" value="Siswa" autocomplete="off"></label>
      ${overwrite ? '<p class="warn">Progres lama akan dihapus jika kamu memulai game baru.</p>' : ''}
      <div class="menu"><button class="btn primary" data-a="go">Mulai petualangan</button><button class="btn" data-a="back">Kembali</button></div></div>`;
    s.onclick = (e) => {
      const a = e.target.closest('button')?.dataset.a;
      if (a === 'back') this.showTitle(this.callbacks);
      if (a === 'go') {
        if (overwrite && !confirm('Mulai game baru? Progres lama akan terhapus.')) return;
        const name = s.querySelector('#pname').value.trim() || 'Siswa';
        const av = Number(s.querySelector('input[name=av]:checked').value);
        A.sfx('ok');
        this.start(() => this.callbacks.onNew(name, av));
      }
    };
  }
  showSettings(back) {
    const s = this.screenEl;
    const draw = () => {
      s.innerHTML = `<div class="title-card"><h2>Pengaturan</h2>
        <button class="btn" data-a="aud">Musik &amp; efek suara: ${A.enabled ? 'Menyala' : 'Mati'}</button>
        <div class="menu"><button class="btn primary" data-a="back">Kembali</button></div></div>`;
    };
    draw();
    s.onclick = (e) => {
      const a = e.target.closest('button')?.dataset.a;
      if (a === 'aud') { this.setAudio(!A.enabled); draw(); }
      if (a === 'back') back();
    };
  }
  showCredit() {
    const s = this.screenEl;
    s.innerHTML = `<div class="title-card"><h2>Credit</h2>
      <p class="credit">Dibuat dengan Phaser 3 dan Vite. Seluruh grafis dan suara dihasilkan lewat kode (tanpa aset pihak ketiga).<br>
      Materi mengacu pada dokumentasi Godot Engine 4.x. Game ini adalah simulasi edukasi, bukan Godot Engine.</p>
      <div class="menu"><button class="btn primary" data-a="back">Kembali</button></div></div>`;
    s.onclick = (e) => { if (e.target.closest('button')) this.showTitle(this.callbacks); };
  }
  setAudio(on) {
    A.setEnabled(on);
    setAudioPref(on);
    state.data.settings.audio = on;
    if (on) A.startMusic();
  }

  /* ---------- HUD ---------- */
  buildHud() {
    this.hudEl.innerHTML = `
      <div class="hud-top">
        <div class="hud-player"><b id="hn"></b><span id="hl"></span><div class="xp"><i id="hx"></i></div></div>
        <div class="hud-res"><span><i class="ico coin"></i><b id="hc">0</b></span><span><i class="ico crystal"></i><b id="hcr">0</b></span></div>
        <div class="hud-btns">
          <button data-a="quest">Quest</button><button data-a="map">Peta</button>
          <button data-a="learn">Materi</button><button data-a="pause">Jeda</button>
        </div>
      </div>
      <div class="questbox" id="hq"></div>
      <canvas id="mm" width="120" height="80" aria-label="Minimap"></canvas>`;
    this.hudEl.addEventListener('click', (e) => {
      const a = e.target.closest('button')?.dataset.a;
      if (!a || this.blocked) return;
      A.sfx('click');
      this.action(a);
    });
    this.mm = this.hudEl.querySelector('#mm').getContext('2d');
  }
  action(a) {
    if (a === 'quest') openQuestLog(this);
    if (a === 'map') openMap(this);
    if (a === 'learn') openProgress(this);
    if (a === 'pause') openPause(this);
  }
  showHud(on) { this.hudEl.classList.toggle('hidden', !on); this.inGame = on; if (on) this.refreshHud(); this.touchEl.classList.toggle('hidden', !on); }
  refreshHud() {
    const d = state.data, q = (id) => this.hudEl.querySelector(id);
    q('#hn').textContent = d.name;
    q('#hl').textContent = ` Lv ${state.level}`;
    q('#hx').style.width = state.xpInLevel + '%';
    q('#hc').textContent = d.coins;
    q('#hcr').textContent = d.crystals;
    const aq = QuestManager.active();
    const side = QuestManager.all().find((x) => x.type === 'Sampingan' && !QuestManager.isDone(x));
    q('#hq').innerHTML = (aq ? `<b>${esc(aq.title)}</b><span>${esc(aq.steps ? aq.steps.find((s) => !s.done(d))?.t || '' : aq.desc)}</span>` : '<b>Semua quest yang tersedia sudah selesai</b>')
      + (side ? `<small>${esc(side.title)}: ${side.progress(d)}</small>` : '');
  }
  drawMinimap(px, py, W, H, bg) {
    const c = this.mm, k = Math.min(120 / W, 80 / H);
    c.fillStyle = '#000'; c.fillRect(0, 0, 120, 80);
    c.save(); c.translate((120 - W * k) / 2, (80 - H * k) / 2);
    if (bg) bg(c, k);
    c.fillStyle = '#fff'; c.fillRect(px * k - 2, py * k - 2, 4, 4);
    c.restore();
  }

  /* ---------- Kontrol sentuh ---------- */
  buildTouch() {
    this.touchEl = $(`<div class="touch hidden">
      <div class="dpad"><button data-d="0,-1" class="u">▲</button><button data-d="-1,0" class="l">◀</button><button data-d="1,0" class="r">▶</button><button data-d="0,1" class="d">▼</button></div>
      <button class="act">E</button></div>`);
    this.root.append(this.touchEl);
    const set = (v) => { this.touch = v; };
    this.touchEl.querySelectorAll('[data-d]').forEach((b) => {
      const [x, y] = b.dataset.d.split(',').map(Number);
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); set({ x, y }); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => b.addEventListener(ev, () => set({ x: 0, y: 0 })));
    });
    this.touchEl.querySelector('.act').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (this.dlg) this.advance(); else this.touchAct = true;
    });
  }

  /* ---------- Keyboard UI ---------- */
  onKey(e) {
    if (e.target.matches('input, textarea')) return; // jangan ganggu pengetikan
    if (this.dlg) {
      if (['e', 'E', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); this.advance(); }
      else if (e.key === 'Escape') this.closeDialog(null);
      return;
    }
    if (e.key === 'Escape') {
      if (this.modals.length) this.modals[this.modals.length - 1].close();
      else if (this.inGame && this.screenEl.classList.contains('hidden')) openPause(this);
    }
  }

  /* ---------- Dialog ---------- */
  dialog({ who, pages, choices = [] }) {
    return new Promise((resolve) => {
      this.dlg = { who, pages, choices, i: 0, resolve, done: false };
      this.dialogEl.classList.remove('hidden');
      this.dialogEl.innerHTML = `<img class="av" src="${portraits[who.portrait] || ''}" alt=""><div class="box">
        <div class="nm">${esc(who.name)}</div><p class="tx"></p><div class="ch"></div>
        <span class="hint">E / Spasi / klik: lanjut</span></div>`;
      this.dialogEl.onclick = (e) => {
        const b = e.target.closest('button[data-i]');
        if (b) { A.sfx('click'); this.closeDialog(Number(b.dataset.i)); } else this.advance();
      };
      this.type();
    });
  }
  type() {
    const d = this.dlg, tx = this.dialogEl.querySelector('.tx'), ch = this.dialogEl.querySelector('.ch');
    clearInterval(d.timer);
    d.done = false; d.n = 0; ch.innerHTML = '';
    const full = d.pages[d.i];
    d.timer = setInterval(() => {
      d.n += 2; tx.textContent = full.slice(0, d.n);
      if (d.n >= full.length) this.finishTyping();
    }, 16);
  }
  finishTyping() {
    const d = this.dlg; if (!d) return;
    clearInterval(d.timer); d.done = true;
    this.dialogEl.querySelector('.tx').textContent = d.pages[d.i];
    if (d.i === d.pages.length - 1 && d.choices.length) {
      this.dialogEl.querySelector('.ch').innerHTML = d.choices.map((c, i) => `<button class="btn" data-i="${i}">${esc(c)}</button>`).join('');
    }
  }
  advance() {
    const d = this.dlg; if (!d) return;
    if (!d.done) return this.finishTyping();
    if (d.i < d.pages.length - 1) { d.i++; this.type(); A.sfx('click'); }
    else if (!d.choices.length) this.closeDialog(null);
  }
  closeDialog(val) {
    const d = this.dlg; if (!d) return;
    clearInterval(d.timer);
    this.dlg = null;
    this.cool = performance.now() + 250;
    this.dialogEl.classList.add('hidden');
    d.resolve(val);
  }

  /* ---------- Modal & toast ---------- */
  openModal({ title, closable = true, wide = false }) {
    const el = $(`<div class="modal-back"><div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-label="${esc(title)}">
      <header><h2>${esc(title)}</h2>${closable ? '<button class="x" aria-label="Tutup">×</button>' : ''}</header><div class="body"></div></div></div>`);
    this.modalLayer.append(el);
    let resolveClosed;
    const closed = new Promise((r) => (resolveClosed = r));
    const m = {
      el, body: el.querySelector('.body'), closed,
      setTitle: (t) => (el.querySelector('h2').textContent = t),
      close: () => {
        if (!this.modals.includes(m)) return;
        this.modals.splice(this.modals.indexOf(m), 1);
        el.remove();
        this.cool = performance.now() + 250;
        resolveClosed();
      },
    };
    el.querySelector('.x')?.addEventListener('click', () => { A.sfx('click'); m.close(); });
    this.modals.push(m);
    return m;
  }
  toast(msg, kind = '') {
    const t = $(`<div class="toast ${kind}">${esc(msg)}</div>`);
    this.toastEl.append(t);
    setTimeout(() => t.remove(), 3200);
  }
}
export const ui = new UIManager();
