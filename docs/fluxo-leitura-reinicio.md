# Ciclo de Vida e Fluxo de Reinício da Leitura ("Ler Novamente")

## 1. Visão Geral e Objetivo
Este documento descreve a arquitetura de ciclo de vida do leitor de flipbook digital narrado (`BookReader`), especificando como o estado da sessão, a árvore DOM e os recursos multimídia (áudio e biblioteca `PageFlip`) são gerenciados com isolamento completo entre múltiplas leituras consecutivas.

---

## 2. Arquitetura e Ciclo de Vida

```
 +-------------------------------------------------------------------------------+
 |                                  BookReader                                   |
 |  Estados Centrais:                                                            |
 |  - mode: 'COVER' | 'READING' | 'FINISHED'                                     |
 |  - sessionKey: number (contador incremental de sessão)                        |
 |  - currentPage: number (1..totalPages)                                        |
 |  - audioState & audioProgress                                                 |
 +---------------------------------------+---------------------------------------+
                                         |
                       +-----------------+-----------------+
                       |                                   |
                       v                                   v
             [ Modo 'COVER' / 'FINISHED' ]          [ Modo 'READING' ]
                       |                                   |
                       |                             +-----+----------------------+
                       |                             | 1. Renderiza DOM limpo     |
                       |                             |    flipbook-wrapper        |
                       |                             |    (key = sessionKey)      |
                       |                             | 2. Valida nós .page-item   |
                       |                             | 3. new PageFlip(container) |
                       |                             | 4. pageFlip.loadFromHTML() |
                       |                             | 5. Registra ResizeObserver |
                       |                             +----------------------------+
                       |
            [ Ação 'Ler Novamente' ]
                       |
  +--------------------+---------------------+
  | 1. globalAudioManager.stopAndReset()     |
  | 2. pageFlipInstanceRef.destroy() -> null |
  | 3. sessionKey = sessionKey + 1           |
  | 4. currentPage = 1, mode = 'COVER'       |
  +------------------------------------------+
```

---

## 3. Fluxo de Dados e Transições de Estado

### 3.1. Início da Leitura (`handleStartReading`)
1. Transição de `mode` para `'READING'` e `currentPage = 1`.
2. O componente monta a estrutura do DOM `.flipbook-wrapper` com a chave da sessão ativa (`key={sessionKey}`).
3. O hook `useEffect` é disparado pelas dependências `[mode, reducedMotion, book.totalPages, sessionKey]`.
4. Uma guarda de segurança verifica se todas as tags filhas (`.page-item`) estão presentes no DOM (`querySelectorAll('.page-item').length === book.pages.length`).
5. A biblioteca `PageFlip` é instanciada e consome as páginas via `pageFlip.loadFromHTML(...)`.
6. Listeners de virada de página (`flip`), redimensionamento (`resize`, `orientationchange`) e `ResizeObserver` são configurados.

### 3.2. Término do Livro e Ação "Ler Novamente" (`handleRestartBook`)
Ao chegar na última página e avançar, o leitor entra em `mode === 'FINISHED'`, exibindo a tela final (`BookFinished`).
Ao clicar em **"Ler Novamente"**:
1. **Áudio:** `globalAudioManager.stopAndReset()` interrompe qualquer reprodução pendente, zera a posição temporal e emite evento de progresso zerado aos inscritos.
2. **PageFlip:** A instância antiga é destruída (`destroy()`) e sua referência é limpa (`pageFlipInstanceRef.current = null`).
3. **Isolamento de DOM:** `sessionKey` é incrementado (`setSessionKey(prev => prev + 1)`). Isso instrui o React a desmontar e descartar completamente o container DOM manipulado pelo PageFlip anterior e recriar nós HTML limpos.
4. **Redefinição de Leitura:** `currentPage` retorna para `1` e `mode` retorna para `'COVER'`.

### 3.3. Tratamento de Exceções de Áudio (`AbortError`)
Em navegadores modernos, invocar `audio.pause()` enquanto uma promise de `audio.play()` está pendente gera uma exceção `DOMException: AbortError: The play() request was interrupted by a call to pause()`.
- O `AudioManager` trata o `AbortError` como interrupção esperada do fluxo, sem emitir avisos desnecessários no console e sem transicionar o estado para `ERROR`.

---

## 4. Guia de Manutenção e Boas Práticas

- **Nunca reutilize nós DOM manipulados pelo PageFlip**: A biblioteca `page-flip` insere containers internos e remove classes originais ao ser destruída. Sempre force a remontagem via chave React (`sessionKey`) quando for necessário recriar o flipbook.
- **Sempre remova listeners explicitamente com suas referências**: Nunca passe funções anônimas como `window.removeEventListener('resize', () => {})`. Utilize a referência exata da função de callback (`handleResize`).
- **Verifique métodos antes de chamadas de atualização**: Antes de invocar `pageFlip.update()`, certifique-se de que a instância existe e de que o método está disponível (`pageFlipInstanceRef.current && typeof pageFlipInstanceRef.current.update === 'function'`).
- **Testes de Regressão**:
  - Teste Unitário: `tests/BookReader.test.tsx` (cenário `Regressão: deve concluir livro -> Ler Novamente...`).
  - Teste E2E: `e2e/bookReader.spec.ts` (cenário `Regressão: Concluir Livro -> Ler Novamente...`).
