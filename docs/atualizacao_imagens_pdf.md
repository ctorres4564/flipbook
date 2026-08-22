# Atualização de Imagens das Páginas via PDF (Flipbook Narrado)

## 1. Visão Geral
Este documento descreve o fluxo de processamento, arquitetura e manutenção para geração e substituição das páginas ilustradas do livro no formato WebP a partir de arquivos mestres em PDF de alta resolução.

---

## 2. Arquitetura e Estrutura de Diretórios

```
/mvp_flipbook
├── livro_nico/
│   └── assets/
│       └── novas_imagens/
│           └── LIVRO DO NICO.pdf       # Arquivo PDF mestre com todas as páginas
├── public/
│   └── books/
│       └── nico/
│           ├── book.json               # Manifesto do livro (ordem, títulos, áudios)
│           ├── audio/                  # Arquivos de narração MP3 (02.mp3 a 16.mp3)
│           └── pages/                  # Imagens WebP otimizadas (01.webp a 16.webp)
├── scripts/
│   ├── convert-pdf-to-webp.mjs         # Script oficial de conversão em lote
│   ├── inspect-pdf.mjs                 # Script de inspeção e validação do PDF
│   └── test-convert.mjs                # Script de teste unitário de conversão
└── docs/
    └── atualizacao_imagens_pdf.md      # Este documento
```

---

## 3. Fluxo de Dados e Conversão

```mermaid
flowchart TD
    A["PDF Mestre (1152pt x 1152pt)"] -->|pdfjs-dist| B["Extração do Viewport de Páginas"]
    B -->|@napi-rs/canvas| C["Renderização Vetorial 1440x1440px"]
    C -->|sharp| D["Compressão WebP (Q=85, Effort=6)"]
    D -->|Gravação| E["public/books/nico/pages/{01..16}.webp"]
    E -->|Carregamento| F["Leitor Flipbook (BookReader / BookCover)"]
```

### Especificações Técnicas das Imagens
- **Formato**: WebP (Moderno, alta taxa de compressão e ampla compatibilidade).
- **Resolução**: 1440 x 1440 pixels (proporção quadrada 1:1, ideal para telas normais e Retina).
- **Qualidade**: 85% com compressão por aproximação perceptual (sharp).
- **Peso médio**: 170 KB a 370 KB por página.
- **Correspondência de Páginas**:
  - `01.webp`: Capa do Livro (Página 1 do PDF)
  - `02.webp` a `16.webp`: Páginas de história 2 a 16 (Páginas 2 a 16 do PDF)

---

## 4. Como Manter e Executar Novas Conversões

Sempre que novas versões de páginas em PDF forem adicionadas ao projeto:

1. Coloque o PDF em `livro_nico/assets/novas_imagens/LIVRO DO NICO.pdf`.
2. Execute o script de inspeção para validar páginas e dimensões:
   ```bash
   node scripts/inspect-pdf.mjs
   ```
3. Execute o script oficial de conversão:
   ```bash
   node scripts/convert-pdf-to-webp.mjs
   ```
4. Execute os testes para garantir a integridade da aplicação:
   ```bash
   npm test
   npm run test:e2e -- --project=chromium
   ```
