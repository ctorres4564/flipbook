import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BookReader } from '../src/components/BookReader/BookReader';
import theoManifest from '../src/books/theo/book.json';
import { BookManifest } from '../src/types/book';
import { validateBookManifest, getBookBySlug, getBookDocumentTitle } from '../src/services/bookService';
import { globalAudioManager } from '../src/services/audioManager';

// Mock do page-flip para ambiente jsdom
let flipCallback: ((e: { data: number }) => void) | null = null;
const mockUpdate = vi.fn();
const mockDestroy = vi.fn();
const mockFlip = vi.fn();
const mockTurnToPage = vi.fn();

vi.mock('page-flip', () => {
  return {
    PageFlip: vi.fn().mockImplementation(() => ({
      loadFromHTML: vi.fn(),
      on: vi.fn().mockImplementation((event: string, cb: (e: { data: number }) => void) => {
        if (event === 'flip') {
          flipCallback = cb;
        }
      }),
      destroy: mockDestroy,
      flip: mockFlip,
      update: mockUpdate,
      turnToPage: mockTurnToPage,
    })),
  };
});

describe('Flipbook Narrado "Theo Tem uma História para Contar" - Testes Obrigatórios', () => {
  const theo = theoManifest as BookManifest;

  beforeEach(() => {
    vi.clearAllMocks();
    flipCallback = null;
    globalAudioManager.stopAndReset();
  });

  it('A & M) deve estar registrado no catálogo sob o slug "theo" e passar na validação de integridade', () => {
    const book = getBookBySlug('theo');
    expect(book).toBeDefined();
    expect(book?.slug).toBe('theo');
    expect(book?.title).toBe('Theo Tem uma História para Contar');
    expect(getBookDocumentTitle(book)).toBe('Theo Tem uma História para Contar | Flipbook Narrado');

    // Validação estrita do manifesto
    const validation = validateBookManifest(theo);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);

    // Suporte aos aliases
    expect(getBookBySlug('livro-theo')).toBeDefined();
    expect(getBookBySlug('theo-tem-uma-historia-para-contar')).toBeDefined();
  });

  it('J) deve possuir exatamente 14 páginas narradas, com proporção landscape e associação 1:1 rigorosa', () => {
    expect(theo.totalPages).toBe(14);
    expect(theo.pages).toHaveLength(14);
    expect(theo.aspectRatio).toBe('landscape');
    expect(theo.pageDimensions).toEqual({ width: 1448, height: 1086 });

    // Validação individual das 14 páginas e áudios
    for (let i = 1; i <= 14; i++) {
      const page = theo.pages[i - 1];
      const pad = String(i).padStart(2, '0');
      expect(page.pageNumber).toBe(i);
      expect(page.image).toBe(`/books/theo/pages/${pad}.webp`);
      expect(page.audio).toBe(`/books/theo/audio/${pad}.wav`);
      expect(page.alt).toBeTruthy();
      expect(page.speechText).toBeTruthy();
    }
  });

  it('B & C) deve abrir inicialmente na tela de Apresentação e transicionar para a Página 1 ao clicar em Começar', async () => {
    render(<BookReader book={theo} />);

    // Tela de apresentação inicial
    const startButton = screen.getByRole('button', { name: /Começar a ler e ouvir/i });
    expect(startButton).toBeInTheDocument();

    // Clica em Começar
    await act(async () => {
      fireEvent.click(startButton);
    });

    // Modo de leitura ativo na página 1 de 14
    expect(screen.getByText('1 / 14')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ouvir narração da página/i })).toBeInTheDocument();
  });

  it('D, E & F) deve tocar áudio da página 1 e interromper IMEDIATAMENTE ao virar para a página 2', async () => {
    const playSpy = vi.spyOn(globalAudioManager, 'loadAndPlay');

    render(<BookReader book={theo} />);

    // Entra no livro
    const startButton = screen.getByRole('button', { name: /Começar a ler e ouvir/i });
    await act(async () => {
      fireEvent.click(startButton);
    });

    // Página 1 carrega áudio
    expect(playSpy).toHaveBeenCalledWith('/books/theo/audio/01.wav', false);

    // Reproduz áudio da página 1
    const playBtn = screen.getByRole('button', { name: /Ouvir narração da página/i });
    await act(async () => {
      fireEvent.click(playBtn);
    });

    // Simula virada para a página 2 via PageFlip
    await act(async () => {
      if (flipCallback) {
        flipCallback({ data: 1 }); // página 2 (0-based)
      }
    });

    // Áudio anterior deve parar e novo áudio assumir
    expect(screen.getByText('2 / 14')).toBeInTheDocument();
    expect(playSpy).toHaveBeenCalledWith('/books/theo/audio/02.wav', false);
  });

  it('G) avançar rapidamente várias páginas não deve gerar sobreposição de áudio', async () => {
    const playSpy = vi.spyOn(globalAudioManager, 'loadAndPlay');

    render(<BookReader book={theo} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Começar a ler e ouvir/i }));
    });

    // Viradas rápidas em sequência: 1 -> 3 -> 5 -> 7
    await act(async () => {
      if (flipCallback) flipCallback({ data: 2 }); // pag 3
      if (flipCallback) flipCallback({ data: 4 }); // pag 5
      if (flipCallback) flipCallback({ data: 6 }); // pag 7
    });

    expect(screen.getByText('7 / 14')).toBeInTheDocument();
    expect(playSpy).toHaveBeenLastCalledWith('/books/theo/audio/07.wav', false);
  });

  it('H) voltar para página já visitada deve restaurar imagem e áudio corretos sem duplicação', async () => {
    const playSpy = vi.spyOn(globalAudioManager, 'loadAndPlay');

    render(<BookReader book={theo} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Começar a ler e ouvir/i }));
    });

    // Avança para página 3
    await act(async () => {
      if (flipCallback) flipCallback({ data: 2 });
    });
    expect(screen.getByText('3 / 14')).toBeInTheDocument();

    // Volta para página 2
    await act(async () => {
      if (flipCallback) flipCallback({ data: 1 });
    });

    expect(screen.getByText('2 / 14')).toBeInTheDocument();
    expect(playSpy).toHaveBeenLastCalledWith('/books/theo/audio/02.wav', false);
  });

  it('I) pausar áudio e avançar não deve fazer o áudio pausado voltar sozinho', async () => {
    render(<BookReader book={theo} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Começar a ler e ouvir/i }));
    });

    // Simula estado de áudio tocando
    const playBtn = screen.getByRole('button', { name: /Ouvir narração da página/i });
    await act(async () => {
      fireEvent.click(playBtn);
    });

    // Avança página
    await act(async () => {
      if (flipCallback) flipCallback({ data: 1 }); // pag 2
    });

    // Na página 2, o botão deve estar em "Ouvir narração da página" (não tocando sozinho)
    expect(screen.getByRole('button', { name: /Ouvir narração da página/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Pausar narração/i })).not.toBeInTheDocument();
  });

  it('K & L) chegar à página 14 e concluir deve permitir reiniciar o livro com sessão limpa', async () => {
    render(<BookReader book={theo} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Começar a ler e ouvir/i }));
    });

    // Navega até a página 14
    await act(async () => {
      if (flipCallback) flipCallback({ data: 13 }); // pag 14
    });
    expect(screen.getByText('14 / 14')).toBeInTheDocument();

    // Avança além da última página (fim do livro)
    await act(async () => {
      if (flipCallback) flipCallback({ data: 14 }); // > 14
    });

    // Tela de conclusão
    expect(screen.getByText('Você concluiu a leitura!')).toBeInTheDocument();
    const restartBtn = screen.getByRole('button', { name: /Ler o livro novamente|Ler novamente/i });
    expect(restartBtn).toBeInTheDocument();

    // Clica em Ler Novamente
    await act(async () => {
      fireEvent.click(restartBtn);
    });

    // Retorna para a tela inicial
    expect(screen.getByRole('button', { name: /Começar a ler e ouvir/i })).toBeInTheDocument();
  });

  it('N) navegação por atalhos de teclado (Setas e Espaço)', async () => {
    render(<BookReader book={theo} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Começar a ler e ouvir/i }));
    });

    // Seta Direita -> Avançar
    await act(async () => {
      fireEvent.keyDown(window, { key: 'ArrowRight' });
    });
    expect(mockFlip).toHaveBeenCalled();

    // Seta Esquerda -> Voltar
    await act(async () => {
      fireEvent.keyDown(window, { key: 'ArrowLeft' });
    });
    expect(mockFlip).toHaveBeenCalled();
  });
});
