import { ui } from '../systems/UIManager.js';
import { state } from '../systems/GameState.js';
import { QuestManager } from '../systems/QuestManager.js';
import { AudioManager as A } from '../systems/AudioManager.js';
import { dateKey } from '../systems/DailyManager.js';
import { festivalNow, festBonus } from '../data/festival.js';
import { bus } from '../core/bus.js';
import { interactTani, openReview } from '../systems/LearningManager.js';
import { talk } from '../systems/FriendManager.js';
import WorldScene from './WorldScene.js';

const COLS = [280, 360, 440, 520];
const ROWS = [200, 270];

// Kebun Akademi (terinspirasi Harvest Moon): tanam, siram setiap hari lewat soal ulasan, lalu panen.
export default class GardenScene extends WorldScene {
  constructor() { super('Garden'); }

  build() {
    const W = (this.W = 800), H = (this.H = 480);
    this.minY = 120;
    this.spawn = { x: 400, y: 410 };
    state.data.location = 'garden';
    this.add.tileSprite(0, 0, W, H, 'grass').setOrigin(0);
    this.add.tileSprite(380, 330, 40, 150, 'path').setOrigin(0).setDepth(1);
    this.add.image(0, 0, 'gwall').setOrigin(0).setDepth(150);
    this.wall(0, 0, W, 100);
    this.plotViews = [];
    COLS.forEach((x0, c) => ROWS.forEach((y0, r) => {
      const i = r * COLS.length + c;
      const soil = this.add.image(x0, y0, 'plot').setDepth(y0);
      const crop = this.add.image(x0, y0 + 12, 'crop0').setOrigin(0.5, 1).setDepth(y0 + 1);
      this.plotViews[i] = { soil, crop };
      this.things.push({
        x: x0, y: y0 + 8, r: 36, hy: y0 - 48,
        label: () => {
          const p = state.data.farm.plots[i];
          return !p.c ? 'Tanam benih' : p.n >= 3 ? 'Panen tanaman' : p.last === dateKey() ? 'Sudah disiram hari ini' : 'Siram (jawab soal ulasan)';
        },
        run: () => this.tendPlot(i),
      });
    }));
    this.add.image(400, H, 'cdoor').setOrigin(0.5, 1).setDepth(H);

    const npc = this.add.sprite(160, 300, 'tani', 'f0').setOrigin(0.5, 1).setDepth(300);
    this.tweens.add({ targets: npc, y: 298, duration: 800, yoyo: true, repeat: -1 });
    this.wall(150, 290, 20, 10);

    this.enemyDefs = [170, 630].map((x) => ({ x, y: 170, axis: 'x', range: 70, tint: 0xa3e635, hp: 2 })).concat([{ x: 760, y: 300, axis: 'y', range: 50, tint: 0xa3e635, hp: 2 }]);
    this.coinDefs = [['g1', 40, 440], ['g2', 760, 150]];
    this.things.push(
      { x: 160, y: 300, r: 60, hy: 250, label: 'Bicara dengan Pak Tani', run: () => talk(ui, 'tani', interactTani) },
      { x: 400, y: 450, r: 50, hy: 415, label: 'Kembali ke halaman sekolah', run: () => bus.emit('goto:scene', 'School', { x: 900, y: 262 }) },
    );
    this.mmBg = (c, k) => {
      c.fillStyle = '#3b9a5c'; c.fillRect(0, 0, W * k, H * k);
      c.fillStyle = '#2f7d4c'; c.fillRect(0, 0, W * k, 100 * k);
      c.fillStyle = '#6b4423';
      COLS.forEach((x0) => ROWS.forEach((y0) => c.fillRect((x0 - 28) * k, (y0 - 20) * k, 56 * k, 40 * k)));
      c.fillStyle = '#ffb347'; c.fillRect(160 * k - 2, 300 * k - 2, 4, 4);
    };
  }

  refreshPlots() {
    const today = dateKey();
    state.data.farm.plots.forEach((p, i) => {
      const v = this.plotViews[i];
      v.crop.setVisible(p.c === 1).setTexture('crop' + p.n);
      v.soil.setTint(p.c === 1 && p.last === today ? 0x9a7a5c : 0xffffff);
    });
  }

  async tendPlot(i) {
    const p = state.data.farm.plots[i], today = dateKey();
    if (!p.c) {
      state.plantPlot(i);
      A.sfx('ok');
      ui.toast('Benih ditanam! Siram setiap hari dengan menjawab soal ulasan. Matang setelah 3 hari disiram.');
    } else if (p.n >= 3) {
      const v = this.plotViews[i];
      state.harvestPlot(i);
      A.sfx('coin');
      const fx = ui.lowFx ? null : this.add.particles(v.soil.x, v.soil.y, 'spark', { speed: { min: 40, max: 130 }, lifespan: 500, scale: { start: 1.6, end: 0 }, tint: 0x22d3ee, emitting: false }).setDepth(9999);
      fx?.explode(14);
      this.time.delayedCall(700, () => fx?.destroy());
      ui.toast(`Panen! +${20 + festBonus('harvest')} koin dan 1 Buah Kristal`, 'good');
      QuestManager.check();
    } else if (p.last === today) {
      ui.toast('Sudah disiram hari ini. Kembali besok untuk menyiram lagi.');
    } else if (await openReview(ui)) {
      state.waterPlot(i, today);
      A.sfx('ok');
      ui.toast(p.n >= 3 ? 'Tanamanmu siap dipanen!' : `Disiram! Tumbuh ${p.n}/3. Kembali besok.`, 'good');
    }
    this.refreshPlots();
  }

  onReady() {
    this.refreshPlots();
    this.add.text(400, 64, `Festival: ${festivalNow().theme.name}`, { fontFamily: 'Nunito, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#ffe08a', stroke: '#06202e', strokeThickness: 3 }).setOrigin(0.5).setDepth(160);
    // Siang malam mengikuti jam perangkat (visual saja)
    const h = new Date().getHours();
    const tone = h >= 20 || h < 5 ? 'rgba(11,16,48,.35)' : h >= 17 ? 'rgba(255,138,61,.12)' : h < 8 ? 'rgba(255,224,138,.08)' : null;
    ui.setDaylight(tone);
    this.events.once('shutdown', () => ui.setDaylight(null));
    this.time.delayedCall(400, () => {
      state.setFlag('gardenRoom');
      QuestManager.check();
      if (!state.hasFlag('tani_met')) ui.toast('Temui Pak Tani di sisi kiri kebun, lalu tanam benih di petak tanah.');
    });
  }
}
