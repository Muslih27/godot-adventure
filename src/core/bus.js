import Phaser from 'phaser';
// Event bus tunggal: penghubung terstruktur antara UI HTML dan scene Phaser.
export const bus = new Phaser.Events.EventEmitter();
