import Phaser from 'phaser';
import { ui } from '../systems/UIManager.js';
import { state } from '../systems/GameState.js';
import { QuestManager } from '../systems/QuestManager.js';
import { AudioManager as A } from '../systems/AudioManager.js';
import { PlayerStatus } from '../systems/PlayerStatus.js';
import { EnemyManager } from '../systems/EnemyManager.js';
import { bus } from '../core/bus.js';
import { cosmetics } from '../data/cosmetics.js';
import { shopItems } from '../data/shop.js';
import { titles, titleUnlocked } from '../data/titles.js';
import { emotes } from '../data/emotes.js';
import { RemotePlayers } from '../systems/RemotePlayers.js';

const LOCATION = { School: 'school', Classroom: 'classroom', Lab: 'lab', Code: 'code', Arena: 'arena', Anim: 'anim', Library: 'library', Level: 'level', AI: 'ai', Audio: 'audio', Server: 'server', Test: 'test', Final: 'final', Garden: 'garden' };

// Kelas dasar semua area yang dapat dijelajahi.
// Subclass mengisi build(): W, H, minY, spawn, things, coinDefs, enemyDefs, mmBg.
export default class WorldScene extends Phaser.Scene {
  wall(x, y, w, h) {
    const z = this.add.zone(x + w / 2, y + h / 2, w, h);
    this.physics.add.existing(z, true);
    this.solids.push(z);
  }

  create() {
    const av = state.data.avatar, key = 'player' + av;
    this.av = av; this.leaving = false;
    this.knockUntil = 0; this.knockV = new Phaser.Math.Vector2();
    this.solids = []; this.things = []; this.coinDefs = []; this.enemyDefs = [];
    this.build();
    const { W, H } = this;
    this.physics.world.setBounds(0, 0, W, H);
    this.cameras.main.setBackgroundColor('#071a30').fadeIn(500);
    if (this.viewW === undefined) { this.viewW = W; this.viewH = H; }
    PlayerStatus.reset();
    bus.emit('track', 'room', state.data.location);

    [0, 1].forEach((a) => {
      const k = 'player' + a;
      if (this.anims.exists('walk' + a)) return;
      this.anims.create({ key: 'walk' + a, frames: [{ key: k, frame: 'f1' }, { key: k, frame: 'f0' }, { key: k, frame: 'f2' }, { key: k, frame: 'f0' }], frameRate: 8, repeat: -1 });
      this.anims.create({ key: 'idle' + a, frames: [{ key: k, frame: 'f0' }], frameRate: 1 });
    });
    const pos = state.data.pos || this.spawn;
    this.player = this.physics.add.sprite(Phaser.Math.Clamp(pos.x, 20, W - 20), Phaser.Math.Clamp(pos.y, this.minY, H - 4), key, 'f0').setOrigin(0.5, 1);
    this.player.body.setSize(12, 8).setOffset(6, 24);
    this.player.setCollideWorldBounds(true);
    this.solids.forEach((z) => this.physics.add.collider(this.player, z));
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12).setRoundPixels(true);
    this.fitCamera();
    this.scale.on('resize', this.fitCamera, this);
    const applyCos = () => {
      const c = cosmetics.find((x) => x.id === state.data.cosmetic);
      if (c && c.tint) this.player.setTint(c.tint); else this.player.clearTint();
    };
    applyCos();
    bus.on('cosmetic', applyCos);

    // Nama, gelar, topi, dan peliharaan (gaya avatar Roblox)
    this.tag = this.add.text(0, 0, '', { fontFamily: 'Nunito, sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#ffffff', align: 'center', stroke: '#06202e', strokeThickness: 3 }).setOrigin(0.5, 1).setDepth(10001);
    this.hat = null; this.pet = null; this.bubble = null; this.petPos = { x: 0, y: 0 };
    const applyEquip = () => {
      const eq = state.data.equip, own = state.data.owned;
      if (this.hat) this.hat.destroy();
      if (this.pet) this.pet.destroy();
      this.hat = null; this.pet = null;
      const h = shopItems.find((i) => i.id === eq.hat && own.includes(i.id));
      const p = shopItems.find((i) => i.id === eq.pet && own.includes(i.id));
      if (h) this.hat = this.add.image(0, 0, h.tex).setOrigin(0.5, 1);
      if (p) {
        this.pet = this.add.image(this.player.x - 24, this.player.y, p.tex).setOrigin(0.5, 1);
        this.petPos = { x: this.pet.x, y: this.pet.y };
      }
      const t = titles.find((x) => x.id === eq.title && titleUnlocked(x, state.data.flags)) || titles[0];
      this.tag.setText(`${state.data.name}\n${t.name}`);
    };
    applyEquip();
    bus.on('equip', applyEquip);
    const onEmote = (i) => this.emote(i);
    bus.on('emote', onEmote);
    this.remote = new RemotePlayers(this);

    this.enemies = new EnemyManager(this, this.enemyDefs);

    this.coinDefs.forEach(([id, x, y]) => {
      if (state.data.collected.includes(id)) return;
      const c = this.physics.add.image(x, y, 'coin').setDepth(y);
      this.tweens.add({ targets: c, y: y - 4, duration: 600, yoyo: true, repeat: -1 });
      this.physics.add.overlap(this.player, c, () => this.collect(id, c));
    });

    this.hint = this.add.text(0, 0, '', { fontFamily: 'Nunito, sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#06202e', backgroundColor: '#7ee7ff', padding: { x: 6, y: 3 } })
      .setOrigin(0.5, 1).setDepth(10000).setVisible(false);
    // enableCapture=false: Phaser tidak memblokir tombol, sehingga mengetik di kolom input tetap normal.
    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,SPACE,SHIFT,F,ONE,TWO,THREE,FOUR,FIVE,SIX', false);
    this.nextStep = 0; this.nextMm = 0;

    ui.showHud(true);
    this.time.addEvent({ delay: 5000, loop: true, callback: () => this.savePos() });
    const toMenu = () => { this.savePos(); this.leaving = true; this.cameras.main.fadeOut(300); this.time.delayedCall(300, () => this.scene.start('MainMenu')); };
    const travel = (target, p) => this.travel(target, p);
    bus.once('goto:menu', toMenu);
    bus.on('goto:scene', travel);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.fitCamera, this);
      this.remote.destroy();
      bus.off('goto:menu', toMenu);
      bus.off('goto:scene', travel);
      bus.off('cosmetic', applyCos);
      bus.off('equip', applyEquip);
      bus.off('emote', onEmote);
      this.input.keyboard.clearCaptures();
      ui.showHud(false);
      ui.touch = { x: 0, y: 0 };
    });
    if (!state.hasFlag('bug_tip')) {
      this.time.delayedCall(2500, () => {
        ui.toast(ui.isTouch ? 'Bug berkeliaran! Hindari, atau ketuk tombol Serang untuk mengalahkannya.' : 'Bug berkeliaran! Hindari, atau tekan F untuk menyerang.');
        state.setFlag('bug_tip');
      });
    }
    this.onReady?.();
  }

  // Zoom mengikuti ukuran layar; ruangan kecil tetap di tengah layar.
  fitCamera() {
    const cam = this.cameras.main, vw = this.scale.width, vh = this.scale.height;
    const zoom = Math.max(0.2, Math.min(vw / this.viewW, vh / this.viewH));
    cam.setZoom(zoom);
    const padX = Math.max(0, (vw / zoom - this.W) / 2), padY = Math.max(0, (vh / zoom - this.H) / 2);
    cam.setBounds(-padX, -padY, this.W + padX * 2, this.H + padY * 2);
  }

  syncVisuals(time) {
    const p = this.player;
    this.tag.setPosition(p.x, p.y - 36 - (this.hat ? 12 : 0));
    if (this.hat) this.hat.setPosition(p.x, p.y - 27).setFlipX(p.flipX).setDepth(p.y + 1).setAlpha(p.alpha);
    if (this.pet) {
      this.petPos.x += (p.x + (p.flipX ? 24 : -24) - this.petPos.x) * 0.12;
      this.petPos.y += (p.y - this.petPos.y) * 0.12;
      this.pet.setPosition(this.petPos.x, this.petPos.y + Math.sin(time / 160) * 1.5).setFlipX(p.flipX).setDepth(this.petPos.y);
    }
    if (this.bubble) this.bubble.setPosition(p.x, p.y - 62 - (this.hat ? 12 : 0));
  }

  emote(i) {
    const text = emotes[i];
    if (!text || this.leaving || ui.blocked) return;
    if (this.bubble) this.bubble.destroy();
    A.sfx('emote');
    const b = this.add.text(this.player.x, this.player.y - 62, text, { fontFamily: 'Nunito, sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#06202e', backgroundColor: '#ffffff', padding: { x: 7, y: 4 } }).setOrigin(0.5, 1).setDepth(10002);
    this.bubble = b;
    this.remote.sendEmote(i);
    this.tweens.add({ targets: this.player, angle: { from: -10, to: 10 }, duration: 110, yoyo: true, repeat: 3, onComplete: () => this.player.setAngle(0) });
    this.time.delayedCall(2200, () => { if (this.bubble === b) { b.destroy(); this.bubble = null; } });
  }

  travel(target, pos) {
    if (this.leaving) return;
    this.leaving = true;
    A.sfx('door');
    state.data.location = LOCATION[target];
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
    bus.emit('track', 'coins');
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
    const atk = JustDown(k.F) || ui.touchAttack;
    const em = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX'].map((n) => JustDown(k[n])).indexOf(true);
    this.syncVisuals(time);
    this.remote.update(time);
    ui.touchAct = false;
    ui.touchAttack = false;
    if (ui.blocked || this.leaving) {
      this.player.setVelocity(0);
      this.player.play('idle' + this.av, true);
      this.hint.setVisible(false);
      this.enemies.freeze();
      return;
    }
    if (atk) this.enemies.attack(time);
    if (em >= 0) this.emote(em);
    if (time < this.knockUntil) {
      this.player.setVelocity(this.knockV.x, this.knockV.y);
      this.enemies.update(time);
      return;
    }
    const x = (k.D.isDown || k.RIGHT.isDown ? 1 : 0) - (k.A.isDown || k.LEFT.isDown ? 1 : 0) + ui.touch.x;
    const y = (k.S.isDown || k.DOWN.isDown ? 1 : 0) - (k.W.isDown || k.UP.isDown ? 1 : 0) + ui.touch.y;
    const v = new Phaser.Math.Vector2(x, y);
    const run = k.SHIFT.isDown || ui.touchRun;
    const mag = Math.min(1, v.length()); // joystick analog: tarik pelan = jalan pelan
    if (mag > 0) v.normalize().scale((run ? 170 : 110) * mag);
    this.player.setVelocity(v.x, v.y);
    const moving = mag > 0;
    this.player.play((moving ? 'walk' : 'idle') + this.av, true);
    if (x < 0) this.player.setFlipX(true); else if (x > 0) this.player.setFlipX(false);
    if (moving && time > this.nextStep) { A.sfx('step'); this.nextStep = time + (run ? 200 : 300); }
    this.player.setDepth(this.player.y);

    let near = null, best = 1e9;
    for (const t of this.things) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, t.x, t.y);
      if (d < t.r && d < best) { best = d; near = t; }
    }
    if (near) this.hint.setText(`[${ui.isTouch ? 'Aksi' : 'E'}] ${typeof near.label === 'function' ? near.label() : near.label}`).setPosition(near.x, near.hy).setVisible(true);
    else this.hint.setVisible(false);
    if (act && near) near.run();
    this.enemies.update(time);
    if (time > this.nextMm) { ui.drawMinimap(this.player.x, this.player.y, this.W, this.H, this.mmBg, this.enemies.positions()); this.nextMm = time + 100; }
  }
}
