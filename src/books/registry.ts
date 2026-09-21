import { BookManifest } from '../types/book';
import cartilhaEngasgoManifest from './cartilha-engasgo/book.json';
import nicoManifest from './nico/book.json';
import caminhosDeNinaManifest from './caminhos-de-nina/book.json';

export const BOOKS_REGISTRY: Record<string, BookManifest> = {
  'caminhos-de-nina': caminhosDeNinaManifest as BookManifest,
  'nina': caminhosDeNinaManifest as BookManifest,
  'os-caminhos-de-nina': caminhosDeNinaManifest as BookManifest,
  'cartilha-engasgo': cartilhaEngasgoManifest as BookManifest,
  'engasgo': cartilhaEngasgoManifest as BookManifest,
  'cartilha': cartilhaEngasgoManifest as BookManifest,
  'nico': nicoManifest as BookManifest,
};

export const DEFAULT_BOOK_SLUG = 'caminhos-de-nina';
