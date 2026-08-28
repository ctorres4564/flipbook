import { BookManifest } from '../types/book';
import { BOOKS_REGISTRY } from '../books/registry';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Valida a estrutura e consistência de um manifesto de livro
 */
export function validateBookManifest(manifest: Partial<BookManifest>): ValidationResult {
  const errors: string[] = [];

  if (!manifest.slug || typeof manifest.slug !== 'string' || manifest.slug.trim() === '') {
    errors.push('O slug do livro é obrigatório.');
  }

  if (!manifest.title || typeof manifest.title !== 'string' || manifest.title.trim() === '') {
    errors.push('O título do livro é obrigatório.');
  }

  if (!manifest.coverImage || typeof manifest.coverImage !== 'string') {
    errors.push('A imagem de capa é obrigatória.');
  }

  if (typeof manifest.totalPages !== 'number' || manifest.totalPages <= 0) {
    errors.push('O número total de páginas deve ser um número maior que zero.');
  }

  if (!Array.isArray(manifest.pages)) {
    errors.push('A lista de páginas é obrigatória e deve ser um array.');
  } else {
    if (manifest.totalPages && manifest.pages.length !== manifest.totalPages) {
      errors.push(
        `O número total de páginas (${manifest.totalPages}) não corresponde à quantidade de páginas cadastradas (${manifest.pages.length}).`
      );
    }

    manifest.pages.forEach((page, index) => {
      if (!page.image || typeof page.image !== 'string') {
        errors.push(`A página no índice ${index} não possui uma imagem válida.`);
      }
      if (page.pageNumber !== index + 1) {
        errors.push(`A página no índice ${index} possui pageNumber incorreto (${page.pageNumber} esperado: ${index + 1}).`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Obtém o livro registrado pelo slug
 */
export function getBookBySlug(slug: string): BookManifest | undefined {
  const book = BOOKS_REGISTRY[slug.toLowerCase()];
  if (book) {
    const validation = validateBookManifest(book);
    if (!validation.isValid) {
      console.warn(`Manifesto do livro '${slug}' contém inconsistências:`, validation.errors);
    }
  }
  return book;
}

/**
 * Retorna a URL do áudio pré-gravado de uma página específica (1-based), ou null caso não exista
 */
export function getPageAudioUrl(manifest: BookManifest, pageNumber: number): string | null {
  if (pageNumber < 1 || pageNumber > manifest.pages.length) {
    return null;
  }
  const page = manifest.pages[pageNumber - 1];
  return page.audio || null;
}

/**
 * Retorna o texto acessível de leitura para síntese de voz (pt-BR)
 */
export function getPageSpeechText(manifest: BookManifest, pageNumber: number): string | null {
  if (pageNumber < 1 || pageNumber > manifest.pages.length) {
    return null;
  }
  const page = manifest.pages[pageNumber - 1];
  return page.speechText || page.alt || page.title || null;
}

/**
 * Retorna todos os livros disponíveis no catálogo
 */
export function getAllBooks(): BookManifest[] {
  const uniqueBooks = new Map<string, BookManifest>();
  Object.values(BOOKS_REGISTRY).forEach((book) => {
    if (!uniqueBooks.has(book.slug)) {
      uniqueBooks.set(book.slug, book);
    }
  });
  return Array.from(uniqueBooks.values());
}
