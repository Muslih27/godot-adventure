import { chapter1 } from './chapter1.js';
import { chapter2 } from './chapter2.js';
// Daftar bab yang sudah dapat dimainkan. Tambahkan bab baru di sini.
export const chapters = [chapter1, chapter2];
export const chapterById = (n) => chapters.find((c) => c.id === n);
