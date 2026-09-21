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
  List,
  Download,
  ZoomIn,
  ZoomOut,
  Printer,
} from 'lucide-react';
import { AudioState, AudioProgress } from '../../types/audio';
import { SpeechState } from '../../services/speechService';

interface ReaderControlsProps {
  currentPage: number;
  totalPages: number;
  audioState: AudioState;
  audioProgress: AudioProgress | null;
  hasAudioOnCurrentPage: boolean;
  speechState?: SpeechState;
  hasSpeechOnCurrentPage?: boolean;
  isActivityPage?: boolean;
  onPrintActivity?: () => void;
  isMuted: boolean;
  isFullscreen: boolean;
  isFullscreenAvailable: boolean;
  isZoomed?: boolean;
  pdfUrl?: string;
  onPrevPage: () => void;
  onNextPage: () => void;
  onTogglePlay: () => void;
  onRestartAudio: () => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onToggleToc: () => void;
  onToggleZoom?: () => void;
}

export const ReaderControls: React.FC<ReaderControlsProps> = ({
  currentPage,
  totalPages,
  audioState,
  audioProgress,
  hasAudioOnCurrentPage,
  speechState = 'IDLE',
  hasSpeechOnCurrentPage = false,
  isActivityPage = false,
  onPrintActivity,
  isMuted,
  isFullscreen,
  isFullscreenAvailable,
  isZoomed = false,
  pdfUrl,
  onPrevPage,
  onNextPage,
  onTogglePlay,
  onRestartAudio,
  onToggleMute,
  onToggleFullscreen,
  onToggleToc,
  onToggleZoom,
}) => {
  const isPlayingAudio = audioState === 'PLAYING';
  const isSpeakingSpeech = speechState === 'SPEAKING';
  const isPlayingAny = isPlayingAudio || isSpeakingSpeech;

  return (
    <footer className="reader-footer" role="toolbar" aria-label="Controles de Leitura e Áudio">
      {/* Barra de progresso visual */}
      <div
        className="audio-progress-bar-container"
        role="progressbar"
        aria-valuenow={audioProgress ? Math.round(audioProgress.percentage) : 0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso da narração"
        style={{
          visibility:
            hasAudioOnCurrentPage && audioProgress && audioProgress.duration > 0
              ? 'visible'
              : 'hidden',
        }}
      >
        <div
          className="audio-progress-bar-fill"
          style={{ width: `${audioProgress?.percentage || 0}%` }}
        />
      </div>

      <div className="controls-group">
        {/* Abrir Sumário / Índice */}
        <button
          type="button"
          id="btn-toc"
          onClick={onToggleToc}
          className="control-btn"
          aria-label="Abrir sumário e miniaturas"
          title="Sumário e miniaturas (Índice)"
        >
          <List size={20} />
        </button>

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

        {/* Controles de Áudio (Ocultos na Capa onde não há narração) */}
        {hasAudioOnCurrentPage ? (
          <>
            {/* Ouvir / Pausar Narração */}
            <button
              type="button"
              id="btn-play-pause"
              onClick={onTogglePlay}
              className={`control-btn primary audio-toggle-btn ${isPlayingAny ? 'playing' : ''}`}
              aria-label={isPlayingAny ? 'Pausar narração' : 'Ouvir narração da página'}
              title={isPlayingAny ? 'Pausar narração' : 'Ouvir narração da página'}
            >
              {isPlayingAny ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: 2 }} />}
              <span className="btn-label-text">{isPlayingAny ? 'Pausar' : 'Ouvir'}</span>
            </button>

            {/* Ouvir Novamente / Reiniciar Áudio */}
            <button
              type="button"
              id="btn-restart-audio"
              onClick={onRestartAudio}
              className="control-btn restart-audio-btn"
              aria-label="Ouvir novamente do início"
              title="Ouvir novamente do início"
            >
              <RotateCcw size={18} />
              <span className="btn-label-text">Ouvir novamente</span>
            </button>
          </>
        ) : (
          !hasAudioOnCurrentPage && hasSpeechOnCurrentPage && currentPage > 1 && (
            <button
              type="button"
              id="btn-play-pause"
              onClick={onTogglePlay}
              className={`control-btn primary audio-toggle-btn ${isPlayingAny ? 'playing' : ''}`}
              aria-label={isPlayingAny ? 'Pausar narração' : 'Ouvir narração da página'}
              title={isPlayingAny ? 'Pausar narração' : 'Ouvir narração da página'}
            >
              {isPlayingAny ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: 2 }} />}
              <span className="btn-label-text">{isPlayingAny ? 'Pausar' : 'Ouvir'}</span>
            </button>
          )
        )}

        {/* Indicador de Página (clicável para abrir sumário) */}
        <button
          type="button"
          className="page-indicator"
          id="page-indicator"
          onClick={onToggleToc}
          aria-label={`Página ${currentPage} de ${totalPages}. Clique para ver sumário`}
          title="Clique para escolher uma página"
        >
          {currentPage} / {totalPages}
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

        {/* Botão Imprimir Atividade (exclusivo para página de atividade) */}
        {isActivityPage && onPrintActivity && (
          <button
            type="button"
            id="btn-print-activity"
            onClick={onPrintActivity}
            className="control-btn print-activity-btn"
            aria-label="Imprimir atividade"
            title="Imprimir somente a página da atividade em folha A4"
          >
            <Printer size={18} />
            <span>Imprimir atividade</span>
          </button>
        )}

        {/* Zoom / Modo Lupa */}
        {onToggleZoom && (
          <button
            type="button"
            id="btn-toggle-zoom"
            onClick={onToggleZoom}
            className={`control-btn ${isZoomed ? 'active' : ''}`}
            aria-label={isZoomed ? 'Diminuir zoom' : 'Aumentar zoom da página'}
            title={isZoomed ? 'Ajustar à tela' : 'Ampliar detalhes'}
          >
            {isZoomed ? <ZoomOut size={19} /> : <ZoomIn size={19} />}
          </button>
        )}

        {/* Mute / Unmute (se houver áudio pré-gravado) */}
        {hasAudioOnCurrentPage && (
          <button
            type="button"
            id="btn-toggle-mute"
            onClick={onToggleMute}
            className={`control-btn ${isMuted ? 'muted' : ''}`}
            aria-label={isMuted ? 'Ativar som' : 'Desativar som'}
            title={isMuted ? 'Ativar som' : 'Desativar som'}
          >
            {isMuted ? <VolumeX size={19} color="#f43f5e" /> : <Volume2 size={19} />}
          </button>
        )}

        {/* Download do PDF */}
        {pdfUrl && (
          <a
            href={pdfUrl}
            download="Cartilha-Engasgo-Idosos-Sonia-Torres.pdf"
            className="control-btn"
            aria-label="Baixar cartilha em PDF"
            title="Baixar arquivo PDF original"
            style={{ textDecoration: 'none' }}
          >
            <Download size={19} />
          </a>
        )}

        {/* Tela Cheia */}
        {isFullscreenAvailable && (
          <button
            type="button"
            id="btn-toggle-fullscreen"
            onClick={onToggleFullscreen}
            className="control-btn"
            aria-label={isFullscreen ? 'Sair da tela cheia' : 'Entrar em tela cheia'}
            title="Tela cheia"
          >
            {isFullscreen ? <Minimize2 size={19} /> : <Maximize2 size={19} />}
          </button>
        )}
      </div>
    </footer>
  );
};
