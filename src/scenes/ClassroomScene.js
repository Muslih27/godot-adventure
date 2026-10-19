import { ui } from '../systems/UIManager.js';
import { state } from '../systems/GameState.js';
import { QuestManager } from '../systems/QuestManager.js';
import { bus } from '../core/bus.js';
import { interactKak, interactLabDoor } from '../systems/LearningManager.js';
import WorldScene from './WorldScene.js';

export default class ClassroomScene extends WorldScene {
  constructor() { super('Classroom'); }

  build() {
    const W = (this.W = 800), H = (this.H = 480);
    this.minY = 120;
    this.spawn = { x: 400, y: 410 };
    state.data.location = 'classroom';
    this.add.tileSprite(0, 0, W, H, 'floor').setOrigin(0);
    this.add.image(0, 0, 'cwall').setOrigin(0).setDepth(150);
    this.wall(0, 0, W, 100);
    for (const y of [260, 330, 400]) {
      for (const x of [120, 250, 550, 680]) {
        this.add.image(x, y, 'desk').setOrigin(0.5, 1).setDepth(y);
        this.wall(x - 24, y - 16, 48, 16);
      }
    }
    this.add.image(400, H, 'cdoor').setOrigin(0.5, 1).setDepth(H);

    this.add.image(610, 102, 'ldoor').setOrigin(0.5, 1).setDepth(151);
    this.coinDefs = [['k1', 50, 440], ['k2', 750, 150]];
    this.things = [
      { x: 400, y: 450, r: 50, hy: 415, label: 'Keluar ke halaman sekolah', run: () => bus.emit('goto:scene', 'School', { x: 480, y: 200 }) },
      { x: 610, y: 125, r: 55, hy: 95, label: 'Masuk Laboratorium Komputer', run: () => interactLabDoor(ui) },
    ];
    // Setelah Bab 2 selesai, Kak Syntax pindah ke laboratorium
    if (!state.hasFlag('quest_q_ch2')) {
      const kak = this.add.sprite(400, 200, 'kak', 'f0').setOrigin(0.5, 1).setDepth(200);
      this.tweens.add({ targets: kak, y: 198, duration: 700, yoyo: true, repeat: -1 });
      this.wall(390, 190, 20, 10);
      this.things.push({ x: 400, y: 200, r: 60, hy: 155, label: 'Bicara dengan Kak Syntax', run: () => interactKak(ui) });
    }
    this.mmBg = (c, k) => {
      c.fillStyle = '#8fb3d1'; c.fillRect(0, 0, W * k, H * k);
      c.fillStyle = '#2c5d8f'; c.fillRect(0, 0, W * k, 100 * k);
      c.fillStyle = '#ffb347'; c.fillRect(400 * k - 2, 200 * k - 2, 4, 4);
    };
  }

  onReady() {
    // Masuk kelas pertama kali menyelesaikan quest "Masuki Ruang Kelas"
    this.time.delayedCall(400, () => {
      state.setFlag('classroom');
      QuestManager.check();
      if (!state.hasFlag('quest_q_ch2')) { if (!state.hasFlag('kak_met')) ui.toast('Temui Kak Syntax di dekat papan tulis.'); } else ui.toast('Kak Syntax menunggu di Laboratorium Komputer (pintu kanan papan tulis).');
    });
  }
}
