import { ui } from '../systems/UIManager.js';
import { state } from '../systems/GameState.js';
import { QuestManager } from '../systems/QuestManager.js';
import { bus } from '../core/bus.js';
import { interactRobo, interactArenaDoor } from '../systems/LearningManager.js';
import { talk } from '../systems/FriendManager.js';
import WorldScene from './WorldScene.js';

export default class CodeScene extends WorldScene {
  constructor() { super('Code'); }

  build() {
    const W = (this.W = 800), H = (this.H = 480);
    this.minY = 120;
    this.spawn = { x: 400, y: 410 };
    state.data.location = 'code';
    this.add.tileSprite(0, 0, W, H, 'floor').setOrigin(0).setTint(0x9fd6c8);
    this.add.image(0, 0, 'pwall').setOrigin(0).setDepth(150);
    this.wall(0, 0, W, 100);
    for (const y of [250, 350]) {
      for (const x of [110, 210, 590, 690]) {
        this.add.image(x, y, 'desk').setOrigin(0.5, 1).setDepth(y);
        this.wall(x - 24, y - 16, 48, 16);
      }
    }
    this.add.image(400, H, 'cdoor').setOrigin(0.5, 1).setDepth(H);

    const robo = this.add.sprite(400, 210, 'robo', 'f0').setOrigin(0.5, 1).setDepth(210);
    this.tweens.add({ targets: robo, y: 207, duration: 500, yoyo: true, repeat: -1 });
    this.wall(390, 200, 20, 10);

    this.add.image(600, 102, 'adoor').setOrigin(0.5, 1).setDepth(151);
    this.enemyDefs = [{ x: 170, y: 170, axis: 'x', range: 70, tint: 0x9dffb5, hp: 2 }, { x: 630, y: 170, axis: 'x', range: 70, tint: 0x9dffb5, hp: 2 }, { x: 760, y: 300, axis: 'y', range: 50, tint: 0x9dffb5, hp: 2 }];
    this.coinDefs = [['p1', 40, 440], ['p2', 760, 150]];
    this.things = [
      { x: 400, y: 210, r: 60, hy: 165, label: 'Bicara dengan RoboGuard', run: () => talk(ui, 'robo', interactRobo) },
      { x: 600, y: 125, r: 55, hy: 95, label: 'Masuk Arena Gim', run: () => interactArenaDoor(ui) },
      { x: 400, y: 450, r: 50, hy: 415, label: 'Kembali ke Laboratorium', run: () => bus.emit('goto:scene', 'Lab', { x: 620, y: 135 }) },
    ];
    this.mmBg = (c, k) => {
      c.fillStyle = '#5f9c8f'; c.fillRect(0, 0, W * k, H * k);
      c.fillStyle = '#0f3b3a'; c.fillRect(0, 0, W * k, 100 * k);
      c.fillStyle = '#ffb347'; c.fillRect(400 * k - 2, 210 * k - 2, 4, 4);
    };
  }

  onReady() {
    this.time.delayedCall(400, () => {
      state.setFlag('codeRoom');
      QuestManager.check();
      if (!state.hasFlag('robo_met')) ui.toast('Temui RoboGuard di tengah ruangan.');
    });
  }
}
