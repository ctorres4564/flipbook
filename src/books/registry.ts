import { BookManifest } from '../types/book';

// Importação tipada do manifesto padrão para bundling / SSR ou acesso instantâneo
import nicoManifest from '../../public/books/nico/book.json';

export const BOOKS_REGISTRY: Record<string, BookManifest> = {
  nico: nicoManifest as BookManifest,
};
