import { BookManifest } from '../types/book';
import nicoManifest from './nico/book.json';

export const BOOKS_REGISTRY: Record<string, BookManifest> = {
  nico: nicoManifest as BookManifest,
};
