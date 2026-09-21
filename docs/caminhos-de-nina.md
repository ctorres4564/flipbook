# Flipbook Digital Infantil — "Os Caminhos de Nina"

Documentação técnica da integração do livro digital infantil **"Os Caminhos de Nina"** ao motor de flipbook da aplicação.

---

## 1. Arquitetura do Livro

O livro foi estruturado de forma desacoplada, declarativa e extensível, seguindo o padrão `BookManifest`.

### Estrutura de Diretórios dos Ativos

```text
/public/books/caminhos-de-nina/
├── pages/
│   ├── 01-capa.png         (Capa original - 1122x1402)
│   ├── 02-pagina-1.png     (Página 1 da história)
│   ├── ...
│   ├── 17-pagina-16.png    (Página 16 - Atividade)
│   └── 18-contracapa.png   (Contracapa original)
└── audio/
    ├── 02-pagina-1.wav     (Áudio correspondente à página 1)
    ├── ...
    ├── 17-pagina-16.wav    (Áudio correspondente à página 16)
    └── 18-contracapa.wav   (Áudio da contracapa)
```

- **Imagens**: 18 ilustrações em resolução nativa (1122x1402 px), sem deformação, sem cortes e sem filtros destrutivos.
- **Áudios**: 17 arquivos de narração pré-gravados em formato `.wav` correspondentes exatamente a cada página. A Capa é a única sem áudio.

---

## 2. Fluxo de Dados e Ciclo de Vida do Áudio

```
                                  [Início na Capa (Página 1)]
                                              │
                                              ▼
                             [Áudio Desativado na Capa (Sem Controles)]
                                              │
                       Usuário avança página ou navega via setas / toque
                                              │
                                              ▼
                              [Interrupção Imediata do Áudio Anterior]
                              [stopAndReset() -> currentTime = 0]
                                              │
                                              ▼
                              [Carregamento Sob Demanda do Novo Áudio]
                              [loadAndPlay(url, autoPlay = false)]
                                              │
                                              ▼
                          [Controles Prontos: ▶ Ouvir | ↻ Ouvir novamente]
                                              │
                               Clicar em "Ouvir"
                                              │
                                              ▼
                                 [Reprodução com Zero Sobreposição]
```

### Regras Estritas de Áudio
1. **Sem Autoplay**: Ao virar de página, a nova narração é carregada e posicionada no início, mas **não toca automaticamente**. O leitor clica conscientemente no botão **"Ouvir"**.
2. **Atomicidade e Zero Sobreposição**: A classe `AudioManager` cancela qualquer reprodução anterior e rebobina para 0s antes de engatilhar o próximo áudio.
3. **Capa Silenciosa**: Na página 1 (Capa), os botões de áudio são automaticamente omitidos para manter uma interface limpa.
4. **Página 16 (Atividade)**: Possui áudio normal de narração e o botão discreto **"Imprimir atividade"**.
5. **Contracapa (Página 18)**: Possui áudio normal de narração correspondente a `CONTRACAPA.wav`.

---

## 3. Impressão Exclusiva da Atividade (Página 16)

A página 17 do flipbook (página 16 da história) contém a atividade infantil. O botão discreto **"Imprimir atividade"** aciona `window.print()`.

O arquivo `src/index.css` define regras estritas de impressão `@media print`:
- Oculta todos os componentes de UI (`.reader-header`, `.reader-footer`, `.reader-stage`, `.touch-nav-area`, `.flipbook-wrapper`, etc.).
- Exibe unicamente o container `.printable-activity-container` com a imagem original da atividade em alta definição.
- Aplica formato `@page { size: A4 portrait; margin: 0; }` com adaptação sem distorção e sem elementos de cabeçalho ou rodapé do navegador.

---

## 4. Como Manter e Estender

### Substituir uma Imagem
Para atualizar uma ilustração, substitua o arquivo correspondente em `public/books/caminhos-de-nina/pages/` mantendo as dimensões de proporção (1122x1402 px) ou atualize o caminho no manifesto `src/books/caminhos-de-nina/book.json`.

### Substituir um Áudio
Substitua o arquivo correspondente em `public/books/caminhos-de-nina/audio/` e atualize o ponteiro no manifesto `src/books/caminhos-de-nina/book.json`.

### Adicionar Novas Páginas
1. Adicione a imagem em `public/books/caminhos-de-nina/pages/` e o áudio em `public/books/caminhos-de-nina/audio/`.
2. Em `src/books/caminhos-de-nina/book.json`, adicione um novo objeto na lista `pages` com o novo `pageNumber` sequencial.
3. Atualize o campo `totalPages`.

---

## 5. Verificação e Testes Automatizados

O projeto possui suíte completa de testes automatizados com **Vitest** e **Testing Library**:
- `tests/caminhosDeNina.test.tsx` (10 testes validando integridade, sequência de 18 páginas, 17 áudios, capa sem áudio, atividade com impressão e contracapa).
- Execução: `npm test`
- Build de produção: `npm run build`
