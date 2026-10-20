// Aset visual prosedural (canvas) bergaya pixel art: tidak butuh file gambar eksternal.
export const portraits = {};
export const previews = {};
let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

const LOOKS = {
  player0: { skin: '#f1c27d', hair: '#2b1b0e', shirt: '#22d3ee', pants: '#1e3a8a' },
  player1: { skin: '#c68642', hair: '#111827', shirt: '#ff8a3d', pants: '#14532d', long: true },
  kak: { skin: '#c68642', hair: '#7c3aed', shirt: '#34d399', pants: '#1f2937' },
  robo: { skin: '#9ca3af', hair: '#22d3ee', shirt: '#4b5563', pants: '#374151', glasses: true },
  coach: { skin: '#f1c27d', hair: '#ff8a3d', shirt: '#ff8a3d', pants: '#1e3a8a' },
  bu: { skin: '#f1c27d', hair: '#0e7490', shirt: '#fbbf24', pants: '#7c3aed' },
  pus: { skin: '#c68642', hair: '#6b7280', shirt: '#0e7490', pants: '#334155', glasses: true },
  lvl: { skin: '#f1c27d', hair: '#111827', shirt: '#7ee7ff', pants: '#92400e' },
  arsi: { skin: '#c68642', hair: '#0f172a', shirt: '#a7f3d0', pants: '#1e293b', glasses: true },
  nada: { skin: '#f1c27d', hair: '#ff8a3d', shirt: '#7c3aed', pants: '#0f172a' },
  srv: { skin: '#f1c27d', hair: '#334155', shirt: '#0f766e', pants: '#1e293b', glasses: true },
  debug: { skin: '#c68642', hair: '#9ca3af', shirt: '#dc2626', pants: '#1e293b', glasses: true },
  kepala: { skin: '#f1c27d', hair: '#4b5563', shirt: '#1e3a8a', pants: '#111827', long: true, glasses: true },
  prof: { skin: '#f1c27d', hair: '#d1d5db', shirt: '#ffffff', pants: '#334155', glasses: true, coat: true },
};

function person(c, ox, oy, o, f) {
  const r = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(ox + x, oy + y, w, h); };
  r(5, 29, 14, 3, 'rgba(0,0,0,.25)');
  r(8, 22, 4, 7 - (f === 1 ? 2 : 0), o.pants);
  r(13, 22, 4, 7 - (f === 2 ? 2 : 0), o.pants);
  r(7, 28 - (f === 1 ? 2 : 0), 5, 2, '#111827');
  r(13, 28 - (f === 2 ? 2 : 0), 5, 2, '#111827');
  r(6, 12, 13, 11, o.shirt);
  if (o.coat) r(11, 12, 3, 11, '#22d3ee');
  r(3, 13, 3, 8, o.shirt); r(19, 13, 3, 8, o.shirt);
  r(3, 20, 3, 2, o.skin); r(19, 20, 3, 2, o.skin);
  r(7, 2, 11, 10, o.skin);
  r(6, 0, 13, 5, o.hair);
  if (o.long) { r(6, 2, 2, 10, o.hair); r(17, 2, 2, 10, o.hair); }
  r(10, 7, 2, 2, '#111'); r(14, 7, 2, 2, '#111');
  if (o.glasses) { c.strokeStyle = '#111'; c.lineWidth = 1; c.strokeRect(ox + 9.5, oy + 6.5, 4, 3); c.strokeRect(ox + 13.5, oy + 6.5, 4, 3); }
  r(11, 10, 4, 1, '#a5532f');
}

function canvasTex(scene, key, w, h, draw) {
  if (scene.textures.exists(key)) return null;
  const t = scene.textures.createCanvas(key, w, h);
  draw(t.context, w, h);
  t.refresh();
  if (/^(hat|pet)_/.test(key)) previews[key] = t.canvas.toDataURL();
  return t;
}

export function generateTextures(scene) {
  canvasTex(scene, 'grass', 32, 32, (c) => {
    c.fillStyle = '#3b9a5c'; c.fillRect(0, 0, 32, 32);
    for (let i = 0; i < 36; i++) {
      c.fillStyle = rnd() > 0.5 ? '#348c52' : '#4aae6b';
      c.fillRect(Math.floor(rnd() * 31), Math.floor(rnd() * 31), 2, 2);
    }
    c.fillStyle = '#ffe66d'; c.fillRect(Math.floor(rnd() * 28) + 1, Math.floor(rnd() * 28) + 1, 2, 2);
  });
  canvasTex(scene, 'path', 32, 32, (c) => {
    c.fillStyle = '#d9c79a'; c.fillRect(0, 0, 32, 32);
    for (let i = 0; i < 20; i++) { c.fillStyle = '#c4b07e'; c.fillRect(Math.floor(rnd() * 30), Math.floor(rnd() * 30), 3, 2); }
  });
  canvasTex(scene, 'building', 960, 150, (c) => {
    c.fillStyle = '#2c5d8f'; c.fillRect(0, 0, 960, 140);
    c.fillStyle = '#244d78';
    for (let y = 22; y < 140; y += 14) c.fillRect(0, y, 960, 1);
    c.fillStyle = '#ff8a3d'; c.fillRect(0, 0, 960, 20);
    c.fillStyle = '#fff'; c.font = 'bold 13px monospace'; c.textAlign = 'center';
    c.fillText('GODOT ADVENTURE ACADEMY', 480, 14);
    for (let i = 0; i < 8; i++) {
      const x = 40 + i * 110 + (i > 3 ? 70 : 0);
      c.fillStyle = '#12304f'; c.fillRect(x - 2, 44, 44, 40);
      c.fillStyle = '#7ee7ff'; c.fillRect(x, 46, 40, 36);
      c.fillStyle = '#c8f6ff'; c.fillRect(x + 4, 50, 10, 12);
    }
    c.fillStyle = '#ff8a3d'; c.fillRect(426, 44, 108, 96);
    c.fillStyle = '#173a5c'; c.fillRect(432, 52, 96, 88);
    c.fillStyle = '#34d399'; c.fillRect(440, 60, 80, 6);
    c.fillStyle = '#fff'; c.font = 'bold 11px monospace'; c.fillText('RUANG KELAS', 480, 38);
    c.fillStyle = '#1b3e66'; c.fillRect(0, 140, 960, 10);
  });
  canvasTex(scene, 'fence', 960, 40, (c) => {
    c.fillStyle = '#a9713a';
    for (const y of [16, 26]) { c.fillRect(0, y, 424, 4); c.fillRect(536, y, 424, 4); }
    c.fillStyle = '#8b5a2b';
    for (let x = 4; x < 960; x += 24) if (x < 420 || x > 540) c.fillRect(x, 8, 6, 30);
    c.fillStyle = '#ff8a3d'; c.fillRect(420, 2, 10, 38); c.fillRect(530, 2, 10, 38);
  });
  canvasTex(scene, 'tree', 48, 64, (c) => {
    c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(24, 60, 16, 4, 0, 0, 7); c.fill();
    c.fillStyle = '#7a4a21'; c.fillRect(20, 38, 8, 24);
    c.fillStyle = '#1f7a46';
    [[24, 24, 20], [13, 33, 13], [35, 33, 13]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); });
    c.fillStyle = '#2fa05d'; c.beginPath(); c.arc(19, 18, 9, 0, 7); c.fill();
  });
  canvasTex(scene, 'bench', 64, 28, (c) => {
    c.fillStyle = '#7a4a21'; c.fillRect(6, 16, 4, 12); c.fillRect(54, 16, 4, 12);
    c.fillStyle = '#c7783a'; c.fillRect(2, 8, 60, 10);
    c.fillStyle = '#e09a58'; c.fillRect(2, 0, 60, 6);
  });
  canvasTex(scene, 'sign', 28, 38, (c) => {
    c.fillStyle = '#7a4a21'; c.fillRect(12, 18, 4, 20);
    c.fillStyle = '#e9c46a'; c.fillRect(1, 2, 26, 18);
    c.fillStyle = '#7a4a21'; c.fillRect(5, 7, 18, 2); c.fillRect(5, 12, 12, 2);
  });
  canvasTex(scene, 'coin', 16, 16, (c) => {
    c.fillStyle = '#c76a00'; c.beginPath(); c.arc(8, 8, 7, 0, 7); c.fill();
    c.fillStyle = '#ffb347'; c.beginPath(); c.arc(8, 8, 5.5, 0, 7); c.fill();
    c.fillStyle = '#fff3c4'; c.fillRect(5, 4, 2, 4);
  });
  canvasTex(scene, 'spark', 4, 4, (c) => { c.fillStyle = '#fff'; c.fillRect(0, 0, 4, 4); });

  canvasTex(scene, 'floor', 32, 32, (c) => {
    c.fillStyle = '#8fb3d1'; c.fillRect(0, 0, 32, 32);
    c.fillStyle = '#7aa0c0'; c.fillRect(0, 0, 32, 1); c.fillRect(0, 0, 1, 32);
  });
  canvasTex(scene, 'cwall', 800, 110, (c) => {
    c.fillStyle = '#2c5d8f'; c.fillRect(0, 0, 800, 110);
    c.fillStyle = '#1b3e66'; c.fillRect(0, 100, 800, 10);
    c.fillStyle = '#7a4a21'; c.fillRect(236, 14, 328, 68);
    c.fillStyle = '#1f5a46'; c.fillRect(242, 20, 316, 56);
    c.fillStyle = '#e8f6ff'; c.font = 'bold 14px monospace'; c.textAlign = 'center';
    c.fillText('Scene > Node > Script', 400, 54);
    [[40, 24], [660, 24]].forEach(([x, y]) => { c.fillStyle = '#12304f'; c.fillRect(x - 2, y - 2, 104, 64); c.fillStyle = '#7ee7ff'; c.fillRect(x, y, 100, 60); c.fillStyle = '#c8f6ff'; c.fillRect(x + 8, y + 8, 24, 20); });
    c.fillStyle = '#22d3ee'; c.beginPath(); c.moveTo(160, 30); c.lineTo(176, 52); c.lineTo(160, 76); c.lineTo(144, 52); c.fill();
  });
  canvasTex(scene, 'desk', 48, 34, (c) => {
    c.fillStyle = '#7a4a21'; c.fillRect(4, 22, 4, 12); c.fillRect(40, 22, 4, 12);
    c.fillStyle = '#c7783a'; c.fillRect(0, 12, 48, 12);
    c.fillStyle = '#111'; c.fillRect(14, 0, 20, 13); c.fillStyle = '#22d3ee'; c.fillRect(16, 2, 16, 9);
  });
  canvasTex(scene, 'cdoor', 64, 34, (c) => {
    c.fillStyle = '#ff8a3d'; c.fillRect(0, 0, 64, 34);
    c.fillStyle = '#173a5c'; c.fillRect(6, 6, 52, 28);
    c.fillStyle = '#fff'; c.font = 'bold 9px monospace'; c.textAlign = 'center'; c.fillText('KELUAR', 32, 22);
  });

  canvasTex(scene, 'lwall', 800, 110, (c) => {
    c.fillStyle = '#14304f'; c.fillRect(0, 0, 800, 110);
    c.fillStyle = '#0c2036'; c.fillRect(0, 100, 800, 10);
    [30, 670].forEach((x) => {
      c.fillStyle = '#0b1f36'; c.fillRect(x, 10, 100, 90);
      for (let i = 0; i < 5; i++) { c.fillStyle = '#071423'; c.fillRect(x + 6, 16 + i * 17, 88, 13); c.fillStyle = i % 2 ? '#34d399' : '#22d3ee'; c.fillRect(x + 10, 20 + i * 17, 4, 4); }
    });
    c.fillStyle = '#7a4a21'; c.fillRect(236, 12, 328, 74);
    c.fillStyle = '#031020'; c.fillRect(242, 18, 316, 62);
    c.font = 'bold 13px monospace'; c.textAlign = 'left';
    c.fillStyle = '#34d399'; c.fillText('var nyawa: int = 3', 256, 42);
    c.fillStyle = '#22d3ee'; c.fillText('func _ready() -> void:', 256, 62);
  });
  canvasTex(scene, 'ldoor', 48, 34, (c) => {
    c.fillStyle = '#22d3ee'; c.fillRect(0, 0, 48, 34);
    c.fillStyle = '#173a5c'; c.fillRect(5, 5, 38, 29);
    c.fillStyle = '#fff'; c.font = 'bold 10px monospace'; c.textAlign = 'center'; c.fillText('LAB', 24, 24);
  });

  canvasTex(scene, 'pwall', 800, 110, (c) => {
    c.fillStyle = '#0f3b3a'; c.fillRect(0, 0, 800, 110);
    c.fillStyle = '#0a2a29'; c.fillRect(0, 100, 800, 10);
    [[40, 22], [660, 22]].forEach(([x, y]) => { c.fillStyle = '#031020'; c.fillRect(x, y, 100, 56); c.fillStyle = '#34d399'; for (let i = 0; i < 4; i++) c.fillRect(x + 8, y + 10 + i * 12, 30 + (i * 17) % 50, 4); });
    c.fillStyle = '#7a4a21'; c.fillRect(236, 12, 328, 74);
    c.fillStyle = '#031020'; c.fillRect(242, 18, 316, 62);
    c.font = 'bold 13px monospace'; c.textAlign = 'left';
    c.fillStyle = '#ffb347'; c.fillText('for i in range(3):', 256, 42);
    c.fillStyle = '#34d399'; c.fillText('    print(i)', 256, 62);
  });
  canvasTex(scene, 'kdoor', 48, 34, (c) => {
    c.fillStyle = '#34d399'; c.fillRect(0, 0, 48, 34);
    c.fillStyle = '#173a5c'; c.fillRect(5, 5, 38, 29);
    c.fillStyle = '#fff'; c.font = 'bold 10px monospace'; c.textAlign = 'center'; c.fillText('KODE', 24, 24);
  });

  canvasTex(scene, 'awall', 800, 110, (c) => {
    c.fillStyle = '#1d3b73'; c.fillRect(0, 0, 800, 110);
    c.fillStyle = '#ff8a3d'; for (let x = 0; x < 800; x += 40) c.fillRect(x, 0, 20, 8);
    c.fillStyle = '#122650'; c.fillRect(0, 100, 800, 10);
    c.fillStyle = '#7a4a21'; c.fillRect(216, 14, 368, 72);
    c.fillStyle = '#031020'; c.fillRect(222, 20, 356, 60);
    c.font = 'bold 13px monospace'; c.textAlign = 'left';
    c.fillStyle = '#22d3ee'; c.fillText('velocity = arah * SPEED', 236, 44);
    c.fillStyle = '#34d399'; c.fillText('move_and_slide()', 236, 64);
  });
  canvasTex(scene, 'adoor', 48, 34, (c) => {
    c.fillStyle = '#ff8a3d'; c.fillRect(0, 0, 48, 34);
    c.fillStyle = '#173a5c'; c.fillRect(5, 5, 38, 29);
    c.fillStyle = '#fff'; c.font = 'bold 9px monospace'; c.textAlign = 'center'; c.fillText('ARENA', 24, 24);
  });
  canvasTex(scene, 'block', 32, 32, (c) => {
    c.fillStyle = '#12304f'; c.fillRect(0, 0, 32, 32);
    c.fillStyle = '#2c5d8f'; c.fillRect(2, 2, 28, 28);
    c.fillStyle = '#ff8a3d'; c.fillRect(2, 2, 28, 4);
    c.fillStyle = '#244d78'; c.fillRect(6, 10, 20, 16);
  });

  canvasTex(scene, 'nwall', 800, 110, (c) => {
    c.fillStyle = '#2a4a6b'; c.fillRect(0, 0, 800, 110);
    c.fillStyle = '#16304a'; c.fillRect(0, 100, 800, 10);
    c.fillStyle = '#0b1f36';
    for (let x = 0; x < 800; x += 20) { c.fillRect(x + 4, 4, 10, 6); c.fillRect(x + 4, 90, 10, 6); }
    c.fillStyle = '#7a4a21'; c.fillRect(216, 16, 368, 66);
    c.fillStyle = '#031020'; c.fillRect(222, 22, 356, 54);
    c.font = 'bold 13px monospace'; c.textAlign = 'left';
    c.fillStyle = '#22d3ee'; c.fillText('anim.play("walk")', 236, 46);
    c.fillStyle = '#ffb347'; c.fillText('frame 0 > 1 > 2 > 3', 236, 66);
  });
  canvasTex(scene, 'sdoor', 48, 34, (c) => {
    c.fillStyle = '#fbbf24'; c.fillRect(0, 0, 48, 34);
    c.fillStyle = '#173a5c'; c.fillRect(5, 5, 38, 29);
    c.fillStyle = '#fff'; c.font = 'bold 9px monospace'; c.textAlign = 'center'; c.fillText('STUDIO', 24, 24);
  });

  canvasTex(scene, 'bwall', 800, 110, (c) => {
    c.fillStyle = '#2d3f55'; c.fillRect(0, 0, 800, 110);
    const cols = ['#ff8a3d', '#22d3ee', '#34d399', '#7ee7ff', '#ffb347', '#a7f3d0'];
    for (let r = 0; r < 2; r++) {
      c.fillStyle = '#7a4a21'; c.fillRect(0, 30 + r * 40, 800, 4);
      for (let x = 6; x < 790; x += 12) { c.fillStyle = cols[Math.floor(rnd() * cols.length)]; c.fillRect(x, 8 + r * 40 + Math.floor(rnd() * 6), 8, 22 - Math.floor(rnd() * 6)); }
    }
    c.fillStyle = '#16304a'; c.fillRect(0, 100, 800, 10);
    c.fillStyle = '#7a4a21'; c.fillRect(300, 40, 200, 28);
    c.fillStyle = '#ffb347'; c.font = 'bold 14px monospace'; c.textAlign = 'center'; c.fillText('PERPUSTAKAAN', 400, 60);
  });
  canvasTex(scene, 'bdoor', 48, 34, (c) => {
    c.fillStyle = '#a7f3d0'; c.fillRect(0, 0, 48, 34);
    c.fillStyle = '#173a5c'; c.fillRect(5, 5, 38, 29);
    c.fillStyle = '#fff'; c.font = 'bold 8px monospace'; c.textAlign = 'center'; c.fillText('PUSTAKA', 24, 24);
  });
  canvasTex(scene, 'shelf', 64, 56, (c) => {
    c.fillStyle = '#5a3a1a'; c.fillRect(0, 0, 64, 56);
    c.fillStyle = '#7a4a21'; c.fillRect(3, 3, 58, 50);
    const cols = ['#ff8a3d', '#22d3ee', '#34d399', '#ffb347'];
    for (let r = 0; r < 3; r++) {
      c.fillStyle = '#5a3a1a'; c.fillRect(3, 18 + r * 17, 58, 3);
      for (let x = 6; x < 58; x += 7) { c.fillStyle = cols[Math.floor(rnd() * cols.length)]; c.fillRect(x, 5 + r * 17, 5, 12); }
    }
  });

  canvasTex(scene, 'twall', 800, 110, (c) => {
    c.fillStyle = '#17426b'; c.fillRect(0, 0, 800, 110);
    c.strokeStyle = '#2a6aa3'; c.lineWidth = 1;
    for (let x = 0; x < 800; x += 20) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 100); c.stroke(); }
    for (let y = 0; y < 100; y += 20) { c.beginPath(); c.moveTo(0, y); c.lineTo(800, y); c.stroke(); }
    c.fillStyle = '#0c2036'; c.fillRect(0, 100, 800, 10);
    c.fillStyle = '#7a4a21'; c.fillRect(236, 14, 328, 70);
    c.fillStyle = '#031020'; c.fillRect(242, 20, 316, 58);
    c.font = 'bold 13px monospace'; c.textAlign = 'left';
    c.fillStyle = '#ffb347'; c.fillText('Skor: 150', 256, 44);
    c.fillStyle = '#34d399'; c.fillRect(256, 54, 120, 10); c.fillStyle = '#12304f'; c.fillRect(376, 54, 40, 10);
  });
  canvasTex(scene, 'tdoor', 48, 34, (c) => {
    c.fillStyle = '#7ee7ff'; c.fillRect(0, 0, 48, 34);
    c.fillStyle = '#173a5c'; c.fillRect(5, 5, 38, 29);
    c.fillStyle = '#fff'; c.font = 'bold 9px monospace'; c.textAlign = 'center'; c.fillText('LEVEL', 24, 24);
  });

  canvasTex(scene, 'iwall', 800, 110, (c) => {
    c.fillStyle = '#0e2a47'; c.fillRect(0, 0, 800, 110);
    c.strokeStyle = '#1f5f8b'; c.fillStyle = '#22d3ee';
    const pts = [[60, 25], [130, 60], [60, 85], [220, 40], [640, 30], [720, 70], [640, 90], [580, 55]];
    pts.forEach(([x, y], i) => { const [x2, y2] = pts[(i + 1) % pts.length]; if (Math.abs(x - x2) < 200) { c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.stroke(); } });
    pts.forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 5, 0, 7); c.fill(); });
    c.fillStyle = '#0a1f36'; c.fillRect(0, 100, 800, 10);
    c.fillStyle = '#7a4a21'; c.fillRect(256, 12, 288, 74);
    c.fillStyle = '#031020'; c.fillRect(262, 18, 276, 62);
    c.font = 'bold 12px monospace'; c.textAlign = 'left';
    c.fillStyle = '#22d3ee'; c.fillText('enum State { IDLE, WALK }', 272, 42);
    c.fillStyle = '#ffb347'; c.fillText('match state:', 272, 62);
  });
  canvasTex(scene, 'idoor', 48, 34, (c) => {
    c.fillStyle = '#c084fc'; c.fillRect(0, 0, 48, 34);
    c.fillStyle = '#173a5c'; c.fillRect(5, 5, 38, 29);
    c.fillStyle = '#fff'; c.font = 'bold 11px monospace'; c.textAlign = 'center'; c.fillText('AI', 24, 24);
  });

  canvasTex(scene, 'owall', 800, 110, (c) => {
    c.fillStyle = '#241a4d'; c.fillRect(0, 0, 800, 110);
    c.fillStyle = '#150f33'; c.fillRect(0, 100, 800, 10);
    [[40, 22], [660, 22]].forEach(([x, y]) => { c.fillStyle = '#0b0820'; c.fillRect(x, y, 100, 66); c.fillStyle = '#7c3aed'; c.beginPath(); c.arc(x + 50, y + 33, 24, 0, 7); c.fill(); c.fillStyle = '#c4b5fd'; c.beginPath(); c.arc(x + 50, y + 33, 8, 0, 7); c.fill(); });
    c.fillStyle = '#7a4a21'; c.fillRect(236, 14, 328, 70);
    c.fillStyle = '#031020'; c.fillRect(242, 20, 316, 58);
    c.font = 'bold 12px monospace'; c.textAlign = 'left';
    c.fillStyle = '#22d3ee'; c.fillText('AudioStreamPlayer', 256, 44);
    c.fillStyle = '#34d399'; c.fillText('musik.play()', 256, 64);
  });
  canvasTex(scene, 'odoor', 48, 34, (c) => {
    c.fillStyle = '#7c3aed'; c.fillRect(0, 0, 48, 34);
    c.fillStyle = '#173a5c'; c.fillRect(5, 5, 38, 29);
    c.fillStyle = '#fff'; c.font = 'bold 9px monospace'; c.textAlign = 'center'; c.fillText('AUDIO', 24, 24);
  });

  canvasTex(scene, 'vwall', 800, 110, (c) => {
    c.fillStyle = '#0b2a2e'; c.fillRect(0, 0, 800, 110);
    c.fillStyle = '#06191c'; c.fillRect(0, 100, 800, 10);
    for (let x = 20; x < 780; x += 60) { if (x > 220 && x < 580) continue; c.fillStyle = '#12414a'; c.fillRect(x, 10, 44, 88); for (let i = 0; i < 5; i++) { c.fillStyle = '#031418'; c.fillRect(x + 4, 14 + i * 17, 36, 13); c.fillStyle = i % 2 ? '#34d399' : '#22d3ee'; c.fillRect(x + 7, 18 + i * 17, 4, 4); } }
    c.fillStyle = '#7a4a21'; c.fillRect(236, 14, 328, 70);
    c.fillStyle = '#031020'; c.fillRect(242, 20, 316, 58);
    c.font = 'bold 12px monospace'; c.textAlign = 'left';
    c.fillStyle = '#22d3ee'; c.fillText('FileAccess.open("user://...")', 252, 44);
    c.fillStyle = '#34d399'; c.fillText('JSON.stringify(data)', 252, 64);
  });
  canvasTex(scene, 'vdoor', 48, 34, (c) => {
    c.fillStyle = '#14b8a6'; c.fillRect(0, 0, 48, 34);
    c.fillStyle = '#173a5c'; c.fillRect(5, 5, 38, 29);
    c.fillStyle = '#fff'; c.font = 'bold 8px monospace'; c.textAlign = 'center'; c.fillText('SERVER', 24, 24);
  });
  canvasTex(scene, 'rack', 48, 64, (c) => {
    c.fillStyle = '#0a2a30'; c.fillRect(0, 0, 48, 64);
    c.fillStyle = '#12414a'; c.fillRect(3, 3, 42, 58);
    for (let i = 0; i < 4; i++) { c.fillStyle = '#031418'; c.fillRect(6, 7 + i * 14, 36, 11); }
  });

  canvasTex(scene, 'xwall', 800, 110, (c) => {
    c.fillStyle = '#3b1f2b'; c.fillRect(0, 0, 800, 110);
    c.fillStyle = '#26121c'; c.fillRect(0, 100, 800, 10);
    [[50, 20], [670, 20]].forEach(([x, y]) => { c.fillStyle = '#12080e'; c.fillRect(x, y, 90, 64); c.fillStyle = '#ef4444'; c.fillRect(x + 12, y + 14, 66, 6); c.fillStyle = '#fbbf24'; c.fillRect(x + 12, y + 28, 44, 6); c.fillStyle = '#ef4444'; c.fillRect(x + 12, y + 42, 54, 6); });
    c.fillStyle = '#7a4a21'; c.fillRect(236, 14, 328, 70);
    c.fillStyle = '#031020'; c.fillRect(242, 20, 316, 58);
    c.font = 'bold 12px monospace'; c.textAlign = 'left';
    c.fillStyle = '#ef4444'; c.fillText('error: Nil pada baris 5', 256, 44);
    c.fillStyle = '#34d399'; c.fillText('breakpoint', 256, 64);
  });
  canvasTex(scene, 'xdoor', 48, 34, (c) => {
    c.fillStyle = '#ef4444'; c.fillRect(0, 0, 48, 34);
    c.fillStyle = '#173a5c'; c.fillRect(5, 5, 38, 29);
    c.fillStyle = '#fff'; c.font = 'bold 9px monospace'; c.textAlign = 'center'; c.fillText('TEST', 24, 24);
  });
  canvasTex(scene, 'bug', 16, 12, (c) => {
    c.fillStyle = '#7f1d1d'; c.fillRect(1, 3, 2, 1); c.fillRect(1, 7, 2, 1); c.fillRect(13, 3, 2, 1); c.fillRect(13, 7, 2, 1);
    c.fillStyle = '#ef4444'; c.beginPath(); c.ellipse(8, 6, 6, 4, 0, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.fillRect(5, 4, 2, 2); c.fillRect(9, 4, 2, 2);
    c.fillStyle = '#111'; c.fillRect(6, 5, 1, 1); c.fillRect(10, 5, 1, 1);
  });

  canvasTex(scene, 'fwall', 800, 110, (c) => {
    c.fillStyle = '#0d2b52'; c.fillRect(0, 0, 800, 110);
    c.fillStyle = '#ffb347'; c.fillRect(0, 0, 800, 6); c.fillRect(0, 94, 800, 6);
    c.fillStyle = '#081a33'; c.fillRect(0, 100, 800, 10);
    c.fillStyle = '#7a4a21'; c.fillRect(250, 66, 300, 26);
    c.fillStyle = '#ffe08a'; c.font = 'bold 13px monospace'; c.textAlign = 'center'; c.fillText('RUANG FINAL PROJECT', 400, 84);
  });
  canvasTex(scene, 'fdoor', 48, 34, (c) => {
    c.fillStyle = '#ffb347'; c.fillRect(0, 0, 48, 34);
    c.fillStyle = '#173a5c'; c.fillRect(5, 5, 38, 29);
    c.fillStyle = '#fff'; c.font = 'bold 9px monospace'; c.textAlign = 'center'; c.fillText('FINAL', 24, 24);
  });

  const hat = (key, main, light) => canvasTex(scene, key, 22, 14, (c) => {
    c.fillStyle = main; c.fillRect(4, 2, 14, 8);
    c.fillStyle = light; c.fillRect(4, 2, 14, 3);
    c.fillStyle = '#12304f'; c.fillRect(0, 9, 22, 4);
  });
  hat('hat_blue', '#1d4ed8', '#60a5fa');
  hat('hat_orange', '#ea580c', '#fdba74');
  canvasTex(scene, 'hat_crown', 22, 14, (c) => {
    c.fillStyle = '#fbbf24'; c.fillRect(2, 6, 18, 7);
    c.beginPath(); c.moveTo(2, 6); c.lineTo(2, 1); c.lineTo(7, 5); c.lineTo(11, 0); c.lineTo(15, 5); c.lineTo(20, 1); c.lineTo(20, 6); c.fill();
    c.fillStyle = '#ef4444'; c.fillRect(9, 8, 4, 3);
  });
  canvasTex(scene, 'pet_slime', 18, 14, (c) => {
    c.fillStyle = '#34d399'; c.beginPath(); c.ellipse(9, 9, 8, 5, 0, 0, 7); c.fill();
    c.fillStyle = '#6ee7b7'; c.fillRect(4, 6, 4, 2);
    c.fillStyle = '#fff'; c.fillRect(5, 8, 3, 3); c.fillRect(10, 8, 3, 3);
    c.fillStyle = '#111'; c.fillRect(6, 9, 1, 2); c.fillRect(11, 9, 1, 2);
  });
  canvasTex(scene, 'pet_robo', 16, 18, (c) => {
    c.fillStyle = '#9ca3af'; c.fillRect(2, 6, 12, 10);
    c.fillStyle = '#6b7280'; c.fillRect(2, 14, 12, 2);
    c.fillStyle = '#22d3ee'; c.fillRect(5, 8, 6, 4);
    c.fillStyle = '#9ca3af'; c.fillRect(7, 2, 2, 4);
    c.fillStyle = '#ef4444'; c.fillRect(6, 0, 4, 3);
  });
  canvasTex(scene, 'pet_cat', 18, 16, (c) => {
    c.fillStyle = '#fb923c'; c.fillRect(3, 6, 12, 9);
    c.beginPath(); c.moveTo(3, 6); c.lineTo(4, 1); c.lineTo(8, 6); c.fill();
    c.beginPath(); c.moveTo(15, 6); c.lineTo(14, 1); c.lineTo(10, 6); c.fill();
    c.fillStyle = '#fff'; c.fillRect(5, 8, 3, 3); c.fillRect(10, 8, 3, 3);
    c.fillStyle = '#111'; c.fillRect(6, 9, 1, 2); c.fillRect(11, 9, 1, 2);
    c.fillStyle = '#f472b6'; c.fillRect(8, 12, 2, 1);
  });

  for (const key of Object.keys(LOOKS)) {
    const t = canvasTex(scene, key, 72, 32, (c) => [0, 1, 2].forEach((f) => person(c, f * 24, 0, LOOKS[key], f)));
    if (t) [0, 1, 2].forEach((f) => t.add('f' + f, 0, f * 24, 0, 24, 32));
    // potret untuk panel dialog (kepala dan bahu diperbesar)
    const tmp = document.createElement('canvas'); tmp.width = 24; tmp.height = 32;
    person(tmp.getContext('2d'), 0, 0, LOOKS[key], 0);
    const p = document.createElement('canvas'); p.width = 64; p.height = 64;
    const pc = p.getContext('2d');
    const g = pc.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, '#12456e'); g.addColorStop(1, '#0b2a4a');
    pc.fillStyle = g; pc.fillRect(0, 0, 64, 64);
    pc.imageSmoothingEnabled = false;
    pc.drawImage(tmp, 2, 0, 20, 20, 0, 0, 64, 64);
    portraits[key] = p.toDataURL();
  }
}
