/**
 * Utilitários para Fullscreen API com suporte e degradação segura em iOS/Safari
 */

export function isFullscreenSupported(): boolean {
  if (typeof document === 'undefined') return false;
  return Boolean(
    document.fullscreenEnabled ||
    (document as unknown as { webkitFullscreenEnabled?: boolean }).webkitFullscreenEnabled ||
    (document as unknown as { mozFullScreenEnabled?: boolean }).mozFullScreenEnabled ||
    (document as unknown as { msFullscreenEnabled?: boolean }).msFullscreenEnabled
  );
}

export function isCurrentlyFullscreen(): boolean {
  if (typeof document === 'undefined') return false;
  return Boolean(
    document.fullscreenElement ||
    (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
    (document as unknown as { mozFullScreenElement?: Element }).mozFullScreenElement ||
    (document as unknown as { msFullscreenElement?: Element }).msFullscreenElement
  );
}

export async function toggleFullscreen(element: HTMLElement = document.documentElement): Promise<boolean> {
  try {
    if (!isFullscreenSupported()) {
      return false;
    }

    if (isCurrentlyFullscreen()) {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as unknown as { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
        await (document as unknown as { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen();
      }
      return false;
    } else {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if ((element as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
        await (element as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
      }
      return true;
    }
  } catch (err) {
    console.warn('Falha ao alternar tela cheia:', err);
    return isCurrentlyFullscreen();
  }
}
