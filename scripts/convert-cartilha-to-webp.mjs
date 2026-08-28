import fs from 'fs';
import path from 'path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import sharp from 'sharp';

const PDF_PATH = path.resolve('C:/1sonia/Cartilha  - Final.pdf');
const OUTPUT_DIR = path.resolve('public/books/cartilha-engasgo/pages');
const PDF_PUBLIC_DEST = path.resolve('public/books/cartilha-engasgo/cartilha-engasgo-idosos.pdf');
const TARGET_WIDTH = 1440; // 1440px de largura para altíssima nitidez em telas retina

async function convertCartilhaPdf() {
  console.log(`[1/4] Lendo arquivo PDF da Cartilha em: ${PDF_PATH}`);
  if (!fs.existsSync(PDF_PATH)) {
    throw new Error(`Arquivo PDF não encontrado em: ${PDF_PATH}`);
  }

  // Garante diretório de destino
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Copia o PDF original para acesso público de download
  fs.copyFileSync(PDF_PATH, PDF_PUBLIC_DEST);
  console.log(`  ✓ PDF original copiado para: ${PDF_PUBLIC_DEST}`);

  const data = new Uint8Array(fs.readFileSync(PDF_PATH));
  const loadingTask = pdfjsLib.getDocument({ data });
  const doc = await loadingTask.promise;

  console.log(`[2/4] Total de páginas encontradas no PDF: ${doc.numPages}`);
  if (doc.numPages !== 17) {
    console.warn(`Aviso: Esperado 17 páginas, encontrado ${doc.numPages}`);
  }

  console.log(`[3/4] Convertendo páginas para WebP em alta definição...`);
  const conversionResults = [];

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const unscaledViewport = page.getViewport({ scale: 1.0 });

    // Escala para atingir TARGET_WIDTH mantendo proporção exata
    const scale = TARGET_WIDTH / unscaledViewport.width;
    const viewport = page.getViewport({ scale });

    const canvasWidth = Math.round(viewport.width);
    const canvasHeight = Math.round(viewport.height);

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Fundo branco sólido para garantir contraste
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    await page.render({
      canvasContext: ctx,
      viewport: viewport,
    }).promise;

    const pngBuffer = canvas.toBuffer('image/png');

    // Converte para WebP com sharp (qualidade 90 para texto e ilustrações ultra nítidos)
    const fileName = `${String(pageNum).padStart(2, '0')}.webp`;
    const outputPath = path.join(OUTPUT_DIR, fileName);

    const webpBuffer = await sharp(pngBuffer)
      .webp({ quality: 90, effort: 6 })
      .toBuffer();

    fs.writeFileSync(outputPath, webpBuffer);

    const metadata = await sharp(outputPath).metadata();
    const sizeKb = (webpBuffer.length / 1024).toFixed(1);

    conversionResults.push({
      page: pageNum,
      file: fileName,
      dimensions: `${metadata.width}x${metadata.height}`,
      size: `${sizeKb} KB`,
    });

    console.log(`  ✓ Página ${String(pageNum).padStart(2, '0')} -> ${fileName} (${metadata.width}x${metadata.height}, ${sizeKb} KB)`);
  }

  console.log(`[4/4] Conversão finalizada com sucesso para todas as ${doc.numPages} páginas!`);
  console.table(conversionResults);
}

convertCartilhaPdf().catch((err) => {
  console.error('Erro na conversão da cartilha:', err);
  process.exit(1);
});
