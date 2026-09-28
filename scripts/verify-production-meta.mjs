async function check(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'WhatsApp/2.21.12.21 A'
    }
  });
  const text = await res.text();
  console.log(`\n=== ${url} (HTTP ${res.status}) ===`);
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.includes('<title>') || line.includes('og:') || line.includes('twitter:')) {
      console.log(line.trim());
    }
  }
}

async function run() {
  await check('https://theo.folheia.com');
  await check('https://theo.folheia.com/livros/theo');
  await check('https://nico.folheia.com');
  await check('https://folheia.com');
}

run();
