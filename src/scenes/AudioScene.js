import { ui } from '../systems/UIManager.js';
import { state } from '../systems/GameState.js';
import { QuestManager } from '../systems/QuestManager.js';
import { bus } from '../core/bus.js';
import { interactNada, interactServerDoor } from '../systems/LearningManager.js';
import WorldScene from './WorldScene.js';

export default class AudioScene extends WorldScene {
  constructor() { super('Audio'); }

  build() {
    const W = (this.W = 800), H = (this.H = 480);
    this.minY = 120;
    this.spawn = { x: 400, y: 410 };
    state.data.location = 'audio';
    this.add.tileSprite(0, 0, W, H, 'floor').setOrigin(0).setTint(0xb7a8e6);
    this.add.image(0, 0, 'owall').setOrigin(0).setDepth(150);
    this.wall(0, 0, W, 100);
    // Panggung equalizer (animasi dekoratif)
    this.add.rectangle(180, 350, 220, 90, 0x150f33).setStrokeStyle(3, 0x7c3aed).setDepth(300);
    this.wall(70, 305, 220, 90);
    for (const [x, y] of [[600, 260], [700, 260], [600, 360], [700, 360]]) {
      this.add.image(x, y, 'desk').setOrigin(0.5, 1).setDepth(y);
      this.wall(x - 24, y - 16, 48, 16);
    }
    this.add.image(400, H, 'cdoor').setOrigin(0.5, 1).setDepth(H);

    const npc = this.add.sprite(400, 210, 'nada', 'f0').setOrigin(0.5, 1).setDepth(210);
    this.tweens.add({ targets: npc, y: 208, duration: 600, yoyo: true, repeat: -1 });
    this.wall(390, 200, 20, 10);

    this.add.image(620, 102, 'vdoor').setOrigin(0.5, 1).setDepth(151);
    this.enemyDefs = [{ x: 170, y: 170, axis: 'x', range: 70, tint: 0xb8a8ff, hp: 2 }, { x: 630, y: 170, axis: 'x', range: 70, tint: 0xb8a8ff, hp: 2 }, { x: 760, y: 300, axis: 'y', range: 50, tint: 0xb8a8ff, hp: 2 }];
    this.coinDefs = [['o1', 40, 440], ['o2', 760, 150]];
    this.things = [
      { x: 400, y: 210, r: 60, hy: 165, label: 'Bicara dengan Kak Nada', run: () => interactNada(ui) },
      { x: 620, y: 125, r: 55, hy: 95, label: 'Masuk Server Room', run: () => interactServerDoor(ui) },
      { x: 400, y: 450, r: 50, hy: 415, label: 'Kembali ke Laboratorium AI', run: () => bus.emit('goto:scene', 'AI', { x: 620, y: 135 }) },
    ];
    this.mmBg = (c, k) => {
      c.fillStyle = '#8d7fbd'; c.fillRect(0, 0, W * k, H * k);
      c.fillStyle = '#241a4d'; c.fillRect(0, 0, W * k, 100 * k);
      c.fillStyle = '#ffb347'; c.fillRect(400 * k - 2, 210 * k - 2, 4, 4);
    };
  }

  onReady() {
    // Bar equalizer: contoh efek visual lewat tween
    const cols = [0x22d3ee, 0x34d399, 0xff8a3d];
    for (let i = 0; i < 9; i++) {
      const bar = this.add.rectangle(100 + i * 20, 385, 12, 60, cols[i % 3]).setOrigin(0.5, 1).setDepth(310);
      this.tweens.add({ targets: bar, scaleY: { from: 0.2, to: 1 }, duration: 350 + (i * 90) % 400, yoyo: true, repeat: -1, delay: i * 60 });
    }
    this.time.delayedCall(400, () => {
      state.setFlag('audioRoom');
      QuestManager.check();
      if (!state.hasFlag('nada_met')) ui.toast('Temui Kak Nada di tengah ruangan.');
    });
  }
}
