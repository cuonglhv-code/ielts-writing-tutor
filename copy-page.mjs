import { readFileSync, writeFileSync } from 'fs';

const oldPath = 'c:\\Users\\cuong\\Downloads\\ielts-writing.tsx';
const newPath = 'c:\\Users\\cuong\\Documents\\ielts-writing-tutor\\src\\app\\(protected)\\dashboard\\page.tsx';

const content = readFileSync(oldPath, 'utf-8');
writeFileSync(newPath, '"use client";\n' + content);
console.log('done');
