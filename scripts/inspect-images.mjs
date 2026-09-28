import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const imgDir = path.resolve('livro_theo_tem_uma_historia_pra_contar/assets/imagens');
const files = fs.readdirSync(imgDir).filter(f => f.endsWith('.png'));

for (const file of files) {
  const meta = await sharp(path.join(imgDir, file)).metadata();
  console.log(`${file}: ${meta.width}x${meta.height}, format=${meta.format}`);
}
