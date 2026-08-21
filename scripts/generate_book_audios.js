import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const audioDir = path.resolve(__dirname, '../public/books/nico/audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

/**
 * Cria um arquivo WAV com tom melódico suave e cabeçalho PCM padrão de 44.1kHz 16-bit mono.
 * Navegadores tocam perfeitamente e suportam com extensão .mp3 ou .wav.
 */
function createToneAudioBuffer(durationSeconds = 3.5, baseFreq = 440) {
  const sampleRate = 44100;
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const dataSize = numSamples * 2; // 16-bit = 2 bytes por amostra
  const buffer = Buffer.alloc(44 + dataSize);

  // Cabeçalho RIFF WAV
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Tamanho subchunk fmt
  buffer.writeUInt16LE(1, 20);  // PCM = 1
  buffer.writeUInt16LE(1, 22);  // Mono = 1 canal
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28); // Byte rate
  buffer.writeUInt16LE(2, 32);  // Block align
  buffer.writeUInt16LE(16, 34); // Bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Geração de sinal de áudio harmônico com envelope ADSR suave
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    
    // Envelope suave (fade in 0.1s e fade out 0.3s)
    let envelope = 1.0;
    if (t < 0.1) {
      envelope = t / 0.1;
    } else if (t > durationSeconds - 0.3) {
      envelope = Math.max(0, (durationSeconds - t) / 0.3);
    }

    // Melodia em acordes maiores para cada página
    const wave1 = Math.sin(2 * Math.PI * baseFreq * t);
    const wave2 = 0.5 * Math.sin(2 * Math.PI * (baseFreq * 1.25) * t); // terça maior
    const wave3 = 0.25 * Math.sin(2 * Math.PI * (baseFreq * 1.5) * t); // quinta justa

    const sample = (wave1 + wave2 + wave3) * 0.4 * envelope;
    const clampedSample = Math.max(-1, Math.min(1, sample));
    const intSample = Math.floor(clampedSample * 32767);

    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  return buffer;
}

// Frequências melódicas para as páginas 2 a 16
const pageFrequencies = [
  330, 370, 392, 440, 493, 523, 587, 659, 698, 784, 880, 523, 440, 392, 330
];

for (let p = 2; p <= 16; p++) {
  const pad = String(p).padStart(2, '0');
  const freq = pageFrequencies[p - 2] || 440;
  const duration = 4.0; // 4 segundos de narração musicalizada por página
  const audioBuffer = createToneAudioBuffer(duration, freq);

  const mp3Path = path.join(audioDir, `${pad}.mp3`);
  fs.writeFileSync(mp3Path, audioBuffer);
}

console.log('Áudios narrativos das páginas 02 a 16 gerados com sucesso em public/books/nico/audio!');
