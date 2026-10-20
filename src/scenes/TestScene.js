import { ui } from '../systems/UIManager.js';
import { state } from '../systems/GameState.js';
import { QuestManager } from '../systems/QuestManager.js';
import { bus } from '../core/bus.js';
import { interactDebug } from '../systems/LearningManager.js';
import WorldScene from './WorldScene.js';

const BARS = [[120, 280, 4, 'h'], [560, 280, 4, 'h'], [250, 180, 3, 'v'], [518, 180, 3, 'v']];

export default class TestScene extends WorldScene {
  constructor() { super('Test'); }

  build() {
    const W = (this.W = 800), H = (this.H = 480);
    this.minY = 120;
    this.spawn = { x: 400, y: 410 };
    state.data.location = 'test';
    this.add.tileSprite(0, 0, W, H, 'floor').setOrigin(0).setTint(0xe3b9b9);
    this.add.image(0, 0, 'xwall').setOrigin(0).setDepth(150);
    this.wall(0, 0, W, 100);
    BARS.forEach(([x, y, n, dir]) => {
      for (let i = 0; i < n; i++) {
        const bx = dir === 'h' ? x + i * 32 : x, by = dir === 'h' ? y : y + i * 32;
        this.add.image(bx, by, 'block').setOrigin(0).setDepth(by + 32);
        this.wall(bx, by, 32, 32);
      }
    });
    this.add.image(400, H, 'cdoor').setOrigin(0.5, 1).setDepth(H);

    const npc = this.add.sprite(400, 210, 'debug', 'f0').setOrigin(0.5, 1).setDepth(210);
    this.tweens.add({ targets: npc, y: 208, duration: 700, yoyo: true, repeat: -1 });
    this.wall(390, 200, 20, 10);

    this.coinDefs = [['x1', 40, 440], ['x2', 760, 440]];
    this.things = [
      { x: 400, y: 210, r: 60, hy: 165, label: 'Bicara dengan Pak Debug', run: () => interactDebug(ui) },
      { x: 400, y: 450, r: 50, hy: 415, label: 'Kembali ke Server Room', run: () => bus.emit('goto:scene', 'Server', { x: 620, y: 135 }) },
    ];
    this.mmBg = (c, k) => {
      c.fillStyle = '#b08a8a'; c.fillRect(0, 0, W * k, H * k);
      c.fillStyle = '#3b1f2b'; c.fillRect(0, 0, W * k, 100 * k);
      c.fillStyle = '#2c5d8f';
      BARS.forEach(([x, y, n, dir]) => c.fillRect(x * k, y * k, (dir === 'h' ? n * 32 : 32) * k, (dir === 'h' ? 32 : n * 32) * k));
      c.fillStyle = '#ffb347'; c.fillRect(400 * k - 2, 210 * k - 2, 4, 4);
    };
  }

  onReady() {
    // Kutu bug dekoratif yang merayap (tidak berbahaya, hanya hiasan)
    [[120, 400, 360], [520, 440, 700], [90, 230, 200], [620, 230, 720]].forEach(([x, y, x2], i) => {
      const bug = this.add.image(x, y, 'bug').setScale(1.5).setDepth(y);
      this.tweens.add({
        targets: bug, x: x2, duration: 2600 + i * 500, yoyo: true, repeat: -1,
        onYoyo: () => bug.setFlipX(true), onRepeat: () => bug.setFlipX(false),
      });
    });
    this.time.delayedCall(400, () => {
      state.setFlag('testRoom');
      QuestManager.check();
      if (!state.hasFlag('debug_met')) ui.toast('Temui Pak Debug di tengah ruangan. Kutu merah itu hanya hiasan.');
    });
  }
}
