import { describe, it, expect } from 'vitest';
import { validateBookManifest, getPageAudioUrl, getBookBySlug } from '../src/services/bookService';
import { BookManifest } from '../src/types/book';

describe('Book Service & Manifest Validation', () => {
  const validNicoManifest: BookManifest = {
    slug: 'nico',
    title: 'Nico e as Histórias que Ele Descobriu Escutando',
    coverImage: '/books/nico/pages/01.webp',
    totalPages: 16,
    pages: Array.from({ length: 16 }, (_, i) => ({
      pageNumber: i + 1,
      image: `/books/nico/pages/${String(i + 1).padStart(2, '0')}.webp`,
      audio: i === 0 ? null : `/books/nico/audio/${String(i + 1).padStart(2, '0')}.mp3`,
      alt: `Página ${i + 1} do livro do Nico`,
    })),
  };

  it('deve validar com sucesso um manifesto correto de 16 páginas', () => {
    const result = validateBookManifest(validNicoManifest);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('deve rejeitar um manifesto sem slug ou sem título', () => {
    const invalid = { ...validNicoManifest, slug: '', title: '' };
    const result = validateBookManifest(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('deve rejeitar manifesto onde totalPages difere do tamanho real do array pages', () => {
    const invalid = { ...validNicoManifest, totalPages: 10 };
    const result = validateBookManifest(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('O número total de páginas (10) não corresponde à quantidade de páginas cadastradas (16).');
  });

  it('deve retornar null para páginas sem áudio (ex: página 1/capa)', () => {
    const audioUrl = getPageAudioUrl(validNicoManifest, 1);
    expect(audioUrl).toBeNull();
  });

  it('deve retornar o caminho correto do áudio para páginas narradas', () => {
    const audioUrl = getPageAudioUrl(validNicoManifest, 2);
    expect(audioUrl).toBe('/books/nico/audio/02.mp3');
  });

  it('deve carregar o livro Nico do registro estático', () => {
    const book = getBookBySlug('nico');
    expect(book).toBeDefined();
    expect(book?.slug).toBe('nico');
    expect(book?.totalPages).toBe(16);
    expect(book?.pages[0].audio).toBeNull();
    expect(book?.pages[1].audio).toBe('/books/nico/audio/02.mp3');
  });

  it('deve retornar undefined para slug inexistente', () => {
    const book = getBookBySlug('livro-que-nao-existe');
    expect(book).toBeUndefined();
  });
});
