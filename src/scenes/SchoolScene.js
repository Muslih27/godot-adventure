import Phaser from 'phaser';
import { ui } from '../systems/UIManager.js';
import { state } from '../systems/GameState.js';
import { QuestManager } from '../systems/QuestManager.js';
import { AudioManager as A } from '../systems/AudioManager.js';
import { bus } from '../core/bus.js';
import { interactProf, interactDoor, interactSign } from '../systems/LearningManager.js';

const W = 960, H = 640;
const TREES = [[120, 220], [820, 200], [200, 440], [760, 450], [110, 560], [860, 560], [300, 210], [660, 215]];
const BENCHES = [[250, 340], [670, 340]];
const COINS = [['c1', 90, 330], ['c2', 880, 330], ['c3', 150, 595]];

export default class SchoolScene extends Phaser.Scene {
  constructor() { super('School'); }

  create() {
    const av = state.data.avatar, key = 'player' + av;
    state.data.location = 'school';
    this.physics.world.setBounds(0, 0, W, H);
    this.cameras.main.setBounds(0, 0, W, H).fadeIn(500);
    this.add.tileSprite(0, 0, W, H, 'grass').setOrigin(0);
    this.add.tileSprite(432, 150, 96, H - 150, 'path').setOrigin(0).setDepth(1);
    this.add.tileSprite(352, 300, 256, 96, 'path').setOrigin(0).setDepth(1);
    this.add.image(0, 0, 'building').setOrigin(0).setDepth(150);
    this.add.image(0, H - 40, 'fence').setOrigin(0).setDepth(H);

    this.solids = [];
    const wall = (x, y, w, h) => { const z = this.add.zone(x + w / 2, y + h / 2, w, h); this.physics.add.existing(z, true); this.solids.push(z); };
    wall(0, 0, W, 140); wall(0, H - 30, 424, 30); wall(536, H - 30, 424, 30);
    TREES.forEach(([x, y]) => { this.add.image(x, y, 'tree').setOrigin(0.5, 1).setDepth(y); wall(x - 12, y - 14, 24, 14); });
    BENCHES.forEach(([x, y]) => { this.add.image(x, y, 'bench').setOrigin(0.5, 1).setDepth(y); wall(x - 32, y - 18, 64, 18); });
    this.add.image(392, 575, 'sign').setOrigin(0.5, 1).setDepth(575); wall(386, 568, 12, 7);

    // Animasi pemain (idle & jalan)
    if (!this.anims.exists('walk' + av)) {
      this.anims.create({ key: 'walk' + av, frames: [{ key, frame: 'f1' }, { key, frame: 'f0' }, { key, frame: 'f2' }, { key, frame: 'f0' }], frameRate: 8, repeat: -1 });
      this.anims.create({ key: 'idle' + av, frames: [{ key, frame: 'f0' }], frameRate: 1 });
    }
    // NPC Profesor Pixel
    const prof = this.add.sprite(480, 340, 'prof', 'f0').setOrigin(0.5, 1).setDepth(340);
    this.tweens.add({ targets: prof, y: 338, duration: 700, yoyo: true, repeat: -1 });
    wall(470, 330, 20, 10);

    const pos = state.data.pos || { x: 480, y: 560 };
    this.player = this.physics.add.sprite(Phaser.Math.Clamp(pos.x, 20, W - 20), Phaser.Math.Clamp(pos.y, 160, H - 40), key, 'f0').setOrigin(0.5, 1);
    this.player.body.setSize(12, 8).setOffset(6, 24);
    this.player.setCollideWorldBounds(true);
    this.solids.forEach((z) => this.physics.add.collider(this.player, z));
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12).setRoundPixels(true);

    // Koin collectible
    COINS.forEach(([id, x, y]) => {
      if (state.data.collected.includes(id)) return;
      const c = this.physics.add.image(x, y, 'coin').setDepth(y);
      this.tweens.add({ targets: c, y: y - 4, duration: 600, yoyo: true, repeat: -1 });
      this.physics.add.overlap(this.player, c, () => this.collect(id, c));
    });

    this.things = [
      { x: 480, y: 330, r: 60, hy: 285, label: 'Bicara dengan Profesor Pixel', run: () => interactProf(ui) },
      { x: 480, y: 170, r: 64, hy: 160, label: 'Periksa pintu Ruang Kelas', run: () => interactDoor(ui) },
      { x: 392, y: 570, r: 50, hy: 530, label: 'Baca papan informasi', run: () => interactSign(ui) },
    ];
    this.hint = this.add.text(0, 0, '', { fontFamily: 'Nunito, sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#06202e', backgroundColor: '#7ee7ff', padding: { x: 6, y: 3 } })
      .setOrigin(0.5, 1).setDepth(10000).setVisible(false);

    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,SPACE,SHIFT');
    this.input.keyboard.addCapture('UP,DOWN,LEFT,RIGHT,SPACE');
    this.nextStep = 0; this.nextMm = 0;
    this.av = av;

    ui.showHud(true);
    this.saveTimer = this.time.addEvent({ delay: 5000, loop: true, callback: () => this.savePos() });
    const toMenu = () => { this.savePos(); this.cameras.main.fadeOut(300); this.time.delayedCall(300, () => this.scene.start('MainMenu')); };
    bus.once('goto:menu', toMenu);
    this.events.once('shutdown', () => {
      bus.off('goto:menu', toMenu);
      this.input.keyboard.clearCaptures();
      ui.showHud(false);
      ui.touch = { x: 0, y: 0 };
    });
    if (!state.hasFlag('met')) this.time.delayedCall(700, () => ui.toast('Cari Profesor Pixel di tengah halaman. Tekan E untuk berbicara.'));
  }

  savePos() {
    if (!this.player) return;
    state.data.pos = { x: Math.round(this.player.x), y: Math.round(this.player.y) };
    state.save();
  }

  collect(id, coin) {
    if (!coin.active) return;
    const { x, y } = coin;
    coin.destroy();
    A.sfx('coin');
    state.collect(id);
    state.addCoins(5);
    const fx = this.add.particles(x, y, 'spark', { speed: { min: 40, max: 120 }, lifespan: 500, scale: { start: 1.5, end: 0 }, tint: 0xffb347, emitting: false }).setDepth(9999);
    fx.explode(12);
    this.time.delayedCall(700, () => fx.destroy());
    const t = this.add.text(x, y - 10, '+5', { fontFamily: 'Silkscreen, monospace', fontSize: '14px', color: '#ffe08a' }).setOrigin(0.5).setDepth(9999);
    this.tweens.add({ targets: t, y: y - 40, alpha: 0, duration: 800, onComplete: () => t.destroy() });
    QuestManager.check();
  }

  update(time) {
    const k = this.keys;
    const { JustDown } = Phaser.Input.Keyboard;
    let act = JustDown(k.E) || JustDown(k.SPACE) || ui.touchAct; // selalu dikonsumsi agar tidak "bocor"
    ui.touchAct = false;
    if (ui.blocked) {
      this.player.setVelocity(0);
      this.player.play('idle' + this.av, true);
      this.hint.setVisible(false);
      return;
    }
    let x = (k.D.isDown || k.RIGHT.isDown ? 1 : 0) - (k.A.isDown || k.LEFT.isDown ? 1 : 0) + ui.touch.x;
    let y = (k.S.isDown || k.DOWN.isDown ? 1 : 0) - (k.W.isDown || k.UP.isDown ? 1 : 0) + ui.touch.y;
    const v = new Phaser.Math.Vector2(x, y);
    const run = k.SHIFT.isDown;
    if (v.lengthSq() > 0) v.normalize().scale(run ? 170 : 110);
    this.player.setVelocity(v.x, v.y);
    const moving = v.lengthSq() > 0;
    this.player.play((moving ? 'walk' : 'idle') + this.av, true);
    if (x < 0) this.player.setFlipX(true); else if (x > 0) this.player.setFlipX(false);
    if (moving && time > this.nextStep) { A.sfx('step'); this.nextStep = time + (run ? 200 : 300); }
    this.player.setDepth(this.player.y);

    let near = null, best = 1e9;
    for (const t of this.things) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, t.x, t.y);
      if (d < t.r && d < best) { best = d; near = t; }
    }
    if (near) this.hint.setText(`[E] ${near.label}`).setPosition(near.x, near.hy).setVisible(true);
    else this.hint.setVisible(false);
    if (act && near) near.run();
    if (time > this.nextMm) { ui.drawMinimap(this.player.x, this.player.y); this.nextMm = time + 100; }
  }
}
