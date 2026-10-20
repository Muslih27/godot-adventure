import { esc } from '../core/util.js';
import { state } from '../systems/GameState.js';
import { DailyManager } from '../systems/DailyManager.js';
import { AudioManager as A } from '../systems/AudioManager.js';

export function openDaily(ui) {
  const m = ui.openModal({ title: 'Misi Harian' });
  const draw = () => {
    const login = DailyManager.loginAvailable();
    const qs = DailyManager.today();
    m.body.innerHTML = `<div class="card ${login ? '' : 'done'}"><h3>Hadiah login harian</h3>
      <p>Streak: <b>${state.data.daily.streak}</b> hari berturut-turut. Hadiah hari ini: <b>${DailyManager.nextLoginReward()} koin</b>.</p>
      <button class="btn ${login ? 'primary' : ''}" data-login="1" ${login ? '' : 'disabled'}>${login ? 'Ambil hadiah' : 'Sudah diambil hari ini'}</button></div>
      <h3>Misi hari ini</h3>${qs.map((q) => {
        const p = Math.min(DailyManager.progress(q), q.goal), done = p >= q.goal, got = !!state.data.dq.claimed[q.id];
        return `<div class="card ${got ? 'done' : ''}"><h3>${esc(q.t)}</h3><div class="bar"><i style="width:${(p / q.goal) * 100}%"></i></div>
          <p class="muted">${p}/${q.goal} · hadiah ${q.reward} koin</p>
          <button class="btn ${done && !got ? 'primary' : ''}" data-q="${q.id}" ${done && !got ? '' : 'disabled'}>${got ? 'Sudah diambil' : done ? 'Ambil hadiah' : 'Belum selesai'}</button></div>`;
      }).join('')}
      <p class="muted">Misi dan hadiah di-reset tiap hari mengikuti jam perangkat, dan progresnya hanya tersimpan di perangkat ini.</p>`;
    m.body.querySelector('[data-login]').onclick = () => {
      const r = DailyManager.claimLogin();
      if (r) { A.sfx('coin'); ui.toast(`+${r} koin dari hadiah harian!`, 'good'); }
      draw();
    };
    m.body.querySelectorAll('[data-q]').forEach((b) => (b.onclick = () => {
      const q = qs.find((x) => x.id === b.dataset.q);
      if (DailyManager.claimQuest(q)) { A.sfx('coin'); ui.toast(`+${q.reward} koin`, 'good'); }
      draw();
    }));
  };
  draw();
}
