// LearningManager: materi, simulasi, kuis, dan dialog mentor untuk Bab 1.
import { $, esc, shuffle } from '../core/util.js';
import { chapter1 as ch } from '../data/chapter1.js';
import { state } from './GameState.js';
import { QuestManager } from './QuestManager.js';
import { AudioManager as A } from './AudioManager.js';

const PROF = { name: 'Profesor Pixel', portrait: 'prof' };

/* ---------- Materi ---------- */
export function openChapter1(ui) {
  const m = ui.openModal({ title: `Bab 1: ${ch.title}`, wide: true });
  let i = -1; // -1 = cerita pengantar & tujuan
  const total = ch.pages.length;
  const render = () => {
    const nav = (last) => `<div class="nav"><button class="btn" data-n="-1" ${i < 0 ? 'disabled' : ''}>Sebelumnya</button>
      <span class="muted">${i < 0 ? 'Pengantar' : `Halaman ${i + 1} / ${total}`}</span>
      <button class="btn primary" data-n="1">${last ? 'Selesai membaca' : 'Lanjut'}</button></div>`;
    if (i < 0) {
      m.body.innerHTML = `<p class="story">${esc(ch.story)}</p><h3>Tujuan pembelajaran</h3><ul>${ch.goals.map((g) => `<li>${esc(g)}</li>`).join('')}</ul>${nav(false)}`;
    } else {
      const p = ch.pages[i];
      m.body.innerHTML = `<h3>${esc(p.title)}</h3>${p.text.map((t) => `<p>${esc(t)}</p>`).join('')}
        <p class="analogy"><b>Analogi:</b> ${esc(p.analogy)}</p>
        ${p.figure ? `<div class="figure">${p.figure.map((f) => `<span>${esc(f)}</span>`).join('<i>→</i>')}</div>` : ''}
        ${p.code ? codeBlock(p.code) : ''}${nav(i === total - 1)}`;
      m.body.querySelector('.copy')?.addEventListener('click', (e) => {
        navigator.clipboard?.writeText(p.code.src).then(() => { e.target.textContent = 'Tersalin'; }, () => { e.target.textContent = 'Gagal menyalin'; });
      });
    }
    m.body.scrollTop = 0;
    m.body.querySelectorAll('[data-n]').forEach((b) => (b.onclick = () => {
      A.sfx('click');
      const n = Number(b.dataset.n);
      if (n > 0 && i === total - 1) return finish();
      i += n; render();
    }));
  };
  const finish = () => {
    if (state.setFlag('read')) { state.addXp(30); ui.toast('+30 XP: materi selesai dibaca', 'good'); }
    m.body.innerHTML = `<h3>Ringkasan</h3><ul>${ch.summary.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
      <h3>Mini project</h3><p>${esc(ch.mini)}</p><h3>Indikator penguasaan</h3>
      <ul class="ind">${ch.indicators.map(([k, t]) => `<li class="${state.hasFlag(k) ? 'ok' : ''}">${esc(t)}</li>`).join('')}</ul>
      <div class="nav"><button class="btn primary" data-close="1">Tutup</button></div>`;
    m.body.querySelector('[data-close]').onclick = () => m.close();
    QuestManager.check();
  };
  render();
  return m.closed;
}

function codeBlock(c) {
  return `<div class="code"><div class="code-head"><b>GDScript (Godot 4.x)</b><button class="btn copy">Salin kode</button></div>
    <pre><code>${esc(c.src)}</code></pre>
    <h4>Fungsi setiap bagian</h4><ul>${c.lines.map(([l, d]) => `<li><code>${esc(l)}</code> — ${esc(d)}</li>`).join('')}</ul>
    <dl><dt>Input</dt><dd>${esc(c.input)}</dd><dt>Output</dt><dd>${esc(c.output)}</dd>
    <dt>Kesalahan umum</dt><dd>${esc(c.mistake)}</dd><dt>Perbaikan</dt><dd>${esc(c.fix)}</dd></dl></div>`;
}

/* ---------- Simulasi game loop ---------- */
export function openSim(ui) {
  const s = ch.sim;
  const m = ui.openModal({ title: s.title, wide: true });
  const order = [];
  let tries = 0;
  const pool = shuffle(s.steps.map((st, idx) => ({ ...st, idx })));
  const render = (msg = '', good = true) => {
    m.body.innerHTML = `<p>${esc(s.intro)}</p>
      <ol class="slots">${s.steps.map((_, k) => `<li class="${order[k] !== undefined ? 'filled' : ''}">${order[k] !== undefined ? esc(s.steps[order[k]].t) : `Langkah ${k + 1}`}</li>`).join('')}</ol>
      <div class="pool">${pool.filter((p) => !order.includes(p.idx)).map((p) => `<button class="btn" data-i="${p.idx}">${esc(p.t)}</button>`).join('')}</div>
      <p class="fb ${good ? 'good' : 'bad'}">${esc(msg)}</p>`;
    m.body.querySelectorAll('[data-i]').forEach((b) => (b.onclick = () => pick(Number(b.dataset.i))));
  };
  const pick = (idx) => {
    if (idx === order.length) {
      order.push(idx); A.sfx('ok');
      if (order.length === s.steps.length) return win();
      render('Tepat! ' + s.steps[idx].why);
    } else {
      tries++; A.sfx('bad');
      render(`Belum tepat. Pikirkan: apa yang harus terjadi lebih dulu sebelum langkah itu? (Langkah ke-${order.length + 1} yang dicari.)`, false);
    }
  };
  const win = () => {
    if (state.setFlag('sim')) { state.addXp(40); ui.toast('+40 XP: simulasi selesai', 'good'); }
    m.body.innerHTML = `<h3>Urutan benar!</h3><ol>${s.steps.map((x) => `<li>${esc(x.t)}<br><small class="muted">${esc(x.why)}</small></li>`).join('')}</ol>
      <p class="fb good">Selesai dengan ${tries} kesalahan.</p><div class="nav"><button class="btn primary" data-close="1">Tutup</button></div>`;
    m.body.querySelector('[data-close]').onclick = () => m.close();
    QuestManager.check();
  };
  render();
  return m.closed;
}

/* ---------- Kuis ---------- */
export function openQuiz(ui) {
  const m = ui.openModal({ title: 'Kuis Bab 1', wide: true });
  const qs = ch.quiz.map((q) => {
    const opts = shuffle(q.a.map((t, i) => ({ t, ok: i === q.c })));
    return q.a.length === 2 ? { ...q, opts: q.a.map((t, i) => ({ t, ok: i === q.c })) } : { ...q, opts };
  });
  let n = 0, score = 0;
  const ask = () => {
    const q = qs[n];
    m.body.innerHTML = `<p class="muted">Soal ${n + 1} / ${qs.length}</p><h3>${esc(q.q)}</h3>
      <div class="pool col">${q.opts.map((o, i) => `<button class="btn" data-i="${i}">${esc(o.t)}</button>`).join('')}</div><p class="fb"></p>`;
    m.body.querySelectorAll('[data-i]').forEach((b) => (b.onclick = () => answer(q, Number(b.dataset.i))));
  };
  const answer = (q, i) => {
    const ok = q.opts[i].ok;
    if (ok) score++;
    A.sfx(ok ? 'ok' : 'bad');
    m.body.querySelectorAll('[data-i]').forEach((b, k) => { b.disabled = true; b.classList.add(q.opts[k].ok ? 'right' : k === i ? 'wrong' : ''); });
    const fb = m.body.querySelector('.fb');
    fb.className = 'fb ' + (ok ? 'good' : 'bad');
    fb.textContent = (ok ? 'Benar! ' : `Belum tepat. Jawaban benar: ${q.opts.find((o) => o.ok).t}. `) + q.why;
    const next = $(`<div class="nav"><span></span><button class="btn primary">${n === qs.length - 1 ? 'Lihat hasil' : 'Soal berikutnya'}</button></div>`);
    next.querySelector('button').onclick = () => { n++; n < qs.length ? ask() : result(); };
    m.body.append(next);
  };
  const result = () => {
    const pass = score >= ch.passScore;
    const first = pass && !state.hasFlag('quiz');
    if (score > (state.data.scores.ch1 || 0)) { state.data.scores.ch1 = score; state.commit(); }
    if (first) { state.setFlag('quiz'); state.addXp(score * 10); state.addBadge('Pemula Gim'); }
    m.body.innerHTML = `<h3>${pass ? 'Kamu lulus!' : 'Belum lulus, coba lagi!'}</h3><p>Skor: <b>${score} / ${qs.length}</b></p>
      <p>${pass ? (first ? `+${score * 10} XP dan Badge "Pemula Gim".` : 'Kamu sudah menguasai bab ini.') : `Butuh minimal ${ch.passScore} benar. Baca ulang materi lalu ulangi kuis. Tidak ada hukuman.`}</p>
      <div class="nav"><button class="btn" data-retry="1">${pass ? 'Ulangi kuis' : 'Coba lagi'}</button><button class="btn primary" data-close="1">Tutup</button></div>`;
    m.body.querySelector('[data-retry]').onclick = () => { n = 0; score = 0; ask(); };
    m.body.querySelector('[data-close]').onclick = () => m.close();
    QuestManager.check();
  };
  ask();
  return m.closed;
}

/* ---------- NPC dan objek interaktif ---------- */
export async function interactProf(ui) {
  const f = (k) => state.hasFlag(k);
  if (!f('met')) {
    const c = await ui.dialog({
      who: PROF,
      pages: [
        `Selamat datang di Godot Adventure Academy, ${state.data.name}!`,
        'Sistem sekolah rusak karena Godot Crystal pertama retak. Hanya siswa yang paham dasar pengembangan gim yang bisa memperbaikinya.',
        'Mulailah dari Bab 1. Siap belajar?',
      ],
      choices: ['Siap belajar!', 'Nanti dulu'],
    });
    state.setFlag('met'); QuestManager.check();
    if (c === 0) await openChapter1(ui);
    return;
  }
  const stages = [
    [!f('read'), 'Kamu belum menyelesaikan materi Bab 1. Mau lanjut membaca?', 'Buka materi', openChapter1],
    [!f('sim'), 'Materi sudah dibaca. Sekarang buktikan pemahamanmu: susun urutan game loop.', 'Mulai simulasi', openSim],
    [!f('quiz'), 'Simulasi selesai! Tinggal satu langkah: kuis 5 soal.', 'Mulai kuis', openQuiz],
  ];
  const st = stages.find((s) => s[0]);
  if (st) {
    const c = await ui.dialog({ who: PROF, pages: [st[1]], choices: [st[2], 'Nanti saja'] });
    if (c === 0) await st[3](ui);
    return;
  }
  const c = await ui.dialog({
    who: PROF,
    pages: ['Hebat! Godot Crystal pertama sudah menyala. Pintu Ruang Kelas kini terbuka, tetapi isinya baru hadir di pembaruan berikutnya.'],
    choices: ['Baca ulang materi', 'Ulangi kuis', 'Tutup'],
  });
  if (c === 0) await openChapter1(ui);
  if (c === 1) await openQuiz(ui);
}

export async function interactDoor(ui) {
  const open = state.hasFlag('quest_q_ch1');
  const who = { name: 'Pintu Ruang Kelas', portrait: 'prof' };
  if (!open) {
    A.sfx('bad');
    await ui.dialog({ who, pages: ['Pintu terkunci oleh sistem sekolah. Selesaikan Misi Bab 1 dari Profesor Pixel untuk membukanya.'] });
  } else {
    A.sfx('door');
    await ui.dialog({ who, pages: ['Pintu terbuka! Ruang Kelas (Bab 2 dst.) belum tersedia di versi prototype ini. Tunggu pembaruan berikutnya.'] });
  }
}

export async function interactSign(ui) {
  await ui.dialog({
    who: { name: 'Papan Informasi', portrait: 'prof' },
    pages: [
      'Kontrol: W A S D / tombol panah untuk bergerak, Shift untuk berlari, E atau Spasi untuk berinteraksi, Esc untuk menu jeda.',
      'Tips: temui Profesor Pixel di tengah halaman, dan cari 3 Koin Akademi yang tersembunyi.',
    ],
  });
}
