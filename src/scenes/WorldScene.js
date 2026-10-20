import Phaser from 'phaser';
import { ui } from '../systems/UIManager.js';
import { state } from '../systems/GameState.js';
import { QuestManager } from '../systems/QuestManager.js';
import { AudioManager as A } from '../systems/AudioManager.js';
import { bus } from '../core/bus.js';
import { cosmetics } from '../data/cosmetics.js';

// Kelas dasar semua area yang dapat dijelajahi.
// Subclass mengisi build(): this.W, this.H, this.minY, this.spawn, this.things, this.coinDefs, this.mmBg.
export default class WorldScene extends Phaser.Scene {
  wall(x, y, w, h) {
    const z = this.add.zone(x + w / 2, y + h / 2, w, h);
    this.physics.add.existing(z, true);
    this.solids.push(z);
  }

  create() {
    const av = state.data.avatar, key = 'player' + av;
    this.av = av; this.leaving = false;
    this.solids = []; this.things = []; this.coinDefs = [];
    this.build();
    const { W, H } = this;
    this.physics.world.setBounds(0, 0, W, H);
    this.cameras.main.setBounds(0, 0, W, H).fadeIn(500);

    if (!this.anims.exists('walk' + av)) {
      this.anims.create({ key: 'walk' + av, frames: [{ key, frame: 'f1' }, { key, frame: 'f0' }, { key, frame: 'f2' }, { key, frame: 'f0' }], frameRate: 8, repeat: -1 });
      this.anims.create({ key: 'idle' + av, frames: [{ key, frame: 'f0' }], frameRate: 1 });
    }
    const pos = state.data.pos || this.spawn;
    this.player = this.physics.add.sprite(Phaser.Math.Clamp(pos.x, 20, W - 20), Phaser.Math.Clamp(pos.y, this.minY, H - 4), key, 'f0').setOrigin(0.5, 1);
    this.player.body.setSize(12, 8).setOffset(6, 24);
    this.player.setCollideWorldBounds(true);
    this.solids.forEach((z) => this.physics.add.collider(this.player, z));
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12).setRoundPixels(true);
    const applyCos = () => {
      const c = cosmetics.find((x) => x.id === state.data.cosmetic);
      if (c && c.tint) this.player.setTint(c.tint); else this.player.clearTint();
    };
    applyCos();
    bus.on('cosmetic', applyCos);

    this.coinDefs.forEach(([id, x, y]) => {
      if (state.data.collected.includes(id)) return;
      const c = this.physics.add.image(x, y, 'coin').setDepth(y);
      this.tweens.add({ targets: c, y: y - 4, duration: 600, yoyo: true, repeat: -1 });
      this.physics.add.overlap(this.player, c, () => this.collect(id, c));
    });

    this.hint = this.add.text(0, 0, '', { fontFamily: 'Nunito, sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#06202e', backgroundColor: '#7ee7ff', padding: { x: 6, y: 3 } })
      .setOrigin(0.5, 1).setDepth(10000).setVisible(false);
    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,SPACE,SHIFT');
    this.input.keyboard.addCapture('UP,DOWN,LEFT,RIGHT,SPACE');
    this.nextStep = 0; this.nextMm = 0;

    ui.showHud(true);
    this.time.addEvent({ delay: 5000, loop: true, callback: () => this.savePos() });
    const toMenu = () => { this.savePos(); this.leaving = true; this.cameras.main.fadeOut(300); this.time.delayedCall(300, () => this.scene.start('MainMenu')); };
    const travel = (target, pos) => this.travel(target, pos);
    bus.once('goto:menu', toMenu);
    bus.on('goto:scene', travel);
    this.events.once('shutdown', () => {
      bus.off('goto:menu', toMenu);
      bus.off('goto:scene', travel);
      bus.off('cosmetic', applyCos);
      this.input.keyboard.clearCaptures();
      ui.showHud(false);
      ui.touch = { x: 0, y: 0 };
    });
    this.onReady?.();
  }

  travel(target, pos) {
    if (this.leaving) return;
    this.leaving = true;
    A.sfx('door');
    state.data.location = { School: 'school', Classroom: 'classroom', Lab: 'lab', Code: 'code', Arena: 'arena', Anim: 'anim', Library: 'library', Level: 'level', AI: 'ai', Audio: 'audio', Server: 'server' }[target];
    state.data.pos = pos || null;
    state.save();
    this.cameras.main.fadeOut(300);
    this.time.delayedCall(300, () => this.scene.start(target));
  }

  savePos() {
    if (!this.player || this.leaving) return;
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
    const act = JustDown(k.E) || JustDown(k.SPACE) || ui.touchAct; // selalu dikonsumsi agar tidak "bocor"
    ui.touchAct = false;
    if (ui.blocked || this.leaving) {
      this.player.setVelocity(0);
      this.player.play('idle' + this.av, true);
      this.hint.setVisible(false);
      return;
    }
    const x = (k.D.isDown || k.RIGHT.isDown ? 1 : 0) - (k.A.isDown || k.LEFT.isDown ? 1 : 0) + ui.touch.x;
    const y = (k.S.isDown || k.DOWN.isDown ? 1 : 0) - (k.W.isDown || k.UP.isDown ? 1 : 0) + ui.touch.y;
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
    if (time > this.nextMm) { ui.drawMinimap(this.player.x, this.player.y, this.W, this.H, this.mmBg); this.nextMm = time + 100; }
  }
}
