# SKILL — MVP Flipbook Narrado

## 1. Nome da skill

**flipbook-mvp-agent**

## 2. Missão

Orientar agentes de desenvolvimento durante todo o ciclo de criação, validação e entrega do MVP de um **flipbook narrado**, garantindo que o produto permaneça simples, reutilizável, responsivo e fiel ao PRD.

O objetivo desta skill é impedir dois desvios comuns:

1. construir uma solução descartável específica para um único livro;
2. transformar prematuramente o MVP em uma plataforma completa.

A engine deve nascer reutilizável, mas o MVP entrega apenas o primeiro livro.

---

## 3. Produto de referência

Aplicação web para leitura de livros digitais ilustrados com:

- páginas visuais;
- narração individual por página;
- navegação com efeito de livro;
- funcionamento em celular, tablet e desktop;
- acesso por URL pública;
- nenhuma conta obrigatória;
- nenhum backend no MVP;
- nenhum painel administrativo no MVP.

Livro inicial:

**Nico e as Histórias que Ele Descobriu Escutando**

Meta principal:

> Abrir `/livros/nico`, tocar em **Começar**, ouvir a história e chegar à página 16 com uma experiência estável, simples e agradável.

---

# 4. Princípios obrigatórios

Todo agente que atuar neste projeto deve obedecer aos seguintes princípios.

## 4.1 MVP antes de plataforma

Não implementar funcionalidades futuras enquanto os critérios do MVP não estiverem integralmente atendidos.

Não implementar:

- login;
- cadastro;
- pagamentos;
- biblioteca pessoal;
- favoritos;
- comentários;
- IA;
- geração automática de livros;
- editor visual;
- upload pelo usuário;
- painel administrativo;
- DRM;
- aplicativo Android ou iOS.

Se uma tarefa exigir qualquer um desses recursos, interromper a implementação e sinalizar:

> **FORA DO ESCOPO DO MVP**

---

## 4.2 Engine reutilizável

A lógica do leitor não pode depender do livro Nico.

O conteúdo deve ser fornecido por configuração estruturada, preferencialmente JSON ou objeto TypeScript validado.

A engine deve receber um livro e renderizá-lo.

Exemplo conceitual:

```ts
type Book = {
  slug: string
  title: string
  pages: BookPage[]
}

type BookPage = {
  image: string
  audio?: string | null
  alt?: string
}
```

Adicionar outro livro não deve exigir alteração da lógica central de navegação, áudio ou renderização.

---

## 4.3 Conteúdo separado da interface

É proibido codificar diretamente nos componentes:

- caminhos específicos das páginas do Nico;
- caminhos específicos dos áudios;
- quantidade fixa de páginas;
- título fixo;
- textos específicos do livro.

Esses dados pertencem à configuração do livro.

---

## 4.4 Mobile-first

Toda decisão visual deve ser testada primeiro em celular.

A página deve:

- ocupar a maior área útil possível;
- manter proporção correta;
- continuar legível;
- dispensar zoom manual;
- permitir toque confortável;
- evitar controles excessivos.

Desktop é adaptação do mobile, não o contrário.

---

## 4.5 Áudio desacoplado da animação

A biblioteca de flipbook pode controlar apenas:

- aparência;
- animação;
- interação de virada.

Ela não deve controlar a regra de áudio.

A reprodução sonora deve pertencer a um módulo próprio.

---

# 5. Stack padrão

Usar, salvo impedimento técnico comprovado:

```text
React
TypeScript
Vite
Vercel
StPageFlip / page-flip
Assets estáticos
JSON ou TypeScript estruturado para livros
```

Não adicionar Next.js, banco de dados, autenticação ou backend apenas por conveniência.

Toda nova dependência deve justificar uma necessidade real do MVP.

---

# 6. Estrutura recomendada

A estrutura abaixo é conceitual. O agente pode adaptar nomes, mas deve preservar a separação de responsabilidades.

```text
src/
  app/
  components/
    BookReader/
    BookPage/
    ReaderControls/
  features/
    audio/
    navigation/
    fullscreen/
  books/
    registry.ts
    nico/
      book.json
  hooks/
  lib/
  types/
  styles/

public/
  books/
    nico/
      pages/
      audio/
```

Responsabilidades:

### `BookReader`

Coordena a experiência de leitura.

Não deve possuir conteúdo específico do Nico.

### `BookPage`

Renderiza imagem e metadados acessíveis.

### `ReaderControls`

Controla:

- anterior;
- próxima;
- play/pause;
- reinício;
- mute;
- tela cheia.

### `audio`

Controla exclusivamente estado e reprodução sonora.

### `navigation`

Controla página atual e limites.

### `books`

Contém metadados e configuração dos livros.

---

# 7. Máquina de estados mínima

Evitar estados implícitos espalhados pelos componentes.

O leitor deve possuir, no mínimo:

```text
COVER
READING
FINISHED
```

O áudio pode possuir:

```text
IDLE
LOADING
PLAYING
PAUSED
BLOCKED
ERROR
```

Eventos relevantes:

```text
START_BOOK
NEXT_PAGE
PREVIOUS_PAGE
PAGE_CHANGED
PLAY_AUDIO
PAUSE_AUDIO
RESTART_AUDIO
MUTE
UNMUTE
RESTART_BOOK
```

Não é obrigatório usar biblioteca de state machine.

O requisito é manter o comportamento explícito e previsível.

---

# 8. Regra crítica de áudio

Ao mudar de página:

1. pausar imediatamente o áudio atual;
2. voltar o áudio anterior para `currentTime = 0`;
3. remover referências desnecessárias;
4. identificar o áudio da nova página;
5. carregar o novo áudio;
6. tentar reproduzir apenas se a interação anterior do usuário permitir;
7. se autoplay for bloqueado, permanecer em estado controlável pelo usuário.

Nunca permitir dois áudios simultâneos.

Essa regra é considerada **P0**.

---

# 9. Autoplay

O agente nunca deve presumir que navegadores permitirão autoplay com som.

A entrada deve conter uma ação explícita:

```text
COMEÇAR
```

Essa primeira interação deve ser usada para habilitar a experiência sonora quando possível.

Se o navegador ainda bloquear áudio:

- não quebrar a navegação;
- não exibir erro técnico ao usuário;
- apresentar controle de reprodução disponível.

---

# 10. Navegação

Implementar:

- botão anterior;
- botão próxima;
- toque nas laterais quando apropriado;
- swipe horizontal no celular;
- setas do teclado no desktop;
- integração com a virada visual.

Regras invariantes:

```text
currentPage >= 0
currentPage <= lastPage
```

Nunca permitir:

- página negativa;
- página maior que o total;
- divergência entre página visual e página lógica.

A página lógica é a fonte da verdade.

---

# 11. Biblioteca de flipbook

Biblioteca preferencial:

**StPageFlip / page-flip**

Antes de consolidar seu uso, validar:

- touch no celular;
- swipe;
- redimensionamento;
- integração com React;
- destruição e recriação segura;
- sincronização do evento de mudança de página;
- ausência de conflito com controles;
- funcionamento com `prefers-reduced-motion`.

Se a biblioteca falhar de forma estrutural em mobile, acessibilidade ou manutenção de estado, substituí-la.

Não construir uma engine de física de virada de página do zero para o MVP.

---

# 12. Responsividade

Testar pelo menos estes cenários:

```text
360x640
390x844
768x1024
1366x768
1920x1080
```

Verificar:

- página não cortada;
- proporção preservada;
- controles acessíveis;
- indicador legível;
- nenhuma rolagem horizontal acidental;
- orientação retrato;
- orientação paisagem;
- mudança de tamanho da janela.

---

# 13. Imagens

Priorizar:

```text
WebP
AVIF quando fizer sentido
```

Cada asset deve possuir dimensões coerentes com o uso real.

Evitar:

- PNG desnecessariamente grande;
- imagens muito superiores à resolução de exibição;
- carregamento antecipado de todo o livro.

Estratégia:

```text
página atual = carregada
próxima página = preload
demais páginas = lazy
```

---

# 14. Áudio

Para produção web, preferir:

```text
MP3
```

WAV pode ser usado como fonte de produção, mas não deve ser o formato padrão entregue ao navegador quando o tamanho for significativamente maior.

Antes de substituir arquivos WAV originais, preservar os arquivos-fonte fora da pasta final de distribuição.

Validar:

- duração;
- início sem silêncio excessivo;
- volume coerente;
- associação correta página ↔ áudio;
- ausência de arquivos ausentes.

---

# 15. Acessibilidade

Obrigatório no MVP:

- controles com `aria-label`;
- navegação por teclado;
- foco visível;
- contraste suficiente;
- semântica adequada para botões;
- texto alternativo configurável por página;
- respeito a `prefers-reduced-motion`;
- controles de áudio acessíveis.

Quando `prefers-reduced-motion: reduce` estiver ativo:

- reduzir ou remover animação de virada;
- manter a navegação totalmente funcional.

A animação nunca pode ser necessária para compreender em qual página o usuário está.

---

# 16. Fullscreen

Usar a Fullscreen API apenas quando suportada.

O recurso deve degradar de forma segura.

Se fullscreen não estiver disponível:

- ocultar ou desabilitar o botão;
- não bloquear leitura;
- não produzir erro.

---

# 17. Performance

Não carregar todo o livro no primeiro acesso.

Meta operacional:

> A capa ou primeira página deve aparecer rapidamente mesmo em conexão móvel.

Estratégia:

- assets estáticos;
- compressão;
- lazy loading;
- preload apenas da próxima página;
- preload moderado do próximo áudio;
- cache HTTP;
- evitar bundles desnecessários.

Não otimizar prematuramente com infraestrutura complexa.

---

# 18. Analytics

Analytics é opcional.

Se implementado, limitar aos eventos:

```text
book_opened
book_started
page_viewed
audio_started
audio_completed
book_completed
book_restarted
```

Não registrar:

- nome da criança;
- idade;
- voz;
- imagem;
- localização precisa;
- identificadores desnecessários.

Não incluir texto do livro ou dados pessoais nos eventos.

---

# 19. Privacidade

O MVP não deve coletar dados pessoais de crianças.

É proibido adicionar sem nova decisão de produto:

- conta infantil;
- perfil;
- câmera;
- microfone;
- gravação;
- identificação nominal;
- tracking invasivo.

Se uma ferramenta de terceiros introduzir coleta incompatível com esse princípio, o agente deve sinalizar o risco antes de adotá-la.

---

# 20. Ordem obrigatória de implementação

O agente deve executar o desenvolvimento nesta ordem.

## Fase 0 — Baseline

Antes de alterar código:

1. identificar branch atual;
2. executar `git status`;
3. registrar arquivos existentes;
4. identificar stack;
5. executar testes existentes;
6. executar build existente;
7. registrar baseline.

Não corrigir problemas não relacionados sem necessidade.

---

## Fase 1 — Contrato de dados

Implementar primeiro:

- tipos de livro;
- tipos de página;
- configuração do Nico;
- validação de configuração;
- registry ou resolução por slug.

Critério de conclusão:

```text
/livros/nico
```

deve conseguir resolver corretamente os dados do livro sem renderizar ainda o flipbook completo.

---

## Fase 2 — Leitor estático

Renderizar:

- capa;
- botão Começar;
- página atual;
- indicador de página;
- anterior;
- próxima.

Sem animação complexa.

Critério:

> Navegação básica completa sem áudio e sem biblioteca de flipbook.

---

## Fase 3 — Engine de áudio

Adicionar:

- carregamento por página;
- play;
- pause;
- restart;
- mute;
- interrupção na troca de página;
- tratamento de autoplay bloqueado.

Critério:

> É impossível produzir dois áudios simultâneos mesmo virando páginas rapidamente.

---

## Fase 4 — Flipbook visual

Integrar StPageFlip.

A página visual deve permanecer sincronizada com o estado lógico.

Critério:

> Navegação por botão, toque, swipe e virada visual termina sempre na mesma página lógica.

---

## Fase 5 — Responsividade

Validar mobile primeiro.

Corrigir:

- tamanho;
- overflow;
- orientação;
- área dos controles;
- legibilidade.

---

## Fase 6 — Acessibilidade

Implementar e testar:

- teclado;
- foco;
- labels;
- reduced motion;
- alt text;
- controles acessíveis.

---

## Fase 7 — Fullscreen

Implementar apenas depois do leitor principal estar estável.

---

## Fase 8 — Performance

Executar auditoria de:

- tamanho dos assets;
- carregamento inicial;
- lazy loading;
- preload;
- bundle.

Não comprometer estabilidade por micro-otimização.

---

## Fase 9 — Testes completos

Executar todos os testes obrigatórios definidos nesta skill.

---

## Fase 10 — Deploy

Somente após todos os critérios locais estarem atendidos.

Deploy na Vercel.

Validar novamente usando URL pública.

---

# 21. Estratégia de testes

Usar a pirâmide abaixo.

## Unitários

Testar lógica pura:

- limites de navegação;
- resolução de página;
- resolução de áudio;
- book registry;
- validação de configuração;
- estado de áudio;
- restart;
- mute.

---

## Integração

Testar:

- troca de página interrompe áudio;
- controles alteram página;
- página correta seleciona áudio correto;
- página sem áudio não quebra;
- restart volta à capa;
- autoplay bloqueado mantém interface funcional.

---

## E2E

Testar no navegador:

```text
abrir livro
clicar Começar
avançar
voltar
tocar áudio
pausar
virar durante áudio
virar várias páginas rapidamente
voltar para página anterior
chegar à última página
reiniciar livro
recarregar navegador
```

---

# 22. Casos críticos obrigatórios

Nenhum agente pode declarar o MVP concluído sem validar estes casos.

### C1 — Virar durante áudio

Esperado:

```text
áudio anterior para imediatamente
novo áudio assume
```

### C2 — Virar várias páginas rapidamente

Esperado:

```text
somente o áudio da página final pode permanecer ativo
```

### C3 — Voltar para página já visitada

Esperado:

```text
estado correto
áudio correto
sem duplicação
```

### C4 — Pausar e avançar

Esperado:

```text
áudio pausado da página anterior não volta sozinho
```

### C5 — Página sem áudio

Esperado:

```text
leitura continua normalmente
controles refletem indisponibilidade quando necessário
```

### C6 — Autoplay bloqueado

Esperado:

```text
navegação continua
usuário pode iniciar áudio manualmente
```

### C7 — Recarregar

Esperado:

```text
aplicação monta sem erro
nenhum estado corrompido
```

### C8 — Perda de conexão durante áudio

Esperado:

```text
falha não derruba o leitor
usuário consegue continuar navegando
```

---

# 23. Browsers mínimos

Validar:

- Chrome desktop;
- Edge desktop;
- Chrome Android;
- Safari iPhone;
- Safari iPad quando disponível.

Problemas exclusivos de Safari devem ser tratados como relevantes, principalmente em:

- autoplay;
- fullscreen;
- áudio;
- eventos touch.

---

# 24. Critérios de aceitação

O MVP está concluído somente quando todos forem verdadeiros:

- [ ] O livro Nico possui exatamente 16 páginas.
- [ ] Todas as páginas são exibidas corretamente.
- [ ] Cada áudio está associado à página correta.
- [ ] Trocar de página interrompe o áudio anterior.
- [ ] Nunca há dois áudios simultâneos.
- [ ] Avançar funciona.
- [ ] Voltar funciona.
- [ ] Swipe funciona em celular.
- [ ] Setas funcionam no desktop.
- [ ] Tela cheia funciona quando suportada.
- [ ] `prefers-reduced-motion` é respeitado.
- [ ] O leitor funciona em celular.
- [ ] O leitor funciona em desktop.
- [ ] Recarregar não quebra o aplicativo.
- [ ] O livro é acessível por URL pública.
- [ ] Nenhuma conta é necessária.
- [ ] Nenhum backend é necessário.
- [ ] O produto não depende do Publuu.
- [ ] Build de produção passa.
- [ ] Testes automatizados passam.
- [ ] Teste manual final passa.

---

# 25. Definição de pronto por tarefa

Uma tarefa só pode ser marcada como concluída quando:

1. código implementado;
2. TypeScript sem erro;
3. lint sem erro relevante;
4. testes relacionados passam;
5. build passa quando aplicável;
6. comportamento validado;
7. nenhum requisito existente foi quebrado;
8. nenhuma funcionalidade fora do escopo foi introduzida;
9. diff revisado;
10. documentação atualizada quando a arquitetura mudou.

---

# 26. Regras para alterações

Antes de editar:

- localizar o código responsável;
- compreender fluxo atual;
- identificar testes existentes;
- fazer a menor mudança suficiente.

Durante a edição:

- evitar refatorações paralelas;
- evitar renomeações cosméticas;
- evitar alteração de dependências sem necessidade;
- não alterar comportamento aprovado sem motivo.

Depois:

```bash
git diff --check
```

e executar a suíte pertinente.

---

# 27. Segurança

Apesar de não possuir backend, o agente deve:

- evitar inserção dinâmica de HTML não confiável;
- não usar `dangerouslySetInnerHTML` para metadados do livro;
- não incluir segredos no bundle;
- não adicionar chaves privadas;
- revisar dependências;
- evitar scripts externos desnecessários.

Não existe motivo para qualquer segredo de servidor no MVP.

---

# 28. Gestão de dependências

Antes de instalar uma biblioteca:

1. confirmar que a necessidade não é atendida pela plataforma web;
2. verificar manutenção recente;
3. verificar compatibilidade React/TypeScript;
4. verificar tamanho;
5. verificar licença;
6. verificar vulnerabilidades conhecidas.

Evitar dependências para funcionalidades triviais.

---

# 29. Tratamento de bugs

Classificação:

## P0

Impede uso básico ou produz erro grave.

Exemplos:

- dois áudios simultâneos;
- leitor não abre;
- página errada;
- crash ao virar página.

Corrigir imediatamente.

## P1

Afeta experiência importante.

Exemplos:

- swipe inconsistente;
- layout quebrado em dispositivo relevante;
- foco inacessível.

Corrigir antes do deploy final.

## P2

Melhoria não bloqueante.

Exemplos:

- sombra;
- microanimação;
- refinamento visual pequeno.

Não atrasar MVP por P2.

---

# 30. Protocolo de trabalho do agente

Ao receber uma tarefa:

## A. Ler

Consultar:

- PRD;
- esta skill;
- código relacionado;
- testes relacionados.

## B. Diagnosticar

Responder internamente:

```text
qual requisito estou implementando?
qual módulo deve ser alterado?
qual comportamento pode regredir?
como vou provar que funcionou?
```

## C. Implementar

Fazer a menor alteração arquiteturalmente correta.

## D. Validar

Executar testes proporcionais ao risco.

## E. Reportar

Informar:

```text
Arquivos alterados
Comportamento implementado
Testes executados
Resultado
Riscos ou limitações
Próxima tarefa lógica
```

Não declarar sucesso sem evidência.

---

# 31. Regra de não expansão

Se durante o desenvolvimento surgir uma ideia como:

- catálogo;
- login;
- painel;
- upload;
- CMS;
- monetização;
- IA;
- estatísticas avançadas;
- múltiplos perfis;

registrar como:

```text
BACKLOG PÓS-MVP
```

e continuar o trabalho atual.

---

# 32. Auditoria final

Antes de declarar versão candidata a MVP:

## Arquitetura

- [ ] Engine independente do Nico.
- [ ] Conteúdo fora dos componentes.
- [ ] Áudio desacoplado do flipbook.
- [ ] Nenhum backend.
- [ ] Nenhuma autenticação.
- [ ] Nenhum código desnecessário de plataforma futura.

## Funcional

- [ ] 16 páginas.
- [ ] Áudios corretos.
- [ ] Navegação correta.
- [ ] Reinício correto.
- [ ] Fullscreen quando disponível.

## Mobile

- [ ] Sem overflow horizontal.
- [ ] Sem zoom manual obrigatório.
- [ ] Swipe estável.
- [ ] Controles confortáveis.
- [ ] Orientação funciona.

## Áudio

- [ ] Sem sobreposição.
- [ ] Autoplay bloqueado tratado.
- [ ] Pause funciona.
- [ ] Restart funciona.
- [ ] Mute funciona.
- [ ] Troca rápida não produz race condition perceptível.

## Acessibilidade

- [ ] Teclado.
- [ ] Foco.
- [ ] Labels.
- [ ] Alt text.
- [ ] Reduced motion.

## Performance

- [ ] Assets comprimidos.
- [ ] Lazy loading.
- [ ] Próxima página pré-carregada.
- [ ] Livro inteiro não carregado inicialmente.

## Produção

- [ ] Build passa.
- [ ] URL pública abre.
- [ ] Navegação direta para `/livros/nico` funciona.
- [ ] Recarregar rota funciona.
- [ ] Console sem erros relevantes.

---

# 33. Critério final de encerramento

O agente somente pode afirmar:

> **MVP concluído**

quando puder demonstrar objetivamente:

```text
URL pública
→ abrir livro
→ tocar Começar
→ navegar pelas 16 páginas
→ ouvir as narrações corretas
→ não haver sobreposição de áudio
→ funcionar em celular e desktop
→ chegar ao fim
→ reiniciar
```

Qualquer falha nesse fluxo mantém o produto em desenvolvimento.

---

# 34. Modelos recomendados para os agentes

## Planejamento, arquitetura e auditoria

**GPT-5.6 Sol — raciocínio alto**

Usar para:

- decisões arquiteturais;
- desenho da engine;
- diagnóstico de bugs complexos;
- concorrência/race conditions de áudio;
- auditoria final;
- revisão de segurança;
- investigação de problemas mobile/Safari difíceis.

## Implementação delimitada

**GPT-5.6 Terra — raciocínio médio**

Usar para:

- componentes;
- hooks;
- integração de biblioteca;
- testes;
- estilos responsivos;
- ajustes de acessibilidade;
- correções localizadas.

## Alterações simples

**Luna — raciocínio baixo**

Usar apenas para:

- textos;
- labels;
- pequenas alterações CSS;
- ajustes muito localizados sem impacto arquitetural.

---

# 35. Instrução central para todo agente

Sempre priorize:

```text
CORREÇÃO
> SIMPLICIDADE
> ESTABILIDADE
> EXPERIÊNCIA MOBILE
> REUTILIZAÇÃO DA ENGINE
> REFINAMENTO VISUAL
> FUNCIONALIDADES FUTURAS
```

Quando houver conflito entre “mais recursos” e “leitor narrado funcionando muito bem”, escolha o leitor narrado.
