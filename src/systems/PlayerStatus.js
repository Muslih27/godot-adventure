import { bus } from '../core/bus.js';

// Nyawa pemain (hati). Hanya berlaku di dalam satu ruangan dan tidak disimpan.
export const PlayerStatus = {
  max: 3,
  hp: 3,
  invulnUntil: 0,
  reset() {
    this.hp = this.max;
    this.invulnUntil = 0;
    bus.emit('hp', this.hp);
  },
  // Mengembalikan true jika serangan benar-benar mengenai pemain.
  hit(time) {
    if (time < this.invulnUntil) return false;
    this.hp = Math.max(0, this.hp - 1);
    this.invulnUntil = time + 1500;
    bus.emit('hp', this.hp);
    return true;
  },
};
