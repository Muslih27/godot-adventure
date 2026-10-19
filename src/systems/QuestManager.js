import { quests } from '../data/quests.js';
import { state } from './GameState.js';
import { bus } from '../core/bus.js';

export const QuestManager = {
  all: () => quests,
  isDone: (q) => state.hasFlag('quest_' + q.id),
  isAvailable(q) {
    const req = quests.find((x) => x.id === q.requires);
    return !req || this.isDone(req);
  },
  // Quest utama berikutnya yang aktif (untuk HUD)
  active() {
    return quests.find((q) => q.type === 'Utama' && this.isAvailable(q) && !this.isDone(q)) || null;
  },
  // Periksa kondisi selesai; beri reward satu kali per quest.
  check() {
    for (const q of quests) {
      if (this.isDone(q) || !this.isAvailable(q) || !q.done(state.data)) continue;
      state.data.flags['quest_' + q.id] = true;
      const r = q.reward || {};
      state.data.xp += r.xp || 0;
      state.data.coins += r.coins || 0;
      state.data.crystals += r.crystals || 0;
      state.commit();
      bus.emit('quest:complete', q);
    }
  },
};
