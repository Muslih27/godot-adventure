import { ui } from '../systems/UIManager.js';
import { state } from '../systems/GameState.js';
import { QuestManager } from '../systems/QuestManager.js';
import { bus } from '../core/bus.js';
import { interactArsi, interactAudioDoor } from '../systems/LearningManager.js';
import { talk } from '../systems/FriendManager.js';
import WorldScene from './WorldScene.js';

export default class AIScene extends WorldScene {
  constructor() { super('AI'); }

  build() {
    const W = (this.W = 800), H = (this.H = 480);
    this.minY = 120;
    this.spawn = { x: 400, y: 410 };
    state.data.location = 'ai';
    this.add.tileSprite(0, 0, W, H, 'floor').setOrigin(0).setTint(0xc9b8e8);
    this.add.image(0, 0, 'iwall').setOrigin(0).setDepth(150);
    this.wall(0, 0, W, 100);
    // Jalur patroli robot demo (hanya tampilan)
    this.add.rectangle(220, 350, 260, 10, 0x12304f).setDepth(2);
    for (const [x, y] of [[600, 260], [700, 260], [600, 360], [700, 360]]) {
      this.add.image(x, y, 'desk').setOrigin(0.5, 1).setDepth(y);
      this.wall(x - 24, y - 16, 48, 16);
    }
    this.add.image(400, H, 'cdoor').setOrigin(0.5, 1).setDepth(H);

    const npc = this.add.sprite(400, 210, 'arsi', 'f0').setOrigin(0.5, 1).setDepth(210);
    this.tweens.add({ targets: npc, y: 208, duration: 700, yoyo: true, repeat: -1 });
    this.wall(390, 200, 20, 10);

    this.add.image(620, 102, 'odoor').setOrigin(0.5, 1).setDepth(151);
    this.enemyDefs = [{ x: 170, y: 170, axis: 'x', range: 70, tint: 0xe0b0ff, hp: 2 }, { x: 630, y: 170, axis: 'x', range: 70, tint: 0xe0b0ff, hp: 2 }, { x: 760, y: 300, axis: 'y', range: 50, tint: 0xe0b0ff, hp: 2 }];
    this.coinDefs = [['i1', 40, 440], ['i2', 760, 150]];
    this.things = [
      { x: 400, y: 210, r: 60, hy: 165, label: 'Bicara dengan Dr. Arsitek', run: () => talk(ui, 'arsi', interactArsi) },
      { x: 620, y: 125, r: 55, hy: 95, label: 'Masuk Ruang Audio', run: () => interactAudioDoor(ui) },
      { x: 400, y: 450, r: 50, hy: 415, label: 'Kembali ke Ruang Desain Level', run: () => bus.emit('goto:scene', 'Level', { x: 620, y: 135 }) },
    ];
    this.mmBg = (c, k) => {
      c.fillStyle = '#9d8fbd'; c.fillRect(0, 0, W * k, H * k);
      c.fillStyle = '#0e2a47'; c.fillRect(0, 0, W * k, 100 * k);
      c.fillStyle = '#ffb347'; c.fillRect(400 * k - 2, 210 * k - 2, 4, 4);
    };
  }

  onReady() {
    // Demo FSM: robot berganti antara state IDLE dan PATROL
    const robo = this.add.sprite(110, 350, 'robo', 'f0').setOrigin(0.5, 1).setDepth(350);
    const lbl = this.add.text(110, 305, 'state: IDLE', { fontFamily: 'Silkscreen, monospace', fontSize: '11px', color: '#7ee7ff', backgroundColor: '#031020', padding: { x: 4, y: 2 } }).setOrigin(0.5).setDepth(360);
    let st = 'IDLE', dir = 1;
    this.time.addEvent({
      delay: 2200, loop: true,
      callback: () => {
        st = st === 'IDLE' ? 'PATROL' : 'IDLE';
        lbl.setText('state: ' + st);
        if (st === 'PATROL') {
          const x = dir > 0 ? 330 : 110;
          dir = -dir;
          robo.setFlipX(x < robo.x);
          this.tweens.add({ targets: [robo, lbl], x, duration: 1800 });
        }
      },
    });
    this.time.delayedCall(400, () => {
      state.setFlag('aiRoom');
      QuestManager.check();
      if (!state.hasFlag('arsi_met')) ui.toast('Temui Dr. Arsitek. Perhatikan robot di kiri yang berganti state.');
    });
  }
}
