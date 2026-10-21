import Phaser from 'phaser';
import { ui } from '../systems/UIManager.js';
import { state } from '../systems/GameState.js';
import { AudioManager as A } from '../systems/AudioManager.js';
import { getAudioPref } from '../systems/SaveManager.js';
import { AchievementManager } from '../systems/AchievementManager.js';

const W = 800, H = 480; // area logis latar menu; kamera menyesuaikan ukuran layar

export default class MainMenuScene extends Phaser.Scene {
  constructor() { super('MainMenu'); }

  create() {
    this.add.rectangle(-700, -500, 2200, 1500, 0x071a30).setOrigin(0);
    for (let i = 0; i < 90; i++) {
      const s = this.add.rectangle(Phaser.Math.Between(-300, 1100), Phaser.Math.Between(-200, H * 0.7), 2, 2, 0x7ee7ff, Phaser.Math.FloatBetween(0.3, 1));
      this.tweens.add({ targets: s, alpha: 0.1, duration: Phaser.Math.Between(800, 2400), yoyo: true, repeat: -1 });
    }
    this.add.image(W / 2, H - 20, 'building').setOrigin(0.5, 1).setScale(0.85);
    this.add.tileSprite(-700, H - 12, 2200, 500, 'grass').setOrigin(0);
    const p = this.add.sprite(120, H - 30, 'player0', 'f1').setOrigin(0.5, 1).setScale(2);
    this.tweens.add({ targets: p, x: W - 120, duration: 9000, yoyo: true, repeat: -1, onYoyo: () => p.setFlipX(true), onRepeat: () => p.setFlipX(false) });

    this.fit = () => {
      const vw = this.scale.width, vh = this.scale.height;
      const z = Math.max(vw / W, vh / H); // menutupi seluruh layar
      const visH = vh / z;
      this.cameras.main.setZoom(z).centerOn(W / 2, visH < H ? H - visH / 2 : H / 2);
    };
    this.fit();
    this.scale.on('resize', this.fit);
    this.events.once('shutdown', () => this.scale.off('resize', this.fit));

    A.setEnabled(getAudioPref());
    ui.showTitle({
      onNew: (name, av) => { state.newGame(name, av); this.go(); },
      onContinue: () => { if (state.continueGame()) this.go(); else ui.toast('Data simpan tidak ditemukan atau rusak.', 'bad'); },
    });
  }

  go() {
    A.setEnabled(state.data.settings.audio);
    A.startMusic();
    AchievementManager.check();
    this.scene.start({ school: 'School', classroom: 'Classroom', lab: 'Lab', code: 'Code', arena: 'Arena', anim: 'Anim', library: 'Library', level: 'Level', ai: 'AI', audio: 'Audio', server: 'Server', test: 'Test', final: 'Final' }[state.data.location] || 'School');
  }
}
