import { AudioState, AudioProgress, AudioListenerEvents } from '../types/audio';

/**
 * Orquestrador central de áudio (P0)
 * Garante zero sobreposição sonora, cancelamento atômico e sincronia estrita por página.
 */
export class AudioManager {
  private audio: HTMLAudioElement | null = null;
  private state: AudioState = 'IDLE';
  private currentUrl: string | null = null;
  private listeners: AudioListenerEvents[] = [];
  private currentPlayPromise: Promise<void> | null = null;
  private isUserMuted: boolean = false;
  private playRequestId: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.setupAudioListeners();
    }
  }

  private setupAudioListeners(): void {
    if (!this.audio) return;

    this.audio.addEventListener('playing', () => {
      this.setState('PLAYING');
    });

    this.audio.addEventListener('pause', () => {
      // Se estava tocando e não estiver em carregamento ou idle
      if (this.state === 'PLAYING') {
        this.setState('PAUSED');
      }
    });

    this.audio.addEventListener('timeupdate', () => {
      this.notifyProgress();
    });

    this.audio.addEventListener('ended', () => {
      this.setState('IDLE');
      this.listeners.forEach((l) => l.onEnded?.());
    });

    this.audio.addEventListener('error', () => {
      if (this.currentUrl) {
        this.setState('ERROR');
        this.listeners.forEach((l) => l.onError?.(this.audio?.error || null));
      }
    });
  }

  private setState(newState: AudioState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.listeners.forEach((l) => l.onStateChange?.(newState));
    }
  }

  private notifyProgress(): void {
    if (!this.audio || isNaN(this.audio.duration)) return;
    const currentTime = this.audio.currentTime || 0;
    const duration = this.audio.duration || 0;
    const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    const progress: AudioProgress = { currentTime, duration, percentage };
    this.listeners.forEach((l) => l.onProgress?.(progress));
  }

  public getState(): AudioState {
    return this.state;
  }

  public getCurrentAudioUrl(): string | null {
    return this.currentUrl;
  }

  public isMuted(): boolean {
    return this.isUserMuted;
  }

  public setMuted(muted: boolean): void {
    this.isUserMuted = muted;
    if (this.audio) {
      this.audio.muted = muted;
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isUserMuted);
    return this.isUserMuted;
  }

  /**
   * P0: Carrega e reproduz o áudio da nova página interrompendo atomicamente o anterior
   */
  public async loadAndPlay(audioUrl: string | null, shouldAutoPlay: boolean = true): Promise<void> {
    const requestId = ++this.playRequestId;

    // 1. Interrompe e zera o áudio anterior imediatamente
    this.stopAndReset();

    if (!audioUrl || !this.audio) {
      this.currentUrl = null;
      this.setState('IDLE');
      return;
    }

    this.currentUrl = audioUrl;
    this.setState('LOADING');

    try {
      this.audio.src = audioUrl;
      this.audio.muted = this.isUserMuted;
      this.audio.load();

      // Se outra requisição de play foi iniciada durante o load, aborta esta
      if (requestId !== this.playRequestId) {
        return;
      }

      if (shouldAutoPlay) {
        this.currentPlayPromise = this.audio.play();
        await this.currentPlayPromise;
        if (requestId === this.playRequestId) {
          this.setState('PLAYING');
        }
      } else {
        this.setState('PAUSED');
      }
    } catch (err: unknown) {
      if (requestId !== this.playRequestId) {
        return; // Requisição superada por nova página
      }

      // Trata interrupção esperada por pausa ou cancelamento sem erro
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }

      // Trata bloqueio de autoplay do navegador sem crash
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        this.setState('BLOCKED');
      } else {
        console.warn('Erro na reprodução de áudio:', err);
        this.setState('ERROR');
      }
    } finally {
      this.currentPlayPromise = null;
    }
  }

  public async play(): Promise<void> {
    if (!this.audio || !this.currentUrl) return;
    try {
      this.currentPlayPromise = this.audio.play();
      await this.currentPlayPromise;
      this.setState('PLAYING');
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        this.setState('BLOCKED');
      } else {
        this.setState('ERROR');
      }
    }
  }

  public pause(): void {
    if (!this.audio) return;
    this.audio.pause();
    this.setState('PAUSED');
  }

  public togglePlay(): void {
    if (this.state === 'PLAYING') {
      this.pause();
    } else {
      this.play();
    }
  }

  public async restart(): Promise<void> {
    if (!this.audio || !this.currentUrl) return;
    this.audio.currentTime = 0;
    await this.play();
  }

  public stopAndReset(): void {
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
      } catch (err: unknown) {
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          console.warn('Aviso ao resetar elemento de áudio:', err);
        }
      }
    }
    this.setState('IDLE');
    const resetProgress: AudioProgress = { currentTime: 0, duration: 0, percentage: 0 };
    this.listeners.forEach((l) => l.onProgress?.(resetProgress));
  }

  public subscribe(events: AudioListenerEvents): () => void {
    this.listeners.push(events);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== events);
    };
  }

  public destroy(): void {
    this.stopAndReset();
    if (this.audio) {
      this.audio.src = '';
      this.audio = null;
    }
    this.listeners = [];
  }
}

// Instância singleton para uso em todo o leitor
export const globalAudioManager = new AudioManager();
