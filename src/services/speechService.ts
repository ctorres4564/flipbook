/**
 * Serviço de Síntese de Voz (Web Speech API) para Leitura Acessível em Voz Alta (pt-BR)
 */

export type SpeechState = 'IDLE' | 'SPEAKING' | 'PAUSED' | 'ERROR';

export interface SpeechListener {
  onStateChange?: (state: SpeechState) => void;
  onBoundary?: (charIndex: number, textLength: number) => void;
  onEnded?: () => void;
}

class BrowserSpeechManager {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private state: SpeechState = 'IDLE';
  private listeners: Set<SpeechListener> = new Set();
  private ptBrVoice: SpeechSynthesisVoice | null = null;
  private currentText: string = '';

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();

      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices(): void {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prioriza vozes pt-BR de qualidade natural
    const ptVoices = voices.filter(
      (v) => v.lang === 'pt-BR' || v.lang === 'pt_BR' || v.lang.startsWith('pt')
    );

    // Prioriza vozes do sistema reconhecidas por clareza (Google, Microsoft, Letícia, Francisca, Luciana)
    this.ptBrVoice =
      ptVoices.find((v) => v.name.includes('Google') || v.name.includes('Natural')) ||
      ptVoices.find((v) => v.lang === 'pt-BR') ||
      ptVoices[0] ||
      null;
  }

  public isSupported(): boolean {
    return Boolean(this.synth);
  }

  public getState(): SpeechState {
    return this.state;
  }

  public subscribe(listener: SpeechListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyState(newState: SpeechState): void {
    this.state = newState;
    this.listeners.forEach((l) => l.onStateChange?.(newState));
  }

  public speak(text: string): void {
    if (!this.synth) return;

    this.stop();
    this.currentText = text.trim();

    if (!this.currentText) {
      this.notifyState('IDLE');
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(this.currentText);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.95; // Cadência ligeiramente mais calma para compreensão ideal
      utterance.pitch = 1.0;

      if (this.ptBrVoice) {
        utterance.voice = this.ptBrVoice;
      }

      utterance.onstart = () => {
        this.notifyState('SPEAKING');
      };

      utterance.onpause = () => {
        this.notifyState('PAUSED');
      };

      utterance.onresume = () => {
        this.notifyState('SPEAKING');
      };

      utterance.onend = () => {
        this.notifyState('IDLE');
        this.listeners.forEach((l) => l.onEnded?.());
      };

      utterance.onerror = (e) => {
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('Erro na síntese de voz:', e);
          this.notifyState('ERROR');
        } else {
          this.notifyState('IDLE');
        }
      };

      utterance.onboundary = (e) => {
        if (e.name === 'word') {
          this.listeners.forEach((l) =>
            l.onBoundary?.(e.charIndex, this.currentText.length)
          );
        }
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    } catch (err) {
      console.warn('Erro ao inicializar fala:', err);
      this.notifyState('ERROR');
    }
  }

  public pause(): void {
    if (this.synth && this.state === 'SPEAKING') {
      this.synth.pause();
      this.notifyState('PAUSED');
    }
  }

  public resume(): void {
    if (this.synth && this.state === 'PAUSED') {
      this.synth.resume();
      this.notifyState('SPEAKING');
    }
  }

  public stop(): void {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // ignore
      }
    }
    this.currentUtterance = null;
    this.notifyState('IDLE');
  }

  public getCurrentUtterance(): SpeechSynthesisUtterance | null {
    return this.currentUtterance;
  }

  public toggle(text: string): void {
    if (this.state === 'SPEAKING') {
      this.pause();
    } else if (this.state === 'PAUSED') {
      this.resume();
    } else {
      this.speak(text);
    }
  }
}

export const browserSpeech = new BrowserSpeechManager();
