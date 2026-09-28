import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Importa os manifestos oficiais dos livros
import theoManifest from '../src/books/theo/book.json' with { type: 'json' };
import nicoManifest from '../src/books/nico/book.json' with { type: 'json' };
import ninaManifest from '../src/books/caminhos-de-nina/book.json' with { type: 'json' };
import cartilhaManifest from '../src/books/cartilha-engasgo/book.json' with { type: 'json' };

export const booksMetadata = [
  {
    slug: 'theo',
    title: 'Theo Tem uma História para Contar | Fonosuite',
    ogTitle: 'Theo Tem uma História para Contar',
    description: theoManifest.description,
    canonicalUrl: 'https://theo.folheia.com/livros/theo',
    imageUrl: 'https://theo.folheia.com/books/theo/pages/01.png',
    imageWidth: 1448,
    imageHeight: 1086,
    imageType: 'image/png'
  },
  {
    slug: 'nico',
    title: 'Nico e as Histórias que Ele Descobriu Escutando | Flipbook Narrado',
    ogTitle: 'Nico e as Histórias que Ele Descobriu Escutando',
    description: nicoManifest.description,
    canonicalUrl: 'https://nico.folheia.com/livros/nico',
    imageUrl: 'https://nico.folheia.com/books/nico/pages/01.webp',
    imageWidth: 1440,
    imageHeight: 1440,
    imageType: 'image/webp'
  },
  {
    slug: 'caminhos-de-nina',
    title: 'Os Caminhos de Nina | Fonosuite',
    ogTitle: 'Os Caminhos de Nina',
    description: ninaManifest.description,
    canonicalUrl: 'https://folheia.com/livros/caminhos-de-nina',
    imageUrl: 'https://folheia.com/books/caminhos-de-nina/pages/01-capa.png',
    imageWidth: 1122,
    imageHeight: 1402,
    imageType: 'image/png'
  },
  {
    slug: 'cartilha-engasgo',
    title: 'Engasgo em Idosos Durante as Refeições | Cartilha Digital Interativa',
    ogTitle: 'Engasgo em Idosos Durante as Refeições',
    description: cartilhaManifest.description,
    canonicalUrl: 'https://folheia.com/livros/cartilha-engasgo',
    imageUrl: 'https://folheia.com/books/cartilha-engasgo/pages/01.webp',
    imageWidth: 420,
    imageHeight: 595,
    imageType: 'image/webp'
  }
];

export function injectMetadata(html, meta) {
  // Remove title e meta description pré-existentes
  let result = html.replace(/<title>.*?<\/title>/i, '');
  result = result.replace(/<meta\s+name=["']description["'][^>]*>/i, '');
  result = result.replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gi, '');
  result = result.replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, '');

  const tags = `
    <title>${meta.title}</title>
    <meta name="description" content="${meta.description}" />
    
    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="book" />
    <meta property="og:site_name" content="Fonosuite" />
    <meta property="og:url" content="${meta.canonicalUrl}" />
    <meta property="og:title" content="${meta.ogTitle}" />
    <meta property="og:description" content="${meta.description}" />
    <meta property="og:image" content="${meta.imageUrl}" />
    <meta property="og:image:secure_url" content="${meta.imageUrl}" />
    <meta property="og:image:type" content="${meta.imageType}" />
    <meta property="og:image:width" content="${meta.imageWidth}" />
    <meta property="og:image:height" content="${meta.imageHeight}" />
    <meta property="og:image:alt" content="${meta.ogTitle}" />
    <meta property="og:locale" content="pt_BR" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${meta.canonicalUrl}" />
    <meta name="twitter:title" content="${meta.ogTitle}" />
    <meta name="twitter:description" content="${meta.description}" />
    <meta name="twitter:image" content="${meta.imageUrl}" />
  `;

  return result.replace('</head>', `${tags}\n  </head>`);
}

export function generateBookHtmls() {
  const DIST_DIR = path.resolve('dist');
  const BASE_HTML_PATH = path.join(DIST_DIR, 'index.html');

  if (!fs.existsSync(BASE_HTML_PATH)) {
    console.error(`Erro: Arquivo base ${BASE_HTML_PATH} não encontrado. Execute o build do Vite primeiro.`);
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(BASE_HTML_PATH, 'utf-8');

  // 1. Gera os arquivos HTML para cada livro em dist/livros/[slug]/index.html
  for (const book of booksMetadata) {
    const targetDir = path.join(DIST_DIR, 'livros', book.slug);
    fs.mkdirSync(targetDir, { recursive: true });

    const customHtml = injectMetadata(baseHtml, book);
    const targetFile = path.join(targetDir, 'index.html');
    fs.writeFileSync(targetFile, customHtml, 'utf-8');
    console.log(`Gerado HTML estático com metadados para: /livros/${book.slug} (${targetFile})`);
  }

  // 2. Remove dist/index.html físico para que a Vercel consulte os rewrites por host na raiz
  fs.unlinkSync(BASE_HTML_PATH);
  console.log('Removido dist/index.html físico para permitir rewrites por host na raiz da Vercel');
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(currentFile)) {
  generateBookHtmls();
}
