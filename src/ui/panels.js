// Panel HTML: quest log, peta, progres materi, jeda.
import { $, esc } from '../core/util.js';
import { state } from '../systems/GameState.js';
import { QuestManager } from '../systems/QuestManager.js';
import { AudioManager as A } from '../systems/AudioManager.js';
import { curriculum, locations } from '../data/curriculum.js';
import { bus } from '../core/bus.js';
import { openChapter } from '../systems/LearningManager.js';
import { chapterById } from '../data/chapters.js';

export function openQuestLog(ui) {
  const m = ui.openModal({ title: 'Quest Log' });
  const d = state.data;
  m.body.innerHTML = QuestManager.all().map((q) => {
    const done = QuestManager.isDone(q), avail = QuestManager.isAvailable(q);
    const steps = q.steps ? `<ul>${q.steps.map((s) => `<li class="${s.done(d) ? 'ok' : ''}">${esc(s.t)}</li>`).join('')}</ul>` : '';
    const prog = q.progress ? `<p class="muted">${q.progress(d)}</p>` : '';
    return `<article class="card ${done ? 'done' : ''}"><h3>${esc(q.title)} <small>${q.type}</small></h3>
      <p>${esc(q.desc)}</p>${avail ? steps + prog : '<p class="muted">Terkunci: selesaikan quest sebelumnya.</p>'}
      <b class="state">${done ? 'Selesai' : avail ? 'Aktif' : 'Terkunci'}</b></article>`;
  }).join('');
}

export function openMap(ui) {
  const m = ui.openModal({ title: 'Peta Sekolah', wide: true });
  const done = (id) => QuestManager.isDone(QuestManager.all().find((q) => q.id === id));
  const unlocked = { gate: 1, school: 1, classroom: done('q_ch1') ? 1 : 0, lab: done('q_ch2') ? 1 : 0, code: done('q_ch3') ? 1 : 0, arena: done('q_ch4') ? 1 : 0, anim: done('q_ch5') ? 1 : 0, library: done('q_ch6') ? 1 : 0, level: done('q_ch7') ? 1 : 0, ai: done('q_ch9') ? 1 : 0, audio: done('q_ch11') ? 1 : 0, server: done('q_ch12') ? 1 : 0, test: done('q_ch13') ? 1 : 0, final: done('q_ch14') ? 1 : 0, garden: 1 };
  const scenes = { school: 'School', classroom: 'Classroom', lab: 'Lab', code: 'Code', arena: 'Arena', anim: 'Anim', library: 'Library', level: 'Level', ai: 'AI', audio: 'Audio', server: 'Server', test: 'Test', final: 'Final', garden: 'Garden' };
  const visit = { classroom: 'classroom', lab: 'lab', code: 'codeRoom', arena: 'arena', anim: 'animRoom', library: 'libRoom', level: 'levelRoom', ai: 'aiRoom', audio: 'audioRoom', server: 'serverRoom', test: 'testRoom', final: 'finalRoom', garden: 'gardenRoom' };
  const seen = (id) => id === 'school' || (visit[id] && state.hasFlag(visit[id]));
  m.body.innerHTML = `<div class="map">${locations.map((l) => {
    const cur = l.id === state.data.location, ok = unlocked[l.id], target = !!(visit[l.id] && ok && !state.hasFlag(visit[l.id]));
    const label = cur ? 'Lokasi sekarang' : target ? 'Dituju' : ok ? 'Terbuka' : 'Terkunci';
    return `<div class="loc ${cur ? 'cur' : ok ? 'open' : 'lock'}"><b>${esc(l.name)}</b><span>${label}</span>${scenes[l.id] && !cur && seen(l.id) ? `<button class="btn" data-go="${scenes[l.id]}">Pergi ke sini</button>` : ''}</div>`;
  }).join('')}</div><p class="muted">Area baru terbuka setelah menyelesaikan misi bab. Ruangan yang sudah pernah dikunjungi bisa dituju langsung dengan tombol "Pergi ke sini".</p>`;
  m.body.querySelectorAll('[data-go]').forEach((b) => (b.onclick = () => { m.close(); bus.emit('goto:scene', b.dataset.go); }));
}

export function openProgress(ui) {
  const m = ui.openModal({ title: 'Materi & Progres', wide: true });
  const d = state.data;
  const pct = (n) => {
    const k = chapterById(n)?.keys;
    return k ? ([k.read, k.sim, k.quiz].filter((x) => d.flags[x]).length / 3) * 100 : 0;
  };
  m.body.innerHTML = `<div class="chap-list">${curriculum.map((c) => {
    const p = c.available ? pct(c.n) : 0;
    return `<div class="chap ${c.available ? '' : 'soon'}"><div><b>Bab ${c.n}: ${esc(c.title)}</b><small>${c.level}</small>
      <div class="bar"><i style="width:${p}%"></i></div></div>
      ${c.available ? '<button class="btn primary" data-open="${c.n}">Buka materi</button>' : '<span class="muted">Segera hadir</span>'}</div>`;
  }).join('')}</div>`;
  m.body.querySelectorAll('[data-open]').forEach((b) => (b.onclick = () => { m.close(); openChapter(ui, chapterById(Number(b.dataset.open))); }));
}

export function openPause(ui) {
  const m = ui.openModal({ title: 'Jeda' });
  const draw = () => {
    m.body.innerHTML = `<div class="menu col">
      <button class="btn primary" data-a="resume">Lanjutkan</button>
      <button class="btn" data-a="aud">Musik &amp; efek suara: ${A.enabled ? 'Menyala' : 'Mati'}</button>
      <button class="btn" data-a="save">Simpan sekarang</button>
      <button class="btn" data-a="touch">Kontrol layar sentuh: ${ui.touchMode === 'always' ? 'Selalu tampil' : 'Otomatis'}</button>
      ${document.fullscreenEnabled ? '<button class="btn" data-a="full">Layar penuh</button>' : ''}
      <button class="btn" data-a="menu">Kembali ke menu utama</button></div>`;
  };
  draw();
  m.body.onclick = (e) => {
    const a = e.target.closest('button')?.dataset.a;
    if (!a) return;
    A.sfx('click');
    if (a === 'resume') m.close();
    if (a === 'aud') { ui.setAudio(!A.enabled); draw(); }
    if (a === 'save') { state.save(); ui.toast('Progres tersimpan.', 'good'); }
    if (a === 'touch') { ui.setTouchMode(ui.touchMode === 'always' ? 'auto' : 'always'); draw(); }
    if (a === 'full') ui.toggleFullscreen();
    if (a === 'menu') { state.save(); m.close(); bus.emit('goto:menu'); }
  };
}
