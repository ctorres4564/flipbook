import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { AudioState, AudioProgress } from '../../types/audio';

interface ReaderControlsProps {
  currentPage: number;
  totalPages: number;
  audioState: AudioState;
  audioProgress: AudioProgress | null;
  hasAudioOnCurrentPage: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  isFullscreenAvailable: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
  onTogglePlay: () => void;
  onRestartAudio: () => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
}

export const ReaderControls: React.FC<ReaderControlsProps> = ({
  currentPage,
  totalPages,
  audioState,
  audioProgress,
  hasAudioOnCurrentPage,
  isMuted,
  isFullscreen,
  isFullscreenAvailable,
  onPrevPage,
  onNextPage,
  onTogglePlay,
  onRestartAudio,
  onToggleMute,
  onToggleFullscreen,
}) => {
  const isPlaying = audioState === 'PLAYING';
  const isAudioDisabled = !hasAudioOnCurrentPage || audioState === 'ERROR';

  return (
    <footer className="reader-footer" role="toolbar" aria-label="Controles de Leitura e Áudio">
      {/* Barra fixa de progresso de áudio da página para evitar qualquer salto de layout */}
      <div
        className="audio-progress-bar-container"
        role="progressbar"
        aria-valuenow={audioProgress ? Math.round(audioProgress.percentage) : 0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso da narração"
        style={{ visibility: hasAudioOnCurrentPage && audioProgress && audioProgress.duration > 0 ? 'visible' : 'hidden' }}
      >
        <div
          className="audio-progress-bar-fill"
          style={{ width: `${audioProgress?.percentage || 0}%` }}
        />
      </div>

      <div className="controls-group">
        {/* Página Anterior */}
        <button
          type="button"
          id="btn-prev-page"
          onClick={onPrevPage}
          disabled={currentPage <= 1}
          className="control-btn"
          aria-label="Página anterior"
          title="Página anterior (Seta esquerda)"
        >
          <ChevronLeft size={22} />
        </button>

        {/* Play / Pause Áudio */}
        <button
          type="button"
          id="btn-play-pause"
          onClick={onTogglePlay}
          disabled={isAudioDisabled}
          className={`control-btn primary ${isPlaying ? 'playing' : ''}`}
          aria-label={isPlaying ? 'Pausar narração' : 'Ouvir narração da página'}
          title={isPlaying ? 'Pausar narração' : 'Reproduzir narração'}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: 2 }} />}
        </button>

        {/* Reiniciar Áudio */}
        <button
          type="button"
          id="btn-restart-audio"
          onClick={onRestartAudio}
          disabled={isAudioDisabled}
          className="control-btn"
          aria-label="Reiniciar narração da página"
          title="Reiniciar narração"
        >
          <RotateCcw size={18} />
        </button>

        {/* Indicador de Página */}
        <div className="page-indicator" id="page-indicator" aria-live="polite" aria-atomic="true">
          {currentPage} / {totalPages}
        </div>

        {/* Mute / Unmute */}
        <button
          type="button"
          id="btn-toggle-mute"
          onClick={onToggleMute}
          className={`control-btn ${isMuted ? 'muted' : ''}`}
          aria-label={isMuted ? 'Ativar som' : 'Desativar som'}
          title={isMuted ? 'Ativar som' : 'Desativar som'}
        >
          {isMuted ? <VolumeX size={20} color="#f43f5e" /> : <Volume2 size={20} />}
        </button>

        {/* Próxima Página / Concluir */}
        <button
          type="button"
          id="btn-next-page"
          onClick={onNextPage}
          disabled={currentPage > totalPages}
          className="control-btn"
          aria-label={currentPage === totalPages ? 'Concluir leitura' : 'Próxima página'}
          title={currentPage === totalPages ? 'Concluir leitura' : 'Próxima página (Seta direita)'}
        >
          <ChevronRight size={22} />
        </button>

        {/* Tela Cheia (apenas se suportado) */}
        {isFullscreenAvailable && (
          <button
            type="button"
            id="btn-toggle-fullscreen"
            onClick={onToggleFullscreen}
            className="control-btn"
            aria-label={isFullscreen ? 'Sair da tela cheia' : 'Entrar em tela cheia'}
            title="Tela cheia"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        )}
      </div>
    </footer>
  );
};
