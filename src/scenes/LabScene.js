import { ui } from '../systems/UIManager.js';
import { state } from '../systems/GameState.js';
import { QuestManager } from '../systems/QuestManager.js';
import { bus } from '../core/bus.js';
import { interactKakLab, interactCodeDoor } from '../systems/LearningManager.js';
import { talk } from '../systems/FriendManager.js';
import WorldScene from './WorldScene.js';

export default class LabScene extends WorldScene {
  constructor() { super('Lab'); }

  build() {
    const W = (this.W = 800), H = (this.H = 480);
    this.minY = 120;
    this.spawn = { x: 400, y: 410 };
    state.data.location = 'lab';
    this.add.tileSprite(0, 0, W, H, 'floor').setOrigin(0).setTint(0xaebfdc);
    this.add.image(0, 0, 'lwall').setOrigin(0).setDepth(150);
    this.wall(0, 0, W, 100);
    for (const y of [240, 340]) {
      for (const x of [110, 210, 310, 490, 590, 690]) {
        this.add.image(x, y, 'desk').setOrigin(0.5, 1).setDepth(y);
        this.wall(x - 24, y - 16, 48, 16);
      }
    }
    this.add.image(400, H, 'cdoor').setOrigin(0.5, 1).setDepth(H);

    const kak = this.add.sprite(400, 200, 'kak', 'f0').setOrigin(0.5, 1).setDepth(200);
    this.tweens.add({ targets: kak, y: 198, duration: 700, yoyo: true, repeat: -1 });
    this.wall(390, 190, 20, 10);

    this.add.image(620, 102, 'kdoor').setOrigin(0.5, 1).setDepth(151);
    this.enemyDefs = [{ x: 170, y: 170, axis: 'x', range: 70, tint: 0x9fe8ff, hp: 2 }, { x: 630, y: 170, axis: 'x', range: 70, tint: 0x9fe8ff, hp: 2 }, { x: 760, y: 300, axis: 'y', range: 50, tint: 0x9fe8ff, hp: 2 }];
    this.coinDefs = [['l1', 40, 150], ['l2', 760, 420]];
    this.things = [
      { x: 400, y: 200, r: 60, hy: 155, label: 'Bicara dengan Kak Syntax', run: () => talk(ui, 'kak', interactKakLab) },
      { x: 620, y: 125, r: 55, hy: 95, label: 'Masuk Ruang Pemrograman', run: () => interactCodeDoor(ui) },
      { x: 400, y: 450, r: 50, hy: 415, label: 'Kembali ke Ruang Kelas', run: () => bus.emit('goto:scene', 'Classroom', { x: 610, y: 135 }) },
    ];
    this.mmBg = (c, k) => {
      c.fillStyle = '#6f87a8'; c.fillRect(0, 0, W * k, H * k);
      c.fillStyle = '#14304f'; c.fillRect(0, 0, W * k, 100 * k);
      c.fillStyle = '#ffb347'; c.fillRect(400 * k - 2, 200 * k - 2, 4, 4);
    };
  }

  onReady() {
    this.time.delayedCall(400, () => {
      state.setFlag('lab');
      QuestManager.check();
      if (!state.hasFlag('kak_lab_met')) ui.toast('Temui Kak Syntax di dekat layar kode.');
    });
  }
}
