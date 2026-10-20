// AudioManager: efek suara & musik latar sintetis (WebAudio) tanpa file audio eksternal.
let ctx = null;
let timer = null;
let step = 0;
const ac = () => {
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
};
function tone(f, dur = 0.12, type = 'square', vol = 0.04, delay = 0) {
  const c = ac();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  const t = c.currentTime + delay;
  o.type = type;
  o.frequency.value = f;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur);
}
const SFX = {
  click: () => tone(520, 0.06),
  step: () => tone(110, 0.05, 'triangle', 0.03),
  coin: () => { tone(880, 0.08); tone(1320, 0.16, 'square', 0.04, 0.08); },
  ok: () => { tone(660, 0.1); tone(990, 0.18, 'square', 0.04, 0.1); },
  bad: () => { tone(200, 0.2, 'sawtooth', 0.035); },
  door: () => { tone(180, 0.15, 'triangle'); tone(140, 0.25, 'triangle', 0.04, 0.12); },
  levelup: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.16, 'square', 0.04, i * 0.1)),
  attack: () => tone(320, 0.08, 'sawtooth', 0.03),
  hurt: () => { tone(180, 0.18, 'square', 0.05); tone(120, 0.2, 'square', 0.04, 0.1); },
  defeat: () => { tone(660, 0.08); tone(880, 0.1, 'square', 0.04, 0.07); tone(1100, 0.14, 'square', 0.04, 0.14); },
  emote: () => { tone(700, 0.06); tone(900, 0.08, 'square', 0.04, 0.06); },
  quest: () => [392, 523, 659, 784].forEach((f, i) => tone(f, 0.14, 'triangle', 0.05, i * 0.09)),
};
const NOTES = [262, 330, 392, 330, 294, 349, 440, 349];
export const AudioManager = {
  enabled: true,
  unlock() { ac(); },
  sfx(name) { if (this.enabled && SFX[name]) SFX[name](); },
  setEnabled(on) {
    this.enabled = on;
    if (on) this.startMusic(); else this.stopMusic();
  },
  startMusic() {
    if (!this.enabled || timer) return;
    timer = setInterval(() => {
      const n = NOTES[step % NOTES.length];
      tone(n / 2, 0.4, 'triangle', 0.025);
      if (step % 2 === 0) tone(n, 0.2, 'sine', 0.015);
      step++;
    }, 420);
  },
  stopMusic() { clearInterval(timer); timer = null; },
};
