// Panel Profil (inventaris, statistik, skill tree, prestasi) dan Jurnal (catatan, glosarium).
import { esc } from '../core/util.js';
import { state } from '../systems/GameState.js';
import { QuestManager } from '../systems/QuestManager.js';
import { AchievementManager } from '../systems/AchievementManager.js';
import { AudioManager as A } from '../systems/AudioManager.js';
import { achievements, COIN_IDS } from '../data/achievements.js';
import { cosmetics } from '../data/cosmetics.js';
import { glossary } from '../data/glossary.js';
import { mentors } from '../data/mentors.js';
import { curriculum } from '../data/curriculum.js';
import { chapters, chapterById } from '../data/chapters.js';
import { bus } from '../core/bus.js';

const mastered = (ch) => [ch.keys.read, ch.keys.sim, ch.keys.quiz].every((k) => state.hasFlag(k));

export function tabbed(ui, title, tabs) {
  const m = ui.openModal({ title, wide: true });
  const names = Object.keys(tabs);
  let cur = names[0];
  const draw = () => {
    m.body.innerHTML = `<div class="tabs">${names.map((n) => `<button class="btn ${n === cur ? 'primary' : ''}" data-t="${esc(n)}">${esc(n)}</button>`).join('')}</div><div class="tab-body"></div>`;
    m.body.querySelectorAll('[data-t]').forEach((b) => (b.onclick = () => { A.sfx('click'); cur = b.dataset.t; draw(); }));
    tabs[cur](m.body.querySelector('.tab-body'), draw);
  };
  draw();
}

export function openProfile(ui) {
  tabbed(ui, 'Profil', {
    Inventaris(el, redraw) {
      const d = state.data;
      el.innerHTML = `<div class="stat-grid"><div><b>${d.crystals}</b><span>Godot Crystal</span></div><div><b>${d.coins}</b><span>Koin Akademi</span></div></div>
        <h3>Barang</h3><div class="chips"><span>Buah Kristal × ${d.items.fruit}</span></div><p class="muted">Didapat dari panen di Kebun Akademi. Berikan ke mentor setelah bercakap-cakap dengannya untuk mempererat persahabatan.</p><h3>Badge kompetensi</h3><div class="chips">${d.badges.length ? d.badges.map((b) => `<span>${esc(b)}</span>`).join('') : '<p class="muted">Belum ada badge. Lulus kuis bab untuk mendapatkannya.</p>'}</div>
        <h3>Kosmetik karakter</h3><div class="cos">${cosmetics.map((c) => {
          const ok = d.crystals >= c.need, on = d.cosmetic === c.id;
          return `<button class="btn ${on ? 'primary' : ''}" data-c="${c.id}" ${ok ? '' : 'disabled'}>${esc(c.name)}<small>${on ? 'Dipakai' : ok ? 'Pakai' : `Butuh ${c.need} Godot Crystal`}</small></button>`;
        }).join('')}</div><p class="muted">Kosmetik hanya mengubah tampilan, tidak mempengaruhi permainan.</p>`;
      el.querySelectorAll('[data-c]').forEach((b) => (b.onclick = () => { A.sfx('ok'); state.setCosmetic(b.dataset.c); redraw(); }));
    },
    Teman(el) {
      const f = state.data.friends;
      el.innerHTML = `<p>Beri Buah Kristal kepada mentor setelah bercakap-cakap dengannya (maksimal satu hadiah per mentor per hari). Kamu punya <b>${state.data.items.fruit}</b> buah.</p>` + mentors.map((m) => {
        const h = f[m.id]?.h || 0;
        return `<div class="card ${h >= 5 ? 'done' : ''}"><h3>${esc(m.name)} <small>${esc(m.room)}</small></h3>
          <div class="hearts">${Array.from({ length: 5 }, (_, i) => `<i class="heart ${i < h ? '' : 'off'}"></i>`).join('')}</div>
          <p>${h >= 1 ? esc(m.tip) : '<span class="muted">Beri 1 hadiah untuk membuka tips belajar.</span>'}</p>
          <p>${h >= 3 ? esc(m.story) : '<span class="muted">Capai 3 hati untuk membuka ceritanya.</span>'}</p>
          ${h >= 5 ? '<p class="muted">Hadiah persahabatan sudah diterima.</p>' : ''}</div>`;
      }).join('');
    },
    Statistik(el) {
      const d = state.data;
      const done = chapters.filter(mastered).length;
      const qs = QuestManager.all();
      const total = curriculum.length;
      el.innerHTML = `<div class="stat-grid">
        <div><b>${state.level}</b><span>Level (${state.xpInLevel}/100 XP)</span></div>
        <div><b>${d.xp}</b><span>Total XP</span></div>
        <div><b>${qs.filter((q) => QuestManager.isDone(q)).length}/${qs.length}</b><span>Quest selesai</span></div>
        <div><b>${d.collected.filter((id) => COIN_IDS.includes(id)).length}/${COIN_IDS.length}</b><span>Koin ditemukan</span></div>
        <div><b>${achievements.filter((a) => AchievementManager.isUnlocked(a)).length}/${achievements.length}</b><span>Prestasi</span></div>
        <div><b>${done}/${total}</b><span>Bab dikuasai</span></div>
        <div><b>${d.bugs}</b><span>Bug dikalahkan</span></div></div>
        <h3>Progres kurikulum</h3><div class="bar"><i style="width:${(done / total) * 100}%"></i></div>
        <h3>Skor kuis terbaik</h3><ul>${chapters.map((c) => `<li>Bab ${c.id}: ${d.scores['ch' + c.id] !== undefined ? `${d.scores['ch' + c.id]} / ${c.quiz.length}` : 'belum dikerjakan'}</li>`).join('')}</ul>`;
    },
    'Skill Tree'(el) {
      const levels = [...new Set(curriculum.map((c) => c.level))];
      el.innerHTML = levels.map((lv) => `<div class="skill"><h3>${esc(lv)}</h3><div class="nodes">${curriculum.filter((c) => c.level === lv).map((c) => {
        const ch = chapterById(c.n);
        const cls = ch && mastered(ch) ? 'done' : ch ? 'open' : 'lock';
        const label = cls === 'done' ? 'Dikuasai' : cls === 'open' ? 'Tersedia' : 'Segera hadir';
        return `<div class="node ${cls}"><b>Bab ${c.n}</b><span>${esc(c.title)}</span><small>${label}</small></div>`;
      }).join('')}</div></div>`).join('');
    },
    Prestasi(el) {
      el.innerHTML = achievements.map((a) => {
        const ok = AchievementManager.isUnlocked(a);
        return `<div class="card ${ok ? 'done' : ''}"><h3>${esc(a.title)}</h3><p>${esc(a.desc)}</p><b class="state">${ok ? 'Terbuka' : 'Terkunci'}</b></div>`;
      }).join('');
    },
  });
}

export function openJournal(ui) {
  tabbed(ui, 'Jurnal Belajar', {
    Catatan(el) {
      el.innerHTML = chapters.map((c) => {
        if (!state.hasFlag(c.keys.read)) return `<div class="card"><h3>Bab ${c.id}: ${esc(c.title)}</h3><p class="muted">Selesaikan membaca materi bab ini untuk membuka catatannya.</p></div>`;
        const mini = state.hasFlag('mini_' + c.id);
        return `<div class="card done"><h3>Bab ${c.id}: ${esc(c.title)}</h3><ul>${c.summary.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
          <p>${esc(c.mini)}</p><label class="check"><input type="checkbox" data-m="${c.id}" ${mini ? 'checked' : ''}> Mini project sudah saya kerjakan</label></div>`;
      }).join('');
      el.querySelectorAll('[data-m]').forEach((b) => (b.onchange = () => { state.data.flags['mini_' + b.dataset.m] = b.checked; state.commit(); }));
    },
    Glosarium(el) {
      const open = glossary.filter((g) => state.hasFlag(chapterById(g.ch).keys.read));
      el.innerHTML = open.length
        ? `<dl class="gloss">${open.map((g) => `<dt>${esc(g.t)} <small>Bab ${g.ch}</small></dt><dd>${esc(g.d)}</dd>`).join('')}</dl><p class="muted">${open.length} dari ${glossary.length} istilah terbuka.</p>`
        : '<p class="muted">Baca materi bab untuk membuka istilah glosarium.</p>';
    },
  });
}

export function openCertificate(ui) {
  const m = ui.openModal({ title: 'Sertifikat Penyelesaian', wide: true });
  const d = state.data;
  const done = chapters.filter(mastered).length;
  const ach = achievements.filter((a) => AchievementManager.isUnlocked(a)).length;
  const tgl = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  m.body.innerHTML = `<div class="certificate"><h2>Sertifikat Penyelesaian</h2><p>Diberikan kepada</p><h1>${esc(d.name)}</h1>
    <p>yang telah menyelesaikan petualangan <b>Godot Adventure Academy</b>: ${done} dari ${curriculum.length} bab Godot Engine 4.x.</p>
    <div class="stat-grid"><div><b>${state.level}</b><span>Level</span></div><div><b>${d.xp}</b><span>Total XP</span></div>
    <div><b>${d.crystals}</b><span>Godot Crystal</span></div><div><b>${ach}/${achievements.length}</b><span>Prestasi</span></div></div>
    <div class="chips">${d.badges.map((b) => `<span>${esc(b)}</span>`).join('')}</div>
    <p class="muted">Tanggal: ${tgl}. Sertifikat ini adalah penanda penyelesaian di dalam game edukasi, bukan sertifikat kompetensi resmi.</p></div>
    <div class="nav"><button class="btn" data-print="1">Cetak atau simpan sebagai PDF</button><button class="btn primary" data-close="1">Tutup</button></div>`;
  m.body.querySelector('[data-print]').onclick = () => window.print();
  m.body.querySelector('[data-close]').onclick = () => m.close();
}
