import { ui } from '../systems/UIManager.js';
import { state } from '../systems/GameState.js';
import { QuestManager } from '../systems/QuestManager.js';
import { bus } from '../core/bus.js';
import { interactLevel, interactAIDoor } from '../systems/LearningManager.js';
import { talk } from '../systems/FriendManager.js';
import WorldScene from './WorldScene.js';

// Susunan balok seperti "tile": [x, y, jumlah, arah]
const BARS = [[100, 260, 4, 'h'], [580, 260, 4, 'h'], [250, 180, 3, 'v'], [518, 180, 3, 'v']];

export default class LevelScene extends WorldScene {
  constructor() { super('Level'); }

  build() {
    const W = (this.W = 800), H = (this.H = 480);
    this.minY = 120;
    this.spawn = { x: 400, y: 410 };
    state.data.location = 'level';
    this.add.tileSprite(0, 0, W, H, 'floor').setOrigin(0).setTint(0xa8d0ee);
    this.add.image(0, 0, 'twall').setOrigin(0).setDepth(150);
    this.wall(0, 0, W, 100);
    BARS.forEach(([x, y, n, dir]) => {
      for (let i = 0; i < n; i++) {
        const bx = dir === 'h' ? x + i * 32 : x, by = dir === 'h' ? y : y + i * 32;
        this.add.image(bx, by, 'block').setOrigin(0).setDepth(by + 32);
        this.wall(bx, by, 32, 32);
      }
    });
    this.add.image(400, H, 'cdoor').setOrigin(0.5, 1).setDepth(H);

    const npc = this.add.sprite(400, 210, 'lvl', 'f0').setOrigin(0.5, 1).setDepth(210);
    this.tweens.add({ targets: npc, y: 208, duration: 700, yoyo: true, repeat: -1 });
    this.wall(390, 200, 20, 10);

    this.add.image(620, 102, 'idoor').setOrigin(0.5, 1).setDepth(151);
    this.enemyDefs = [{ x: 170, y: 170, axis: 'x', range: 60, tint: 0x9fd0ff, hp: 2 }, { x: 630, y: 170, axis: 'x', range: 60, tint: 0x9fd0ff, hp: 2 }, { x: 760, y: 300, axis: 'y', range: 50, tint: 0x9fd0ff, hp: 2 }];
    this.coinDefs = [['t1', 40, 440], ['t2', 760, 440]];
    this.things = [
      { x: 400, y: 210, r: 60, hy: 165, label: 'Bicara dengan Mas Level', run: () => talk(ui, 'lvl', interactLevel) },
      { x: 620, y: 125, r: 55, hy: 95, label: 'Masuk Laboratorium AI', run: () => interactAIDoor(ui) },
      { x: 400, y: 450, r: 50, hy: 415, label: 'Kembali ke Perpustakaan', run: () => bus.emit('goto:scene', 'Library', { x: 620, y: 135 }) },
    ];
    this.mmBg = (c, k) => {
      c.fillStyle = '#6f9ec2'; c.fillRect(0, 0, W * k, H * k);
      c.fillStyle = '#17426b'; c.fillRect(0, 0, W * k, 100 * k);
      c.fillStyle = '#2c5d8f';
      BARS.forEach(([x, y, n, dir]) => c.fillRect(x * k, y * k, (dir === 'h' ? n * 32 : 32) * k, (dir === 'h' ? 32 : n * 32) * k));
      c.fillStyle = '#ffb347'; c.fillRect(400 * k - 2, 210 * k - 2, 4, 4);
    };
  }

  onReady() {
    this.time.delayedCall(400, () => {
      state.setFlag('levelRoom');
      QuestManager.check();
      if (!state.hasFlag('lvl_met')) ui.toast('Temui Mas Level di tengah ruangan.');
    });
  }
}
