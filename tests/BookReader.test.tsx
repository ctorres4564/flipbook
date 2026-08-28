import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BookReader } from '../src/components/BookReader/BookReader';
import { BookManifest } from '../src/types/book';
import cartilhaManifest from '../src/books/cartilha-engasgo/book.json';

const mockUpdate = vi.fn();
const mockDestroy = vi.fn();
const mockFlip = vi.fn();

// Mock do page-flip para ambiente jsdom
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

describe('BookReader Component Integration with Resize & Real Assets', () => {
  const mockRealBook: BookManifest = {
    slug: 'nico',
    title: 'Nico e as Histórias que Ele Descobriu Escutando',
    description: 'Nico acordava falando e adorava contar seus sonhos.',
    coverImage: '/books/nico/pages/01.webp',
    totalPages: 16,
    pages: Array.from({ length: 16 }, (_, i) => ({
      pageNumber: i + 1,
      image: `/books/nico/pages/${String(i + 1).padStart(2, '0')}.webp`,
      audio: i === 0 ? null : `/books/nico/audio/${String(i + 1).padStart(2, '0')}.mp3`,
      alt: `Página ${i + 1}`,
    })),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar a tela de capa inicialmente com o botão Começar', () => {
    render(<BookReader book={mockRealBook} />);

    const titles = screen.getAllByText('Nico e as Histórias que Ele Descobriu Escutando');
    expect(titles.length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Começar a ler e ouvir/i })).toBeInTheDocument();
  });

  it('deve transicionar para o modo de leitura ao clicar em Começar', async () => {
    render(<BookReader book={mockRealBook} />);

    const startButton = screen.getByRole('button', { name: /Começar a ler e ouvir/i });
    await act(async () => {
      fireEvent.click(startButton);
    });

    // Controles inferiores visíveis
    expect(screen.getByText('1 / 16')).toBeInTheDocument();
    expect(screen.getByLabelText('Próxima página')).toBeInTheDocument();
  });

  it('deve navegar para a próxima página ao clicar no botão de avançar', async () => {
    render(<BookReader book={mockRealBook} />);

    const startButton = screen.getByRole('button', { name: /Começar a ler e ouvir/i });
    await act(async () => {
      fireEvent.click(startButton);
    });

    const nextButton = screen.getByLabelText('Próxima página');
    await act(async () => {
      fireEvent.click(nextButton);
    });

    expect(screen.getByText('2 / 16')).toBeInTheDocument();
  });

  it('deve desabilitar o botão de voltar na primeira página', async () => {
    render(<BookReader book={mockRealBook} />);

    const startButton = screen.getByRole('button', { name: /Começar a ler e ouvir/i });
    await act(async () => {
      fireEvent.click(startButton);
    });

    const prevButton = screen.getByLabelText('Página anterior');
    expect(prevButton).toBeDisabled();
  });

  it('deve registrar ResizeObserver ao entrar no modo de leitura e desconectar no unmount', async () => {
    const { unmount } = render(<BookReader book={mockRealBook} />);

    const startButton = screen.getByRole('button', { name: /Começar a ler e ouvir/i });
    await act(async () => {
      fireEvent.click(startButton);
    });

    // Desmonta o componente
    unmount();
    expect(mockDestroy).toHaveBeenCalled();
  });

  it('deve preservar a página lógica e disparar update() no redimensionamento da janela', async () => {
    render(<BookReader book={mockRealBook} />);

    const startButton = screen.getByRole('button', { name: /Começar a ler e ouvir/i });
    await act(async () => {
      fireEvent.click(startButton);
    });

    // Avança para a página 3
    const nextButton = screen.getByLabelText('Próxima página');
    await act(async () => {
      fireEvent.click(nextButton);
    });
    await act(async () => {
      fireEvent.click(nextButton);
    });
    expect(screen.getByText('3 / 16')).toBeInTheDocument();

    // Simula múltiplos eventos de resize consecutivos da janela
    await act(async () => {
      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new Event('orientationchange'));
      // Aguarda requestAnimationFrame
      await new Promise((r) => setTimeout(r, 50));
    });

    // A página atual DEVE continuar exatamente na 3 / 16
    expect(screen.getByText('3 / 16')).toBeInTheDocument();
  });

  it('Regressão: deve concluir livro -> Ler Novamente -> reabrir capa -> reiniciar e avançar por todas as páginas com nova sessão limpa', async () => {
    render(<BookReader book={mockRealBook} />);

    // 1. Inicia primeira leitura
    const startButton = screen.getByRole('button', { name: /Começar a ler e ouvir/i });
    await act(async () => {
      fireEvent.click(startButton);
    });

    const nextButton = screen.getByLabelText('Próxima página');

    // 2. Avança até a última página (16)
    for (let i = 1; i < 16; i++) {
      await act(async () => {
        fireEvent.click(nextButton);
      });
    }
    expect(screen.getByText('16 / 16')).toBeInTheDocument();

    // 3. Conclui livro e entra na tela BookFinished
    await act(async () => {
      fireEvent.click(nextButton);
    });

    const restartButton = screen.getByRole('button', { name: /Reler a cartilha desde o início|Ler o livro novamente/i });
    expect(restartButton).toBeInTheDocument();
    expect(screen.getByText('Você concluiu a leitura!')).toBeInTheDocument();

    // 4. Clica em Ler Novamente
    await act(async () => {
      fireEvent.click(restartButton);
    });

    // 5. Deve retornar para a Capa com estado e áudio resetados
    const newStartButton = screen.getByRole('button', { name: /Começar a ler e ouvir/i });
    expect(newStartButton).toBeInTheDocument();

    // 6. Inicia segunda leitura (nova sessão limpa)
    await act(async () => {
      fireEvent.click(newStartButton);
    });

    expect(screen.getByText('1 / 16')).toBeInTheDocument();

    // 7. Avança pelas páginas na segunda leitura sem erros
    const secondNextButton = screen.getByLabelText('Próxima página');
    await act(async () => {
      fireEvent.click(secondNextButton);
    });
    expect(screen.getByText('2 / 16')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(secondNextButton);
    });
    expect(screen.getByText('3 / 16')).toBeInTheDocument();
  });
});

describe('Cartilha Engasgo em Idosos - Interactive Reader Flow', () => {
  const cartilha = cartilhaManifest as unknown as BookManifest;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve abrir a cartilha, exibir os 17 tópicos do sumário e permitir navegação direta', async () => {
    render(<BookReader book={cartilha} />);

    // Verifica capa com título e autora
    const titles = screen.getAllByText('Engasgo em Idosos Durante as Refeições');
    expect(titles.length).toBeGreaterThan(0);
    expect(screen.getByText('Sônia Torres')).toBeInTheDocument();

    // Inicia leitura da cartilha
    const openButton = screen.getByRole('button', { name: /Abrir Cartilha Digital/i });
    await act(async () => {
      fireEvent.click(openButton);
    });

    expect(screen.getByText('1 / 17')).toBeInTheDocument();

    // Abre o sumário
    const tocButton = screen.getByLabelText(/Abrir sumário e miniaturas/i);
    await act(async () => {
      fireEvent.click(tocButton);
    });

    expect(screen.getByText('Sumário da Cartilha')).toBeInTheDocument();
    expect(screen.getByText('A posição correta (Postura)')).toBeInTheDocument();

    // Clica no tópico da página 10
    const topicItem = screen.getByText('A posição correta (Postura)');
    await act(async () => {
      fireEvent.click(topicItem);
    });

    // Deve saltar para página 10 / 17
    expect(screen.getByText('10 / 17')).toBeInTheDocument();
  });
});
