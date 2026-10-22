import { esc } from '../core/util.js';
import { OnlineManager } from '../systems/OnlineManager.js';
import { normalizeCode, validCode } from '../systems/netcode.js';
import { AudioManager as A } from '../systems/AudioManager.js';
import { bus } from '../core/bus.js';

export function openOnline(ui) {
  const m = ui.openModal({ title: 'Mode Online' });
  const names = { off: 'mati', connecting: 'menghubungkan...', ok: 'tersambung', error: 'gagal' };
  const statusText = () => `Status koneksi: <b>${names[OnlineManager.status] || '-'}</b>${OnlineManager.status === 'error' && OnlineManager.detail ? ` (${esc(OnlineManager.detail)})` : ''}`;
  const onSt = () => { const el = m.body.querySelector('#ostat'); if (el) el.innerHTML = statusText(); };
  bus.on('online:status', onSt);
  m.closed.then(() => bus.off('online:status', onSt));
  const draw = () => {
    const st = OnlineManager.settings, cloud = OnlineManager.hasCloud;
    m.body.innerHTML = `<p>Main bersama teman sekelas: pemain lain dengan <b>kode kelas</b> yang sama di <b>ruangan yang sama</b> akan terlihat bergerak, lengkap dengan nama, gelar, topi, dan emote.</p>
      <div class="card ${st.on ? 'done' : ''}"><h3>Status: ${st.on ? 'Aktif' : 'Mati'}</h3>
        <p class="muted">Mode: ${cloud ? `server online (lintas perangkat) · ${esc(OnlineManager.host)}` : 'uji lokal (hanya antar jendela browser di perangkat ini; buka dua jendela berdampingan)'}</p>
        <p class="muted" id="ostat">${statusText()}</p>
        <label class="field">Kode kelas (3 sampai 12 huruf atau angka)<input id="kode" maxlength="12" autocomplete="off" autocapitalize="characters" value="${esc(st.code)}"></label>
        <div class="nav"><button class="btn primary" data-save="1">${st.on ? 'Simpan kode' : 'Aktifkan'}</button>${st.on ? '<button class="btn" data-off="1">Matikan</button>' : ''}</div></div>
      <p class="muted">Privasi: pemain lain hanya melihat nama panggilan, gelar, dan gerakanmu. Tidak ada chat bebas; komunikasi hanya lewat emote. Hanya pemain dengan kode kelas yang sama yang saling terlihat, jadi bagikan kode hanya kepada teman sekelasmu. Progres, koin, dan bug tetap milikmu sendiri.</p>
      ${cloud ? '' : '<p class="muted">Agar bisa lintas perangkat, pengelola perlu mengisi pengaturan server (lihat README).</p>'}`;
    m.body.querySelector('[data-save]').onclick = () => {
      const code = normalizeCode(m.body.querySelector('#kode').value);
      if (!validCode(code)) { A.sfx('bad'); ui.toast('Kode kelas harus 3 sampai 12 huruf atau angka.', 'bad'); return; }
      A.sfx('ok');
      OnlineManager.setSettings({ on: true, code });
      ui.toast(`Mode online aktif dengan kode ${code}.`, 'good');
      draw();
    };
    m.body.querySelector('[data-off]')?.addEventListener('click', () => { A.sfx('click'); OnlineManager.setSettings({ on: false }); draw(); });
  };
  draw();
}
