import { state } from './GameState.js';
import { bus } from '../core/bus.js';
import { festivalNow, REWARD } from '../data/festival.js';

const KEYMAP = { bugs: 'bug', harvest: 'harvest', blitz: 'blitz', gift: 'gift' };

// Progres tantangan mingguan; di-reset otomatis saat pekan berganti. Stempel tidak ikut di-reset.
export const FestivalManager = {
  init() { bus.on('track', (k) => this.track(k)); },
  ensure() {
    const w = String(festivalNow().week);
    if (state.data.fest.week !== w) state.data.fest = { week: w, prog: { harvest: 0, bug: 0, blitz: 0, gift: 0 }, claimed: false };
  },
  track(k) {
    const key = KEYMAP[k];
    if (!key) return;
    this.ensure();
    state.data.fest.prog[key] += 1;
    state.commit();
  },
  current() {
    this.ensure();
    const { theme, daysLeft } = festivalNow();
    const f = state.data.fest;
    return { theme, daysLeft, progress: Math.min(f.prog[theme.goal.key], theme.goal.n), claimed: f.claimed };
  },
  claimable() { const c = this.current(); return !c.claimed && c.progress >= c.theme.goal.n; },
  claim() {
    if (!this.claimable()) return false;
    state.data.fest.claimed = true;
    state.data.coins += REWARD.coins;
    state.data.stamps += 1;
    state.commit();
    return true;
  },
};
