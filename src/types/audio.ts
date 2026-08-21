/**
 * Estados do reprodutor de áudio
 */
export type AudioState =
  | 'IDLE'      // Sem áudio carregado ou página sem áudio
  | 'LOADING'   // Carregando arquivo de áudio
  | 'PLAYING'   // Em reprodução
  | 'PAUSED'    // Pausado pelo leitor
  | 'BLOCKED'   // Autoplay bloqueado pelo navegador
  | 'ERROR';    // Erro ao carregar arquivo de som

export interface AudioProgress {
  currentTime: number;
  duration: number;
  percentage: number;
}

export interface AudioListenerEvents {
  onStateChange?: (state: AudioState) => void;
  onProgress?: (progress: AudioProgress) => void;
  onEnded?: () => void;
  onError?: (error: Error | MediaError | null) => void;
}
