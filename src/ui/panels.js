// Panel HTML: quest log, peta, progres materi, jeda.
import { $, esc } from '../core/util.js';
import { state } from '../systems/GameState.js';
import { QuestManager } from '../systems/QuestManager.js';
import { AudioManager as A } from '../systems/AudioManager.js';
import { curriculum, locations } from '../data/curriculum.js';
import { bus } from '../core/bus.js';
import { openChapter1 } from '../systems/LearningManager.js';

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
  const unlocked = { gate: 1, school: 1, classroom: QuestManager.isDone(QuestManager.all()[1]) ? 1 : 0 };
  m.body.innerHTML = `<div class="map">${locations.map((l) => {
    const cur = l.id === 'school', ok = unlocked[l.id], target = l.id === 'classroom' && ok;
    const label = cur ? 'Lokasi sekarang' : target ? 'Dituju (belum tersedia di Fase 1)' : ok ? 'Terbuka' : 'Terkunci';
    return `<div class="loc ${cur ? 'cur' : ok ? 'open' : 'lock'}"><b>${esc(l.name)}</b><span>${label}</span></div>`;
  }).join('')}</div><p class="muted">Area baru terbuka setelah menyelesaikan misi bab.</p>`;
}

export function openProgress(ui) {
  const m = ui.openModal({ title: 'Materi & Progres', wide: true });
  const d = state.data;
  const pct = (['read', 'sim', 'quiz'].filter((k) => d.flags[k]).length / 3) * 100;
  m.body.innerHTML = `<div class="chap-list">${curriculum.map((c) => {
    const p = c.available ? pct : 0;
    return `<div class="chap ${c.available ? '' : 'soon'}"><div><b>Bab ${c.n}: ${esc(c.title)}</b><small>${c.level}</small>
      <div class="bar"><i style="width:${p}%"></i></div></div>
      ${c.available ? '<button class="btn primary" data-open="1">Buka materi</button>' : '<span class="muted">Segera hadir</span>'}</div>`;
  }).join('')}</div>`;
  m.body.querySelector('[data-open]').onclick = () => { m.close(); openChapter1(ui); };
}

export function openPause(ui) {
  const m = ui.openModal({ title: 'Jeda' });
  const draw = () => {
    m.body.innerHTML = `<div class="menu col">
      <button class="btn primary" data-a="resume">Lanjutkan</button>
      <button class="btn" data-a="aud">Musik &amp; efek suara: ${A.enabled ? 'Menyala' : 'Mati'}</button>
      <button class="btn" data-a="save">Simpan sekarang</button>
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
    if (a === 'menu') { state.save(); m.close(); bus.emit('goto:menu'); }
  };
}
