import { ui } from '../systems/UIManager.js';
import { state } from '../systems/GameState.js';
import { QuestManager } from '../systems/QuestManager.js';
import { bus } from '../core/bus.js';
import { interactPus, interactLevelDoor } from '../systems/LearningManager.js';
import WorldScene from './WorldScene.js';

const SHELVES = [[100, 230], [100, 330], [700, 230], [700, 330]];

export default class LibraryScene extends WorldScene {
  constructor() { super('Library'); }

  build() {
    const W = (this.W = 800), H = (this.H = 480);
    this.minY = 120;
    this.spawn = { x: 400, y: 410 };
    state.data.location = 'library';
    this.add.tileSprite(0, 0, W, H, 'floor').setOrigin(0).setTint(0xd9c8a8);
    this.add.image(0, 0, 'bwall').setOrigin(0).setDepth(150);
    this.wall(0, 0, W, 100);
    SHELVES.forEach(([x, y]) => {
      this.add.image(x, y, 'shelf').setOrigin(0.5, 1).setDepth(y);
      this.wall(x - 32, y - 30, 64, 30);
    });
    for (const x of [300, 500]) {
      this.add.image(x, 340, 'desk').setOrigin(0.5, 1).setDepth(340);
      this.wall(x - 24, 324, 48, 16);
    }
    this.add.image(400, H, 'cdoor').setOrigin(0.5, 1).setDepth(H);

    const pus = this.add.sprite(400, 210, 'pus', 'f0').setOrigin(0.5, 1).setDepth(210);
    this.tweens.add({ targets: pus, y: 208, duration: 800, yoyo: true, repeat: -1 });
    this.wall(390, 200, 20, 10);

    this.add.image(620, 102, 'tdoor').setOrigin(0.5, 1).setDepth(151);
    this.enemyDefs = [{ x: 170, y: 170, axis: 'x', range: 70, tint: 0xd4c0ff, hp: 2 }, { x: 630, y: 170, axis: 'x', range: 70, tint: 0xd4c0ff, hp: 2 }, { x: 760, y: 300, axis: 'y', range: 50, tint: 0xd4c0ff, hp: 2 }];
    this.coinDefs = [['b1', 40, 440], ['b2', 760, 150]];
    this.things = [
      { x: 400, y: 210, r: 60, hy: 165, label: 'Bicara dengan Pustakawan Data', run: () => interactPus(ui) },
      { x: 620, y: 125, r: 55, hy: 95, label: 'Masuk Ruang Desain Level', run: () => interactLevelDoor(ui) },
      { x: 400, y: 450, r: 50, hy: 415, label: 'Kembali ke Studio Animasi', run: () => bus.emit('goto:scene', 'Anim', { x: 640, y: 135 }) },
    ];
    this.mmBg = (c, k) => {
      c.fillStyle = '#a8977a'; c.fillRect(0, 0, W * k, H * k);
      c.fillStyle = '#2d3f55'; c.fillRect(0, 0, W * k, 100 * k);
      c.fillStyle = '#7a4a21'; SHELVES.forEach(([x, y]) => c.fillRect((x - 32) * k, (y - 56) * k, 64 * k, 56 * k));
      c.fillStyle = '#ffb347'; c.fillRect(400 * k - 2, 210 * k - 2, 4, 4);
    };
  }

  onReady() {
    this.time.delayedCall(400, () => {
      state.setFlag('libRoom');
      QuestManager.check();
      if (!state.hasFlag('pus_met')) ui.toast('Temui Pustakawan Data di tengah perpustakaan.');
    });
  }
}
