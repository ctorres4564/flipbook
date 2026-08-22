import fs from 'fs';
import path from 'path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const pdfPath = path.resolve('livro_nico/assets/novas_imagens/LIVRO DO NICO.pdf');

async function inspect() {
  console.log(`Lendo arquivo: ${pdfPath}`);
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const loadingTask = pdfjsLib.getDocument({ data });
  const doc = await loadingTask.promise;
  
  console.log(`Total de páginas no PDF: ${doc.numPages}`);
  
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 1.0 });
    console.log(`Página ${i}: largura=${viewport.width}pt, altura=${viewport.height}pt (ratio: ${(viewport.width/viewport.height).toFixed(3)})`);
  }
}

inspect().catch(err => {
  console.error('Erro ao inspecionar PDF:', err);
  process.exit(1);
});
