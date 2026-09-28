# Flipbook Narrado — "Theo Tem uma História para Contar"

Documentação técnica da integração do livro digital infantil narrado **"Theo Tem uma História para Contar"** à engine de flipbook da aplicação.

---

## 1. Arquitetura do Livro

O livro foi adicionado seguindo o padrão desacoplado e declarativo `BookManifest`, sem hardcode na engine nem acoplamento aos componentes visuais.

### Estrutura dos Ativos

```text
/public/books/theo/
├── pages/
│   ├── 01.png / 01.webp     (Página 1 - 1448x1086 px)
│   ├── 02.png / 02.webp     (Página 2 - 1448x1086 px)
│   ├── ...
│   └── 14.png / 14.webp     (Página 14 - 1448x1086 px)
└── audio/
    ├── 01.wav               (Narração da Página 1)
    ├── 02.wav               (Narração da Página 2)
    ├── ...
    └── 14.wav               (Narração da Página 14)
```

- **Imagens**: 14 ilustrações na proporção nativa paisagem (~4:3, 1448 × 1086 px), com cópias em WebP otimizadas (qualidade 90) para carregamento ultra-rápido em redes móveis e arquivos PNG originais preservados.
- **Áudios**: 14 narrações originais em formato `.wav` correspondentes exatamente a cada página (da página 1 até a página 14).
- **Fontes Originais**: Mantidos intactos na pasta do projeto `livro_theo_tem_uma_historia_pra_contar/`.

---

## 2. Fluxo de Dados e Ciclo de Vida do Áudio

```
                       [Acesso à Rota /livros/theo]
                                    │
                                    ▼
                   [Apresentação da Capa (CoverScreen)]
                   [Botão "Começar a Ler e Ouvir"]
                                    │
                                    ▼
                   [Modo de Leitura (READING) na Página 1]
                                    │
                                    ▼
              [Carregamento do Áudio 01 (sem autoplay forçado)]
              [Botão "Ouvir narração da página" disponível]
                                    │
                                    ▼
                       [Virada de Página (Touch/Seta)]
                                    │
                                    ▼
                 [Interrupção Imediata do Áudio Anterior]
                 [stopAndReset() -> currentTime = 0]
                 [Zero Sobreposição Sonora (P0)]
                                    │
                                    ▼
               [Carregamento do Próximo Áudio da Página Ativa]
                                    │
                                    ▼
              [Após a Página 14 -> Tela de Conclusão / Ler Novamente]
```

### Regras Estritas de Áudio
1. **Página 1 com Narração**: Diferente de livros com capa silenciosa, Theo inicia a história diretamente com narração na página 1 após o clique em "Começar".
2. **Zero Sobreposição (P0)**: Qualquer virada (seja por clique, toque, swipe ou tecla de atalho) cancela imediatamente o áudio anterior, zera seu `currentTime` e garante que nunca haja dois áudios tocando simultaneamente.
3. **Respeito ao Autoplay**: O áudio só é iniciado após interação deliberada do usuário, degradando para controles manuais acessíveis caso o navegador restrinja a reprodução.

---

## 3. Mapeamento 1:1 das 14 Páginas e Áudios

| Página | Imagem Web | Áudio | Descrição Visual (A11y / Alt) | Narração |
| :---: | :---: | :---: | :--- | :--- |
| **01** | `01.webp` | `01.wav` | Theo sentado assistindo TV com atenção e interesse. | Theo adorava assistir aos seus desenhos preferidos... |
| **02** | `02.webp` | `02.wav` | Theo sorrindo diante da TV acompanhando a aventura. | A menina aprontava uma coisa atrás da outra... |
| **03** | `03.webp` | `03.wav` | O desenho termina e Theo se levanta animado para procurar a família. | Quando o desenho terminou, Theo ainda estava pensando... |
| **04** | `04.webp` | `04.wav` | Theo diante de um familiar tentando começar a contar. | Theo sabia o que queria contar. A história estava todinha... |
| **05** | `05.webp` | `05.wav` | Theo concentrado e o familiar atento dando tempo para ele. | Theo tentou. Parou. Pensou um pouco. E tentou outra vez. |
| **06** | `06.webp` | `06.wav` | Theo consegue dizer a primeira palavra: "MENINA!". | Então, uma palavra apareceu. "MENINA!" Era só uma palavra... |
| **07** | `07.webp` | `07.wav` | Theo percebe a atenção e encontra outra palavra: "URSO!". | Theo percebeu que estavam prestando atenção... "URSO!" |
| **08** | `08.webp` | `08.wav` | Theo usa movimentos e expressões enquanto tenta continuar. | Agora havia uma menina. Havia um urso. Mas Theo ainda queria... |
| **09** | `09.webp` | `09.wav` | Theo combina gestos faciais e manuais para ajudar a contar. | As palavras ainda estavam difíceis. Então Theo usou também as mãos... |
| **10** | `10.webp` | `10.wav` | A família espera, observa, escuta e começa a entender. | Sua família esperou. Observou. Escutou. E começou a entender. |
| **11** | `11.webp` | `11.wav` | Theo percebe que entenderam, sorri e demonstra vontade de continuar. | Theo percebeu que estavam entendendo! Sorriu e continuou... |
| **12** | `12.webp` | `12.wav` | Theo continua com palavras e gestos em momento tranquilo. | Theo não precisou contar tudo de uma vez. Cada palavra ajudou... |
| **13** | `13.webp` | `13.wav` | No outro dia, Theo assiste TV e vira-se para compartilhar. | No outro dia, Theo assistiu ao desenho novamente... |
| **14** | `14.webp` | `14.wav` | Theo junto da família em momento afetivo, encerrando o livro. | Theo ainda tinha muitas histórias para contar... |

---

## 4. Como Manter e Estender

### Atualização de Ilustrações
- Substitua os arquivos em `public/books/theo/pages/` preservando a proporção de 1448 × 1086 px ou reexecute `node scripts/setup-theo.mjs`.

### Atualização de Áudios
- Substitua os arquivos correspondentes em `public/books/theo/audio/` (`01.wav` até `14.wav`).

### Validação Automatizada
Para garantir que futuras alterações no projeto não quebrem o livro Theo:
```bash
npm run test
npm run build
```
- A suíte `tests/theo.test.tsx` valida automaticamente todas as regras de negócio, limites de página, interrupção de som e reinício.
