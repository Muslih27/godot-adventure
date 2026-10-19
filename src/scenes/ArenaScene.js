import { ui } from '../systems/UIManager.js';
import { state } from '../systems/GameState.js';
import { QuestManager } from '../systems/QuestManager.js';
import { bus } from '../core/bus.js';
import { interactCoach } from '../systems/LearningManager.js';
import WorldScene from './WorldScene.js';

// Rintangan balok: [x, y, jumlah, arah]
const BARS = [[120, 300, 5, 'h'], [500, 260, 5, 'h'], [300, 200, 3, 'v']];

export default class ArenaScene extends WorldScene {
  constructor() { super('Arena'); }

  build() {
    const W = (this.W = 800), H = (this.H = 480);
    this.minY = 120;
    this.spawn = { x: 400, y: 410 };
    state.data.location = 'arena';
    this.add.tileSprite(0, 0, W, H, 'floor').setOrigin(0).setTint(0xe6c9a5);
    this.add.image(0, 0, 'awall').setOrigin(0).setDepth(150);
    this.wall(0, 0, W, 100);
    BARS.forEach(([x, y, n, dir]) => {
      for (let i = 0; i < n; i++) {
        const bx = dir === 'h' ? x + i * 32 : x, by = dir === 'h' ? y : y + i * 32;
        this.add.image(bx, by, 'block').setOrigin(0).setDepth(by + 32);
        this.wall(bx, by, 32, 32);
      }
    });
    this.add.image(400, H, 'cdoor').setOrigin(0.5, 1).setDepth(H);

    const coach = this.add.sprite(400, 210, 'coach', 'f0').setOrigin(0.5, 1).setDepth(210);
    this.tweens.add({ targets: coach, y: 207, duration: 500, yoyo: true, repeat: -1 });
    this.wall(390, 200, 20, 10);

    this.coinDefs = [['a1', 60, 300], ['a2', 740, 200]];
    this.things = [
      { x: 400, y: 210, r: 60, hy: 165, label: 'Bicara dengan Coach Vektor', run: () => interactCoach(ui) },
      { x: 400, y: 450, r: 50, hy: 415, label: 'Kembali ke Ruang Pemrograman', run: () => bus.emit('goto:scene', 'Code', { x: 600, y: 135 }) },
    ];
    this.mmBg = (c, k) => {
      c.fillStyle = '#b79c7e'; c.fillRect(0, 0, W * k, H * k);
      c.fillStyle = '#1d3b73'; c.fillRect(0, 0, W * k, 100 * k);
      c.fillStyle = '#2c5d8f';
      BARS.forEach(([x, y, n, dir]) => c.fillRect(x * k, y * k, (dir === 'h' ? n * 32 : 32) * k, (dir === 'h' ? 32 : n * 32) * k));
      c.fillStyle = '#ffb347'; c.fillRect(400 * k - 2, 210 * k - 2, 4, 4);
    };
  }

  onReady() {
    this.time.delayedCall(400, () => {
      state.setFlag('arena');
      QuestManager.check();
      if (!state.hasFlag('coach_met')) ui.toast('Temui Coach Vektor di tengah arena. Coba tabrak balok untuk merasakan collision.');
    });
  }
}
