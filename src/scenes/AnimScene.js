import { ui } from '../systems/UIManager.js';
import { state } from '../systems/GameState.js';
import { QuestManager } from '../systems/QuestManager.js';
import { bus } from '../core/bus.js';
import { interactBu, interactLibDoor } from '../systems/LearningManager.js';
import WorldScene from './WorldScene.js';

export default class AnimScene extends WorldScene {
  constructor() { super('Anim'); }

  build() {
    const W = (this.W = 800), H = (this.H = 480);
    this.minY = 120;
    this.spawn = { x: 400, y: 410 };
    state.data.location = 'anim';
    this.add.tileSprite(0, 0, W, H, 'floor').setOrigin(0).setTint(0xbfe6d8);
    this.add.image(0, 0, 'nwall').setOrigin(0).setDepth(150);
    this.wall(0, 0, W, 100);
    // Panggung demo: sprite berjalan di tempat (contoh AnimatedSprite2D)
    this.add.rectangle(150, 340, 110, 70, 0x12304f).setStrokeStyle(3, 0xff8a3d).setDepth(300);
    this.wall(95, 305, 110, 70);
    for (const [x, y] of [[600, 260], [700, 260], [600, 360], [700, 360]]) {
      this.add.image(x, y, 'desk').setOrigin(0.5, 1).setDepth(y);
      this.wall(x - 24, y - 16, 48, 16);
    }
    this.add.image(400, H, 'cdoor').setOrigin(0.5, 1).setDepth(H);

    const bu = this.add.sprite(400, 210, 'bu', 'f0').setOrigin(0.5, 1).setDepth(210);
    this.tweens.add({ targets: bu, y: 207, duration: 600, yoyo: true, repeat: -1 });
    this.wall(390, 200, 20, 10);

    this.add.image(640, 102, 'bdoor').setOrigin(0.5, 1).setDepth(151);
    this.coinDefs = [['n1', 40, 440], ['n2', 760, 150]];
    this.things = [
      { x: 400, y: 210, r: 60, hy: 165, label: 'Bicara dengan Bu Animasi', run: () => interactBu(ui) },
      { x: 640, y: 125, r: 55, hy: 95, label: 'Masuk Perpustakaan', run: () => interactLibDoor(ui) },
      { x: 400, y: 450, r: 50, hy: 415, label: 'Kembali ke Arena Gim', run: () => bus.emit('goto:scene', 'Arena', { x: 640, y: 135 }) },
    ];
    this.mmBg = (c, k) => {
      c.fillStyle = '#7fa89a'; c.fillRect(0, 0, W * k, H * k);
      c.fillStyle = '#2a4a6b'; c.fillRect(0, 0, W * k, 100 * k);
      c.fillStyle = '#ffb347'; c.fillRect(400 * k - 2, 210 * k - 2, 4, 4);
    };
  }

  onReady() {
    const av = state.data.avatar;
    // Demo animasi frame: sama seperti AnimatedSprite2D memutar animasi "walk"
    this.add.sprite(150, 335, 'player' + av, 'f0').setOrigin(0.5, 1).setScale(2).setDepth(310).play('walk' + av);
    this.add.text(150, 285, 'animasi "walk"', { fontFamily: 'Nunito, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#e8f6ff' }).setOrigin(0.5).setDepth(311);
    this.time.delayedCall(400, () => {
      state.setFlag('animRoom');
      QuestManager.check();
      if (!state.hasFlag('bu_met')) ui.toast('Temui Bu Animasi di tengah studio.');
    });
  }
}
