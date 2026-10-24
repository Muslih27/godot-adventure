import { esc } from '../core/util.js';
import { state } from '../systems/GameState.js';
import { AudioManager as A } from '../systems/AudioManager.js';
import { shopItems } from '../data/shop.js';
import { titles, titleUnlocked } from '../data/titles.js';
import { previews } from '../assets/textures.js';
import { tabbed } from './profile.js';

export function openShop(ui) {
  const itemTab = (cat, slot) => (el, redraw) => {
    const d = state.data;
    el.innerHTML = `<p>Koin kamu: <b>${d.coins}</b>. Barang di toko hanya mengubah tampilan, tidak mempengaruhi permainan.</p><div class="shop">${shopItems.filter((i) => i.cat === cat).map((i) => {
      const own = d.owned.includes(i.id), on = d.equip[slot] === i.id;
      const locked = !own && i.req && !d.flags[i.req.flag];
      const label = locked ? 'Terkunci' : !own ? (i.price === 0 ? 'Ambil (gratis)' : d.coins >= i.price ? `Beli (${i.price})` : `Butuh ${i.price} koin`) : on ? 'Lepas' : 'Pakai';
      const sub = locked ? `Rahasia: ${i.req.hint}` : own ? (on ? 'Dipakai' : 'Dimiliki') : i.price === 0 ? 'Gratis' : `${i.price} koin`;
      return `<div class="card item"><img src="${previews[i.tex] || ''}" alt=""><div><h3>${esc(i.name)}</h3><p class="muted">${esc(sub)}</p></div>
        <button class="btn ${own && !on ? 'primary' : ''}" data-id="${i.id}" ${locked || (!own && d.coins < i.price) ? 'disabled' : ''}>${label}</button></div>`;
    }).join('')}</div>`;
    el.querySelectorAll('[data-id]').forEach((b) => (b.onclick = () => {
      const item = shopItems.find((x) => x.id === b.dataset.id);
      if (item.req && !state.data.flags[item.req.flag]) return;
      if (!d.owned.includes(item.id)) {
        if (!state.buy(item)) return;
        A.sfx('coin');
        state.equip(slot, item.id);
        ui.toast(`${item.name} ${item.price ? 'dibeli' : 'diambil'} dan dipakai.`, 'good');
      } else {
        A.sfx('click');
        state.equip(slot, d.equip[slot] === item.id ? '' : item.id);
      }
      redraw();
    }));
  };
  tabbed(ui, 'Toko Akademi', {
    Topi: itemTab('hat', 'hat'),
    Peliharaan: itemTab('pet', 'pet'),
    Gelar(el, redraw) {
      el.innerHTML = `<p>Gelar tampil di bawah namamu. Gelar dibuka lewat prestasi, bukan dibeli.</p><div class="shop">${titles.map((t) => {
        const ok = titleUnlocked(t, state.data.flags), on = state.data.equip.title === t.id;
        return `<div class="card item"><div><h3>${esc(t.name)}</h3><p class="muted">${ok ? (on ? 'Dipakai' : 'Terbuka') : `Terkunci: ${esc(t.hint)}`}</p></div>
          <button class="btn ${ok && !on ? 'primary' : ''}" data-t="${t.id}" ${ok && !on ? '' : 'disabled'}>${on ? 'Dipakai' : ok ? 'Pakai' : 'Terkunci'}</button></div>`;
      }).join('')}</div>`;
      el.querySelectorAll('[data-t]').forEach((b) => (b.onclick = () => { A.sfx('click'); state.equip('title', b.dataset.t); redraw(); }));
    },
  });
}
