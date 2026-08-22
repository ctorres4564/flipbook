import fs from 'fs';
import path from 'path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import sharp from 'sharp';

const pdfPath = path.resolve('livro_nico/assets/novas_imagens/LIVRO DO NICO.pdf');

async function testPage1() {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const loadingTask = pdfjsLib.getDocument({ data });
  const doc = await loadingTask.promise;
  
  const page = await doc.getPage(1);
  // Escala para obter alta resolução (ex: 1152pt * 1.25 = 1440px ou scale 1.25/1.5)
  // 1440x1440 é nítido para telas retina e web
  const scale = 1440 / 1152; // 1.25 -> 1440x1440
  const viewport = page.getViewport({ scale });
  
  const canvas = createCanvas(Math.round(viewport.width), Math.round(viewport.height));
  const ctx = canvas.getContext('2d');
  
  const renderContext = {
    canvasContext: ctx,
    viewport: viewport,
  };
  
  await page.render(renderContext).promise;
  
  const pngBuffer = canvas.toBuffer('image/png');
  const webpBuffer = await sharp(pngBuffer)
    .webp({ quality: 85, effort: 6 })
    .toBuffer();
    
  console.log(`Página 1 renderizada com sucesso! Tamanho PNG: ${(pngBuffer.length/1024).toFixed(1)}KB, Tamanho WebP: ${(webpBuffer.length/1024).toFixed(1)}KB`);
  
  const metadata = await sharp(webpBuffer).metadata();
  console.log('Metadados WebP:', metadata);
}

testPage1().catch(err => {
  console.error('Erro:', err);
  process.exit(1);
});
