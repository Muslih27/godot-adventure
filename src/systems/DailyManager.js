// Hadiah login harian dan misi harian. Memakai jam perangkat; tanpa server.
import { state } from './GameState.js';
import { bus } from '../core/bus.js';

const POOL = [
  { id: 'bugs', t: 'Kalahkan 5 bug', goal: 5, reward: 20 },
  { id: 'coins', t: 'Kumpulkan 2 Koin Akademi', goal: 2, reward: 15 },
  { id: 'rooms', t: 'Kunjungi 3 ruangan berbeda', goal: 3, reward: 20 },
  { id: 'quiz', t: 'Selesaikan 1 kuis', goal: 1, reward: 25 },
];
const LOGIN = [10, 15, 20, 25, 30, 40, 60];
const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const todayKey = () => key(new Date());
const yesterdayKey = () => { const d = new Date(); d.setDate(d.getDate() - 1); return key(d); };

export const DailyManager = {
  init() { bus.on('track', (k, v) => this.track(k, v)); },
  ensure() {
    const d = state.data;
    if (d.dq.date !== todayKey()) d.dq = { date: todayKey(), prog: { bugs: 0, coins: 0, rooms: [], quiz: 0 }, claimed: {} };
  },
  today() {
    this.ensure();
    const n = Math.floor(new Date().setHours(0, 0, 0, 0) / 86400000);
    return [0, 1, 2].map((i) => POOL[(n + i) % POOL.length]);
  },
  track(k, v) {
    this.ensure();
    const p = state.data.dq.prog;
    if (k === 'room') { if (!p.rooms.includes(v)) p.rooms.push(v); }
    else if (k in p) p[k] += 1;
    state.commit();
  },
  progress(q) {
    const p = state.data.dq.prog;
    return q.id === 'rooms' ? p.rooms.length : p[q.id];
  },
  claimQuest(q) {
    this.ensure();
    const dq = state.data.dq;
    if (dq.claimed[q.id] || this.progress(q) < q.goal) return false;
    dq.claimed[q.id] = true;
    state.data.coins += q.reward;
    state.commit();
    return true;
  },
  loginAvailable() { return state.data.daily.last !== todayKey(); },
  nextStreak() { return state.data.daily.last === yesterdayKey() ? state.data.daily.streak + 1 : 1; },
  nextLoginReward() { return LOGIN[(this.nextStreak() - 1) % LOGIN.length]; },
  claimLogin() {
    if (!this.loginAvailable()) return 0;
    const reward = this.nextLoginReward();
    state.data.daily = { last: todayKey(), streak: this.nextStreak() };
    state.data.coins += reward;
    state.commit();
    return reward;
  },
  hasClaimable() {
    this.ensure();
    return this.loginAvailable() || this.today().some((q) => !state.data.dq.claimed[q.id] && this.progress(q) >= q.goal);
  },
};
