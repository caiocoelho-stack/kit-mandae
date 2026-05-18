const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const CACHE_KEY = "alerta_diario";

async function kvGet(key) {
  if (!KV_URL || !KV_TOKEN) return null;
  const r = await fetch(`${KV_URL}/get/${key}`, { headers: { Authorization: `Bearer ${KV_TOKEN}` } });
  const d = await r.json();
  return d.result ? JSON.parse(d.result) : null;
}

async function kvSet(key, value, ex = 90000) {
  if (!KV_URL || !KV_TOKEN) return;
  await fetch(`${KV_URL}/set/${key}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: JSON.stringify(value), ex })
  });
}

const SYSTEM = `Voce e analista de mercado especializado em e-commerce e logistica no Brasil, escrevendo para vendedores da Mandae/Nuvem Envio. Objetivo: encontrar UMA noticia ou tendencia das ultimas 48h. Responda APENAS neste JSON sem texto fora: {"titulo":"","o_que_esta_acontecendo":"","por_que_importa":"","gancho_para_call":"","fonte":"","data_busca":""}`;
const USER = `Busque noticias recentes sobre e-commerce e logistica no Brasil (ultimas 48h). Selecione a mais relevante para vendedores negociando com lojistas agora.`;

async function callClaude(apiKey, retryCount = 0) {
  let messages = [{ role: 'user', content: USER }];
  for (let turn = 0; turn < 3; turn++) {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-beta': 'web-search-2025-03-05' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1024, system: SYSTEM, tools: [{ type: 'web_search_20250305', name: 'web_search' }], messages })
    });
    if (r.status === 429) {
      if (retryCount >= 1) throw new Error('Rate limit');
      await new Promise(res => setTimeout(res, 15000));
      return callClaude(apiKey, retryCount + 1);
    }
    if (!r.ok) throw new Error(`Claude API ${r.status}: ${await r.text()}`);
    const d = await r.json();
    if (d.stop_reason === 'end_turn') {
      const t = d.content.filter(b => b.type === 'text');
      return t[t.length - 1]?.text ?? '';
    }
    if (d.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: d.content });
      messages.push({ role: 'user', content: d.content.filter(b => b.type === 'tool_use').map(b => ({ type: 'tool_result', tool_use_id: b.id, content: '' })) });
    } else {
      const t = d.content.filter(b => b.type === 'text');
      return t[t.length - 1]?.text ?? '';
    }
  }
  throw new Error('Max turns');
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

  // Verifica cache KV
  try {
    const cached = await kvGet(CACHE_KEY);
    console.log('[alerta] KV result:', cached ? `hit (${cached.date})` : 'miss');
    if (cached?.date === hoje && cached?.data) {
      console.log('[alerta] cache hit — sem custo');
      return res.json(cached.data);
    }
  } catch (e) {
    console.error('[alerta] KV erro:', e.message);
  }

  // Gera novo alerta
  console.log('[alerta] gerando novo alerta...');
  try {
    const text = await callClaude(apiKey);
    const parsed = parseJson(text);
    try {
      await kvSet(CACHE_KEY, { date: hoje, data: parsed });
      console.log('[alerta] salvo no KV');
    } catch (e) {
      console.error('[alerta] KV save erro:', e.message);
    }
    res.json(parsed);
  } catch (e) {
    console.error('[alerta] erro:', e.message);
    res.status(500).json({ error: e.message });
  }
}
