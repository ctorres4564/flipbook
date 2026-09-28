import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
// @ts-ignore
import { injectMetadata } from '../scripts/generate-book-htmls.mjs';
import theoManifest from '../src/books/theo/book.json';
import nicoManifest from '../src/books/nico/book.json';
import ninaManifest from '../src/books/caminhos-de-nina/book.json';

describe('Social Metadata & Open Graph Injection', () => {
  const sampleHtml = `<!doctype html>
<html lang="pt-BR">
  <head>
    <title>Os Caminhos de Nina | Fonosuite</title>
    <meta name="description" content="Os Caminhos de Nina - Flipbook" />
  </head>
  <body><div id="root"></div></body>
</html>`;

  it('deve injetar metadados de Theo corretamente no HTML', () => {
    const theoMeta = {
      slug: 'theo',
      title: 'Theo Tem uma História para Contar | Fonosuite',
      ogTitle: 'Theo Tem uma História para Contar',
      description: theoManifest.description,
      canonicalUrl: 'https://theo.folheia.com/livros/theo',
      imageUrl: 'https://theo.folheia.com/books/theo/pages/01.png',
      imageWidth: 1448,
      imageHeight: 1086,
      imageType: 'image/png'
    };

    const transformed = injectMetadata(sampleHtml, theoMeta);

    // Deve conter título e descrição de Theo
    expect(transformed).toContain('<title>Theo Tem uma História para Contar | Fonosuite</title>');
    expect(transformed).toContain(`<meta property="og:title" content="Theo Tem uma História para Contar" />`);
    expect(transformed).toContain(`<meta property="og:description" content="${theoManifest.description}" />`);
    expect(transformed).toContain(`<meta property="og:url" content="https://theo.folheia.com/livros/theo" />`);
    expect(transformed).toContain(`<meta property="og:image" content="https://theo.folheia.com/books/theo/pages/01.png" />`);
    expect(transformed).toContain(`<meta property="og:image:type" content="image/png" />`);

    // Não deve conter resquícios de Os Caminhos de Nina no title
    expect(transformed).not.toContain('<title>Os Caminhos de Nina | Fonosuite</title>');
  });

  it('deve injetar metadados de Nico e Nina sem regressão', () => {
    const nicoMeta = {
      slug: 'nico',
      title: 'Nico e as Histórias que Ele Descobriu Escutando | Flipbook Narrado',
      ogTitle: 'Nico e as Histórias que Ele Descobriu Escutando',
      description: nicoManifest.description,
      canonicalUrl: 'https://nico.folheia.com/livros/nico',
      imageUrl: 'https://nico.folheia.com/books/nico/pages/01.webp',
      imageWidth: 1440,
      imageHeight: 1440,
      imageType: 'image/webp'
    };

    const transformedNico = injectMetadata(sampleHtml, nicoMeta);
    expect(transformedNico).toContain('<title>Nico e as Histórias que Ele Descobriu Escutando | Flipbook Narrado</title>');
    expect(transformedNico).toContain('<meta property="og:image" content="https://nico.folheia.com/books/nico/pages/01.webp" />');

    const ninaMeta = {
      slug: 'caminhos-de-nina',
      title: 'Os Caminhos de Nina | Fonosuite',
      ogTitle: 'Os Caminhos de Nina',
      description: ninaManifest.description,
      canonicalUrl: 'https://folheia.com/livros/caminhos-de-nina',
      imageUrl: 'https://folheia.com/books/caminhos-de-nina/pages/01-capa.png',
      imageWidth: 1122,
      imageHeight: 1402,
      imageType: 'image/png'
    };
    const transformedNina = injectMetadata(sampleHtml, ninaMeta);
    expect(transformedNina).toContain('<title>Os Caminhos de Nina | Fonosuite</title>');
    expect(transformedNina).toContain(`<meta property="og:description" content="${ninaManifest.description}" />`);
  });

  it('vercel.json deve conter rewrites por host para theo.folheia.com e rotas de livros', () => {
    const vercelConfig = JSON.parse(fs.readFileSync(path.resolve('vercel.json'), 'utf-8'));
    expect(vercelConfig.rewrites).toBeDefined();

    const theoHostRewrite = vercelConfig.rewrites.find(
      (r: any) => r.source === '/' && r.has?.some((h: any) => h.type === 'host' && h.value === 'theo.folheia.com')
    );
    expect(theoHostRewrite).toBeDefined();
    expect(theoHostRewrite.destination).toBe('/livros/theo/index.html');

    const theoRouteRewrite = vercelConfig.rewrites.find(
      (r: any) => r.source === '/livros/theo'
    );
    expect(theoRouteRewrite).toBeDefined();
    expect(theoRouteRewrite.destination).toBe('/livros/theo/index.html');
  });
});
