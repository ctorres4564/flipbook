import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookReader } from '../src/components/BookReader/BookReader';
import { BookManifest } from '../src/types/book';

// Mock do page-flip para ambiente jsdom
vi.mock('page-flip', () => {
  return {
    PageFlip: vi.fn().mockImplementation(() => ({
      loadFromHTML: vi.fn(),
      on: vi.fn(),
      destroy: vi.fn(),
      flip: vi.fn(),
      turnToPage: vi.fn(),
    })),
  };
});

describe('BookReader Component Integration', () => {
  const mockBook: BookManifest = {
    slug: 'nico',
    title: 'Nico e as Histórias que Ele Descobriu Escutando',
    description: 'Uma jornada sensorial incrível com o Nico.',
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
    render(<BookReader book={mockBook} />);

    const titles = screen.getAllByText('Nico e as Histórias que Ele Descobriu Escutando');
    expect(titles.length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Começar a ler e ouvir/i })).toBeInTheDocument();
  });

  it('deve transicionar para o modo de leitura ao clicar em Começar', () => {
    render(<BookReader book={mockBook} />);

    const startButton = screen.getByRole('button', { name: /Começar a ler e ouvir/i });
    fireEvent.click(startButton);

    // Controles inferiores visíveis
    expect(screen.getByText('1 / 16')).toBeInTheDocument();
    expect(screen.getByLabelText('Próxima página')).toBeInTheDocument();
  });

  it('deve navegar para a próxima página ao clicar no botão de avançar', () => {
    render(<BookReader book={mockBook} />);

    const startButton = screen.getByRole('button', { name: /Começar a ler e ouvir/i });
    fireEvent.click(startButton);

    const nextButton = screen.getByLabelText('Próxima página');
    fireEvent.click(nextButton);

    expect(screen.getByText('2 / 16')).toBeInTheDocument();
  });

  it('deve desabilitar o botão de voltar na primeira página', () => {
    render(<BookReader book={mockBook} />);

    const startButton = screen.getByRole('button', { name: /Começar a ler e ouvir/i });
    fireEvent.click(startButton);

    const prevButton = screen.getByLabelText('Página anterior');
    expect(prevButton).toBeDisabled();
  });
});
