import { ui } from '../systems/UIManager.js';
import { state } from '../systems/GameState.js';
import { QuestManager } from '../systems/QuestManager.js';
import { bus } from '../core/bus.js';
import { interactSage } from '../systems/LearningManager.js';
import WorldScene from './WorldScene.js';

const BARS = [[160, 270, 3, 'h'], [560, 270, 3, 'h'], [300, 180, 2, 'v'], [470, 180, 2, 'v']];

// Ruang Rahasia: terbuka lewat persahabatan mentor. Berisi 5 pecahan kristal dan Tantangan Kilat.
export default class SecretScene extends WorldScene {
  constructor() { super('Secret'); }

  build() {
    const W = (this.W = 800), H = (this.H = 480);
    this.minY = 120;
    this.spawn = { x: 400, y: 410 };
    state.data.location = 'secret';
    this.add.tileSprite(0, 0, W, H, 'floor').setOrigin(0).setTint(0x8e7bc8);
    this.add.image(0, 0, 'swall').setOrigin(0).setDepth(150);
    this.wall(0, 0, W, 100);
    BARS.forEach(([x, y, n, dir]) => {
      for (let i = 0; i < n; i++) {
        const bx = dir === 'h' ? x + i * 32 : x, by = dir === 'h' ? y : y + i * 32;
        this.add.image(bx, by, 'block').setOrigin(0).setDepth(by + 32).setTint(0xb79cff);
        this.wall(bx, by, 32, 32);
      }
    });
    this.add.image(400, H, 'cdoor').setOrigin(0.5, 1).setDepth(H);

    const npc = this.add.sprite(400, 210, 'sage', 'f0').setOrigin(0.5, 1).setDepth(210);
    this.tweens.add({ targets: npc, y: 208, duration: 900, yoyo: true, repeat: -1 });
    this.wall(390, 200, 20, 10);

    this.enemyDefs = [[170, 170, 'x', 70], [630, 170, 'x', 70], [760, 300, 'y', 50], [40, 300, 'y', 50]]
      .map(([x, y, axis, range]) => ({ x, y, axis, range, tint: 0xb79cff, hp: 3 }));
    this.coinDefs = [['s1', 60, 150, 'shard'], ['s2', 740, 150, 'shard'], ['s3', 60, 430, 'shard'], ['s4', 740, 430, 'shard'], ['s5', 400, 320, 'shard']];
    this.things = [
      { x: 400, y: 210, r: 60, hy: 165, label: 'Bicara dengan Penjaga Rahasia', run: () => interactSage(ui) },
      { x: 400, y: 450, r: 50, hy: 415, label: 'Kembali ke Perpustakaan', run: () => bus.emit('goto:scene', 'Library', { x: 190, y: 135 }) },
    ];
    this.mmBg = (c, k) => {
      c.fillStyle = '#5a4a8a'; c.fillRect(0, 0, W * k, H * k);
      c.fillStyle = '#241046'; c.fillRect(0, 0, W * k, 100 * k);
      c.fillStyle = '#b79cff';
      BARS.forEach(([x, y, n, dir]) => c.fillRect(x * k, y * k, (dir === 'h' ? n * 32 : 32) * k, (dir === 'h' ? 32 : n * 32) * k));
      c.fillStyle = '#ffb347'; c.fillRect(400 * k - 2, 210 * k - 2, 4, 4);
    };
  }

  onReady() {
    this.time.delayedCall(400, () => {
      state.setFlag('secretRoom');
      QuestManager.check();
      if (!state.hasFlag('sage_met')) ui.toast('Ruang rahasia! Temui Penjaga Rahasia, lalu cari 5 pecahan kristal ungu.');
    });
  }
}
