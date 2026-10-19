import './style.css';
import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import { AchievementManager } from './systems/AchievementManager.js';
import SchoolScene from './scenes/SchoolScene.js';
import ClassroomScene from './scenes/ClassroomScene.js';
import LabScene from './scenes/LabScene.js';
import CodeScene from './scenes/CodeScene.js';
import ArenaScene from './scenes/ArenaScene.js';
import AnimScene from './scenes/AnimScene.js';
import LibraryScene from './scenes/LibraryScene.js';

AchievementManager.init();

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 800,
  height: 480,
  pixelArt: true,
  backgroundColor: '#071a30',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: [BootScene, PreloadScene, MainMenuScene, SchoolScene, ClassroomScene, LabScene, CodeScene, ArenaScene, AnimScene, LibraryScene],
});
