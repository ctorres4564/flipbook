import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BookReader } from '../src/components/BookReader/BookReader';
import caminhosDeNinaManifest from '../src/books/caminhos-de-nina/book.json';
import { BookManifest } from '../src/types/book';
import { validateBookManifest, getBookBySlug } from '../src/services/bookService';
import { globalAudioManager } from '../src/services/audioManager';

// Mock do page-flip para ambiente jsdom
const mockUpdate = vi.fn();
const mockDestroy = vi.fn();
const mockFlip = vi.fn();

vi.mock('page-flip', () => {
  return {
    PageFlip: vi.fn().mockImplementation(() => ({
      loadFromHTML: vi.fn(),
      on: vi.fn(),
      destroy: mockDestroy,
      flip: mockFlip,
      update: mockUpdate,
      turnToPage: vi.fn(),
    })),
  };
});

describe('Flipbook Digital "Os Caminhos de Nina" - Testes de Integridade e Regras de Negócio', () => {
  const nina = caminhosDeNinaManifest as BookManifest;

  beforeEach(() => {
    vi.clearAllMocks();
    globalAudioManager.stopAndReset();
  });

  it('deve ter exatamente 18 páginas no manifesto e passar na validação de integridade', () => {
    expect(nina.totalPages).toBe(18);
    expect(nina.pages).toHaveLength(18);

    const validation = validateBookManifest(nina);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('deve ter a sequência estrita de 18 páginas na ordem correta', () => {
    // 1. Capa
    expect(nina.pages[0].pageNumber).toBe(1);
    expect(nina.pages[0].image).toContain('01-capa.png');
    expect(nina.pages[0].title).toBe('Capa');

    // 2 a 16. Páginas 1 a 15
    for (let i = 1; i <= 15; i++) {
      const page = nina.pages[i];
      expect(page.pageNumber).toBe(i + 1);
      expect(page.image).toContain(`pagina-${i}.png`);
      expect(page.audio).toContain(`pagina-${i}.wav`);
    }

    // 17. Página 16 — atividade
    const activityPage = nina.pages[16];
    expect(activityPage.pageNumber).toBe(17);
    expect(activityPage.image).toContain('17-pagina-16.png');
    expect(activityPage.audio).toContain('17-pagina-16.wav');
    expect(activityPage.isActivity).toBe(true);

    // 18. Contracapa
    const backCover = nina.pages[17];
    expect(backCover.pageNumber).toBe(18);
    expect(backCover.image).toContain('18-contracapa.png');
    expect(backCover.audio).toContain('18-contracapa.wav');
  });

  it('deve ter exatamente 17 áudios associados (somente a Capa sem áudio)', () => {
    // Capa: sem áudio
    expect(nina.pages[0].audio).toBeNull();

    // Páginas 2 a 18: todas com áudio
    const pagesWithAudio = nina.pages.filter((p) => p.audio !== null && p.audio !== undefined);
    expect(pagesWithAudio).toHaveLength(17);
  });

  it('deve estar registrado no catálogo e ser o livro padrão (DEFAULT_BOOK_SLUG)', () => {
    const book = getBookBySlug('caminhos-de-nina');
    expect(book).toBeDefined();
    expect(book?.title).toBe('Os Caminhos de Nina');

    // Suporte aos aliases
    expect(getBookBySlug('nina')).toBeDefined();
    expect(getBookBySlug('os-caminhos-de-nina')).toBeDefined();
  });

  it('deve abrir diretamente no leitor mostrando a Capa (página 1) sem botões de áudio', () => {
    render(<BookReader book={nina} />);

    // Na Capa (página 1), não deve ter controles de áudio
    expect(screen.queryByRole('button', { name: /ouvir/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /pausar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ouvir novamente/i })).not.toBeInTheDocument();

    // Indicador deve mostrar 1 / 18
    expect(screen.getByText('1 / 18')).toBeInTheDocument();

    // Botão de voltar deve estar desabilitado na primeira página
    const prevBtn = screen.getByRole('button', { name: /página anterior/i });
    expect(prevBtn).toBeDisabled();

    // Botão de avançar deve estar habilitado
    const nextBtn = screen.getByRole('button', { name: /próxima página/i });
    expect(nextBtn).not.toBeDisabled();
  });

  it('deve exibir botões "Ouvir" e "Ouvir novamente" ao avançar para páginas com áudio', async () => {
    render(<BookReader book={nina} />);

    const nextBtn = screen.getByRole('button', { name: /próxima página/i });
    await act(async () => {
      fireEvent.click(nextBtn);
    });

    // Agora na página 2 (Página 1 da história), que tem áudio
    expect(screen.getByText('2 / 18')).toBeInTheDocument();

    const playBtn = screen.getByRole('button', { name: /^ouvir narração/i });
    expect(playBtn).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^ouvir novamente/i })).toBeInTheDocument();
  });

  it('não deve iniciar o áudio automaticamente (autoplay desativado por padrão)', async () => {
    const loadSpy = vi.spyOn(globalAudioManager, 'loadAndPlay');

    render(<BookReader book={nina} />);

    const nextBtn = screen.getByRole('button', { name: /próxima página/i });
    await act(async () => {
      fireEvent.click(nextBtn);
    });

    // loadAndPlay deve ser chamado com shouldAutoPlay = false
    expect(loadSpy).toHaveBeenCalledWith(expect.stringContaining('02-pagina-1.wav'), false);
  });

  it('deve interromper o áudio imediatamente e resetar ao mudar de página', async () => {
    const stopSpy = vi.spyOn(globalAudioManager, 'stopAndReset');

    render(<BookReader book={nina} />);

    // Avança para a página 2
    const nextBtn = screen.getByRole('button', { name: /próxima página/i });
    await act(async () => {
      fireEvent.click(nextBtn);
    });

    expect(stopSpy).toHaveBeenCalled();
  });

  it('deve exibir o botão "Imprimir atividade" na página 17 e acionar window.print()', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(<BookReader book={nina} />);

    // Navega até a página 17 (Atividade)
    const nextBtn = screen.getByRole('button', { name: /próxima página/i });
    for (let i = 1; i < 17; i++) {
      await act(async () => {
        fireEvent.click(nextBtn);
      });
    }

    expect(screen.getByText('17 / 18')).toBeInTheDocument();

    // Botão discreto Imprimir atividade deve estar presente
    const printBtn = screen.getByRole('button', { name: /imprimir atividade/i });
    expect(printBtn).toBeInTheDocument();

    // Áudio também deve estar presente na página 17
    expect(screen.getByRole('button', { name: /^ouvir narração/i })).toBeInTheDocument();

    // Clica em imprimir
    await act(async () => {
      fireEvent.click(printBtn);
    });

    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });

  it('deve suportar a Contracapa na página 18 com narração disponível', async () => {
    render(<BookReader book={nina} />);

    // Navega até a página 18 (Contracapa)
    const nextBtn = screen.getByRole('button', { name: /próxima página/i });
    for (let i = 1; i < 18; i++) {
      await act(async () => {
        fireEvent.click(nextBtn);
      });
    }

    expect(screen.getByText('18 / 18')).toBeInTheDocument();
    // Áudio da contracapa presente
    expect(screen.getByRole('button', { name: /^ouvir narração/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^ouvir novamente/i })).toBeInTheDocument();
  });
});
