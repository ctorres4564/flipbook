import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const SRC_IMG_DIR = path.resolve('livro_theo_tem_uma_historia_pra_contar/assets/imagens');
const SRC_AUDIO_DIR = path.resolve('livro_theo_tem_uma_historia_pra_contar/audios');

const DEST_PAGES_DIR = path.resolve('public/books/theo/pages');
const DEST_AUDIO_DIR = path.resolve('public/books/theo/audio');
const DEST_JSON_PATH = path.resolve('src/books/theo/book.json');

// Garante existência dos diretórios
fs.mkdirSync(DEST_PAGES_DIR, { recursive: true });
fs.mkdirSync(DEST_AUDIO_DIR, { recursive: true });
fs.mkdirSync(path.dirname(DEST_JSON_PATH), { recursive: true });

// Conteúdo e textos oficiais do roteiro aprovado
const pagesData = [
  {
    pageNumber: 1,
    rawImageName: 'pagina 1.png',
    rawAudioName: 'audio_pagina 1.wav',
    title: 'Página 1',
    alt: 'Theo sentado confortavelmente assistindo ao desenho na televisão, atento e interessado.',
    speechText: 'Theo adorava assistir aos seus desenhos preferidos. Naquele dia, uma menina e um urso estavam vivendo uma aventura muito engraçada.'
  },
  {
    pageNumber: 2,
    rawImageName: 'pagina 2.png',
    rawAudioName: 'audio_pagina 2.wav',
    title: 'Página 2',
    alt: 'Theo sorrindo diante da televisão enquanto acompanha a aventura da menina e do urso.',
    speechText: 'A menina aprontava uma coisa atrás da outra. E o urso tentava acompanhar toda aquela confusão. Theo achava muita graça.'
  },
  {
    pageNumber: 3,
    rawImageName: 'pagina 3.png',
    rawAudioName: 'audio_pagina 3.wav',
    title: 'Página 3',
    alt: 'O desenho termina e Theo se levanta animado para procurar alguém da família.',
    speechText: 'Quando o desenho terminou, Theo ainda estava pensando naquela história. Ele queria contar para sua família o que tinha acontecido.'
  },
  {
    pageNumber: 4,
    rawImageName: 'pagina 4.png',
    rawAudioName: 'audio_pagina 4.wav',
    title: 'Página 4',
    alt: 'Theo diante de um familiar, tentando começar a contar, com expressão concentrada.',
    speechText: 'Theo sabia o que queria contar. A história estava todinha em sua cabeça. Mas encontrar as palavras era difícil.'
  },
  {
    pageNumber: 5,
    rawImageName: 'pagina 5.png',
    rawAudioName: 'audio_pagina 5.wav',
    title: 'Página 5',
    alt: 'Theo concentrado. O familiar permanece próximo e atento, dando tempo para ele se comunicar.',
    speechText: 'Theo tentou. Parou. Pensou um pouco. E tentou outra vez.'
  },
  {
    pageNumber: 6,
    rawImageName: 'pagina 6.png',
    rawAudioName: 'audio_pagina 6.wav',
    title: 'Página 6',
    alt: 'Theo consegue dizer a primeira palavra. Sua expressão mostra que quer continuar.',
    speechText: 'Então, uma palavra apareceu. "MENINA!" Era só uma palavra. Mas a história de Theo tinha começado.'
  },
  {
    pageNumber: 7,
    rawImageName: 'pagina 7.png',
    rawAudioName: 'audio_pagina 7.wav',
    title: 'Página 7',
    alt: 'Theo continua tentando se comunicar enquanto o familiar presta atenção.',
    speechText: 'Theo percebeu que estavam prestando atenção. Pensou mais um pouco. E encontrou outra palavra: "URSO!"'
  },
  {
    pageNumber: 8,
    rawImageName: 'pagina 8.png',
    rawAudioName: 'audio_pagina 8.wav',
    title: 'Página 8',
    alt: 'Theo começa a usar espontaneamente movimentos e expressões enquanto tenta continuar a história.',
    speechText: 'Agora havia uma menina. Havia um urso. Mas Theo ainda queria contar o que tinha acontecido com eles.'
  },
  {
    pageNumber: 9,
    rawImageName: 'pagina 9.png',
    rawAudioName: 'audio_pagina 9.wav',
    title: 'Página 9',
    alt: 'Theo combina suas tentativas de falar com gestos e expressões faciais.',
    speechText: 'As palavras ainda estavam difíceis. Então Theo usou também as mãos, o rosto e os gestos. Tudo ajudava a contar.'
  },
  {
    pageNumber: 10,
    rawImageName: 'pagina 10.png',
    rawAudioName: 'audio_pagina 10.wav',
    title: 'Página 10',
    alt: 'Theo se comunica enquanto sua família acompanha com atenção, sem interrompê-lo.',
    speechText: 'Sua família esperou. Observou. Escutou. E, pouco a pouco, começou a entender.'
  },
  {
    pageNumber: 11,
    rawImageName: 'pagina 11.png',
    rawAudioName: 'audio_pagina 11.wav',
    title: 'Página 11',
    alt: 'Theo sorri e demonstra vontade de continuar contando.',
    speechText: 'Theo percebeu que estavam entendendo! Sorriu e continuou. Uma palavra. Um gesto. Depois, outra tentativa.'
  },
  {
    pageNumber: 12,
    rawImageName: 'pagina 12.png',
    rawAudioName: 'audio_pagina 12.wav',
    title: 'Página 12',
    alt: 'Theo continua sua narrativa com palavras, expressões e gestos, em um momento tranquilo com a família.',
    speechText: 'Theo não precisou contar tudo de uma vez. Cada palavra ajudou. Cada gesto também. E sua história foi aparecendo aos poucos.'
  },
  {
    pageNumber: 13,
    rawImageName: 'pagina 13.png',
    rawAudioName: 'audio_pagina 13.wav',
    title: 'Página 13',
    alt: 'Theo assiste à televisão e, espontaneamente, vira-se em direção a um familiar, querendo compartilhar o que está vendo.',
    speechText: 'No outro dia, Theo assistiu ao desenho novamente. Quando viu a menina e o urso, lembrou da história que tinha contado. E procurou alguém da família.'
  },
  {
    pageNumber: 14,
    rawImageName: 'pagina 14.png',
    rawAudioName: 'audio_pagina 14.wav',
    title: 'Página 14',
    alt: 'Theo junto da família em um momento afetivo e tranquilo, encerrando a história.',
    speechText: 'Theo ainda tinha muitas histórias para contar. Algumas começavam com uma palavra. Outras, com um gesto. E sempre que Theo tentava contar alguma coisa, havia alguém disposto a escutar.'
  }
];

async function run() {
  console.log('Iniciando processamento dos assets do Theo...');

  const manifestPages = [];

  for (const item of pagesData) {
    const padNum = String(item.pageNumber).padStart(2, '0');
    const srcImgPath = path.join(SRC_IMG_DIR, item.rawImageName);
    const destImgPngName = `${padNum}.png`;
    const destImgWebpName = `${padNum}.webp`;

    const destImgPngPath = path.join(DEST_PAGES_DIR, destImgPngName);
    const destImgWebpPath = path.join(DEST_PAGES_DIR, destImgWebpName);

    // Copia PNG original para preservação de alta fidelidade
    fs.copyFileSync(srcImgPath, destImgPngPath);

    // Gera WebP com qualidade 90 para performance otimizada na web
    await sharp(srcImgPath)
      .webp({ quality: 90, effort: 6 })
      .toFile(destImgWebpPath);

    const origPngStat = fs.statSync(destImgPngPath);
    const webpStat = fs.statSync(destImgWebpPath);
    console.log(`Página ${padNum}: PNG (${(origPngStat.size / 1024).toFixed(1)} KB) -> WebP (${(webpStat.size / 1024).toFixed(1)} KB)`);

    // Copia áudio original (.wav)
    const srcAudioPath = path.join(SRC_AUDIO_DIR, item.rawAudioName);
    const destAudioName = `${padNum}.wav`;
    const destAudioPath = path.join(DEST_AUDIO_DIR, destAudioName);
    fs.copyFileSync(srcAudioPath, destAudioPath);

    manifestPages.push({
      pageNumber: item.pageNumber,
      image: `/books/theo/pages/${destImgWebpName}`,
      audio: `/books/theo/audio/${destAudioName}`,
      alt: item.alt,
      title: item.title,
      speechText: item.speechText
    });
  }

  const bookManifest = {
    slug: 'theo',
    title: 'Theo Tem uma História para Contar',
    documentTitle: 'Theo Tem uma História para Contar | Flipbook Narrado',
    description: 'Theo tem uma história todinha em sua cabeça. Com paciência, apoio da família e encontrando suas próprias formas de se comunicar, ele descobre que sempre há alguém disposto a escutar.',
    coverImage: '/books/theo/pages/01.webp',
    totalPages: 14,
    aspectRatio: 'landscape',
    pageDimensions: {
      width: 1448,
      height: 1086
    },
    autoPlayAudio: false,
    pages: manifestPages
  };

  fs.writeFileSync(DEST_JSON_PATH, JSON.stringify(bookManifest, null, 2), 'utf-8');
  console.log(`Manifesto gerado com sucesso em: ${DEST_JSON_PATH}`);
}

run().catch(err => {
  console.error('Erro na execução:', err);
  process.exit(1);
});
