import { describe, it, expect } from 'vitest';
import { getDefaultBookSlugForHost, getBookBySlug, getBookDocumentTitle } from '../src/services/bookService';
import { DEFAULT_BOOK_SLUG } from '../src/books/registry';

describe('Host Detection & Subdomain Routing (nico.folheia.com)', () => {
  it('deve retornar "caminhos-de-nina" para o domínio principal folheia.com', () => {
    const slug = getDefaultBookSlugForHost('folheia.com');
    expect(slug).toBe('caminhos-de-nina');
    expect(slug).toBe(DEFAULT_BOOK_SLUG);
  });

  it('deve retornar "caminhos-de-nina" para www.folheia.com', () => {
    const slug = getDefaultBookSlugForHost('www.folheia.com');
    expect(slug).toBe('caminhos-de-nina');
  });

  it('deve retornar "caminhos-de-nina" para domínios técnicos da Vercel e localhost', () => {
    expect(getDefaultBookSlugForHost('flipbook-mvp.vercel.app')).toBe('caminhos-de-nina');
    expect(getDefaultBookSlugForHost('localhost')).toBe('caminhos-de-nina');
    expect(getDefaultBookSlugForHost('127.0.0.1')).toBe('caminhos-de-nina');
    expect(getDefaultBookSlugForHost('')).toBe('caminhos-de-nina');
  });

  it('deve retornar "nico" para o subdomínio nico.folheia.com', () => {
    const slug = getDefaultBookSlugForHost('nico.folheia.com');
    expect(slug).toBe('nico');
  });

  it('deve retornar "nico" para o subdomínio local de teste nico.localhost', () => {
    const slug = getDefaultBookSlugForHost('nico.localhost');
    expect(slug).toBe('nico');
  });

  it('deve retornar "theo" para o subdomínio theo.folheia.com', () => {
    const slug = getDefaultBookSlugForHost('theo.folheia.com');
    expect(slug).toBe('theo');
  });

  it('deve retornar "theo" para o subdomínio local de teste theo.localhost', () => {
    const slug = getDefaultBookSlugForHost('theo.localhost');
    expect(slug).toBe('theo');
  });

  it('deve carregar o manifesto correto para cada slug identificado', () => {
    const ninaBook = getBookBySlug('caminhos-de-nina');
    expect(ninaBook).toBeDefined();
    expect(ninaBook?.slug).toBe('caminhos-de-nina');
    expect(ninaBook?.title).toBe('Os Caminhos de Nina');

    const nicoBook = getBookBySlug('nico');
    expect(nicoBook).toBeDefined();
    expect(nicoBook?.slug).toBe('nico');
    expect(nicoBook?.title).toBe('Nico e as Histórias que Ele Descobriu Escutando');

    const theoBook = getBookBySlug('theo');
    expect(theoBook).toBeDefined();
    expect(theoBook?.slug).toBe('theo');
    expect(theoBook?.title).toBe('Theo Tem uma História para Contar');
  });

  it('deve formatar o título correto da aba para folheia.com (Os Caminhos de Nina)', () => {
    const ninaBook = getBookBySlug('caminhos-de-nina');
    const title = getBookDocumentTitle(ninaBook);
    expect(title).toBe('Os Caminhos de Nina | Fonosuite');
  });

  it('deve formatar o título correto da aba para nico.folheia.com (Nico e as Histórias...)', () => {
    const nicoBook = getBookBySlug('nico');
    const title = getBookDocumentTitle(nicoBook);
    expect(title).toBe('Nico e as Histórias que Ele Descobriu Escutando | Flipbook Narrado');
  });

  it('deve formatar o título correto da aba para theo.folheia.com (Theo Tem uma História...)', () => {
    const theoBook = getBookBySlug('theo');
    const title = getBookDocumentTitle(theoBook);
    expect(title).toBe('Theo Tem uma História para Contar | Fonosuite');
  });
});
