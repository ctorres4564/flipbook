/**
 * Gerador de efeitos sonoros procedurais para folheio de páginas (Web Audio API)
 * Funciona 100% offline, sem carregar arquivos de áudio externos e com latência zero.
 */

class SoundEffectManager {
  private audioCtx: AudioContext | null = null;
  private isEnabled: boolean = true;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    return this.audioCtx;
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Reproduz um efeito suave e natural de virada de página de papel (paper flip)
   */
  public playPageFlipSound(): void {
    if (!this.isEnabled) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const duration = 0.18; // 180ms
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);

      // Gera ruído filtrado (textura de papel folheando)
      let lastVal = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Filtro passa-baixa simples para simular fricção suave de celulose
        lastVal = lastVal * 0.7 + white * 0.3;
        output[i] = lastVal;
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;

      // Filtro Biquad passa-banda para dar o tom acústico do papel
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      filter.Q.setValueAtTime(1.8, ctx.currentTime);

      // Envelope de ganho rápido com decaimento suave
      const gainNode = ctx.createGain();
      const now = ctx.currentTime;
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.22, now + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      noiseNode.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      noiseNode.start(now);
      noiseNode.stop(now + duration);
    } catch {
      // Ignora silenciosamente em navegadores restritivos de autoplay
    }
  }
}

export const soundEffects = new SoundEffectManager();
