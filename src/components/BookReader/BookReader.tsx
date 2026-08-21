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
  const [sessionKey, setSessionKey] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [audioState, setAudioState] = useState<AudioState>('IDLE');
  const [audioProgress, setAudioProgress] = useState<AudioProgress | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(checkPrefersReducedMotion());

  const flipbookContainerRef = useRef<HTMLDivElement | null>(null);
  const pageFlipInstanceRef = useRef<PageFlip | null>(null);
  const readerRootRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLElement | null>(null);

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

  // Inicialização e Redimensionamento Reativo do StPageFlip quando entrar no modo READING
  useEffect(() => {
    if (mode !== 'READING' || !flipbookContainerRef.current) {
      return;
    }

    let resizeObserver: ResizeObserver | null = null;
    let animationFrameId: number | null = null;

    // Destrói instância anterior caso exista
    if (pageFlipInstanceRef.current) {
      try {
        pageFlipInstanceRef.current.destroy();
      } catch {
        // ignore
      }
      pageFlipInstanceRef.current = null;
    }

    // Garante que todas as páginas estejam devidamente montadas no DOM
    const pageElements = flipbookContainerRef.current.querySelectorAll<HTMLElement>('.page-item');
    if (pageElements.length < book.pages.length) {
      return;
    }

    try {
      // Calcula dimensões ideais para exibição de página individual (1 cena por vez)
      const container = stageRef.current || flipbookContainerRef.current.parentElement;
      const stageWidth = container?.clientWidth || window.innerWidth;
      const stageHeight = container?.clientHeight || window.innerHeight;

      // Margens de respiro para garantir aproveitamento máximo da tela
      const isMobile = stageWidth <= 768;
      const paddingX = isMobile ? 12 : 24;
      const paddingY = isMobile ? 8 : 16;

      const availWidth = Math.max(180, stageWidth - paddingX);
      const availHeight = Math.max(180, stageHeight - paddingY);

      // Cada página é uma cena individual completa com sua própria narração
      // O tamanho ideal ocupa o maior espaço mantendo a proporção 1:1
      const baseDimension = Math.round(Math.min(availWidth, availHeight));
      const baseWidth = baseDimension;
      const baseHeight = baseDimension;

      const pageFlip = new PageFlip(flipbookContainerRef.current, {
        width: baseWidth,
        height: baseHeight,
        size: 'fixed',
        drawShadow: true,
        flippingTime: reducedMotion ? 100 : 700,
        usePortrait: true,
        startPage: currentPage - 1,
        autoSize: true,
        showCover: false,
        maxShadowOpacity: 0.5,
      });

      // Carrega elementos HTML das páginas
      pageFlip.loadFromHTML(pageElements as unknown as NodeListOf<HTMLElement>);

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

      // Manipulador de resize com requestAnimationFrame usando update() nativo sem destruir DOM
      const handleResize = () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        animationFrameId = requestAnimationFrame(() => {
          if (pageFlipInstanceRef.current && typeof pageFlipInstanceRef.current.update === 'function') {
            try {
              pageFlipInstanceRef.current.update();
            } catch (err) {
              console.warn('Aviso ao atualizar dimensões do PageFlip:', err);
            }
          }
        });
      };

      // Registra ResizeObserver no container do palco de leitura
      if (typeof ResizeObserver !== 'undefined' && container) {
        resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(container);
      }

      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);

      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
        if (resizeObserver) {
          resizeObserver.disconnect();
          resizeObserver = null;
        }
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);

        if (pageFlipInstanceRef.current) {
          try {
            pageFlipInstanceRef.current.destroy();
          } catch {
            // cleanup seguro
          }
          pageFlipInstanceRef.current = null;
        }
      };
    } catch (err) {
      console.warn('Inicialização do PageFlip:', err);
    }
  }, [mode, reducedMotion, book.totalPages, sessionKey]);

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

  // Ler Novamente: reseta estado de áudio, destrói com segurança instância antiga e remonta DOM com nova sessionKey
  const handleRestartBook = () => {
    globalAudioManager.stopAndReset();
    setAudioState('IDLE');
    setAudioProgress(null);

    if (pageFlipInstanceRef.current) {
      try {
        pageFlipInstanceRef.current.destroy();
      } catch {
        // cleanup seguro
      }
      pageFlipInstanceRef.current = null;
    }

    setSessionKey((prev) => prev + 1);
    setCurrentPage(1);
    setMode('COVER');
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
      <main className="reader-stage" ref={stageRef} role="main">
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

        {/* Container do StPageFlip com remonte completo do DOM isolado por sessionKey */}
        <div className="flipbook-wrapper" key={sessionKey}>
          <div className="flipbook-container" ref={flipbookContainerRef}>
            {book.pages.map((page) => (
              <BookPage
                key={`s${sessionKey}-p${page.pageNumber}`}
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
