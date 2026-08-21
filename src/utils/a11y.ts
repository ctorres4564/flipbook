/**
 * Utilitários de acessibilidade
 */

/**
 * Detecta se o usuário tem preferência por redução de movimento no sistema operacional
 */
export function checkPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Observa alterações na preferência de movimento reduzido
 */
export function subscribeToReducedMotion(callback: (reduced: boolean) => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {};
  }
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const listener = (event: MediaQueryListEvent) => callback(event.matches);

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  } else {
    // Suporte a navegadores legados
    mediaQuery.addListener(listener);
    return () => mediaQuery.removeListener(listener);
  }
}
