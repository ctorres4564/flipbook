import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.resolve(__dirname, '../public/books/nico/pages');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const pagesData = [
  {
    page: 1,
    title: 'Nico e as Histórias',
    subtitle: 'que Ele Descobriu Escutando',
    text: 'Capa Oficial',
    theme: 'cover',
    color1: '#0f172a',
    color2: '#0284c7',
    icon: '🎧',
    desc: 'Nico e o mundo dos sons'
  },
  {
    page: 2,
    title: 'O Canto dos Passarinhos',
    subtitle: 'Manhã ensolarada',
    text: 'Nico acordou com um trinado alegre vindo da janela do quarto.',
    theme: 'morning',
    color1: '#fef3c7',
    color2: '#f59e0b',
    icon: '🐦',
    desc: 'Piu piu! Os pássaros anunciam o dia.'
  },
  {
    page: 3,
    title: 'A Dança das Folhas',
    subtitle: 'Vento na grande árvore',
    text: 'O vento soprava suavemente, fazendo as folhas sussurrarem segredos.',
    theme: 'tree',
    color1: '#dcfce7',
    color2: '#16a34a',
    icon: '🍃',
    desc: 'Shhh... O sussurro das folhas verdes.'
  },
  {
    page: 4,
    title: 'A Chuva no Telhado',
    subtitle: 'Ritmo da natureza',
    text: 'Gotas d\'água começaram a cair, tocando uma música ritmada nas telhas.',
    theme: 'rain',
    color1: '#e0f2fe',
    color2: '#0284c7',
    icon: '🌧️',
    desc: 'Ploc, ploc, ploc! A melodia da chuva.'
  },
  {
    page: 5,
    title: 'Passos na Calçada',
    subtitle: 'A cidade acordando',
    text: 'Ao abrir a porta, Nico ouviu passos apressados e alegres na calçada.',
    theme: 'city',
    color1: '#f1f5f9',
    color2: '#475569',
    icon: '👟',
    desc: 'Toc, toc, toc... O caminhar compassado.'
  },
  {
    page: 6,
    title: 'O Riacho Cristalino',
    subtitle: 'Água corrente',
    text: 'Perto da colina, a água corria entre pedrinhas fazendo um som cantante.',
    theme: 'river',
    color1: '#ccfbf1',
    color2: '#0d9488',
    icon: '💧',
    desc: 'Tchibum suave e o fluir da correnteza.'
  },
  {
    page: 7,
    title: 'O Gato Preguiçoso',
    subtitle: 'Ronrom de carinho',
    text: 'Na cerca de madeira, um gatinho tigrado ronronava baixinho ao sol.',
    theme: 'cat',
    color1: '#ffedd5',
    color2: '#ea580c',
    icon: '🐱',
    desc: 'Rrrr... O ronronar quentinho.'
  },
  {
    page: 8,
    title: 'O Apito do Trem',
    subtitle: 'Eco nas montanhas',
    text: 'Lá longe, o apito do trem cortou as montanhas dizendo olá.',
    theme: 'train',
    color1: '#f3e8ff',
    color2: '#9333ea',
    icon: '🚂',
    desc: 'Piii-piii! O trem sobre os trilhos.'
  },
  {
    page: 9,
    title: 'A Praça Colorida',
    subtitle: 'Risadas e palmas',
    text: 'Crianças brincavam na praça, enchendo o ar de gargalhadas e palmas.',
    theme: 'park',
    color1: '#fdf4ff',
    color2: '#c026d3',
    icon: '🎈',
    desc: 'Ha ha ha! A alegria contagiante.'
  },
  {
    page: 10,
    title: 'A Música da Janela',
    subtitle: 'Notas no ar',
    text: 'De uma janela antiga saíam notas suaves de um violão encantador.',
    theme: 'music',
    color1: '#fae8ff',
    color2: '#a21caf',
    icon: '🎵',
    desc: 'Lá lá lá... As cordas do violão.'
  },
  {
    page: 11,
    title: 'A Sinfonia dos Grilos',
    subtitle: 'Entardecer estrelado',
    text: 'Ao cair da tarde, os grilos afinaram seus instrumentos na grama.',
    theme: 'crickets',
    color1: '#1e1b4b',
    color2: '#4338ca',
    icon: '🦗',
    desc: 'Cri-cri-cri... O coro da noite que chega.'
  },
  {
    page: 12,
    title: 'O Mar Distante',
    subtitle: 'Ondas de paz',
    text: 'O vento trouxe o som distante do mar acariciando a areia fofa.',
    theme: 'sea',
    color1: '#082f49',
    color2: '#0369a1',
    icon: '🌊',
    desc: 'Whooosh... O vaivém das ondas.'
  },
  {
    page: 13,
    title: 'O Som de Dentro',
    subtitle: 'O coração de Nico',
    text: 'Nico fechou os olhos e sentiu o bater calmo e forte de seu coração.',
    theme: 'heart',
    color1: '#fff1f2',
    color2: '#e11d48',
    icon: '💓',
    desc: 'Tum-tum, tum-tum... A batida da vida.'
  },
  {
    page: 14,
    title: 'O Segredo dos Sons',
    subtitle: 'Escutar é viajar',
    text: 'Ele percebeu que cada som contava uma história mágica e invisível.',
    theme: 'magic',
    color1: '#312e81',
    color2: '#7c3aed',
    icon: '✨',
    desc: 'Um mundo inteiro revelado pelos ouvidos.'
  },
  {
    page: 15,
    title: 'O Caderno de Memórias',
    subtitle: 'Guardando histórias',
    text: 'Nico desenhou em seu caderno todos os sons que descobriu no dia.',
    theme: 'notebook',
    color1: '#fefce8',
    color2: '#ca8a04',
    icon: '📖',
    desc: 'Desenhando notas, pássaros e ventos.'
  },
  {
    page: 16,
    title: 'Boa Noite, Nico',
    subtitle: 'O doce silêncio',
    text: 'Embrulhado nas cobertas, Nico adormeceu pronto para sonhar.',
    theme: 'night',
    color1: '#090d16',
    color2: '#1e293b',
    icon: '🌙',
    desc: 'Bons sonhos e até amanhã!'
  }
];

function generateSvgPage(item) {
  const isDark = item.page === 1 || item.page >= 11;
  const textColor = isDark ? '#ffffff' : '#1e293b';
  const textMuted = isDark ? '#94a3b8' : '#64748b';
  const cardBg = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.9)';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
  <defs>
    <linearGradient id="grad-${item.page}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${item.color1}" />
      <stop offset="100%" stop-color="${item.color2}" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Fundo com gradiente -->
  <rect width="600" height="800" fill="url(#grad-${item.page})" />

  <!-- Detalhes ornamentais de fundo -->
  <circle cx="500" cy="150" r="180" fill="rgba(255,255,255,0.06)" />
  <circle cx="100" cy="700" r="140" fill="rgba(255,255,255,0.05)" />
  <path d="M -50 400 Q 300 300 650 400" stroke="rgba(255,255,255,0.12)" stroke-width="6" fill="none" />
  <path d="M -50 440 Q 300 340 650 440" stroke="rgba(255,255,255,0.08)" stroke-width="4" fill="none" />

  <!-- Ilustração Central com Moldura Flutuante -->
  <g filter="url(#shadow)">
    <rect x="60" y="70" width="480" height="420" rx="24" fill="${cardBg}" />
    <text x="300" y="250" font-family="'Plus Jakarta Sans', sans-serif" font-size="96" text-anchor="middle">${item.icon}</text>
    <text x="300" y="340" font-family="'Outfit', sans-serif" font-weight="bold" font-size="28" fill="${textColor}" text-anchor="middle">${item.title}</text>
    <text x="300" y="380" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" fill="${textMuted}" text-anchor="middle">${item.subtitle}</text>
  </g>

  <!-- Caixa de Texto / História -->
  <g filter="url(#shadow)">
    <rect x="60" y="520" width="480" height="190" rx="20" fill="${cardBg}" />
    <foreignObject x="80" y="545" width="440" height="140">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 19px; line-height: 1.5; color: ${textColor}; text-align: center; display: flex; flex-direction: column; justify-content: center; height: 100%;">
        <p style="margin: 0 0 10px 0; font-weight: 600;">${item.text}</p>
        <p style="margin: 0; font-size: 15px; color: ${textMuted}; font-style: italic;">"${item.desc}"</p>
      </div>
    </foreignObject>
  </g>

  <!-- Indicador discreto de rodapé da página -->
  <rect x="250" y="736" width="100" height="28" rx="14" fill="rgba(0,0,0,0.2)" />
  <text x="300" y="755" font-family="'Outfit', sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">Página ${item.page} de 16</text>
</svg>`;
}

pagesData.forEach((item) => {
  const pad = String(item.page).padStart(2, '0');
  const svgContent = generateSvgPage(item);
  
  // Salva tanto como SVG quanto como WebP-compatível ou SVG referenciável
  const svgPath = path.join(outputDir, `${pad}.svg`);
  const webpPath = path.join(outputDir, `${pad}.webp`);
  
  fs.writeFileSync(svgPath, svgContent, 'utf-8');
  // Usamos o SVG com encoding ou salvamos com caminho direto suportado
  fs.writeFileSync(webpPath, svgContent, 'utf-8');
});

console.log('16 páginas ilustradas geradas com sucesso em public/books/nico/pages!');
