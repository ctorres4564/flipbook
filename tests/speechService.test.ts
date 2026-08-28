import { describe, it, expect, vi, beforeEach } from 'vitest';
import { browserSpeech } from '../src/services/speechService';
import { soundEffects } from '../src/utils/soundEffects';

describe('Speech Service & Sound Effects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve verificar suporte e estado inicial de browserSpeech', () => {
    expect(browserSpeech.getState()).toBe('IDLE');
  });

  it('deve permitir habilitar e desabilitar soundEffects com segurança', () => {
    expect(() => soundEffects.setEnabled(false)).not.toThrow();
    expect(() => soundEffects.playPageFlipSound()).not.toThrow();
    expect(() => soundEffects.setEnabled(true)).not.toThrow();
  });
});
