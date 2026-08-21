import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AudioManager } from '../src/services/audioManager';

describe('AudioManager - P0 Audio Engine', () => {
  let audioManager: AudioManager;

  beforeEach(() => {
    vi.clearAllMocks();
    audioManager = new AudioManager();
  });

  afterEach(() => {
    audioManager.destroy();
  });

  it('deve iniciar no estado IDLE', () => {
    expect(audioManager.getState()).toBe('IDLE');
    expect(audioManager.getCurrentAudioUrl()).toBeNull();
  });

  it('deve atualizar o estado para IDLE quando a página não possui áudio', async () => {
    const stateCallback = vi.fn();
    audioManager.subscribe({ onStateChange: stateCallback });

    await audioManager.loadAndPlay(null);

    expect(audioManager.getState()).toBe('IDLE');
    expect(audioManager.getCurrentAudioUrl()).toBeNull();
  });

  it('deve carregar e tentar reproduzir quando fornecido um áudio válido', async () => {
    const stateCallback = vi.fn();
    audioManager.subscribe({ onStateChange: stateCallback });

    await audioManager.loadAndPlay('/books/nico/audio/02.mp3');

    expect(audioManager.getCurrentAudioUrl()).toBe('/books/nico/audio/02.mp3');
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  it('deve pausar e zerar áudio anterior imediatamente ao trocar de faixa (C1/C2 - Zero sobreposição)', async () => {
    await audioManager.loadAndPlay('/books/nico/audio/02.mp3');
    
    // Troca rápida para a página 3
    await audioManager.loadAndPlay('/books/nico/audio/03.mp3');

    expect(window.HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    expect(audioManager.getCurrentAudioUrl()).toBe('/books/nico/audio/03.mp3');
  });

  it('deve tratar adequadamente quando o autoplay for bloqueado pelo navegador (C6)', async () => {
    // Simula rejeição de NotAllowedError do browser
    window.HTMLMediaElement.prototype.play = vi.fn().mockRejectedValue(new DOMException('Autoplay not allowed', 'NotAllowedError'));

    const stateCallback = vi.fn();
    audioManager.subscribe({ onStateChange: stateCallback });

    await audioManager.loadAndPlay('/books/nico/audio/02.mp3');

    expect(audioManager.getState()).toBe('BLOCKED');
  });

  it('deve permitir pausar e retomar manualmente', async () => {
    await audioManager.loadAndPlay('/books/nico/audio/02.mp3');
    
    audioManager.pause();
    expect(audioManager.getState()).toBe('PAUSED');
    expect(window.HTMLMediaElement.prototype.pause).toHaveBeenCalled();

    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    await audioManager.play();
    expect(audioManager.getState()).toBe('PLAYING');
  });

  it('deve reiniciar o áudio atual com restart()', async () => {
    await audioManager.loadAndPlay('/books/nico/audio/02.mp3');
    await audioManager.restart();

    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  it('deve controlar mute/unmute', () => {
    expect(audioManager.isMuted()).toBe(false);
    
    audioManager.setMuted(true);
    expect(audioManager.isMuted()).toBe(true);

    audioManager.toggleMute();
    expect(audioManager.isMuted()).toBe(false);
  });
});
