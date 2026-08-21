# Flipbook Narrado — Nico e as Histórias que Ele Descobriu Escutando

Aplicação web moderna para publicação de livros digitais infantis ilustrados com virada de página suave (flipbook) e narração sincronizada individual por página.

---

## 1. Objetivo do Projeto

Transformar páginas ilustradas e arquivos de áudio em uma experiência de livro digital interativa e imersiva diretamente pelo navegador, sem dependência de serviços terceirizados por assinatura (como Publuu) e sem necessidade de instalação de aplicativos ou criação de contas.

O MVP entrega o livro de referência **"Nico e as Histórias que Ele Descobriu Escutando"** composto por 16 páginas, narrações sonoras e navegação mobile-first com acessibilidade completa.

---

## 2. Stack Tecnológica

- **Frontend**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- **Estilização**: CSS Vanilla moderno com Design System responsivo e tokens de tema
- **Engine de Flipbook**: [StPageFlip (page-flip)](https://nodegarden.github.io/page-flip/) desacoplado da lógica sonora
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Roteamento**: [React Router](https://reactrouter.com/) (suporte a `/livros/:slug`)
- **Testes**: [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/)

---

## 3. Instruções de Instalação e Execução

### Pré-requisitos
- Node.js >= 18.0.0
- npm >= 9.0.0

### Instalação
```bash
npm install
```

### Execução em Modo de Desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:5173/livros/nico` no seu navegador.

### Executar Testes Automatizados
```bash
npm run test
```

### Build de Produção
```bash
npm run build
npm run preview
```

---

## 4. Estrutura de Diretórios

```text
/mvp_flipbook
├── docs/                      # Documentação técnica e arquitetural
│   └── ARQUITETURA.md
├── prompts/                   # Referências de prompts de imagem e áudio
│   └── nico_book_prompts.md
├── scripts/                   # Scripts utilitários de geração de assets
│   ├── generate_book_pages.js
│   └── generate_book_audios.js
├── public/
│   ├── favicon.svg
│   └── books/
│       └── nico/
│           ├── book.json      # Manifesto oficial de páginas e áudios
│           ├── pages/         # 01.webp a 16.webp
│           └── audio/         # 02.mp3 a 16.mp3
├── src/
│   ├── assets/                # Estilos globais e recursos visuais
│   ├── components/
│   │   ├── BookReader/        # Container e orquestrador do leitor
│   │   ├── BookPage/          # Renderizador de página com alt text
│   │   ├── ReaderControls/    # Barra de controle (Play/Pause, Mute, Telas)
│   │   ├── BookCover/         # Capa com botão "Começar a Ler e Ouvir"
│   │   └── BookFinished/      # Tela final "Ler novamente"
│   ├── pages/
│   │   └── BookViewPage.tsx   # Rota /livros/:slug
│   ├── services/
│   │   ├── audioManager.ts    # Gerenciador de áudio P0 e isolamento atômico
│   │   └── bookService.ts     # Validação de schema e carregamento de livros
│   ├── types/
│   │   ├── book.ts            # Tipagens de dados
│   │   ├── audio.ts           # Estados de reprodução
│   │   └── reader.ts          # Estados do leitor
│   ├── utils/
│   │   ├── fullscreen.ts      # Suporte à Fullscreen API com fallback
│   │   └── a11y.ts            # Detecção de prefers-reduced-motion
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css              # Design system e responsividade mobile-first
├── tests/                     # Bateria de testes unitários e de integração
│   ├── setup.ts
│   ├── bookService.test.ts
│   ├── audioManager.test.ts
│   └── BookReader.test.tsx
├── package.json
├── tsconfig.json
└── vite.config.ts
```
