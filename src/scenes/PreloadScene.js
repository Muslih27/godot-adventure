import Phaser from 'phaser';
import { generateTextures } from '../assets/textures.js';
export default class PreloadScene extends Phaser.Scene {
  constructor() { super('Preload'); }
  create() {
    generateTextures(this); // semua aset dibuat prosedural, tidak ada file eksternal
    this.scene.start('MainMenu');
  }
}
