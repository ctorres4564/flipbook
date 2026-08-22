import fs from 'fs';
import path from 'path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import sharp from 'sharp';

const PDF_PATH = path.resolve('livro_nico/assets/novas_imagens/LIVRO DO NICO.pdf');
const OUTPUT_DIR = path.resolve('public/books/nico/pages');
const TARGET_RESOLUTION = 1440; // 1440x1440 px para alta fidelidade e nitidez retina

async function convertPdfToWebp() {
  console.log(`[1/4] Lendo arquivo PDF: ${PDF_PATH}`);
  if (!fs.existsSync(PDF_PATH)) {
    throw new Error(`Arquivo PDF não encontrado em: ${PDF_PATH}`);
  }

  const data = new Uint8Array(fs.readFileSync(PDF_PATH));
  const loadingTask = pdfjsLib.getDocument({ data });
  const doc = await loadingTask.promise;

  console.log(`[2/4] Total de páginas encontradas no PDF: ${doc.numPages}`);
  if (doc.numPages !== 16) {
    throw new Error(`Divergência de páginas: esperado 16, encontrado ${doc.numPages}`);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`[3/4] Iniciando conversão para WebP em ${OUTPUT_DIR}...`);
  const conversionResults = [];

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const unscaledViewport = page.getViewport({ scale: 1.0 });
    
    // Calcula escala para atingir TARGET_RESOLUTION na maior dimensão
    const scale = TARGET_RESOLUTION / Math.max(unscaledViewport.width, unscaledViewport.height);
    const viewport = page.getViewport({ scale });

    const canvasWidth = Math.round(viewport.width);
    const canvasHeight = Math.round(viewport.height);

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    await page.render({
      canvasContext: ctx,
      viewport: viewport,
    }).promise;

    const pngBuffer = canvas.toBuffer('image/png');

    // Converte para WebP com sharp (qualidade 85, compressão sem perdas de nitidez)
    const fileName = `${String(pageNum).padStart(2, '0')}.webp`;
    const outputPath = path.join(OUTPUT_DIR, fileName);

    const webpBuffer = await sharp(pngBuffer)
      .webp({ quality: 85, effort: 6 })
      .toBuffer();

    fs.writeFileSync(outputPath, webpBuffer);

    const metadata = await sharp(outputPath).metadata();
    const sizeKb = (webpBuffer.length / 1024).toFixed(1);

    conversionResults.push({
      page: pageNum,
      file: fileName,
      width: metadata.width,
      height: metadata.height,
      sizeKb: `${sizeKb} KB`,
    });

    console.log(`  ✓ Página ${String(pageNum).padStart(2, '0')} -> ${fileName} (${metadata.width}x${metadata.height}, ${sizeKb} KB)`);
  }

  console.log(`[4/4] Conversão concluída com sucesso para todas as ${doc.numPages} páginas!`);
  console.table(conversionResults);
}

convertPdfToWebp().catch((err) => {
  console.error('Erro na conversão:', err);
  process.exit(1);
});
