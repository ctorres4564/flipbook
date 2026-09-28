import fs from 'fs';
import path from 'path';

const imgDir = path.resolve('livro_theo_tem_uma_historia_pra_contar/assets/imagens');
const audioDir = path.resolve('livro_theo_tem_uma_historia_pra_contar/audios');

console.log('--- IMAGENS ---');
const images = fs.readdirSync(imgDir).sort();
images.forEach(f => {
  const stat = fs.statSync(path.join(imgDir, f));
  console.log(`${f} (${stat.size} bytes)`);
});

console.log('--- AUDIOS ---');
const audios = fs.readdirSync(audioDir).sort();
audios.forEach(f => {
  const stat = fs.statSync(path.join(audioDir, f));
  console.log(`${f} (${stat.size} bytes)`);
});
