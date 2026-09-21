import fs from 'fs';
import path from 'path';

const SRC_IMG_DIR = path.resolve('livro_caminhos_de_nina');
const SRC_AUDIO_DIR = path.resolve('livro_caminhos_de_nina/AUDIOS');

const DEST_PAGES_DIR = path.resolve('public/books/caminhos-de-nina/pages');
const DEST_AUDIO_DIR = path.resolve('public/books/caminhos-de-nina/audio');
const DEST_JSON_PATH = path.resolve('src/books/caminhos-de-nina/book.json');

// Garante existência das pastas
fs.mkdirSync(DEST_PAGES_DIR, { recursive: true });
fs.mkdirSync(DEST_AUDIO_DIR, { recursive: true });
fs.mkdirSync(path.dirname(DEST_JSON_PATH), { recursive: true });

// Mapeamento das 18 páginas na sequência estrita exigida
const pagesMapping = [
  {
    order: 1,
    rawImageName: 'CAPA.png',
    destImageName: '01-capa.png',
    rawAudioName: null,
    destAudioName: null,
    title: 'Capa',
    alt: 'Capa do livro Os Caminhos de Nina',
    isActivity: false,
    section: 'Capa'
  },
  {
    order: 2,
    rawImageName: 'pagina 1.png',
    destImageName: '02-pagina-1.png',
    rawAudioName: 'AUDIO DA PAGINA 1.wav',
    destAudioName: '02-pagina-1.wav',
    title: 'Página 1',
    alt: 'Página 1: Ilustração de Os Caminhos de Nina',
    isActivity: false,
    section: 'História'
  },
  {
    order: 3,
    rawImageName: 'pagina 2.png',
    destImageName: '03-pagina-2.png',
    rawAudioName: 'AUDIO DA PAGINA 2.wav',
    destAudioName: '03-pagina-2.wav',
    title: 'Página 2',
    alt: 'Página 2: Ilustração de Os Caminhos de Nina',
    isActivity: false,
    section: 'História'
  },
  {
    order: 4,
    rawImageName: 'pagina 3.png',
    destImageName: '04-pagina-3.png',
    rawAudioName: 'AUDIO DA PAGINA 3.wav',
    destAudioName: '04-pagina-3.wav',
    title: 'Página 3',
    alt: 'Página 3: Ilustração de Os Caminhos de Nina',
    isActivity: false,
    section: 'História'
  },
  {
    order: 5,
    rawImageName: 'pagina 4.png',
    destImageName: '04-pagina-4.png',
    destImageName: '05-pagina-4.png',
    rawAudioName: 'AUDIO DA PAGINA 4.wav',
    destAudioName: '05-pagina-4.wav',
    title: 'Página 4',
    alt: 'Página 4: Ilustração de Os Caminhos de Nina',
    isActivity: false,
    section: 'História'
  },
  {
    order: 6,
    rawImageName: 'pagina 5.png',
    destImageName: '06-pagina-5.png',
    rawAudioName: 'AUDIO DA PAGINA 5.wav',
    destAudioName: '06-pagina-5.wav',
    title: 'Página 5',
    alt: 'Página 5: Ilustração de Os Caminhos de Nina',
    isActivity: false,
    section: 'História'
  },
  {
    order: 7,
    rawImageName: 'pagina 6.png',
    destImageName: '07-pagina-6.png',
    rawAudioName: 'AUDIO DA PAGINA 6.wav',
    destAudioName: '07-pagina-6.wav',
    title: 'Página 6',
    alt: 'Página 6: Ilustração de Os Caminhos de Nina',
    isActivity: false,
    section: 'História'
  },
  {
    order: 8,
    rawImageName: 'pagina 7.png',
    destImageName: '08-pagina-7.png',
    rawAudioName: 'AUDIO DA PAGINA 7.wav',
    destAudioName: '08-pagina-7.wav',
    title: 'Página 7',
    alt: 'Página 7: Ilustração de Os Caminhos de Nina',
    isActivity: false,
    section: 'História'
  },
  {
    order: 9,
    rawImageName: 'pagina 8.png',
    destImageName: '09-pagina-8.png',
    rawAudioName: 'AUDIO DA PAGINA 8.wav',
    destAudioName: '09-pagina-8.wav',
    title: 'Página 8',
    alt: 'Página 8: Ilustração de Os Caminhos de Nina',
    isActivity: false,
    section: 'História'
  },
  {
    order: 10,
    rawImageName: 'pagina 9.png',
    destImageName: '10-pagina-9.png',
    rawAudioName: 'AUDIO DA PAGINA 9.wav',
    destAudioName: '10-pagina-9.wav',
    title: 'Página 9',
    alt: 'Página 9: Ilustração de Os Caminhos de Nina',
    isActivity: false,
    section: 'História'
  },
  {
    order: 11,
    rawImageName: 'pagina 10.png',
    destImageName: '11-pagina-10.png',
    rawAudioName: 'AUDIO DA PAGINA 10.wav',
    destAudioName: '11-pagina-10.wav',
    title: 'Página 10',
    alt: 'Página 10: Ilustração de Os Caminhos de Nina',
    isActivity: false,
    section: 'História'
  },
  {
    order: 12,
    rawImageName: 'pagina 11.png',
    destImageName: '12-pagina-11.png',
    rawAudioName: 'AUDIO DA PAGINA 11.wav',
    destAudioName: '12-pagina-11.wav',
    title: 'Página 11',
    alt: 'Página 11: Ilustração de Os Caminhos de Nina',
    isActivity: false,
    section: 'História'
  },
  {
    order: 13,
    rawImageName: 'pagina 12.png',
    destImageName: '13-pagina-12.png',
    rawAudioName: 'AUDIO DA PAGINA 12.wav',
    destAudioName: '13-pagina-12.wav',
    title: 'Página 12',
    alt: 'Página 12: Ilustração de Os Caminhos de Nina',
    isActivity: false,
    section: 'História'
  },
  {
    order: 14,
    rawImageName: 'pagina 13.png',
    destImageName: '14-pagina-13.png',
    rawAudioName: 'AUDIO DA PAGINA 13.wav',
    destAudioName: '14-pagina-13.wav',
    title: 'Página 13',
    alt: 'Página 13: Ilustração de Os Caminhos de Nina',
    isActivity: false,
    section: 'História'
  },
  {
    order: 15,
    rawImageName: 'pagina 14.png',
    destImageName: '15-pagina-14.png',
    rawAudioName: 'AUDIO DA PAGINA 14.wav',
    destAudioName: '15-pagina-14.wav',
    title: 'Página 14',
    alt: 'Página 14: Ilustração de Os Caminhos de Nina',
    isActivity: false,
    section: 'História'
  },
  {
    order: 16,
    rawImageName: 'pagina 15.png',
    destImageName: '16-pagina-15.png',
    rawAudioName: 'AUDIO DA PAGINA 15.wav',
    destAudioName: '16-pagina-15.wav',
    title: 'Página 15',
    alt: 'Página 15: Ilustração de Os Caminhos de Nina',
    isActivity: false,
    section: 'História'
  },
  {
    order: 17,
    rawImageName: 'pagina 16.png',
    destImageName: '17-pagina-16.png',
    rawAudioName: 'AUDIO DA PAGINA 16.wav',
    destAudioName: '17-pagina-16.wav',
    title: 'Página 16 — Atividade',
    alt: 'Página 16: Atividade de Os Caminhos de Nina',
    isActivity: true,
    section: 'Atividade'
  },
  {
    order: 18,
    rawImageName: fs.existsSync(path.join(SRC_IMG_DIR, 'contacapa.png')) ? 'contacapa.png' : 'contracapa.png',
    destImageName: '18-contracapa.png',
    rawAudioName: 'CONTRACAPA.wav',
    destAudioName: '18-contracapa.wav',
    title: 'Contracapa',
    alt: 'Contracapa do livro Os Caminhos de Nina',
    isActivity: false,
    section: 'Contracapa'
  }
];

console.log('Iniciando cópia e estruturação de "Os Caminhos de Nina"...');

const bookPages = [];

for (const item of pagesMapping) {
  // 1. Cópia da imagem
  const srcImgPath = path.join(SRC_IMG_DIR, item.rawImageName);
  const destImgPath = path.join(DEST_PAGES_DIR, item.destImageName);

  if (!fs.existsSync(srcImgPath)) {
    throw new Error(`Imagem não encontrada: ${srcImgPath}`);
  }
  fs.copyFileSync(srcImgPath, destImgPath);
  console.log(`  ✓ Imagem [${item.order}/18] copiada: ${item.rawImageName} -> ${item.destImageName}`);

  // 2. Cópia do áudio se existir
  let audioPublicPath = null;
  if (item.rawAudioName) {
    const srcAudioPath = path.join(SRC_AUDIO_DIR, item.rawAudioName);
    const destAudioPath = path.join(DEST_AUDIO_DIR, item.destAudioName);

    if (!fs.existsSync(srcAudioPath)) {
      throw new Error(`Áudio não encontrado: ${srcAudioPath}`);
    }
    fs.copyFileSync(srcAudioPath, destAudioPath);
    console.log(`  ✓ Áudio [${item.order}/18] copiado: ${item.rawAudioName} -> ${item.destAudioName}`);
    audioPublicPath = `/books/caminhos-de-nina/audio/${item.destAudioName}`;
  } else {
    console.log(`  - Página [${item.order}/18] sem áudio (esperado para Capa)`);
  }

  bookPages.push({
    pageNumber: item.order,
    image: `/books/caminhos-de-nina/pages/${item.destImageName}`,
    audio: audioPublicPath,
    alt: item.alt,
    title: item.title,
    section: item.section,
    isActivity: item.isActivity
  });
}

const manifest = {
  slug: 'caminhos-de-nina',
  title: 'Os Caminhos de Nina',
  description: 'Um livro infantil sensível sobre escolhas, descobertas e imaginação.',
  coverImage: '/books/caminhos-de-nina/pages/01-capa.png',
  totalPages: 18,
  aspectRatio: 'portrait',
  pageDimensions: {
    width: 1122,
    height: 1402
  },
  startInReadingMode: true,
  disableSoundEffects: true,
  autoPlayAudio: false,
  topics: [
    { title: 'Capa', pageNumber: 1, section: 'Capa' },
    { title: 'Início da História', pageNumber: 2, section: 'História' },
    { title: 'Atividade', pageNumber: 17, section: 'Atividade' },
    { title: 'Contracapa', pageNumber: 18, section: 'Contracapa' }
  ],
  pages: bookPages
};

fs.writeFileSync(DEST_JSON_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
console.log(`\nManifesto salvo com sucesso em: ${DEST_JSON_PATH}`);
console.log(`Total de páginas: ${manifest.totalPages}`);
console.log(`Total de páginas com áudio: ${manifest.pages.filter(p => Boolean(p.audio)).length}`);
