import { chapter1 } from './chapter1.js';
import { chapter2 } from './chapter2.js';
import { chapter3 } from './chapter3.js';
import { chapter4 } from './chapter4.js';
import { chapter5 } from './chapter5.js';
import { chapter6 } from './chapter6.js';
import { chapter7 } from './chapter7.js';
import { chapter8 } from './chapter8.js';
import { chapter9 } from './chapter9.js';
import { chapter10 } from './chapter10.js';
import { chapter11 } from './chapter11.js';
import { chapter12 } from './chapter12.js';
import { chapter13 } from './chapter13.js';
// Daftar bab yang sudah dapat dimainkan. Tambahkan bab baru di sini.
export const chapters = [chapter1, chapter2, chapter3, chapter4, chapter5, chapter6, chapter7, chapter8, chapter9, chapter10, chapter11, chapter12, chapter13];
export const chapterById = (n) => chapters.find((c) => c.id === n);
