import './style.css';
import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import { AchievementManager } from './systems/AchievementManager.js';
import { ui } from './systems/UIManager.js';
import { DailyManager } from './systems/DailyManager.js';
import SchoolScene from './scenes/SchoolScene.js';
import ClassroomScene from './scenes/ClassroomScene.js';
import LabScene from './scenes/LabScene.js';
import CodeScene from './scenes/CodeScene.js';
import ArenaScene from './scenes/ArenaScene.js';
import AnimScene from './scenes/AnimScene.js';
import LibraryScene from './scenes/LibraryScene.js';
import LevelScene from './scenes/LevelScene.js';
import AIScene from './scenes/AIScene.js';
import AudioScene from './scenes/AudioScene.js';
import ServerScene from './scenes/ServerScene.js';
import TestScene from './scenes/TestScene.js';
import FinalScene from './scenes/FinalScene.js';
import GardenScene from './scenes/GardenScene.js';

AchievementManager.init();
DailyManager.init();

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: '100%',
  height: '100%',
  pixelArt: true,
  disableVisibilityChange: true,
  backgroundColor: '#071a30',
  scale: { mode: Phaser.Scale.RESIZE, resizeInterval: 100 },
  render: { powerPreference: 'high-performance' },
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: [BootScene, PreloadScene, MainMenuScene, SchoolScene, ClassroomScene, LabScene, CodeScene, ArenaScene, AnimScene, LibraryScene, LevelScene, AIScene, AudioScene, ServerScene, TestScene, FinalScene, GardenScene],
});

ui.game = game;
