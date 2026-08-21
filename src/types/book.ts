/**
 * Tipagens do domínio do Livro
 */

export interface BookPage {
  /** Número sequencial da página (1-based) */
  pageNumber: number;
  /** Caminho da imagem da página (ex: /books/nico/pages/01.webp) */
  image: string;
  /** Caminho do áudio da página ou null se não houver narração */
  audio?: string | null;
  /** Texto alternativo / transcrição para acessibilidade */
  alt?: string;
  /** Título opcional da seção ou página */
  title?: string;
}

export interface BookManifest {
  /** Identificador único na URL (ex: "nico") */
  slug: string;
  /** Título oficial da obra */
  title: string;
  /** Descrição ou sinopse */
  description?: string;
  /** Autor(es) */
  author?: string;
  /** Ilustrador(es) */
  illustrator?: string;
  /** Capa do livro (geralmente a página 1 ou imagem dedicada) */
  coverImage: string;
  /** Total de páginas do livro */
  totalPages: number;
  /** Lista ordenada de páginas */
  pages: BookPage[];
}
