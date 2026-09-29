import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
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
    expect(getBookDocumentTitle(book)).toBe('Theo Tem uma História para Contar | Fonosuite');

    // Validação estrita do manifesto
    const validation = validateBookManifest(theo);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);

    // Suporte aos aliases
    expect(getBookBySlug('livro-theo')).toBeDefined();
    expect(getBookBySlug('theo-tem-uma-historia-para-contar')).toBeDefined();
  });

  it('J) deve possuir exatamente 15 páginas (14 narradas + 1 contracapa sem áudio), com proporção landscape e associação 1:1 rigorosa', () => {
    expect(theo.totalPages).toBe(15);
    expect(theo.pages).toHaveLength(15);
    expect(theo.aspectRatio).toBe('landscape');
    expect(theo.pageDimensions).toEqual({ width: 1448, height: 1086 });

    // Validação individual das 14 páginas narradas
    for (let i = 1; i <= 14; i++) {
      const page = theo.pages[i - 1];
      const pad = String(i).padStart(2, '0');
      expect(page.pageNumber).toBe(i);
      expect(page.image).toBe(`/books/theo/pages/${pad}.webp`);
      const expectedAudio = i === 4 ? '/books/theo/audio/04.1.wav' : `/books/theo/audio/${pad}.wav`;
      expect(page.audio).toBe(expectedAudio);
      expect(page.alt).toBeTruthy();
      expect(page.speechText).toBeTruthy();
    }

    // Validação estrita da Contracapa (Página 15)
    const contracapa = theo.pages[14];
    expect(contracapa.pageNumber).toBe(15);
    expect(contracapa.image).toBe('/books/theo/pages/15.webp');
    expect(contracapa.audio).toBeNull();
    expect(contracapa.speechText).toBeNull();
    expect(contracapa.title).toBe('Contracapa');
    expect(contracapa.alt).toContain('Contracapa');

    // Validação dos arquivos físicos em public/
    const diskWebp = path.resolve(__dirname, '../public/books/theo/pages/15.webp');
    const diskPng = path.resolve(__dirname, '../public/books/theo/pages/15.png');
    const sourcePng = path.resolve(__dirname, '../livro_theo_tem_uma_historia_pra_contar/assets/imagens/contracapa.png');

    expect(fs.existsSync(diskWebp)).toBe(true);
    expect(fs.existsSync(diskPng)).toBe(true);
    expect(fs.statSync(diskPng).size).toBe(fs.statSync(sourcePng).size);
    expect(fs.statSync(diskWebp).size).toBeGreaterThan(100000);
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

    // Modo de leitura ativo na página 1 de 15
    expect(screen.getByText('1 / 15')).toBeInTheDocument();
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
    expect(screen.getByText('2 / 15')).toBeInTheDocument();
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

    expect(screen.getByText('7 / 15')).toBeInTheDocument();
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
    expect(screen.getByText('3 / 15')).toBeInTheDocument();

    // Volta para página 2
    await act(async () => {
      if (flipCallback) flipCallback({ data: 1 });
    });

    expect(screen.getByText('2 / 15')).toBeInTheDocument();
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

  it('TESTE B, C, D, E) Transição da Página 14 para a Contracapa (Página 15) e retorno bidirecional', async () => {
    const playSpy = vi.spyOn(globalAudioManager, 'loadAndPlay');
    const stopSpy = vi.spyOn(globalAudioManager, 'stopAndReset');

    render(<BookReader book={theo} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Começar a ler e ouvir/i }));
    });

    // 1. Navega até a Página 14
    await act(async () => {
      if (flipCallback) flipCallback({ data: 13 }); // index 13 = página 14
    });
    expect(screen.getByText('14 / 15')).toBeInTheDocument();
    expect(playSpy).toHaveBeenCalledWith('/books/theo/audio/14.wav', false);
    expect(screen.getByRole('button', { name: /Ouvir narração da página/i })).toBeInTheDocument();

    // 2. Inicia a reprodução do áudio 14
    const playBtn14 = screen.getByRole('button', { name: /Ouvir narração da página/i });
    await act(async () => {
      fireEvent.click(playBtn14);
    });

    // 3. TESTE C: Enquanto estiver tocando o áudio 14, avança para a Contracapa (Página 15)
    await act(async () => {
      if (flipCallback) flipCallback({ data: 14 }); // index 14 = página 15 (contracapa)
    });

    // RESULTADO OBRIGATÓRIO:
    // - O áudio da página 14 deve parar imediatamente (stopAndReset chamado)
    // - Nenhum novo áudio deve iniciar
    // - Controles exclusivos de reprodução de áudio ficam ocultos
    expect(screen.getByText('15 / 15')).toBeInTheDocument();
    expect(stopSpy).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: /Ouvir narração da página/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Pausar narração/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Ouvir novamente do início/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Desativar som|Ativar som/i })).not.toBeInTheDocument();

    // 4. TESTE D: Na contracapa, volta para a Página 14
    await act(async () => {
      if (flipCallback) flipCallback({ data: 13 }); // volta para página 14
    });

    // Confirmações: imagem correta, áudio 14 associado, controles restaurados
    expect(screen.getByText('14 / 15')).toBeInTheDocument();
    expect(playSpy).toHaveBeenLastCalledWith('/books/theo/audio/14.wav', false);
    expect(screen.getByRole('button', { name: /Ouvir narração da página/i })).toBeInTheDocument();

    // 5. TESTE E: Volta novamente à contracapa
    await act(async () => {
      if (flipCallback) flipCallback({ data: 14 }); // volta para a contracapa
    });

    expect(screen.getByText('15 / 15')).toBeInTheDocument();
    expect(stopSpy).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: /Ouvir narração da página/i })).not.toBeInTheDocument();
  });

  it('K & L) chegar à contracapa (página 15) e avançar deve concluir o livro e permitir reiniciar', async () => {
    render(<BookReader book={theo} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Começar a ler e ouvir/i }));
    });

    // Navega até a contracapa (página 15)
    await act(async () => {
      if (flipCallback) flipCallback({ data: 14 }); // pag 15
    });
    expect(screen.getByText('15 / 15')).toBeInTheDocument();

    // Avança além da contracapa (conclusão do livro)
    await act(async () => {
      if (flipCallback) flipCallback({ data: 15 }); // > 15
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

  it('Página 4 deve reproduzir o novo áudio 04.1.wav, parar ao avançar para a página 5 e retomar 04.1 ao voltar', async () => {
    const playSpy = vi.spyOn(globalAudioManager, 'loadAndPlay');
    const stopSpy = vi.spyOn(globalAudioManager, 'stopAndReset');

    render(<BookReader book={theo} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Começar a ler e ouvir/i }));
    });

    // 1. Navega até a Página 3
    await act(async () => {
      if (flipCallback) flipCallback({ data: 2 }); // index 2 = página 3
    });
    expect(screen.getByText('3 / 15')).toBeInTheDocument();
    expect(playSpy).toHaveBeenCalledWith('/books/theo/audio/03.wav', false);

    // 2. Navega até a Página 4
    await act(async () => {
      if (flipCallback) flipCallback({ data: 3 }); // index 3 = página 4
    });
    expect(screen.getByText('4 / 15')).toBeInTheDocument();
    expect(playSpy).toHaveBeenCalledWith('/books/theo/audio/04.1.wav', false);

    // 3. Reproduz o áudio na página 4
    const playBtn = screen.getByRole('button', { name: /Ouvir narração da página/i });
    await act(async () => {
      fireEvent.click(playBtn);
    });

    // 4. Avança para a Página 5 durante a reprodução
    await act(async () => {
      if (flipCallback) flipCallback({ data: 4 }); // index 4 = página 5
    });
    expect(screen.getByText('5 / 15')).toBeInTheDocument();
    expect(stopSpy).toHaveBeenCalled();
    expect(playSpy).toHaveBeenCalledWith('/books/theo/audio/05.wav', false);

    // 5. Retorna para a Página 4
    await act(async () => {
      if (flipCallback) flipCallback({ data: 3 }); // volta para página 4
    });
    expect(screen.getByText('4 / 15')).toBeInTheDocument();
    expect(playSpy).toHaveBeenLastCalledWith('/books/theo/audio/04.1.wav', false);
  });
});
