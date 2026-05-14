export const maxDuration = 60;

const SYSTEM = `Você é analista de mercado especializado em e-commerce e logística \
no Brasil, escrevendo para vendedores da Mandaê/Nuvem Envio.
Objetivo: encontrar UMA notícia ou tendência das últimas 48h que \
vendedores possam usar como gancho com clientes de e-commerce.
Temas prioritários:
1. Mudanças em frete, tributação ou regulação logística
2. Movimentos de marketplaces (Mercado Livre, Shopee, Amazon BR)
3. Tendências de consumo ou sazonalidade próxima
4. Concorrentes ou novidades do setor de envios
5. E-commerce brasileiro em geral
Responda SEMPRE neste JSON sem texto fora dele:
{
  "titulo": "string curta (max 10 palavras)",
  "o_que_esta_acontecendo": "string (2-3 frases, factual)",
  "por_que_importa": "string (1-2 frases, impacto no cliente)",
  "gancho_para_call": "string (frase pronta, começa com aspas)",
  "fonte": "string (veículo ou origem)",
  "data_busca": "string"
}`;

const USER = `Busque as notícias mais recentes sobre e-commerce e logística no Brasil \
(últimas 48h). Selecione a mais relevante e útil para vendedores negociando com lojistas agora.`;

async function callClaude(apiKey, extraInstruction = '') {
  const userContent = extraInstruction ? `${USER}\n\n${extraInstruction}` : USER;
  let messages = [{ role: 'user', content: userContent }];

  for (let turn = 0; turn < 8; turn++) {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: SYSTEM,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages,
      }),
    });

    if (!r.ok) throw new Error(`Claude API ${r.status}: ${await r.text()}`);
    const d = await r.json();

    if (d.stop_reason === 'end_turn') {
      const textBlocks = d.content.filter(b => b.type === 'text');
      return textBlocks[textBlocks.length - 1]?.text ?? '';
    }

    if (d.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: d.content });
      const results = d.content
        .filter(b => b.type === 'tool_use')
        .map(b => ({ type: 'tool_result', tool_use_id: b.id, content: '' }));
      messages.push({ role: 'user', content: results });
    } else {
      const textBlocks = d.content.filter(b => b.type === 'text');
      return textBlocks[textBlocks.length - 1]?.text ?? '';
    }
  }

  throw new Error('Search loop exceeded max turns');
}

function parseJson(text) {
  const cleaned = text.replace(/```json|```/g, '').trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON found in response');
  return JSON.parse(match[0]);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  try {
    const text = await callClaude(apiKey);
    let parsed;
    try {
      parsed = parseJson(text);
    } catch (e) {
      console.error('Alerta error (first parse):', e.message, '\nText:', text.slice(0, 300));
      const text2 = await callClaude(apiKey, 'Responda APENAS com o JSON, sem texto antes ou depois, sem markdown.');
      parsed = parseJson(text2);
    }
    res.json(parsed);
  } catch (e) {
    console.error('Alerta error:', e);
    res.status(500).json({ error: e.message });
  }
}
