import { achievements } from '../data/achievements.js';
import { state } from './GameState.js';
import { bus } from '../core/bus.js';

let busy = false;
export const AchievementManager = {
  isUnlocked: (a) => !!state.data.flags['ach_' + a.id],
  // Periksa semua syarat; setiap prestasi dibuka satu kali.
  check() {
    if (busy) return;
    busy = true;
    const fresh = achievements.filter((a) => !this.isUnlocked(a) && a.test(state.data));
    if (fresh.length) {
      fresh.forEach((a) => { state.data.flags['ach_' + a.id] = true; });
      state.commit();
      bus.emit('achievement', fresh);
    }
    busy = false;
  },
  init() { bus.on('state', () => this.check()); },
};
