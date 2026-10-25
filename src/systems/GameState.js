// GameState: sumber kebenaran tunggal untuk progres pemain (XP, koin, flag, dll).
import { bus } from '../core/bus.js';
import { festBonus, blitzMultiplier } from '../data/festival.js';
import { defaultSave, load, persist, clearSave } from './SaveManager.js';

class GameState {
  constructor() { this.data = defaultSave(); }
  get level() { return Math.floor(this.data.xp / 100) + 1; }
  get xpInLevel() { return this.data.xp % 100; }

  newGame(name, avatar) {
    clearSave();
    this.data = { ...defaultSave(), name, avatar };
    this.save();
  }
  continueGame() {
    const d = load();
    if (!d) return false;
    this.data = d;
    return true;
  }
  save() { persist(this.data); }
  // commit = umumkan perubahan ke UI + autosave pada peristiwa penting
  commit() { bus.emit('state', this.data); this.save(); }

  addXp(n) {
    const before = this.level;
    this.data.xp += n;
    this.commit();
    if (this.level > before) bus.emit('levelup', this.level);
  }
  addCoins(n) { this.data.coins += n; this.commit(); }
  addCrystals(n) { this.data.crystals += n; this.commit(); }
  setFlag(k) { if (!this.data.flags[k]) { this.data.flags[k] = true; this.commit(); return true; } return false; }
  hasFlag(k) { return !!this.data.flags[k]; }
  collect(id) { if (!this.data.collected.includes(id)) { this.data.collected.push(id); this.commit(); } }
  setCosmetic(c) { this.data.cosmetic = c; this.commit(); bus.emit('cosmetic', c); }
  defeatBug() { this.data.bugs += 1; this.data.coins += 1 + festBonus('bug'); this.commit(); bus.emit('track', 'bugs'); }
  plantPlot(i) { this.data.farm.plots[i] = { c: 1, last: '', n: 0 }; this.commit(); }
  waterPlot(i, day) {
    const p = this.data.farm.plots[i];
    p.n = Math.min(3, p.n + 1);
    p.last = day;
    this.commit();
    bus.emit('track', 'water');
  }
  harvestPlot(i) {
    this.data.farm.plots[i] = { c: 0, last: '', n: 0 };
    this.data.farm.harvests += 1;
    this.data.items.fruit += 1;
    this.data.coins += 20 + festBonus('harvest');
    this.commit();
    bus.emit('track', 'harvest');
  }
  // Mengembalikan jumlah hati baru, atau -1 jika hadiah tidak bisa diberikan.
  giveGift(id, day) {
    const f = this.data.friends[id] || { h: 0, last: '' };
    if (this.data.items.fruit < 1 || f.last === day || f.h >= 5) return -1;
    this.data.items.fruit -= 1;
    this.data.friends[id] = { h: f.h + 1, last: day };
    this.data.coins += festBonus('gift');
    this.commit();
    bus.emit('track', 'gift');
    return f.h + 1;
  }
  // Hasil Tantangan Kilat: koin hanya dibayar sekali per hari agar tidak bisa diulang untuk mengumpulkan koin.
  finishBlitz(score, day) {
    const b = this.data.blitz;
    b.best = Math.max(b.best, score);
    let coins = 0;
    if (b.paid !== day) { coins = score * 2 * blitzMultiplier(); b.paid = day; this.data.coins += coins; }
    if (score >= 7) this.data.flags.kilatTop = true;
    this.commit();
    bus.emit('track', 'blitz');
    return coins;
  }
  buy(item) {
    if (this.data.owned.includes(item.id) || this.data.coins < item.price) return false;
    this.data.coins -= item.price;
    this.data.owned.push(item.id);
    this.commit();
    return true;
  }
  equip(slot, id) { this.data.equip[slot] = id; this.commit(); bus.emit('equip'); }
  addBadge(b) { if (!this.data.badges.includes(b)) { this.data.badges.push(b); this.commit(); } }
}
export const state = new GameState();
