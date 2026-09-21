import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BookViewPage } from '../src/pages/BookViewPage';
import { getDefaultBookSlugForHost } from '../src/services/bookService';

// Mock do page-flip
vi.mock('page-flip', () => ({
  PageFlip: vi.fn().mockImplementation(() => ({
    loadFromHTML: vi.fn(),
    on: vi.fn(),
    destroy: vi.fn(),
    flip: vi.fn(),
    update: vi.fn(),
    turnToPage: vi.fn(),
  })),
}));

// Mock do audioManager
vi.mock('../src/services/audioManager', () => ({
  globalAudioManager: {
    subscribe: vi.fn(() => vi.fn()),
    loadAndPlay: vi.fn(),
    stopAndReset: vi.fn(),
  },
}));

describe('Subdomain & Route Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderTestApp(initialPath: string, hostname: string) {
    const defaultSlug = getDefaultBookSlugForHost(hostname);
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/livros/:slug" element={<BookViewPage />} />
          <Route path="/" element={<Navigate to={`/livros/${defaultSlug}`} replace />} />
          <Route path="*" element={<Navigate to={`/livros/${defaultSlug}`} replace />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it('1. folheia.com/ (raiz) deve abrir "Os Caminhos de Nina"', async () => {
    renderTestApp('/', 'folheia.com');
    // Verifica título da obra na interface
    expect(await screen.findByText('Os Caminhos de Nina')).toBeInTheDocument();
    expect(document.title).toBe('Os Caminhos de Nina | Fonosuite');
  });

  it('2. folheia.com/livros/caminhos-de-nina deve abrir "Os Caminhos de Nina"', async () => {
    renderTestApp('/livros/caminhos-de-nina', 'folheia.com');
    expect(await screen.findByText('Os Caminhos de Nina')).toBeInTheDocument();
    expect(document.title).toBe('Os Caminhos de Nina | Fonosuite');
  });

  it('3. nico.folheia.com/ (raiz) deve abrir o livro do Nico', async () => {
    renderTestApp('/', 'nico.folheia.com');
    const titles = await screen.findAllByText('Nico e as Histórias que Ele Descobriu Escutando');
    expect(titles.length).toBeGreaterThan(0);
    expect(document.title).toBe('Nico e as Histórias que Ele Descobriu Escutando | Flipbook Narrado');
  });

  it('4. rota tradicional /livros/nico deve abrir o livro do Nico em qualquer domínio', async () => {
    renderTestApp('/livros/nico', 'folheia.com');
    const titles = await screen.findAllByText('Nico e as Histórias que Ele Descobriu Escutando');
    expect(titles.length).toBeGreaterThan(0);
    expect(document.title).toBe('Nico e as Histórias que Ele Descobriu Escutando | Flipbook Narrado');
  });

  it('5. título da aba correto em nico.folheia.com', async () => {
    renderTestApp('/', 'nico.folheia.com');
    expect(document.title).toBe('Nico e as Histórias que Ele Descobriu Escutando | Flipbook Narrado');
  });
});
