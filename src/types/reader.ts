/**
 * Estados principais da experiência de leitura
 */
export type ReaderMode =
  | 'COVER'      // Tela de boas-vindas / Capa com botão "Começar"
  | 'READING'    // Lendo o flipbook
  | 'FINISHED';  // Última página lida / Ação "Ler novamente"

export interface ReaderState {
  mode: ReaderMode;
  currentPage: number; // 1-based (1 a totalPages)
  isMuted: boolean;
  isFullscreen: boolean;
  reducedMotion: boolean;
}
