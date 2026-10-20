import { ui } from '../systems/UIManager.js';
import { state } from '../systems/GameState.js';
import { QuestManager } from '../systems/QuestManager.js';
import { bus } from '../core/bus.js';
import { interactKepala } from '../systems/LearningManager.js';
import WorldScene from './WorldScene.js';

export default class FinalScene extends WorldScene {
  constructor() { super('Final'); }

  build() {
    const W = (this.W = 800), H = (this.H = 480);
    this.minY = 120;
    this.spawn = { x: 400, y: 410 };
    state.data.location = 'final';
    this.add.tileSprite(0, 0, W, H, 'floor').setOrigin(0).setTint(0xf0dcae);
    this.add.image(0, 0, 'fwall').setOrigin(0).setDepth(150);
    this.wall(0, 0, W, 100);
    // Karpet menuju panggung kepala akademi
    this.add.rectangle(400, 330, 90, 260, 0x1e3a8a).setStrokeStyle(3, 0xffb347).setDepth(2);
    for (const [x, y] of [[150, 260], [250, 260], [550, 260], [650, 260], [150, 360], [650, 360]]) {
      this.add.image(x, y, 'desk').setOrigin(0.5, 1).setDepth(y);
      this.wall(x - 24, y - 16, 48, 16);
    }
    this.add.image(400, H, 'cdoor').setOrigin(0.5, 1).setDepth(H);

    const npc = this.add.sprite(400, 200, 'kepala', 'f0').setOrigin(0.5, 1).setDepth(200);
    this.tweens.add({ targets: npc, y: 198, duration: 800, yoyo: true, repeat: -1 });
    this.wall(390, 190, 20, 10);

    this.coinDefs = [['f1', 40, 440], ['f2', 760, 440]];
    this.things = [
      { x: 400, y: 200, r: 60, hy: 155, label: 'Bicara dengan Bu Kepala Akademi', run: () => interactKepala(ui) },
      { x: 400, y: 450, r: 50, hy: 415, label: 'Kembali ke Ruang Pengujian', run: () => bus.emit('goto:scene', 'Test', { x: 620, y: 135 }) },
    ];
    this.mmBg = (c, k) => {
      c.fillStyle = '#b8a678'; c.fillRect(0, 0, W * k, H * k);
      c.fillStyle = '#0d2b52'; c.fillRect(0, 0, W * k, 100 * k);
      c.fillStyle = '#1e3a8a'; c.fillRect(355 * k, 200 * k, 90 * k, 260 * k);
      c.fillStyle = '#ffb347'; c.fillRect(400 * k - 2, 200 * k - 2, 4, 4);
    };
  }

  onReady() {
    // 15 kristal di dinding: menyala sesuai jumlah Godot Crystal milik pemain
    for (let i = 0; i < 15; i++) {
      const lit = state.data.crystals > i;
      const x = 80 + i * 45;
      const g = this.add.polygon(x, 38, [0, -13, 10, 0, 0, 13, -10, 0], lit ? 0x22d3ee : 0x1a3552).setDepth(160);
      g.setStrokeStyle(2, lit ? 0xc8f6ff : 0x2c5d8f);
      if (lit) this.tweens.add({ targets: g, alpha: 0.65, duration: 900 + (i % 5) * 150, yoyo: true, repeat: -1 });
    }
    this.time.delayedCall(400, () => {
      state.setFlag('finalRoom');
      QuestManager.check();
      if (!state.hasFlag('kepala_met')) ui.toast('Temui Bu Kepala Akademi di ujung karpet biru.');
    });
  }
}
