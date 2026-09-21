import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PageFlip } from 'page-flip';
import { BookManifest } from '../../types/book';
import { AudioState, AudioProgress } from '../../types/audio';
import { ReaderMode } from '../../types/reader';
import { globalAudioManager } from '../../services/audioManager';
import { getPageAudioUrl, getPageSpeechText } from '../../services/bookService';
import { browserSpeech, SpeechState } from '../../services/speechService';
import { soundEffects } from '../../utils/soundEffects';
import { BookCover } from '../BookCover/BookCover';
import { BookFinished } from '../BookFinished/BookFinished';
import { BookPage } from '../BookPage/BookPage';
import { ReaderControls } from '../ReaderControls/ReaderControls';
import { TableOfContents } from '../TableOfContents/TableOfContents';
import { checkPrefersReducedMotion, subscribeToReducedMotion } from '../../utils/a11y';
import {
  isFullscreenSupported,
  isCurrentlyFullscreen,
  toggleFullscreen,
} from '../../utils/fullscreen';
import { ChevronLeft, ChevronRight, BookOpen, Volume2, X } from 'lucide-react';

interface BookReaderProps {
  book: BookManifest;
}

export const BookReader: React.FC<BookReaderProps> = ({ book }) => {
  const [mode, setMode] = useState<ReaderMode>(() => (book.startInReadingMode ? 'READING' : 'COVER'));
  const [sessionKey, setSessionKey] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const playFlipSound = useCallback(() => {
    if (!book.disableSoundEffects) {
      soundEffects.playPageFlipSound();
    }
  }, [book.disableSoundEffects]);
  const [audioState, setAudioState] = useState<AudioState>('IDLE');
  const [audioProgress, setAudioProgress] = useState<AudioProgress | null>(null);
  const [speechState, setSpeechState] = useState<SpeechState>('IDLE');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isTocOpen, setIsTocOpen] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(checkPrefersReducedMotion());

  const flipbookContainerRef = useRef<HTMLDivElement | null>(null);
  const pageFlipInstanceRef = useRef<PageFlip | null>(null);
  const readerRootRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLElement | null>(null);

  // Escuta áudio gravado
  useEffect(() => {
    const unsubscribe = globalAudioManager.subscribe({
      onStateChange: (state) => setAudioState(state),
      onProgress: (progress) => setAudioProgress(progress),
      onEnded: () => {
        // Áudio terminou
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Escuta síntese de fala no navegador
  useEffect(() => {
    const unsubscribe = browserSpeech.subscribe({
      onStateChange: (state) => setSpeechState(state),
      onEnded: () => {
        // Fala concluiu
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Escuta acessibilidade de movimento reduzido
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

  // Fecha o zoom ao mudar de página ou modo
  useEffect(() => {
    setIsZoomed(false);
  }, [currentPage, mode]);
  // Se houver áudio gravado em estúdio, carrega.
  // Respeita a regra de não autoplay quando book.autoPlayAudio for false (aguarda clique em Ouvir).
  useEffect(() => {
    if (mode === 'READING') {
      const audioUrl = getPageAudioUrl(book, currentPage);
      if (audioUrl) {
        globalAudioManager.loadAndPlay(audioUrl, book.autoPlayAudio ?? false);
      } else {
        globalAudioManager.stopAndReset();
        // Para fala anterior ao virar a página
        browserSpeech.stop();
      }
    } else {
      globalAudioManager.stopAndReset();
      browserSpeech.stop();
    }
  }, [book, currentPage, mode]);

  // Inicialização e Redimensionamento do StPageFlip quando entrar no modo READING
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

    // Garante que todas as páginas estejam montadas no DOM
    const pageElements = flipbookContainerRef.current.querySelectorAll<HTMLElement>('.page-item');
    if (pageElements.length < book.pages.length) {
      return;
    }

    try {
      const container = stageRef.current || flipbookContainerRef.current.parentElement;
      const stageWidth = container?.clientWidth || window.innerWidth;
      const stageHeight = container?.clientHeight || window.innerHeight;

      // Margens de respiro
      const isMobile = stageWidth <= 768;
      const paddingX = isMobile ? 12 : 32;
      const paddingY = isMobile ? 8 : 24;

      const availWidth = Math.max(160, stageWidth - paddingX);
      const availHeight = Math.max(160, stageHeight - paddingY);

      const isPortrait = book.aspectRatio === 'portrait' || (book.pageDimensions && book.pageDimensions.height > book.pageDimensions.width);
      const targetAspect = isPortrait
        ? (book.pageDimensions ? book.pageDimensions.width / book.pageDimensions.height : 420 / 595)
        : 1.0;

      let baseWidth: number;
      let baseHeight: number;

      if (isPortrait) {
        // Ajusta para caber na altura disponível mantendo a proporção A5
        baseHeight = Math.round(availHeight);
        baseWidth = Math.round(baseHeight * targetAspect);

        // Se a largura ultrapassar o espaço disponível, reescala pela largura
        if (baseWidth > availWidth) {
          baseWidth = Math.round(availWidth);
          baseHeight = Math.round(baseWidth / targetAspect);
        }
      } else {
        const baseDimension = Math.round(Math.min(availWidth, availHeight));
        baseWidth = baseDimension;
        baseHeight = baseDimension;
      }

      const pageFlip = new PageFlip(flipbookContainerRef.current, {
        width: Math.max(140, baseWidth),
        height: Math.max(180, baseHeight),
        size: 'fixed',
        drawShadow: true,
        flippingTime: reducedMotion ? 100 : 650,
        usePortrait: true,
        startPage: currentPage - 1,
        autoSize: true,
        showCover: false,
        maxShadowOpacity: 0.45,
      });

      // Carrega elementos HTML das páginas
      pageFlip.loadFromHTML(pageElements as unknown as NodeListOf<HTMLElement>);

      // Sincroniza virada física com estado lógico React e reproduz som de papel
      pageFlip.on('flip', (e: { data: number }) => {
        const targetPage = e.data + 1;
        setCurrentPage(targetPage);
        playFlipSound();

        // Se chegou ao fim do livro
        if (targetPage > book.totalPages) {
          setMode('FINISHED');
        }
      });

      pageFlipInstanceRef.current = pageFlip;

      // Manipulador de resize reativo
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
  }, [mode, reducedMotion, book.totalPages, book.aspectRatio, book.pageDimensions, sessionKey]);

  // Ações de navegação
  const goToPage = useCallback(
    (pageNumber: number) => {
      const clamped = Math.max(1, Math.min(book.totalPages, pageNumber));
      if (clamped === currentPage) return;

      setCurrentPage(clamped);
      playFlipSound();

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

  // Teclado (Setas, Espaço, M, Esc)
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
        handleTogglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleToggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, handlePrevPage, handleNextPage, currentPage]);

  // Iniciar Leitura
  const handleStartReading = () => {
    playFlipSound();
    setMode('READING');
    setCurrentPage(1);
  };

  // Ler Novamente: reseta estado de áudio e fala, destrói com segurança instância e remonta DOM
  const handleRestartBook = () => {
    globalAudioManager.stopAndReset();
    browserSpeech.stop();
    setAudioState('IDLE');
    setAudioProgress(null);
    setSpeechState('IDLE');

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

  // Controles de Áudio / Síntese de Voz
  const handleTogglePlay = () => {
    const audioUrl = getPageAudioUrl(book, currentPage);
    if (audioUrl) {
      globalAudioManager.togglePlay();
    } else {
      const speechText = getPageSpeechText(book, currentPage);
      if (speechText) {
        browserSpeech.toggle(speechText);
      }
    }
  };

  const handleRestartAudio = () => {
    const audioUrl = getPageAudioUrl(book, currentPage);
    if (audioUrl) {
      globalAudioManager.restart();
    } else {
      const speechText = getPageSpeechText(book, currentPage);
      if (speechText) {
        browserSpeech.speak(speechText);
      }
    }
  };

  const handleToggleMute = () => {
    const muted = globalAudioManager.toggleMute();
    setIsMuted(muted);
    soundEffects.setEnabled(!muted);
  };

  const handleToggleFullscreen = () => {
    if (readerRootRef.current) {
      toggleFullscreen(readerRootRef.current);
    }
  };

  const hasAudioOnCurrentPage = Boolean(getPageAudioUrl(book, currentPage));
  const hasSpeechOnCurrentPage = Boolean(getPageSpeechText(book, currentPage));
  const currentPageData = book.pages[currentPage - 1];
  const isCurrentPageActivity = Boolean(currentPageData?.isActivity || (book.slug === 'caminhos-de-nina' && currentPage === 17));
  const activityPage = book.pages.find((p) => p.isActivity) || (book.slug === 'caminhos-de-nina' ? book.pages[16] : undefined);

  const handlePrintActivity = () => {
    window.print();
  };

  return (
    <div className="app-container" ref={readerRootRef}>
      {/* Header Superior */}
      <header className="reader-header">
        <div className="reader-header-left">
          <button
            type="button"
            className="btn-header-toc"
            onClick={() => setIsTocOpen(true)}
            aria-label="Abrir sumário"
            title="Ver sumário e índice de páginas"
          >
            <BookOpen size={18} />
            <span className="header-toc-label">Sumário</span>
          </button>
          <h1 className="reader-title" title={book.title}>
            {book.title}
          </h1>
        </div>

        <div className="reader-header-badges">
          {currentPageData?.section && (
            <span className="badge badge-section" title="Seção atual">
              {currentPageData.section}
            </span>
          )}
          <span className="badge">{book.totalPages} Páginas</span>
          {hasSpeechOnCurrentPage && !hasAudioOnCurrentPage && (
            <span
              className={`badge badge-speech ${speechState === 'SPEAKING' ? 'active-pulse' : ''}`}
              title="Leitura acessível por voz em pt-BR disponível"
            >
              <Volume2 size={13} style={{ marginRight: 4 }} />
              {speechState === 'SPEAKING' ? 'Lendo...' : 'Voz pt-BR'}
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
        {/* Áreas de toque nas laterais */}
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
        <div
          className={`flipbook-wrapper ${book.aspectRatio === 'portrait' ? 'portrait-book' : ''}`}
          key={sessionKey}
        >
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

      {/* Modal de Zoom da Página Atual */}
      {isZoomed && currentPageData && (
        <div
          className="zoom-modal-overlay"
          onClick={() => setIsZoomed(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Visualização ampliada da página"
        >
          <div className="zoom-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="zoom-close-btn"
              onClick={() => setIsZoomed(false)}
              aria-label="Fechar ampliação"
            >
              <X size={24} />
            </button>
            <img
              src={currentPageData.image}
              alt={currentPageData.alt || `Página ampliada ${currentPage}`}
              className="zoom-image"
            />
            <div className="zoom-caption">
              Página {currentPage} de {book.totalPages} {currentPageData.title ? `— ${currentPageData.title}` : ''}
            </div>
          </div>
        </div>
      )}

      {/* Sumário e Drawer de Miniaturas */}
      <TableOfContents
        book={book}
        currentPage={currentPage}
        isOpen={isTocOpen}
        onClose={() => setIsTocOpen(false)}
        onSelectPage={goToPage}
      />

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
          speechState={speechState}
          hasSpeechOnCurrentPage={hasSpeechOnCurrentPage}
          isActivityPage={isCurrentPageActivity}
          onPrintActivity={handlePrintActivity}
          isMuted={isMuted}
          isFullscreen={isFullscreen}
          isFullscreenAvailable={isFullscreenSupported()}
          isZoomed={isZoomed}
          pdfUrl={book.pdfUrl}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          onTogglePlay={handleTogglePlay}
          onRestartAudio={handleRestartAudio}
          onToggleMute={handleToggleMute}
          onToggleFullscreen={handleToggleFullscreen}
          onToggleToc={() => setIsTocOpen(true)}
          onToggleZoom={() => setIsZoomed((prev) => !prev)}
        />
      )}

      {/* Container de impressão de alta fidelidade para folha A4 (visível apenas ao acionar impressão) */}
      {activityPage && (
        <div className="printable-activity-container" aria-hidden="true">
          <img
            src={activityPage.image}
            alt={activityPage.alt || 'Atividade do livro Os Caminhos de Nina'}
            className="printable-activity-image"
          />
        </div>
      )}
    </div>
  );
};
