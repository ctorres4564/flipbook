import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { validateBookManifest, getPageAudioUrl, getBookBySlug } from '../src/services/bookService';
import { BookManifest } from '../src/types/book';

describe('Book Service & Real Assets Manifest Validation (WebP)', () => {
  const publicDir = path.resolve(__dirname, '../public');

  it('deve carregar o livro Nico do registro com manifesto real', () => {
    const book = getBookBySlug('nico');
    expect(book).toBeDefined();
    expect(book?.slug).toBe('nico');
    expect(book?.totalPages).toBe(16);
    expect(book?.pages).toHaveLength(16);
  });

  it('deve validar com sucesso o manifesto real do livro Nico', () => {
    const book = getBookBySlug('nico') as BookManifest;
    const result = validateBookManifest(book);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('deve garantir que a página 1 (Capa) possui audio: null', () => {
    const book = getBookBySlug('nico') as BookManifest;
    const audioUrl = getPageAudioUrl(book, 1);
    expect(audioUrl).toBeNull();
    expect(book.pages[0].audio).toBeNull();
  });

  it('deve garantir que todas as 16 imagens apontadas no manifesto existem no disco e são WebPs otimizados', () => {
    const book = getBookBySlug('nico') as BookManifest;

    book.pages.forEach((page) => {
      expect(page.image).toMatch(/^\/books\/nico\/pages\/\d{2}\.webp$/);
      const diskPath = path.join(publicDir, page.image);
      expect(fs.existsSync(diskPath)).toBe(true);
      const stat = fs.statSync(diskPath);
      expect(stat.size).toBeGreaterThan(150000); // WebPs de alta fidelidade (>150KB)
      expect(stat.size).toBeLessThan(600000); // Compactados (<600KB)
    });
  });

  it('deve garantir que os 15 arquivos de áudio narrativos referenciados existem no disco e são MP3s reais', () => {
    const book = getBookBySlug('nico') as BookManifest;
    const audioPathsSeen = new Set<string>();

    for (let p = 2; p <= 16; p++) {
      const page = book.pages[p - 1];
      expect(page.audio).toBeDefined();
      expect(page.audio).not.toBeNull();
      expect(page.audio).toMatch(/^\/books\/nico\/audio\/\d{2}\.mp3$/);

      // Não há sobreposição ou duplicação de áudio entre páginas
      expect(audioPathsSeen.has(page.audio!)).toBe(false);
      audioPathsSeen.add(page.audio!);

      const diskPath = path.join(publicDir, page.audio!);
      expect(fs.existsSync(diskPath)).toBe(true);
      const stat = fs.statSync(diskPath);
      expect(stat.size).toBeGreaterThan(50000); // Narrações reais (>50KB)
    }

    expect(audioPathsSeen.size).toBe(15);
  });
});
