import { ui } from '../systems/UIManager.js';
import { state } from '../systems/GameState.js';
import { QuestManager } from '../systems/QuestManager.js';
import { bus } from '../core/bus.js';
import { interactSrv, interactTestDoor } from '../systems/LearningManager.js';
import WorldScene from './WorldScene.js';

const RACKS = [[100, 230], [100, 330], [700, 230], [700, 330]];

export default class ServerScene extends WorldScene {
  constructor() { super('Server'); }

  build() {
    const W = (this.W = 800), H = (this.H = 480);
    this.minY = 120;
    this.spawn = { x: 400, y: 410 };
    state.data.location = 'server';
    this.add.tileSprite(0, 0, W, H, 'floor').setOrigin(0).setTint(0x8fc9c4);
    this.add.image(0, 0, 'vwall').setOrigin(0).setDepth(150);
    this.wall(0, 0, W, 100);
    RACKS.forEach(([x, y]) => {
      this.add.image(x, y, 'rack').setOrigin(0.5, 1).setDepth(y);
      this.wall(x - 24, y - 24, 48, 24);
    });
    for (const x of [300, 500]) {
      this.add.image(x, 340, 'desk').setOrigin(0.5, 1).setDepth(340);
      this.wall(x - 24, 324, 48, 16);
    }
    this.add.image(400, H, 'cdoor').setOrigin(0.5, 1).setDepth(H);

    const npc = this.add.sprite(400, 210, 'srv', 'f0').setOrigin(0.5, 1).setDepth(210);
    this.tweens.add({ targets: npc, y: 208, duration: 800, yoyo: true, repeat: -1 });
    this.wall(390, 200, 20, 10);

    this.add.image(620, 102, 'xdoor').setOrigin(0.5, 1).setDepth(151);
    this.coinDefs = [['v1', 40, 440], ['v2', 760, 150]];
    this.things = [
      { x: 400, y: 210, r: 60, hy: 165, label: 'Bicara dengan Mas Server', run: () => interactSrv(ui) },
      { x: 620, y: 125, r: 55, hy: 95, label: 'Masuk Ruang Pengujian', run: () => interactTestDoor(ui) },
      { x: 400, y: 450, r: 50, hy: 415, label: 'Kembali ke Ruang Audio', run: () => bus.emit('goto:scene', 'Audio', { x: 620, y: 135 }) },
    ];
    this.mmBg = (c, k) => {
      c.fillStyle = '#6aa39e'; c.fillRect(0, 0, W * k, H * k);
      c.fillStyle = '#0b2a2e'; c.fillRect(0, 0, W * k, 100 * k);
      c.fillStyle = '#12414a'; RACKS.forEach(([x, y]) => c.fillRect((x - 24) * k, (y - 64) * k, 48 * k, 64 * k));
      c.fillStyle = '#ffb347'; c.fillRect(400 * k - 2, 210 * k - 2, 4, 4);
    };
  }

  onReady() {
    // Lampu rak berkedip (efek dekoratif)
    RACKS.forEach(([x, y], r) => {
      for (let i = 0; i < 4; i++) {
        const led = this.add.rectangle(x - 18, y - 56 + i * 14, 4, 4, i % 2 ? 0x34d399 : 0x22d3ee).setDepth(y + 1);
        this.tweens.add({ targets: led, alpha: 0.15, duration: 400 + ((r + i) * 170) % 500, yoyo: true, repeat: -1 });
      }
    });
    this.time.delayedCall(400, () => {
      state.setFlag('serverRoom');
      QuestManager.check();
      if (!state.hasFlag('srv_met')) ui.toast('Temui Mas Server di tengah ruangan.');
    });
  }
}
