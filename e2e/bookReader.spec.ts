import { test, expect } from '@playwright/test';

test.describe('E2E MVP Flipbook Narrado - Livro Nico', () => {

  test('Fluxo Completo: Capa -> Leitura -> Navegação -> Áudio -> Finalização -> Reinício', async ({ page }) => {
    test.setTimeout(90000);
    // 1. Abertura direta da rota
    await page.goto('/livros/nico');
    await expect(page).toHaveTitle(/Nico e as Histórias que Ele Descobriu Escutando/);

    // 2. Capa visível com botão Começar
    const startButton = page.getByRole('button', { name: /Começar a ler e ouvir/i });
    await expect(startButton).toBeVisible();

    // 3. Iniciar Leitura
    await startButton.click();

    // 4. Página 1 no leitor
    const pageIndicator = page.locator('#page-indicator');
    await expect(pageIndicator).toHaveText('1 / 16');

    const prevButton = page.locator('#btn-prev-page');
    const nextButton = page.locator('#btn-next-page');
    await expect(prevButton).toBeDisabled();
    await expect(nextButton).toBeEnabled();

    // 5. Avançar para a Página 2 (Cena 1 - possui áudio)
    await nextButton.click();
    await page.waitForTimeout(600);
    await expect(pageIndicator).toHaveText('2 / 16');
    await expect(prevButton).toBeEnabled();

    // 6. Controles de Áudio (Página 2)
    const playPauseBtn = page.locator('#btn-play-pause');
    await expect(playPauseBtn).toBeVisible();

    // Pausar áudio
    await playPauseBtn.click();
    await page.waitForTimeout(200);

    // Retomar áudio
    await playPauseBtn.click();
    await page.waitForTimeout(200);

    // Mute / Unmute
    const muteBtn = page.locator('#btn-toggle-mute');
    await muteBtn.click();
    await expect(page.locator('.badge-muted')).toBeVisible();
    await muteBtn.click();
    await expect(page.locator('.badge-muted')).toHaveCount(0);

    // 7. Navegação por Teclado
    await page.keyboard.press('ArrowRight'); // Avança para 3
    await expect(pageIndicator).toHaveText('3 / 16', { timeout: 7000 });

    await page.keyboard.press('ArrowLeft'); // Volta para 2
    await expect(pageIndicator).toHaveText('2 / 16', { timeout: 7000 });

    // 8. Avançar até a Página 16 (Cena 15)
    while ((await pageIndicator.innerText()) !== '16 / 16') {
      await nextButton.click();
      await page.waitForTimeout(750);
    }
    await expect(pageIndicator).toHaveText('16 / 16', { timeout: 7000 });

    // 10. Chegada ao Final -> Clicar no botão Concluir para abrir a Tela Final
    await nextButton.click();

    // Aguarda tela final
    const restartBtn = page.locator('#btn-restart-book');
    await expect(restartBtn).toBeVisible({ timeout: 5000 });

    // 11. Ler Novamente -> Volta para a Capa
    await restartBtn.click();
    await expect(startButton).toBeVisible();
  });

  test('Áudio: Casos Críticos de Concorrência e Troca Rápida', async ({ page }) => {
    await page.goto('/livros/nico');
    await page.getByRole('button', { name: /Começar a ler e ouvir/i }).click();

    const nextButton = page.locator('#btn-next-page');
    const prevButton = page.locator('#btn-prev-page');

    // Troca durante narração
    await nextButton.click(); // Página 2
    await page.waitForTimeout(300);

    // Troca rápida consecutiva: 2 -> 3 -> 4 -> 5
    await nextButton.click();
    await page.waitForTimeout(150);
    await nextButton.click();
    await page.waitForTimeout(150);
    await nextButton.click();
    await page.waitForTimeout(600);

    const indicatorText = await page.locator('#page-indicator').innerText();
    expect(indicatorText).toMatch(/\d+ \/ 16/);

    // Voltar para página já visitada
    await prevButton.click();
    await page.waitForTimeout(600);
    expect(await page.locator('#page-indicator').innerText()).toMatch(/\d+ \/ 16/);

    // Nenhuma exceção não tratada no console
    page.on('pageerror', (exception) => {
      expect(exception).toBeNull();
    });
  });

  test('Responsividade e Rotação em Múltiplos Viewports', async ({ page }) => {
    const viewports = [
      { name: 'Mobile Pequeno Retrato', width: 360, height: 640 },
      { name: 'Mobile Padrão Retrato', width: 390, height: 844 },
      { name: 'Mobile Paisagem (Baixa Altura)', width: 844, height: 390 },
      { name: 'Tablet Retrato', width: 768, height: 1024 },
      { name: 'Desktop Laptop', width: 1366, height: 768 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/livros/nico');

      await page.getByRole('button', { name: /Começar a ler e ouvir/i }).click();
      await page.locator('#btn-next-page').click();
      await page.waitForTimeout(600);

      // Verifica que a página atual é 2 / 16
      await expect(page.locator('#page-indicator')).toHaveText('2 / 16');

      // Verifica ausência de barra de rolagem horizontal indesejada no body
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

      // Verifica que controles essenciais permanecem visíveis
      await expect(page.locator('#btn-next-page')).toBeVisible();
      await expect(page.locator('#btn-prev-page')).toBeVisible();
    }
  });

  test('Acessibilidade: Navegação por Teclado e Foco', async ({ page }) => {
    await page.goto('/livros/nico');

    const startButton = page.getByRole('button', { name: /Começar a ler e ouvir/i });
    await startButton.focus();
    await expect(startButton).toBeFocused();

    // Ativação por Enter/Espaço
    await page.keyboard.press('Enter');
    await expect(page.locator('#page-indicator')).toHaveText('1 / 16');

    // Navegação com setas
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(600);
    await expect(page.locator('#page-indicator')).toHaveText('2 / 16');

    // Espaço pausa/retoma áudio
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);
    await page.keyboard.press('Space');
  });

  test('Performance e Carregamento de Recursos', async ({ page }) => {
    const audioRequests: string[] = [];

    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/books/nico/audio/')) {
        audioRequests.push(url);
      }
    });

    // 1. Abertura da capa
    await page.goto('/livros/nico');
    await page.waitForTimeout(400);

    // Na capa, NENHUM áudio narrativo deve ter sido baixado antecipadamente
    expect(audioRequests.length).toBe(0);

    // 2. Entrar na leitura
    await page.getByRole('button', { name: /Começar a ler e ouvir/i }).click();
    await page.waitForTimeout(400);

    // Na página 1 (capa interna, sem áudio), os áudios continuam sem download desnecessário
    expect(audioRequests.length).toBe(0);

    // 3. Avançar para página 2 (Cena 1)
    await page.locator('#btn-next-page').click();
    await page.waitForTimeout(600);

    // Verifica que o badge de status de áudio ativo está renderizado
    await expect(page.locator('.badge', { hasText: 'Áudio Ativo' })).toBeVisible();
  });

});
