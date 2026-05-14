import fs from 'fs';
import path from 'path';

const manual = fs.readFileSync(
  path.join(process.cwd(), 'public', 'manual.txt'), 'utf-8'
);

const SYSTEM = `Você é especialista jurídico-comercial da Mandaê/Nuvem Envio.
Analisa contratos comentados por clientes comparando com o manual
de negociação interno.
Para cada cláusula alterada ou comentada:
1. Identifique o pedido do cliente
2. Compare com o manual
3. Classifique: ACEITAR (dentro das margens) / NEGOCIAR (fora do padrão mas há margem) / ESCALAR (requer jurídico interno)
4. Sugira resposta ou caminho
Cláusula completamente nova → classifique como ESCALAR com label 'NOVA'.
Responda SOMENTE em JSON válido sem markdown:
{
  "clausulas": [{
    "numero": "string|null",
    "titulo": "string",
    "pedido_cliente": "string",
    "status": "ACEITAR|NEGOCIAR|ESCALAR",
    "is_nova": false,
    "justificativa": "string",
    "sugestao": "string"
  }],
  "resumo": "string",
  "proximo_passo": "string",
  "email_retorno": "string com Assunto: na primeira linha"
}`;

async function callClaude(conteudo, contexto, extraInstruction = '') {
  const userContent = `Manual de negociação interno:\n${manual}\n\n---\nContrato comentado pelo cliente:\n${conteudo}${contexto ? `\n\n---\nContexto do deal: ${contexto}` : ''}${extraInstruction ? `\n\n${extraInstruction}` : ''}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM,
      messages: [{ role: 'user', content: userContent }],
    }),
  });

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  let { conteudoContrato, contexto } = req.body;

  if (!conteudoContrato) return res.status(400).json({ error: 'conteudoContrato obrigatório' });

  if (conteudoContrato.length > 12000) {
    conteudoContrato = conteudoContrato.slice(0, 12000);
  }

  let text = await callClaude(conteudoContrato, contexto);

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    text = await callClaude(conteudoContrato, contexto, 'responda APENAS com JSON válido, sem markdown, sem texto adicional');
    try {
      parsed = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: 'Falha ao obter JSON válido da API.' });
    }
  }

  res.status(200).json(parsed);
}

export const config = {
  api: { bodyParser: { sizeLimit: '2mb' } },
};
