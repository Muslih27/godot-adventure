// GameState: sumber kebenaran tunggal untuk progres pemain (XP, koin, flag, dll).
import { bus } from '../core/bus.js';
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
  defeatBug() { this.data.bugs += 1; this.data.coins += 1; this.commit(); }
  addBadge(b) { if (!this.data.badges.includes(b)) { this.data.badges.push(b); this.commit(); } }
}
export const state = new GameState();
