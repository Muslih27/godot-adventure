// UIManager: lapisan HTML (menu, HUD, dialog, panel) yang berkomunikasi dengan Phaser lewat bus.
import { $, esc } from '../core/util.js';
import { bus } from '../core/bus.js';
import { state } from './GameState.js';
import { QuestManager } from './QuestManager.js';
import { AudioManager as A } from './AudioManager.js';
import { hasSave, setAudioPref } from './SaveManager.js';
import { portraits } from '../assets/textures.js';
import { PlayerStatus } from './PlayerStatus.js';
import { openQuestLog, openMap, openProgress, openPause } from '../ui/panels.js';
import { openProfile, openJournal } from '../ui/profile.js';
import { openShop } from '../ui/shop.js';
import { openDaily } from '../ui/daily.js';
import { DailyManager } from './DailyManager.js';
import { emotes } from '../data/emotes.js';

class UIManager {
  constructor() {
    this.root = document.getElementById('ui');
    this.modals = [];
    this.dlg = null;
    this.syncClasses();
    this.cool = 0;
    this.touch = { x: 0, y: 0 };
    this.touchAct = false;
    this.touchAttack = false;
    this.touchRun = false;
    this.touchMode = 'auto';
    this.isTouch = window.matchMedia('(pointer: coarse)').matches;
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
    this.initTouchMode();
    this.buildRotateHint();
    window.addEventListener('keydown', (e) => this.onKey(e));
    bus.on('state', () => this.refreshHud());
    bus.on('hp', () => this.refreshHearts());
    bus.on('levelup', (lv) => { A.sfx('levelup'); this.toast(`Naik ke Level ${lv}!`, 'good'); });
    bus.on('achievement', (list) => {
      A.sfx('quest');
      if (list.length > 3) this.toast(`${list.length} prestasi baru terbuka! Lihat di Profil.`, 'good');
      else list.forEach((a) => this.toast(`Prestasi: ${a.title}`, 'good'));
    });
    bus.on('quest:complete', (q) => {
      A.sfx('quest');
      const r = q.reward || {};
      const parts = [r.xp ? `+${r.xp} XP` : '', r.coins ? `+${r.coins} koin` : '', r.crystals ? `+${r.crystals} Godot Crystal` : ''].filter(Boolean).join('  ');
      const t = $(`<div class="toast quest-banner"><b>Misi selesai!</b><span>${esc(q.title)}</span><small>${esc(parts)}</small></div>`);
      this.toastEl.append(t);
      setTimeout(() => t.remove(), 5200);
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
        <button class="btn" data-a="touch">Kontrol layar sentuh: ${this.touchMode === 'always' ? 'Selalu tampil' : 'Otomatis'}</button>
        <div class="menu"><button class="btn primary" data-a="back">Kembali</button></div></div>`;
    };
    draw();
    s.onclick = (e) => {
      const a = e.target.closest('button')?.dataset.a;
      if (a === 'aud') { this.setAudio(!A.enabled); draw(); }
      if (a === 'touch') { this.setTouchMode(this.touchMode === 'always' ? 'auto' : 'always'); draw(); }
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
        <div class="hud-res"><span class="hearts" id="hh"></span><span><i class="ico coin"></i><b id="hc">0</b></span><span><i class="ico crystal"></i><b id="hcr">0</b></span></div>
        <div class="hud-btns"><button class="menu-btn" data-a="menu">Menu<i class="dot hidden"></i></button></div>
      </div>
      <div class="menu-drop hidden" id="md">
        <button data-a="quest">Quest</button><button data-a="map">Peta</button>
        <button data-a="learn">Materi</button><button data-a="journal">Jurnal</button>
        <button data-a="profile">Profil</button><button data-a="shop">Toko</button>
        <button data-a="daily">Misi Harian</button><button data-a="emote">Emote</button>
        <button data-a="pause" class="wide">Jeda</button></div>
      <div class="questbox" id="hq"></div>
      <canvas id="mm" width="120" height="80" aria-label="Minimap"></canvas>`;
    const md = this.hudEl.querySelector('#md');
    this.hudEl.addEventListener('click', (e) => {
      const a = e.target.closest('button')?.dataset.a;
      if (!a || this.blocked) return;
      A.sfx('click');
      if (a === 'menu') { md.classList.toggle('hidden'); return; }
      md.classList.add('hidden');
      this.action(a);
    });
    const hq = this.hudEl.querySelector('#hq');
    if (this.isTouch) hq.classList.add('collapsed');
    hq.addEventListener('click', () => hq.classList.toggle('collapsed'));
    document.addEventListener('pointerdown', (e) => {
      if (!md.contains(e.target) && !e.target.closest('.menu-btn')) md.classList.add('hidden');
      if (this.emotePop && !this.emotePop.contains(e.target)) { this.emotePop.remove(); this.emotePop = null; }
    });
    this.mm = this.hudEl.querySelector('#mm').getContext('2d');
  }
  action(a) {
    if (a === 'quest') openQuestLog(this);
    if (a === 'map') openMap(this);
    if (a === 'learn') openProgress(this);
    if (a === 'journal') openJournal(this);
    if (a === 'profile') openProfile(this);
    if (a === 'pause') openPause(this);
    if (a === 'shop') openShop(this);
    if (a === 'daily') openDaily(this);
    if (a === 'emote') this.openEmotes();
  }
  showHud(on) { this.hudEl.classList.toggle('hidden', !on); this.inGame = on; if (on) this.refreshHud(); this.touchEl.classList.toggle('hidden', !on); }
  refreshHud() {
    const d = state.data, q = (id) => this.hudEl.querySelector(id);
    q('#hn').textContent = d.name;
    q('#hl').textContent = ` Lv ${state.level}`;
    q('#hx').style.width = state.xpInLevel + '%';
    q('#hc').textContent = d.coins;
    this.refreshHearts();
    q('#hcr').textContent = d.crystals;
    q('.menu-btn .dot')?.classList.toggle('hidden', !DailyManager.hasClaimable());
    const aq = QuestManager.active();
    const side = QuestManager.all().find((x) => x.type === 'Sampingan' && !QuestManager.isDone(x));
    q('#hq').innerHTML = (aq ? `<b>${esc(aq.title)}</b><span>${esc(aq.steps ? aq.steps.find((s) => !s.done(d))?.t || '' : aq.desc)}</span>` : '<b>Semua quest yang tersedia sudah selesai</b>')
      + (side ? `<small>${esc(side.title)}: ${side.progress(d)}</small>` : '');
  }
  drawMinimap(px, py, W, H, bg, dots = []) {
    const c = this.mm, k = Math.min(120 / W, 80 / H);
    c.fillStyle = '#000'; c.fillRect(0, 0, 120, 80);
    c.save(); c.translate((120 - W * k) / 2, (80 - H * k) / 2);
    if (bg) bg(c, k);
    c.fillStyle = '#ef4444';
    dots.forEach((d) => c.fillRect(d.x * k - 1.5, d.y * k - 1.5, 3, 3));
    c.fillStyle = '#fff'; c.fillRect(px * k - 2, py * k - 2, 4, 4);
    c.restore();
  }
  refreshHearts() {
    const el = this.hudEl.querySelector('#hh');
    if (!el) return;
    el.innerHTML = Array.from({ length: PlayerStatus.max }, (_, i) => `<i class="heart ${i < PlayerStatus.hp ? '' : 'off'}"></i>`).join('');
  }

  /* ---------- Kontrol sentuh ---------- */
  buildTouch() {
    this.touchEl = $(`<div class="touch hidden">
      <div class="joy-zone"><div class="joy-base"><div class="joy-knob"></div></div></div>
      <div class="touch-btns">
        <button class="tb run" data-k="run" aria-label="Lari">Lari</button>
        <button class="tb atk" data-k="atk" aria-label="Serang">Serang</button>
        <button class="tb act" data-k="act" aria-label="Aksi">Aksi</button>
      </div></div>`);
    this.root.append(this.touchEl);
    const zone = this.touchEl.querySelector('.joy-zone');
    const base = this.touchEl.querySelector('.joy-base');
    const knob = this.touchEl.querySelector('.joy-knob');
    const R = 52;
    let pid = null, cx = 0, cy = 0;
    const reset = () => {
      pid = null;
      this.touch = { x: 0, y: 0 };
      knob.style.transform = '';
      base.classList.remove('active');
      base.style.left = base.style.top = base.style.bottom = '';
    };
    this.resetJoystick = reset;
    const move = (e) => {
      let dx = e.clientX - cx, dy = e.clientY - cy;
      const len = Math.hypot(dx, dy);
      if (len > R) { dx = (dx / len) * R; dy = (dy / len) * R; }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      const mag = Math.min(1, len / R);
      this.touch = mag < 0.18 ? { x: 0, y: 0 } : { x: (dx / R), y: (dy / R) };
    };
    zone.addEventListener('pointerdown', (e) => {
      if (pid !== null) return;
      e.preventDefault();
      pid = e.pointerId;
      zone.setPointerCapture(pid);
      cx = e.clientX; cy = e.clientY;
      base.classList.add('active');
      base.style.bottom = 'auto';
      base.style.left = `${cx - 60}px`;
      base.style.top = `${cy - 60}px`;
      move(e);
    });
    zone.addEventListener('pointermove', (e) => { if (e.pointerId === pid) move(e); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((ev) => zone.addEventListener(ev, (e) => { if (e.pointerId === pid || ev === 'lostpointercapture') reset(); }));
    this.touchEl.querySelectorAll('.tb').forEach((b) => {
      b.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const kind = b.dataset.k;
        if (kind === 'act') { if (this.dlg) this.advance(); else this.touchAct = true; }
        if (kind === 'atk') this.touchAttack = true;
        if (kind === 'run') { this.touchRun = !this.touchRun; b.classList.toggle('on', this.touchRun); }
      });
    });
  }
  openEmotes() {
    if (this.emotePop) { this.emotePop.remove(); this.emotePop = null; return; }
    const el = $(`<div class="emote-pop">${emotes.map((l, i) => `<button class="btn" data-i="${i}">${i + 1}. ${esc(l)}</button>`).join('')}</div>`);
    el.onclick = (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      bus.emit('emote', Number(b.dataset.i));
      el.remove();
      this.emotePop = null;
    };
    this.root.append(el);
    this.emotePop = el;
  }
  syncClasses() {
    this.root.classList.toggle('dialog-open', !!this.dlg);
    this.root.classList.toggle('modal-open', this.modals.length > 0);
    if ((this.dlg || this.modals.length) && this.resetJoystick) this.resetJoystick();
  }
  initTouchMode() {
    let m = 'auto';
    try { m = localStorage.getItem('gaa.touch') === 'always' ? 'always' : 'auto'; } catch { /* abaikan */ }
    this.setTouchMode(m);
  }
  setTouchMode(mode) {
    this.touchMode = mode;
    try { localStorage.setItem('gaa.touch', mode); } catch { /* abaikan */ }
    this.root.classList.toggle('force-touch', mode === 'always');
    this.isTouch = mode === 'always' || window.matchMedia('(pointer: coarse)').matches;
  }
  buildRotateHint() {
    const el = $(`<div class="rotate-hint"><div class="rh-card"><div class="rh-ico"></div><h3>Putar perangkatmu</h3>
      <p>Game ini paling nyaman dimainkan dalam mode layar melebar (landscape).</p><button class="btn primary">Tetap main di sini</button></div></div>`);
    el.querySelector('button').onclick = () => this.root.classList.add('no-rotate-hint');
    this.root.append(el);
  }
  toggleFullscreen() {
    const d = document;
    if (!d.fullscreenElement) d.documentElement.requestFullscreen?.().catch(() => {});
    else d.exitFullscreen?.();
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
      this.syncClasses();
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
        this.syncClasses();
        el.remove();
        this.cool = performance.now() + 250;
        resolveClosed();
      },
    };
    el.querySelector('.x')?.addEventListener('click', () => { A.sfx('click'); m.close(); });
    this.modals.push(m);
    this.syncClasses();
    return m;
  }
  toast(msg, kind = '') {
    const t = $(`<div class="toast ${kind}">${esc(msg)}</div>`);
    this.toastEl.append(t);
    setTimeout(() => t.remove(), 3200);
  }
}
export const ui = new UIManager();
