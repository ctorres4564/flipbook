import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PageFlip } from 'page-flip';
import { BookManifest } from '../../types/book';
import { AudioState, AudioProgress } from '../../types/audio';
import { ReaderMode } from '../../types/reader';
import { globalAudioManager } from '../../services/audioManager';
import { getPageAudioUrl } from '../../services/bookService';
import { BookCover } from '../BookCover/BookCover';
import { BookFinished } from '../BookFinished/BookFinished';
import { BookPage } from '../BookPage/BookPage';
import { ReaderControls } from '../ReaderControls/ReaderControls';
import { checkPrefersReducedMotion, subscribeToReducedMotion } from '../../utils/a11y';
import {
  isFullscreenSupported,
  isCurrentlyFullscreen,
  toggleFullscreen,
} from '../../utils/fullscreen';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BookReaderProps {
  book: BookManifest;
}

export const BookReader: React.FC<BookReaderProps> = ({ book }) => {
  const [mode, setMode] = useState<ReaderMode>('COVER');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [audioState, setAudioState] = useState<AudioState>('IDLE');
  const [audioProgress, setAudioProgress] = useState<AudioProgress | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(checkPrefersReducedMotion());

  const flipbookContainerRef = useRef<HTMLDivElement | null>(null);
  const pageFlipInstanceRef = useRef<PageFlip | null>(null);
  const readerRootRef = useRef<HTMLDivElement | null>(null);

  // Escuta áudio
  useEffect(() => {
    const unsubscribe = globalAudioManager.subscribe({
      onStateChange: (state) => setAudioState(state),
      onProgress: (progress) => setAudioProgress(progress),
      onEnded: () => {
        // Áudio terminou naturalmente
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Escuta preferências de acessibilidade (reduced motion)
  useEffect(() => {
    const unsubscribe = subscribeToReducedMotion((reduced) => {
      setReducedMotion(reduced);
    });
    return () => unsubscribe();
  }, []);

  // Escuta fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(isCurrentlyFullscreen());
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Efeito P0: Ao mudar de página no modo READING, carrega e reproduz o áudio correspondente
  useEffect(() => {
    if (mode === 'READING') {
      const audioUrl = getPageAudioUrl(book, currentPage);
      globalAudioManager.loadAndPlay(audioUrl, true);
    } else {
      globalAudioManager.stopAndReset();
    }
  }, [book, currentPage, mode]);

  // Inicialização do StPageFlip quando entrar no modo READING
  useEffect(() => {
    if (mode !== 'READING' || !flipbookContainerRef.current) {
      return;
    }

    try {
      // Destrói instância anterior caso exista
      if (pageFlipInstanceRef.current) {
        pageFlipInstanceRef.current.destroy();
        pageFlipInstanceRef.current = null;
      }

      // Calcula dimensões ideais responsivas
      const containerWidth = flipbookContainerRef.current.parentElement?.clientWidth || window.innerWidth;
      const containerHeight = flipbookContainerRef.current.parentElement?.clientHeight || window.innerHeight;
      const isMobile = window.innerWidth <= 768;

      // Dimensões base de página (proporção 3:4 ou 4:3 para livro infantil)
      const baseWidth = isMobile ? Math.min(containerWidth - 16, 480) : 450;
      const baseHeight = isMobile ? Math.min(containerHeight - 120, 680) : 600;

      const pageFlip = new PageFlip(flipbookContainerRef.current, {
        width: baseWidth,
        height: baseHeight,
        size: 'stretch',
        minWidth: 280,
        maxWidth: 900,
        minHeight: 380,
        maxHeight: 1200,
        drawShadow: true,
        flippingTime: reducedMotion ? 100 : 700,
        usePortrait: true,
        startPage: currentPage - 1,
        autoSize: true,
        showCover: true,
        maxShadowOpacity: 0.5,
      });

      // Carrega elementos HTML das páginas
      const pageElements = flipbookContainerRef.current.querySelectorAll('.page-item');
      if (pageElements.length > 0) {
        pageFlip.loadFromHTML(pageElements as unknown as NodeListOf<HTMLElement>);
      }

      // Sincroniza virada física com estado lógico React
      pageFlip.on('flip', (e: { data: number }) => {
        const targetPage = e.data + 1;
        setCurrentPage(targetPage);

        // Se chegou ao fim do livro
        if (targetPage > book.totalPages) {
          setMode('FINISHED');
        }
      });

      pageFlipInstanceRef.current = pageFlip;
    } catch (err) {
      console.warn('Inicialização do PageFlip em modo simplificado:', err);
    }

    return () => {
      if (pageFlipInstanceRef.current) {
        try {
          pageFlipInstanceRef.current.destroy();
        } catch {
          // cleanup seguro
        }
        pageFlipInstanceRef.current = null;
      }
    };
  }, [mode, reducedMotion, book.totalPages]);

  // Ações de navegação
  const goToPage = useCallback(
    (pageNumber: number) => {
      const clamped = Math.max(1, Math.min(book.totalPages, pageNumber));
      if (clamped === currentPage) return;

      setCurrentPage(clamped);

      if (pageFlipInstanceRef.current) {
        try {
          pageFlipInstanceRef.current.flip(clamped - 1);
        } catch {
          // fallback
        }
      }
    },
    [book.totalPages, currentPage]
  );

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < book.totalPages) {
      goToPage(currentPage + 1);
    } else if (currentPage === book.totalPages) {
      setMode('FINISHED');
    }
  }, [currentPage, book.totalPages, goToPage]);

  // Teclado (Setas & Barra de espaço)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode !== 'READING') return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevPage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === ' ') {
        e.preventDefault();
        globalAudioManager.togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, handlePrevPage, handleNextPage]);

  // Iniciar Leitura
  const handleStartReading = () => {
    setMode('READING');
    setCurrentPage(1);
  };

  // Ler Novamente
  const handleRestartBook = () => {
    globalAudioManager.stopAndReset();
    setMode('COVER');
    setCurrentPage(1);
  };

  // Controles de Áudio
  const handleTogglePlay = () => {
    globalAudioManager.togglePlay();
  };

  const handleRestartAudio = () => {
    globalAudioManager.restart();
  };

  const handleToggleMute = () => {
    const muted = globalAudioManager.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleFullscreen = () => {
    if (readerRootRef.current) {
      toggleFullscreen(readerRootRef.current);
    }
  };

  const hasAudioOnCurrentPage = Boolean(getPageAudioUrl(book, currentPage));

  return (
    <div className="app-container" ref={readerRootRef}>
      {/* Header Superior */}
      <header className="reader-header">
        <h1 className="reader-title">{book.title}</h1>
        <div className="reader-header-badges">
          <span className="badge">16 Páginas</span>
          {hasAudioOnCurrentPage && (
            <span className={`badge ${isMuted ? 'badge-muted' : ''}`}>
              {isMuted ? 'Som Mutado' : 'Áudio Ativo'}
            </span>
          )}
        </div>
      </header>

      {/* Tela de Capa */}
      {mode === 'COVER' && (
        <BookCover book={book} onStart={handleStartReading} />
      )}

      {/* Palco do Flipbook */}
      <main className="reader-stage" role="main">
        {/* Áreas de toque nas laterais para mobile/desktop */}
        {mode === 'READING' && currentPage > 1 && (
          <div
            className="touch-nav-area left"
            onClick={handlePrevPage}
            role="button"
            aria-label="Voltar página"
          >
            <div className="touch-indicator-icon">
              <ChevronLeft size={28} />
            </div>
          </div>
        )}

        {mode === 'READING' && currentPage < book.totalPages && (
          <div
            className="touch-nav-area right"
            onClick={handleNextPage}
            role="button"
            aria-label="Avançar página"
          >
            <div className="touch-indicator-icon">
              <ChevronRight size={28} />
            </div>
          </div>
        )}

        {/* Container do StPageFlip */}
        <div className="flipbook-wrapper">
          <div className="flipbook-container" ref={flipbookContainerRef}>
            {book.pages.map((page) => (
              <BookPage
                key={page.pageNumber}
                page={page}
                totalPages={book.totalPages}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Tela Final */}
      {mode === 'FINISHED' && (
        <BookFinished book={book} onRestart={handleRestartBook} />
      )}

      {/* Controles Inferiores de Leitura */}
      {mode === 'READING' && (
        <ReaderControls
          currentPage={currentPage}
          totalPages={book.totalPages}
          audioState={audioState}
          audioProgress={audioProgress}
          hasAudioOnCurrentPage={hasAudioOnCurrentPage}
          isMuted={isMuted}
          isFullscreen={isFullscreen}
          isFullscreenAvailable={isFullscreenSupported()}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          onTogglePlay={handleTogglePlay}
          onRestartAudio={handleRestartAudio}
          onToggleMute={handleToggleMute}
          onToggleFullscreen={handleToggleFullscreen}
        />
      )}
    </div>
  );
};
