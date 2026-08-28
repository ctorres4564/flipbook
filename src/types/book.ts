/**
 * Tipagens do domínio do Livro e Cartilha Digital
 */

export interface BookTopic {
  title: string;
  pageNumber: number;
  section?: string;
}

export interface BookPage {
  /** Número sequencial da página (1-based) */
  pageNumber: number;
  /** Caminho da imagem da página (ex: /books/cartilha-engasgo/pages/01.webp) */
  image: string;
  /** Caminho do áudio gravado da página ou null se não houver narração de estúdio */
  audio?: string | null;
  /** Texto alternativo / transcrição para leitores de tela e acessibilidade */
  alt?: string;
  /** Título opcional da seção ou página */
  title?: string;
  /** Nome da seção (ex: "Sinais de Alerta", "Preparando a Refeição") */
  section?: string;
  /** Texto completo para leitura em voz alta acessível (Web Speech Synthesis pt-BR) */
  speechText?: string;
}

export interface BookManifest {
  /** Identificador único na URL (ex: "cartilha-engasgo", "nico") */
  slug: string;
  /** Título oficial da obra */
  title: string;
  /** Subtítulo da obra */
  subtitle?: string;
  /** Descrição ou sinopse */
  description?: string;
  /** Autor(es) / Responsabilidade técnica */
  author?: string;
  /** Conselho de classe / Registro (ex: CRFa 1-17701) */
  credentials?: string;
  /** Ilustrador(es) / Designer */
  illustrator?: string;
  /** Capa do livro (geralmente a página 1 ou imagem dedicada) */
  coverImage: string;
  /** Total de páginas do livro */
  totalPages: number;
  /** Proporção de página ('portrait' | 'square' | 'landscape') */
  aspectRatio?: 'portrait' | 'square' | 'landscape';
  /** Dimensões base de proporção { width, height } */
  pageDimensions?: {
    width: number;
    height: number;
  };
  /** Link para download do arquivo PDF original */
  pdfUrl?: string;
  /** Tópicos do sumário / Índice */
  topics?: BookTopic[];
  /** Lista ordenada de páginas */
  pages: BookPage[];
}
