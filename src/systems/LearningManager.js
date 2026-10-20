// LearningManager: materi, simulasi, kuis, dan dialog mentor. Generik untuk semua bab.
import { $, esc, shuffle } from '../core/util.js';
import { chapter1 } from '../data/chapter1.js';
import { chapter2 } from '../data/chapter2.js';
import { chapter3 } from '../data/chapter3.js';
import { chapter4 } from '../data/chapter4.js';
import { chapter5 } from '../data/chapter5.js';
import { chapter6 } from '../data/chapter6.js';
import { chapter7 } from '../data/chapter7.js';
import { chapter8 } from '../data/chapter8.js';
import { chapter9 } from '../data/chapter9.js';
import { chapter10 } from '../data/chapter10.js';
import { chapter11 } from '../data/chapter11.js';
import { chapter12 } from '../data/chapter12.js';
import { chapter13 } from '../data/chapter13.js';
import { state } from './GameState.js';
import { QuestManager } from './QuestManager.js';
import { AudioManager as A } from './AudioManager.js';
import { bus } from '../core/bus.js';

const PROF = { name: 'Profesor Pixel', portrait: 'prof' };
const KAK = { name: 'Kak Syntax', portrait: 'kak' };
const ROBO = { name: 'RoboGuard', portrait: 'robo' };
const COACH = { name: 'Coach Vektor', portrait: 'coach' };
const BU = { name: 'Bu Animasi', portrait: 'bu' };
const PUS = { name: 'Pustakawan Data', portrait: 'pus' };
const LVL = { name: 'Mas Level', portrait: 'lvl' };
const ARSI = { name: 'Dr. Arsitek', portrait: 'arsi' };
const NADA = { name: 'Kak Nada', portrait: 'nada' };
const SRV = { name: 'Mas Server', portrait: 'srv' };

/* ---------- Materi ---------- */
export function openChapter(ui, ch) {
  const m = ui.openModal({ title: `Bab ${ch.id}: ${ch.title}`, wide: true });
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
    if (state.setFlag(ch.keys.read)) { state.addXp(30); ui.toast('+30 XP: materi selesai dibaca', 'good'); }
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

/* ---------- Simulasi ---------- */
function simDone(ui, ch, m, tries, listHtml) {
  if (state.setFlag(ch.keys.sim)) { state.addXp(40); ui.toast('+40 XP: simulasi selesai', 'good'); }
  m.body.innerHTML = `<h3>Selesai!</h3>${listHtml}<p class="fb good">Selesai dengan ${tries} kesalahan.</p>
    <div class="nav"><span></span><button class="btn primary" data-close="1">Tutup</button></div>`;
  m.body.querySelector('[data-close]').onclick = () => m.close();
  QuestManager.check();
}

export function openSim(ui, ch) {
  if (ch.sim.type === 'match') return openMatch(ui, ch);
  if (ch.sim.type === 'logic') return openLogic(ui, ch);
  if (ch.sim.type === 'bug') return openBug(ui, ch);
  return openOrder(ui, ch);
}

function openOrder(ui, ch) {
  const s = ch.sim;
  const m = ui.openModal({ title: s.title, wide: true });
  const order = [];
  let tries = 0;
  const pool = shuffle(s.steps.map((st, idx) => ({ ...st, idx })));
  const fmt = (t) => (s.code ? `<code>${esc(t)}</code>` : esc(t));
  const render = (msg = '', good = true) => {
    m.body.innerHTML = `<p>${esc(s.intro)}</p>
      <ol class="slots">${s.steps.map((_, k) => `<li class="${order[k] !== undefined ? 'filled' : ''}">${order[k] !== undefined ? fmt(s.steps[order[k]].t) : `Langkah ${k + 1}`}</li>`).join('')}</ol>
      <div class="pool">${pool.filter((p) => !order.includes(p.idx)).map((p) => `<button class="btn" data-i="${p.idx}">${fmt(p.t)}</button>`).join('')}</div>
      <p class="fb ${good ? 'good' : 'bad'}">${esc(msg)}</p>`;
    m.body.querySelectorAll('[data-i]').forEach((b) => (b.onclick = () => pick(Number(b.dataset.i))));
  };
  const pick = (idx) => {
    if (idx === order.length) {
      order.push(idx); A.sfx('ok');
      if (order.length === s.steps.length) {
        return simDone(ui, ch, m, tries, `<ol>${s.steps.map((x) => `<li>${fmt(x.t)}<br><small class="muted">${esc(x.why)}</small></li>`).join('')}</ol>`);
      }
      render('Tepat! ' + s.steps[idx].why);
    } else {
      tries++; A.sfx('bad');
      render(`Belum tepat. Pikirkan: apa yang harus terjadi lebih dulu sebelum langkah itu? (Langkah ke-${order.length + 1} yang dicari.)`, false);
    }
  };
  render();
  return m.closed;
}

function openBug(ui, ch) {
  const s = ch.sim;
  const m = ui.openModal({ title: s.title, wide: true });
  let n = 0, tries = 0, stage = 'line';
  const show = (msg = '', good = true) => {
    const r = s.rounds[n];
    const lines = r.code.map((l, i) => `<button class="btn ${stage === 'fix' && i === r.bug ? 'right' : ''}" data-l="${i}" ${stage === 'fix' ? 'disabled' : ''}><code>${esc(l)}</code></button>`).join('');
    const fixes = stage === 'fix'
      ? `<h3>Pilih perbaikan yang tepat</h3><div class="pool col">${r.fixes.map((f, i) => `<button class="btn" data-f="${i}">${esc(f.t)}</button>`).join('')}</div>`
      : '<p class="muted">Klik baris yang menjadi penyebab masalah.</p>';
    m.body.innerHTML = `<p>${esc(s.intro)}</p><p class="muted">Kasus ${n + 1} / ${s.rounds.length}</p>
      <p><b>Gejala:</b> ${esc(r.symptom)}</p><div class="pool col">${lines}</div>${fixes}
      <p class="fb ${good ? 'good' : 'bad'}">${esc(msg)}</p>`;
    m.body.querySelectorAll('[data-l]').forEach((b) => (b.onclick = () => {
      if (Number(b.dataset.l) === r.bug) { A.sfx('ok'); stage = 'fix'; show('Benar, baris itu menjadi sumber masalah.'); }
      else { tries++; A.sfx('bad'); show('Bukan baris itu. Cocokkan gejala dengan fungsi tiap baris.', false); }
    }));
    m.body.querySelectorAll('[data-f]').forEach((b) => (b.onclick = () => {
      if (r.fixes[Number(b.dataset.f)].ok) {
        A.sfx('ok'); n++; stage = 'line';
        if (n === s.rounds.length) return simDone(ui, ch, m, tries, '<p>Semua bug berhasil diperbaiki.</p>');
        show('Tepat! ' + r.why);
      } else { tries++; A.sfx('bad'); show('Perbaikan itu belum menyelesaikan masalah. Pikirkan penyebab sebenarnya.', false); }
    }));
  };
  show();
  return m.closed;
}

function openLogic(ui, ch) {
  const s = ch.sim;
  const m = ui.openModal({ title: s.title, wide: true });
  const steps = s.rounds.flatMap((r) => r.cases.map((c) => ({ ...c, rule: r.rule })));
  let n = 0, tries = 0;
  const show = (msg = '', good = true) => {
    const st = steps[n];
    m.body.innerHTML = `<p>${esc(s.intro)}</p><p class="muted">Kasus ${n + 1} / ${steps.length}</p>
      <div class="code"><pre><code>${esc(st.rule)}</code></pre></div>
      <p>Nilai saat ini: ${Object.entries(st.v).map(([k, v]) => `<code>${esc(k)} = ${esc(v)}</code>`).join(' dan ')}</p>
      <div class="pool"><button class="btn" data-o="1">Pintu terbuka</button><button class="btn" data-o="0">Pintu terkunci</button></div>
      <p class="fb ${good ? 'good' : 'bad'}">${esc(msg)}</p>`;
    m.body.querySelectorAll('[data-o]').forEach((b) => (b.onclick = () => {
      if ((b.dataset.o === '1') === st.open) {
        A.sfx('ok'); n++;
        if (n === steps.length) return simDone(ui, ch, m, tries, '<p>Kamu berhasil membaca semua kondisi.</p>');
        show('Tepat! ' + st.why);
      } else {
        tries++; A.sfx('bad');
        show('Belum tepat. Periksa tiap syarat satu per satu, lalu gabungkan dengan and atau or.', false);
      }
    }));
  };
  show();
  return m.closed;
}

function openMatch(ui, ch) {
  const s = ch.sim;
  const m = ui.openModal({ title: s.title, wide: true });
  const done = new Set();
  let sel = null, tries = 0;
  const defs = shuffle(s.pairs.map((p, i) => ({ i, d: p.d })));
  const render = (msg = '', good = true) => {
    m.body.innerHTML = `<p>${esc(s.intro)}</p><div class="match">
      <div class="col">${s.pairs.map((p, i) => `<button class="btn ${done.has(i) ? 'right' : ''} ${sel === i ? 'sel' : ''}" data-l="${i}" ${done.has(i) ? 'disabled' : ''}>${esc(p.t)}</button>`).join('')}</div>
      <div class="col">${defs.map((d) => `<button class="btn ${done.has(d.i) ? 'right' : ''}" data-r="${d.i}" ${done.has(d.i) ? 'disabled' : ''}>${esc(d.d)}</button>`).join('')}</div></div>
      <p class="fb ${good ? 'good' : 'bad'}">${esc(msg)}</p>`;
    m.body.querySelectorAll('[data-l]').forEach((b) => (b.onclick = () => { A.sfx('click'); sel = Number(b.dataset.l); render(); }));
    m.body.querySelectorAll('[data-r]').forEach((b) => (b.onclick = () => {
      const i = Number(b.dataset.r);
      if (sel === null) { A.sfx('bad'); return render('Pilih salah satu item di kolom kiri terlebih dahulu.', false); }
      if (i === sel) {
        A.sfx('ok'); done.add(sel);
        const why = s.pairs[sel].why; sel = null;
        if (done.size === s.pairs.length) {
          return simDone(ui, ch, m, tries, `<ul>${s.pairs.map((p) => `<li><b>${esc(p.t)}</b>: ${esc(p.d)}<br><small class="muted">${esc(p.why)}</small></li>`).join('')}</ul>`);
        }
        render('Tepat! ' + why);
      } else {
        tries++; A.sfx('bad');
        render(`Belum cocok. "${s.pairs[sel].t}" tidak berpasangan dengan itu. Baca lagi deskripsinya.`, false);
      }
    }));
  };
  render();
  return m.closed;
}

/* ---------- Kuis ---------- */
export function openQuiz(ui, ch) {
  const m = ui.openModal({ title: `Kuis Bab ${ch.id}`, wide: true });
  const qs = ch.quiz.map((q) => {
    const opts = q.a.map((t, i) => ({ t, ok: i === q.c }));
    return { ...q, opts: q.a.length === 2 ? opts : shuffle(opts) };
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
    m.body.querySelectorAll('[data-i]').forEach((b, k) => {
      b.disabled = true;
      if (q.opts[k].ok) b.classList.add('right');
      else if (k === i) b.classList.add('wrong');
    });
    const fb = m.body.querySelector('.fb');
    fb.className = 'fb ' + (ok ? 'good' : 'bad');
    fb.textContent = (ok ? 'Benar! ' : `Belum tepat. Jawaban benar: ${q.opts.find((o) => o.ok).t}. `) + q.why;
    const next = $(`<div class="nav"><span></span><button class="btn primary">${n === qs.length - 1 ? 'Lihat hasil' : 'Soal berikutnya'}</button></div>`);
    next.querySelector('button').onclick = () => { n++; if (n < qs.length) ask(); else result(); };
    m.body.append(next);
  };
  const result = () => {
    const pass = score >= ch.passScore;
    const first = pass && !state.hasFlag(ch.keys.quiz);
    const sk = 'ch' + ch.id;
    if (score > (state.data.scores[sk] || 0)) { state.data.scores[sk] = score; state.commit(); }
    if (first) { state.setFlag(ch.keys.quiz); state.addXp(score * 10); state.addBadge(ch.badge); }
    m.body.innerHTML = `<h3>${pass ? 'Kamu lulus!' : 'Belum lulus, coba lagi!'}</h3><p>Skor: <b>${score} / ${qs.length}</b></p>
      <p>${pass ? (first ? `+${score * 10} XP dan Badge "${esc(ch.badge)}".` : 'Kamu sudah menguasai bab ini.') : `Butuh minimal ${ch.passScore} benar. Baca ulang materi lalu ulangi kuis. Tidak ada hukuman.`}</p>
      <div class="nav"><button class="btn" data-retry="1">${pass ? 'Ulangi kuis' : 'Coba lagi'}</button><button class="btn primary" data-close="1">Tutup</button></div>`;
    m.body.querySelector('[data-retry]').onclick = () => { n = 0; score = 0; ask(); };
    m.body.querySelector('[data-close]').onclick = () => m.close();
    QuestManager.check();
  };
  ask();
  return m.closed;
}

/* ---------- Alur mentor (materi -> simulasi -> kuis) ---------- */
async function stageFlow(ui, who, ch, doneLine) {
  const k = ch.keys, f = (x) => state.hasFlag(x);
  const stages = [
    [!f(k.read), `Kamu belum menyelesaikan materi Bab ${ch.id}. Mau lanjut membaca?`, 'Buka materi', () => openChapter(ui, ch)],
    [!f(k.sim), 'Materi sudah dibaca. Sekarang buktikan pemahamanmu lewat simulasi.', 'Mulai simulasi', () => openSim(ui, ch)],
    [!f(k.quiz), 'Simulasi selesai! Tinggal satu langkah: kuis.', 'Mulai kuis', () => openQuiz(ui, ch)],
  ];
  const st = stages.find((s) => s[0]);
  if (st) {
    const c = await ui.dialog({ who, pages: [st[1]], choices: [st[2], 'Nanti saja'] });
    if (c === 0) await st[3]();
    return;
  }
  const c = await ui.dialog({ who, pages: [doneLine], choices: ['Baca ulang materi', 'Ulangi kuis', 'Tutup'] });
  if (c === 0) await openChapter(ui, ch);
  if (c === 1) await openQuiz(ui, ch);
}

/* ---------- NPC dan objek interaktif ---------- */
export async function interactProf(ui) {
  if (!state.hasFlag('met')) {
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
    if (c === 0) await openChapter(ui, chapter1);
    return;
  }
  await stageFlow(ui, PROF, chapter1, 'Hebat! Godot Crystal pertama sudah menyala. Pintu Ruang Kelas kini terbuka. Kak Syntax menunggumu di dalam.');
}

export async function interactKak(ui) {
  if (!state.hasFlag('kak_met')) {
    const c = await ui.dialog({
      who: KAK,
      pages: [
        `Hai, ${state.data.name}! Aku Kak Syntax, mentor di kelas ini.`,
        'Sebelum menulis kode, kamu harus kenal "dapur kerjanya": Godot Editor. Kita bahas Scene, Node, Scene Tree, Inspector, dan FileSystem.',
        'Siap mulai Bab 2?',
      ],
      choices: ['Siap!', 'Nanti dulu'],
    });
    state.setFlag('kak_met');
    if (c === 0) await openChapter(ui, chapter2);
    return;
  }
  await stageFlow(ui, KAK, chapter2, 'Mantap! Kamu sudah mengenal Godot Editor dan Godot Crystal kedua menyala. Ayo ke Laboratorium Komputer lewat pintu di sisi kanan papan tulis. Aku tunggu di sana!');
}

export async function interactKakLab(ui) {
  if (!state.hasFlag('kak_lab_met')) {
    const c = await ui.dialog({
      who: KAK,
      pages: [
        `Selamat datang di Laboratorium Komputer, ${state.data.name}!`,
        'Di sini kita belajar GDScript: komentar, variabel, tipe data, operator, dan fungsi. Ingat, GDScript sangat teliti soal indentasi.',
        'Siap mulai Bab 3?',
      ],
      choices: ['Siap!', 'Nanti dulu'],
    });
    state.setFlag('kak_lab_met');
    if (c === 0) await openChapter(ui, chapter3);
    return;
  }
  await stageFlow(ui, KAK, chapter3, 'Hebat! Godot Crystal ketiga menyala. Bab 4 (Logika Pemrograman) hadir di pembaruan berikutnya.');
}

export async function interactRobo(ui) {
  if (!state.hasFlag('robo_met')) {
    const c = await ui.dialog({
      who: ROBO,
      pages: [
        `BEEP. Selamat datang di Ruang Pemrograman, ${state.data.name}. Aku RoboGuard.`,
        'Sistem keamanan sekolah hanya menurut pada logika yang benar: if, elif, else, perulangan, dan penyimpanan data.',
        'Buktikan logikamu. Siap memulai Bab 4?',
      ],
      choices: ['Siap!', 'Nanti dulu'],
    });
    state.setFlag('robo_met');
    if (c === 0) await openChapter(ui, chapter4);
    return;
  }
  await stageFlow(ui, ROBO, chapter4, 'Logikamu tervalidasi. BEEP! Godot Crystal keempat menyala. Bab 5 (Karakter dan Gerakan) hadir di pembaruan berikutnya.');
}

export async function interactCoach(ui) {
  if (!state.hasFlag('coach_met')) {
    const c = await ui.dialog({
      who: COACH,
      pages: [
        `Halo, ${state.data.name}! Aku Coach Vektor, pelatih Arena Gim.`,
        'Di sini kamu belajar membuat karakter bergerak: membaca input, mengatur kecepatan, dan menabrak dinding dengan benar.',
        'Siap latihan Bab 5?',
      ],
      choices: ['Siap!', 'Nanti dulu'],
    });
    state.setFlag('coach_met');
    if (c === 0) await openChapter(ui, chapter5);
    return;
  }
  await stageFlow(ui, COACH, chapter5, 'Gerakanmu lincah! Godot Crystal kelima menyala. Bab 6 (Sprite dan Animasi) hadir di pembaruan berikutnya.');
}

export async function interactBu(ui) {
  if (!state.hasFlag('bu_met')) {
    const c = await ui.dialog({
      who: BU,
      pages: [
        `Selamat datang di Studio Animasi, ${state.data.name}! Aku Bu Animasi.`,
        'Di sini kamu belajar membuat karakter terasa hidup: sprite, sprite sheet, dan animasi idle serta berjalan.',
        'Siap mulai Bab 6?',
      ],
      choices: ['Siap!', 'Nanti dulu'],
    });
    state.setFlag('bu_met');
    if (c === 0) await openChapter(ui, chapter6);
    return;
  }
  await stageFlow(ui, BU, chapter6, 'Animasimu luwes! Godot Crystal keenam menyala. Bab 7 (Scene, Instancing, dan Signal) hadir di pembaruan berikutnya.');
}

export async function interactPus(ui) {
  if (!state.hasFlag('pus_met')) {
    const c = await ui.dialog({
      who: PUS,
      pages: [
        `Selamat datang di Perpustakaan Akademi, ${state.data.name}. Aku Pustakawan Data.`,
        'Aku mengelola materi dan glosarium. Catatan dan istilah yang sudah kamu pelajari tersimpan di tombol Jurnal.',
        'Hari ini kita belajar merakit scene dan membuat node saling berkomunikasi. Siap mulai Bab 7?',
      ],
      choices: ['Siap!', 'Nanti dulu'],
    });
    state.setFlag('pus_met');
    if (c === 0) await openChapter(ui, chapter7);
    return;
  }
  await stageFlow(ui, PUS, chapter7, 'Rakitan scene-mu rapi! Godot Crystal ketujuh menyala. Bab 8 (UI dan Sistem Permainan) hadir di pembaruan berikutnya.');
}

export async function interactLevel(ui) {
  if (state.hasFlag('quest_q_ch8')) {
    if (!state.hasFlag('lvl9_met')) {
      const c = await ui.dialog({
        who: LVL,
        pages: [
          'Antarmukamu sudah beres. Sekarang saatnya merancang dunianya.',
          'Di Bab 9 kamu belajar melukis level dengan tile, membuat collision, koin dan pintu, serta mengatur kamera.',
          'Siap mulai Bab 9?',
        ],
        choices: ['Siap!', 'Nanti dulu'],
      });
      state.setFlag('lvl9_met');
      if (c === 0) await openChapter(ui, chapter9);
      return;
    }
    await stageFlow(ui, LVL, chapter9, 'Levelmu terarah dan menyenangkan! Godot Crystal kesembilan menyala. Bab 10 (Arsitektur Gameplay) hadir di pembaruan berikutnya.');
    return;
  }
  if (!state.hasFlag('lvl_met')) {
    const c = await ui.dialog({
      who: LVL,
      pages: [
        `Halo, ${state.data.name}! Aku Mas Level, perancang level dan antarmuka akademi.`,
        'Pemain butuh tahu skor, nyawa, dan cara menjeda gim. Itu semua dirancang lewat UI, dan hari ini kamu belajar membuatnya.',
        'Siap mulai Bab 8?',
      ],
      choices: ['Siap!', 'Nanti dulu'],
    });
    state.setFlag('lvl_met');
    if (c === 0) await openChapter(ui, chapter8);
    return;
  }
  await stageFlow(ui, LVL, chapter8, 'Antarmukamu rapi dan jelas! Godot Crystal kedelapan menyala. Bicara lagi denganku untuk lanjut ke Bab 9 (Desain Level dan Interaksi).');
}

export async function interactArsi(ui) {
  if (state.hasFlag('quest_q_ch10')) {
    if (!state.hasFlag('arsi11_met')) {
      const c = await ui.dialog({
        who: ARSI,
        pages: [
          'Fondasimu sudah kokoh. Sekarang kita beri NPC kemampuan berpikir.',
          'Di Bab 11 kamu belajar membuat NPC yang berpatroli, mengejar, mencari jalan, dan berbicara dengan pilihan jawaban.',
          'Siap mulai Bab 11?',
        ],
        choices: ['Siap!', 'Nanti dulu'],
      });
      state.setFlag('arsi11_met');
      if (c === 0) await openChapter(ui, chapter11);
      return;
    }
    await stageFlow(ui, ARSI, chapter11, 'NPC-mu cerdas! Godot Crystal kesebelas menyala. Bab 12 (Audio dan Efek Visual) hadir di pembaruan berikutnya.');
    return;
  }
  if (!state.hasFlag('arsi_met')) {
    const c = await ui.dialog({
      who: ARSI,
      pages: [
        `Selamat datang di Laboratorium AI, ${state.data.name}. Aku Dr. Arsitek.`,
        'Lihat robot kecil itu: ia berpindah antara diam dan patroli. Itulah contoh state machine, salah satu fondasi arsitektur gim.',
        'Di Bab 10 kamu belajar membangun fondasi: state machine, Autoload, quest, dan inventaris. Siap?',
      ],
      choices: ['Siap!', 'Nanti dulu'],
    });
    state.setFlag('arsi_met');
    if (c === 0) await openChapter(ui, chapter10);
    return;
  }
  await stageFlow(ui, ARSI, chapter10, 'Fondasimu kokoh! Godot Crystal kesepuluh menyala. Bicara lagi denganku untuk lanjut ke Bab 11 (AI dan NPC).');
}

export async function interactNada(ui) {
  if (!state.hasFlag('nada_met')) {
    const c = await ui.dialog({
      who: NADA,
      pages: [
        `Halo, ${state.data.name}! Aku Kak Nada, teknisi suara akademi.`,
        'Lihat bar di dinding itu? Itu irama musik latar. Di sini kamu belajar memutar suara, mengatur volume, membuat efek partikel, dan transisi layar.',
        'Siap mulai Bab 12?',
      ],
      choices: ['Siap!', 'Nanti dulu'],
    });
    state.setFlag('nada_met');
    if (c === 0) await openChapter(ui, chapter12);
    return;
  }
  await stageFlow(ui, NADA, chapter12, 'Gimmu terdengar dan terlihat hidup! Godot Crystal kedua belas menyala. Bab 13 (Save System) hadir di pembaruan berikutnya.');
}

export async function interactSrv(ui) {
  if (!state.hasFlag('srv_met')) {
    const c = await ui.dialog({
      who: SRV,
      pages: [
        `Selamat datang di Server Room, ${state.data.name}. Aku Mas Server.`,
        'Di sini kita menjaga data. Gim yang bagus harus mengingat progres pemain, bahkan setelah gimnya ditutup.',
        'Siap mulai Bab 13?',
      ],
      choices: ['Siap!', 'Nanti dulu'],
    });
    state.setFlag('srv_met');
    if (c === 0) await openChapter(ui, chapter13);
    return;
  }
  await stageFlow(ui, SRV, chapter13, 'Datamu aman! Godot Crystal ketiga belas menyala. Bab 14 (Debugging dan Optimasi) hadir di pembaruan berikutnya.');
}

export async function interactServerDoor(ui) {
  const who = { name: 'Pintu Server Room', portrait: 'nada' };
  if (!state.hasFlag('quest_q_ch12')) {
    A.sfx('bad');
    await ui.dialog({ who, pages: ['Pintu terkunci. Selesaikan Misi Bab 12 dari Kak Nada untuk membukanya.'] });
  } else {
    bus.emit('goto:scene', 'Server');
  }
}

export async function interactAudioDoor(ui) {
  const who = { name: 'Pintu Ruang Audio', portrait: 'arsi' };
  if (!state.hasFlag('quest_q_ch11')) {
    A.sfx('bad');
    await ui.dialog({ who, pages: ['Pintu terkunci. Selesaikan Misi Bab 11 dari Dr. Arsitek untuk membukanya.'] });
  } else {
    bus.emit('goto:scene', 'Audio');
  }
}

export async function interactAIDoor(ui) {
  const who = { name: 'Pintu Laboratorium AI', portrait: 'lvl' };
  if (!state.hasFlag('quest_q_ch9')) {
    A.sfx('bad');
    await ui.dialog({ who, pages: ['Pintu terkunci. Selesaikan Misi Bab 9 dari Mas Level untuk membukanya.'] });
  } else {
    bus.emit('goto:scene', 'AI');
  }
}

export async function interactLevelDoor(ui) {
  const who = { name: 'Pintu Ruang Desain Level', portrait: 'pus' };
  if (!state.hasFlag('quest_q_ch7')) {
    A.sfx('bad');
    await ui.dialog({ who, pages: ['Pintu terkunci. Selesaikan Misi Bab 7 dari Pustakawan Data untuk membukanya.'] });
  } else {
    bus.emit('goto:scene', 'Level');
  }
}

export async function interactLibDoor(ui) {
  const who = { name: 'Pintu Perpustakaan', portrait: 'bu' };
  if (!state.hasFlag('quest_q_ch6')) {
    A.sfx('bad');
    await ui.dialog({ who, pages: ['Pintu terkunci. Selesaikan Misi Bab 6 dari Bu Animasi untuk membukanya.'] });
  } else {
    bus.emit('goto:scene', 'Library');
  }
}

export async function interactAnimDoor(ui) {
  const who = { name: 'Pintu Studio Animasi', portrait: 'coach' };
  if (!state.hasFlag('quest_q_ch5')) {
    A.sfx('bad');
    await ui.dialog({ who, pages: ['Pintu terkunci. Selesaikan Misi Bab 5 dari Coach Vektor untuk membukanya.'] });
  } else {
    bus.emit('goto:scene', 'Anim');
  }
}

export async function interactArenaDoor(ui) {
  const who = { name: 'Pintu Arena Gim', portrait: 'robo' };
  if (!state.hasFlag('quest_q_ch4')) {
    A.sfx('bad');
    await ui.dialog({ who, pages: ['Pintu terkunci. Selesaikan Misi Bab 4 dari RoboGuard untuk membukanya.'] });
  } else {
    bus.emit('goto:scene', 'Arena');
  }
}

export async function interactCodeDoor(ui) {
  const who = { name: 'Pintu Ruang Pemrograman', portrait: 'kak' };
  if (!state.hasFlag('quest_q_ch3')) {
    A.sfx('bad');
    await ui.dialog({ who, pages: ['Pintu terkunci. Selesaikan Misi Bab 3 dari Kak Syntax untuk membukanya.'] });
  } else {
    bus.emit('goto:scene', 'Code');
  }
}

export async function interactLabDoor(ui) {
  const who = { name: 'Pintu Laboratorium', portrait: 'kak' };
  if (!state.hasFlag('quest_q_ch2')) {
    A.sfx('bad');
    await ui.dialog({ who, pages: ['Pintu laboratorium terkunci. Selesaikan Misi Bab 2 dari Kak Syntax untuk membukanya.'] });
  } else {
    bus.emit('goto:scene', 'Lab');
  }
}

export async function interactDoor(ui) {
  const who = { name: 'Pintu Ruang Kelas', portrait: 'prof' };
  if (!state.hasFlag('quest_q_ch1')) {
    A.sfx('bad');
    await ui.dialog({ who, pages: ['Pintu terkunci oleh sistem sekolah. Selesaikan Misi Bab 1 dari Profesor Pixel untuk membukanya.'] });
  } else {
    bus.emit('goto:scene', 'Classroom');
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
