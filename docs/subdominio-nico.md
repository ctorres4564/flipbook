# Suporte ao Subdomínio nico.folheia.com

Este documento descreve a arquitetura, o fluxo de roteamento por host e como manter o roteamento de subdomínios no projeto Flipbook Narrado.

---

## 1. Objetivo

Permitir que o acesso ao subdomínio `nico.folheia.com` abra diretamente o livro do Nico (`/livros/nico`) na raiz (`/`), mantendo:
- O livro "Os Caminhos de Nina" como padrão para o domínio principal `folheia.com` e rota `/livros/caminhos-de-nina`;
- A rota tradicional `/livros/nico` funcionando normalmente;
- Domínios técnicos da Vercel (`*.vercel.app`) e ambientes de desenvolvimento (`localhost`) inalterados;
- O título próprio da aba do navegador para o livro do Nico (`Nico e as Histórias que Ele Descobriu Escutando | Flipbook Narrado`).

---

## 2. Arquitetura

### 2.1 Identificação de Host e Mapeamento (`src/services/bookService.ts`)
A função `getDefaultBookSlugForHost(hostname?: string): string` centraliza a lógica de resolução:
- Se `hostname` for `nico.folheia.com` ou `nico.localhost`: retorna `'nico'`.
- Caso contrário: retorna o fallback padrão `DEFAULT_BOOK_SLUG` (`'caminhos-de-nina'`).

```typescript
export function getDefaultBookSlugForHost(hostname?: string): string {
  const host = (
    hostname !== undefined
      ? hostname
      : typeof window !== 'undefined'
        ? window.location.hostname
        : ''
  ).toLowerCase();

  if (host === 'nico.folheia.com' || host === 'nico.localhost') {
    return 'nico';
  }

  return DEFAULT_BOOK_SLUG;
}
```

### 2.2 Roteamento no Frontend (`src/App.tsx` & `src/pages/BookViewPage.tsx`)
- `src/App.tsx`: A rota raiz `<Route path="/" element={<RootRedirect />} />` redireciona dinamicamente para `/livros/${getDefaultBookSlugForHost()}`. O fallback `*` também redireciona para esse mesmo livro padrão do host.
- `src/pages/BookViewPage.tsx`: Se a rota acessada for `/livros` sem parâmetro `:slug`, o fallback utiliza `getDefaultBookSlugForHost()`. Ao carregar o livro, o componente atualiza `document.title` com base na propriedade `documentTitle` do manifesto (`book.json`).

### 2.3 Otimização de Título e SEO (`index.html`)
Para evitar qualquer flash de título incorreto antes do carregamento do bundle React, um script inline síncrono no `<head>` do `index.html` inspeciona `window.location.hostname`. Se for `nico.folheia.com` ou `nico.localhost`, o `<title>` é imediatamente ajustado para:
`Nico e as Histórias que Ele Descobriu Escutando | Flipbook Narrado`.

---

## 3. Fluxo de Dados

```
[Requisição HTTP]
       │
       ▼
[Navegador avalia window.location.hostname]
       │
       ├── Se nico.folheia.com:
       │     ├── index.html define <title> do Nico
       │     └── App.tsx detecta 'nico' -> /livros/nico
       │           └── Carrega src/books/nico/book.json
       │
       └── Se folheia.com ou *.vercel.app:
             ├── index.html mantém "Os Caminhos de Nina | Fonosuite"
             └── App.tsx detecta 'caminhos-de-nina' -> /livros/caminhos-de-nina
                   └── Carrega src/books/caminhos-de-nina/book.json
```

---

## 4. Como Manter e Adicionar Novos Subdomínios

Para mapear futuros subdomínios para livros adicionais:
1. Registre o livro no catálogo (`src/books/registry.ts`).
2. Em `src/services/bookService.ts`, expanda o mapeamento em `getDefaultBookSlugForHost` para associar o novo hostname ao slug do novo livro.
3. Se necessário, adicione o pré-ajuste de `<title>` no `index.html`.
4. Adicione testes em `tests/hostRouting.test.ts` e `tests/subdomainRoutingFlow.test.tsx`.
