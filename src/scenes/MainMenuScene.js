import Phaser from 'phaser';
import { ui } from '../systems/UIManager.js';
import { state } from '../systems/GameState.js';
import { AudioManager as A } from '../systems/AudioManager.js';
import { getAudioPref } from '../systems/SaveManager.js';

export default class MainMenuScene extends Phaser.Scene {
  constructor() { super('MainMenu'); }
  create() {
    const { width: W, height: H } = this.scale;
    this.add.rectangle(0, 0, W, H, 0x071a30).setOrigin(0);
    for (let i = 0; i < 60; i++) {
      const s = this.add.rectangle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H * 0.7), 2, 2, 0x7ee7ff, Phaser.Math.FloatBetween(0.3, 1));
      this.tweens.add({ targets: s, alpha: 0.1, duration: Phaser.Math.Between(800, 2400), yoyo: true, repeat: -1 });
    }
    this.add.image(W / 2, H - 20, 'building').setOrigin(0.5, 1).setScale(0.85);
    this.add.tileSprite(0, H - 12, W, 12, 'grass').setOrigin(0);
    const p = this.add.sprite(120, H - 30, 'player0', 'f1').setOrigin(0.5, 1).setScale(2);
    this.tweens.add({ targets: p, x: W - 120, duration: 9000, yoyo: true, repeat: -1, onYoyo: () => p.setFlipX(true), onRepeat: () => p.setFlipX(false) });
    A.setEnabled(getAudioPref());
    ui.showTitle({
      onNew: (name, av) => { state.newGame(name, av); this.go(); },
      onContinue: () => { if (state.continueGame()) this.go(); else ui.toast('Data simpan tidak ditemukan atau rusak.', 'bad'); },
    });
  }
  go() {
    A.setEnabled(state.data.settings.audio);
    A.startMusic();
    this.scene.start({ school: 'School', classroom: 'Classroom', lab: 'Lab' }[state.data.location] || 'School');
  }
}
