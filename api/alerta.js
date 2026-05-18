const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const CACHE_KEY = "alerta_diario";

const FEEDS = [
  'https://www.ecommercebrasil.com.br/feed/rss/?post_type=noticias',
  'https://www.ecommercebrasil.com.br/feed/rss/?post_type=artigos',
  'https://mercadoeconsumo.com.br/feed/',
  'https://www.logisticadescomplicada.com/feed/',
  'https://www.nuvemshop.com.br/blog/feed/',
  'https://canaltech.com.br/rss/',
];

async function kvCmd(cmd) {
  const r = await fetch(KV_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd)
  });
  const d = await r.json();
  return d.result;
}

async function kvGet(key) {
  if (!KV_URL || !KV_TOKEN) return null;
  const result = await kvCmd(['GET', key]);
  if (!result) return null;
  if (typeof result === 'string') { try { return JSON.parse(result); } catch { return null; } }
  if (result.value !== undefined && result.date === undefined) { try { return JSON.parse(result.value); } catch { return null; } }
  return result;
}

async function kvSet(key, value, ex = 90000) {
  if (!KV_URL || !KV_TOKEN) return;
  await kvCmd(['SETEX', key, String(ex), JSON.stringify(value)]);
}

function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null && items.length < 4) {
    const item = match[1];
    const title = (item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || item.match(/<title>([\s\S]*?)<\/title>/))?.[1] || '';
    const desc = (item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || item.match(/<description>([\s\S]*?)<\/description>/))?.[1] || '';
    const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '';
    const clean = (s) => s.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, ' ').trim();
    if (clean(title)) items.push({ title: clean(title), desc: clean(desc).slice(0, 120), pubDate: pubDate.trim() });
  }
  return items;
}

async function fetchFeeds() {
  const results = await Promise.allSettled(
    FEEDS.map(url => fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then(r => r.text()))
  );
  const all = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      const items = parseRSS(r.value);
      console.log(`[feed] ${FEEDS[i].split('/')[2]}: ${items.length} items`);
      all.push(...items);
    } else {
      console.log(`[feed] ${FEEDS[i].split('/')[2]}: falhou`);
    }
  });
  return all.slice(0, 20);
}

async function callHaiku(apiKey, headlines) {
  const content = headlines.map((h, i) => `${i+1}. ${h.title}${h.desc ? ' — ' + h.desc : ''} (${h.pubDate})`).join('\n');
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `Você é analista de mercado para vendedores da Mandaê/Nuvem Envio (transportadora brasileira).

Notícias recentes de e-commerce e logística no Brasil:
${content}

Selecione a MAIS RELEVANTE para um vendedor negociando com lojistas AGORA (frete, entrega, marketplaces, tributação, tendências).

Responda APENAS com este JSON válido, sem texto fora dele:
{"titulo":"máx 10 palavras","o_que_esta_acontecendo":"2-3 frases factuais","por_que_importa":"1-2 frases sobre impacto no lojista","gancho_para_call":"frase pronta entre aspas para o vendedor usar na call","fonte":"nome do portal","data_busca":"${new Date().toLocaleDateString('pt-BR')}"}`
      }]
    })
  });
  if (!r.ok) throw new Error(`Haiku ${r.status}: ${await r.text()}`);
  const d = await r.json();
  return d.content[0]?.text ?? '';
}

function parseJson(t) {
  const m = t.replace(/```json|```/g, '').trim().match(/\{[\s\S]*\}/);
  if (!m) throw new Error('No JSON');
  return JSON.parse(m[0]);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key missing' });
  const hoje = new Date().toDateString();

  try {
    const cached = await kvGet(CACHE_KEY);
    console.log('[alerta] cache:', cached?.date, '| hoje:', hoje, '| hit:', cached?.date === hoje);
    if (cached?.date === hoje && cached?.data) {
      console.log('[alerta] CACHE HIT');
      return res.json(cached.data);
    }
  } catch (e) {
    console.error('[alerta] KV get erro:', e.message);
  }

  console.log('[alerta] buscando RSS...');
  try {
    const headlines = await fetchFeeds();
    if (headlines.length === 0) throw new Error('Nenhum feed disponivel');
    console.log(`[alerta] ${headlines.length} headlines coletadas, chamando Haiku...`);
    const text = await callHaiku(apiKey, headlines);
    const parsed = parseJson(text);
    await kvSet(CACHE_KEY, { date: hoje, data: parsed });
    console.log('[alerta] salvo no KV');
    res.json(parsed);
  } catch (e) {
    console.error('[alerta] erro:', e.message);
    res.status(500).json({ error: e.message });
  }
}
