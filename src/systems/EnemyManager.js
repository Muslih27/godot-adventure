import Phaser from 'phaser';
import { ui } from './UIManager.js';
import { state } from './GameState.js';
import { PlayerStatus } from './PlayerStatus.js';
import { AudioManager as A } from './AudioManager.js';
import { QuestManager } from './QuestManager.js';
import { festBonus } from '../data/festival.js';

const DETECT = 130;       // jarak deteksi pemain
const LEASH = 230;        // jarak maksimal sebelum musuh menyerah
const CONTACT = 20;       // jarak sentuh yang melukai pemain
const ATTACK_RANGE = 58;  // jangkauan serangan pemain
const RESPAWN = 25000;    // musuh muncul lagi setelah 25 detik

// Musuh "bug" dengan state machine: PATROL, CHASE, STUN (konsep Bab 10 dan 11).
export class EnemyManager {
  constructor(scene, defs = []) {
    this.scene = scene;
    this.nextAttack = 0;
    this.tmp = new Phaser.Math.Vector2();
    this.list = defs.map((d) => this.create(d));
  }

  create(d) {
    const s = this.scene;
    const sprite = s.physics.add.sprite(d.x, d.y, 'bug').setScale(2).setDepth(d.y);
    sprite.body.setSize(12, 8);
    sprite.setCollideWorldBounds(true);
    if (d.tint) sprite.setTint(d.tint);
    s.solids.forEach((z) => s.physics.add.collider(sprite, z));
    const bar = s.add.rectangle(d.x, d.y - 20, 22, 4, 0x34d399).setDepth(9000).setVisible(false);
    return {
      sprite, bar, home: { x: d.x, y: d.y }, axis: d.axis || 'x', range: d.range || 60, dir: 1,
      hp: d.hp || 2, maxHp: d.hp || 2, speed: d.speed || 50, state: 'PATROL', stunUntil: 0,
      tint: d.tint || 0xffffff, alive: true,
    };
  }

  positions() { return this.list.filter((e) => e.alive).map((e) => ({ x: e.sprite.x, y: e.sprite.y })); }
  freeze() { this.list.forEach((e) => e.alive && e.sprite.setVelocity(0)); }

  update(time) {
    const p = this.scene.player;
    for (const e of this.list) {
      if (!e.alive) continue;
      const sp = e.sprite;
      const d = Phaser.Math.Distance.Between(sp.x, sp.y, p.x, p.y - 8);
      const dHome = Phaser.Math.Distance.Between(sp.x, sp.y, e.home.x, e.home.y);
      if (e.state === 'STUN') {
        if (time > e.stunUntil) e.state = 'PATROL';
      } else if (e.state === 'PATROL' && d < DETECT) {
        e.state = 'CHASE';
      } else if (e.state === 'CHASE' && (d > LEASH || dHome > LEASH + 60)) {
        e.state = 'PATROL';
      }
      if (e.state === 'PATROL') this.patrol(e);
      else if (e.state === 'CHASE') {
        const v = this.tmp.set(p.x - sp.x, p.y - 8 - sp.y).normalize().scale(e.speed * 1.6);
        sp.setVelocity(v.x, v.y);
        sp.setFlipX(v.x < 0);
      }
      if (e.state !== 'STUN' && d < CONTACT) this.hitPlayer(time, e);
      e.bar.setPosition(sp.x, sp.y - 20);
      sp.setDepth(sp.y);
    }
  }

  patrol(e) {
    const sp = e.sprite, ax = e.axis;
    const off = ax === 'x' ? sp.x - e.home.x : sp.y - e.home.y;
    const offOther = ax === 'x' ? sp.y - e.home.y : sp.x - e.home.x;
    if (Math.abs(offOther) > 8) {
      const v = this.tmp.set(e.home.x - sp.x, e.home.y - sp.y).normalize().scale(e.speed);
      sp.setVelocity(v.x, v.y);
      return;
    }
    if (off > e.range) e.dir = -1; else if (off < -e.range) e.dir = 1;
    const b = sp.body.blocked;
    if (ax === 'x' && (b.left || b.right)) e.dir = b.left ? 1 : -1;
    if (ax === 'y' && (b.up || b.down)) e.dir = b.up ? 1 : -1;
    sp.setVelocity(ax === 'x' ? e.dir * e.speed : 0, ax === 'y' ? e.dir * e.speed : 0);
    if (ax === 'x') sp.setFlipX(e.dir < 0);
  }

  hitPlayer(time, e) {
    if (!PlayerStatus.hit(time)) return;
    const sc = this.scene, p = sc.player;
    A.sfx('hurt');
    const v = new Phaser.Math.Vector2(p.x - e.sprite.x, p.y - 8 - e.sprite.y);
    if (v.lengthSq() === 0) v.set(0, 1);
    v.normalize().scale(220);
    sc.knockV = v;
    sc.knockUntil = time + 160;
    sc.tweens.add({ targets: p, alpha: 0.3, duration: 90, yoyo: true, repeat: 6, onComplete: () => p.setAlpha(1) });
    e.state = 'STUN';
    e.stunUntil = time + 400;
    e.sprite.setVelocity(-v.x * 0.5, -v.y * 0.5);
    if (PlayerStatus.hp <= 0) this.faint();
  }

  // Tidak ada hukuman berat: kembali ke pintu masuk, nyawa penuh, progres aman.
  faint() {
    const sc = this.scene;
    ui.toast('Kamu kelelahan! Kembali ke pintu masuk ruangan. Progres tetap aman.', 'bad');
    A.sfx('bad');
    PlayerStatus.reset();
    PlayerStatus.invulnUntil = sc.time.now + 2000;
    sc.player.setPosition(sc.spawn.x, sc.spawn.y).setVelocity(0);
    sc.knockUntil = 0;
    sc.cameras.main.flash(300, 255, 255, 255);
    this.list.forEach((e) => {
      if (!e.alive) return;
      e.state = 'PATROL';
      e.sprite.setPosition(e.home.x, e.home.y).setVelocity(0);
    });
  }

  attack(time) {
    if (time < this.nextAttack) return;
    this.nextAttack = time + 450;
    const sc = this.scene, p = sc.player;
    A.sfx('attack');
    const ring = sc.add.circle(p.x, p.y - 10, 12).setStrokeStyle(3, 0x7ee7ff).setDepth(9999);
    sc.tweens.add({ targets: ring, scale: 4.5, alpha: 0, duration: 260, onComplete: () => ring.destroy() });
    for (const e of this.list) {
      if (e.alive && Phaser.Math.Distance.Between(e.sprite.x, e.sprite.y, p.x, p.y - 10) <= ATTACK_RANGE) this.damage(e, time, p);
    }
  }

  damage(e, time, p) {
    const sc = this.scene;
    e.hp -= 1;
    e.sprite.setTintFill(0xffffff);
    sc.time.delayedCall(90, () => { if (e.alive) e.sprite.setTint(e.tint); });
    const v = new Phaser.Math.Vector2(e.sprite.x - p.x, e.sprite.y - (p.y - 10));
    if (v.lengthSq() === 0) v.set(1, 0);
    v.normalize().scale(200);
    e.sprite.setVelocity(v.x, v.y);
    e.state = 'STUN';
    e.stunUntil = time + 280;
    e.bar.setVisible(true).setSize(Math.max(1, 22 * Math.max(0, e.hp) / e.maxHp), 4);
    if (e.hp <= 0) this.defeat(e);
  }

  defeat(e) {
    const sc = this.scene, { x, y } = e.sprite;
    e.alive = false;
    e.sprite.setVisible(false);
    e.sprite.body.enable = false;
    e.bar.setVisible(false);
    A.sfx('defeat');
    const fx = ui.lowFx ? null : sc.add.particles(x, y, 'spark', { speed: { min: 40, max: 140 }, lifespan: 450, scale: { start: 1.6, end: 0 }, tint: 0xef4444, emitting: false }).setDepth(9999);
    fx?.explode(14);
    sc.time.delayedCall(600, () => fx?.destroy());
    const t = sc.add.text(x, y - 10, `+${1 + festBonus('bug')} koin`, { fontFamily: 'Silkscreen, monospace', fontSize: '12px', color: '#ffe08a' }).setOrigin(0.5).setDepth(9999);
    sc.tweens.add({ targets: t, y: y - 40, alpha: 0, duration: 800, onComplete: () => t.destroy() });
    state.defeatBug();
    QuestManager.check();
    sc.time.delayedCall(RESPAWN, () => this.revive(e));
  }

  revive(e) {
    e.hp = e.maxHp;
    e.alive = true;
    e.state = 'PATROL';
    e.sprite.enableBody(true, e.home.x, e.home.y, true, true);
    e.sprite.setTint(e.tint);
    e.bar.setVisible(false).setSize(22, 4);
  }
}
