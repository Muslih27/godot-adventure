import { ui } from '../systems/UIManager.js';
import { state } from '../systems/GameState.js';
import { interactProf, interactDoor, interactSign } from '../systems/LearningManager.js';
import WorldScene from './WorldScene.js';

const TREES = [[120, 220], [820, 200], [200, 440], [760, 450], [110, 560], [860, 560], [300, 210], [660, 215]];
const BENCHES = [[250, 340], [670, 340]];

export default class SchoolScene extends WorldScene {
  constructor() { super('School'); }

  build() {
    const W = (this.W = 960), H = (this.H = 640);
    this.minY = 160;
    this.viewW = 640; // bagian dunia yang terlihat; kamera mengikuti pemain
    this.viewH = 400;
    this.spawn = { x: 480, y: 560 };
    state.data.location = 'school';
    this.add.tileSprite(0, 0, W, H, 'grass').setOrigin(0);
    this.add.tileSprite(432, 150, 96, H - 150, 'path').setOrigin(0).setDepth(1);
    this.add.tileSprite(352, 300, 256, 96, 'path').setOrigin(0).setDepth(1);
    this.add.image(0, 0, 'building').setOrigin(0).setDepth(150);
    this.add.image(0, H - 40, 'fence').setOrigin(0).setDepth(H);
    this.wall(0, 0, W, 140); this.wall(0, H - 30, 424, 30); this.wall(536, H - 30, 424, 30);
    TREES.forEach(([x, y]) => { this.add.image(x, y, 'tree').setOrigin(0.5, 1).setDepth(y); this.wall(x - 12, y - 14, 24, 14); });
    BENCHES.forEach(([x, y]) => { this.add.image(x, y, 'bench').setOrigin(0.5, 1).setDepth(y); this.wall(x - 32, y - 18, 64, 18); });
    this.add.image(392, 575, 'sign').setOrigin(0.5, 1).setDepth(575); this.wall(386, 568, 12, 7);

    const prof = this.add.sprite(480, 340, 'prof', 'f0').setOrigin(0.5, 1).setDepth(340);
    this.tweens.add({ targets: prof, y: 338, duration: 700, yoyo: true, repeat: -1 });
    this.wall(470, 330, 20, 10);

    this.enemyDefs = [{ x: 200, y: 300, axis: 'x', range: 70, tint: 0xffffff, hp: 2 }, { x: 760, y: 300, axis: 'x', range: 70, tint: 0xffffff, hp: 2 }, { x: 680, y: 410, axis: 'x', range: 60, tint: 0xffffff, hp: 2 }];
    this.coinDefs = [['c1', 90, 330], ['c2', 880, 330], ['c3', 150, 595]];
    this.things = [
      { x: 480, y: 330, r: 60, hy: 285, label: 'Bicara dengan Profesor Pixel', run: () => interactProf(ui) },
      { x: 480, y: 172, r: 64, hy: 160, label: 'Masuk / periksa pintu Ruang Kelas', run: () => interactDoor(ui) },
      { x: 392, y: 570, r: 50, hy: 530, label: 'Baca papan informasi', run: () => interactSign(ui) },
    ];
    this.mmBg = (c, k) => {
      c.fillStyle = '#2f7d4c'; c.fillRect(0, 0, W * k, H * k);
      c.fillStyle = '#d9c79a'; c.fillRect(432 * k, 150 * k, 96 * k, 490 * k);
      c.fillStyle = '#2c5d8f'; c.fillRect(0, 0, W * k, 150 * k);
      c.fillStyle = '#ffb347'; c.fillRect(480 * k - 2, 330 * k - 2, 4, 4);
    };
  }

  onReady() {
    if (!state.hasFlag('met')) this.time.delayedCall(700, () => ui.toast('Cari Profesor Pixel di tengah halaman. Tekan E untuk berbicara.'));
  }
}
