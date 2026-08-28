import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { validateBookManifest, getBookBySlug, getPageSpeechText } from '../src/services/bookService';
import { BookManifest } from '../src/types/book';

describe('Cartilha Engasgo em Idosos - Manifest & Assets Validation', () => {
  const publicDir = path.resolve(__dirname, '../public');

  it('deve carregar a Cartilha de Engasgo do registro', () => {
    const book = getBookBySlug('cartilha-engasgo');
    expect(book).toBeDefined();
    expect(book?.slug).toBe('cartilha-engasgo');
    expect(book?.totalPages).toBe(17);
    expect(book?.pages).toHaveLength(17);
    expect(book?.author).toBe('Sônia Torres');
    expect(book?.credentials).toContain('CRFa 1-17701');
  });

  it('deve validar com sucesso a estrutura do manifesto da Cartilha', () => {
    const book = getBookBySlug('cartilha-engasgo') as BookManifest;
    const result = validateBookManifest(book);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('deve garantir que todas as 17 imagens WebP existem fisicamente e estão otimizadas', () => {
    const book = getBookBySlug('cartilha-engasgo') as BookManifest;

    book.pages.forEach((page) => {
      expect(page.image).toMatch(/^\/books\/cartilha-engasgo\/pages\/\d{2}\.webp$/);
      const diskPath = path.join(publicDir, page.image);
      expect(fs.existsSync(diskPath)).toBe(true);
      const stat = fs.statSync(diskPath);
      expect(stat.size).toBeGreaterThan(30000); // Mínimo 30KB para páginas com ilustrações
      expect(stat.size).toBeLessThan(400000); // Compactadas abaixo de 400KB
    });
  });

  it('deve garantir que o arquivo PDF original está disponível para download', () => {
    const book = getBookBySlug('cartilha-engasgo') as BookManifest;
    expect(book.pdfUrl).toBeDefined();
    const diskPdfPath = path.join(publicDir, book.pdfUrl!);
    expect(fs.existsSync(diskPdfPath)).toBe(true);
    const stat = fs.statSync(diskPdfPath);
    expect(stat.size).toBeGreaterThan(500000);
  });

  it('deve garantir que todas as 17 páginas possuem texto para síntese de voz (pt-BR) e acessibilidade', () => {
    const book = getBookBySlug('cartilha-engasgo') as BookManifest;

    for (let p = 1; p <= 17; p++) {
      const speechText = getPageSpeechText(book, p);
      expect(speechText).toBeDefined();
      expect(speechText).not.toBeNull();
      expect(speechText!.length).toBeGreaterThan(15);
    }
  });

  it('deve conter tópicos de navegação para o sumário', () => {
    const book = getBookBySlug('cartilha-engasgo') as BookManifest;
    expect(book.topics).toBeDefined();
    expect(book.topics!.length).toBe(17);
    expect(book.topics![0].title).toBe('Capa');
    expect(book.topics![9].title).toContain('A posição correta');
  });
});
