export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { tipoReuniao, nomeCliente, empresa, objetivo, contexto, preocupacoes } = req.body;

  const parts = [];
  if (nomeCliente || empresa)
    parts.push(`Cliente: ${[nomeCliente, empresa].filter(Boolean).join(' — ')}`);
  parts.push(`Tipo de reunião: ${tipoReuniao || 'Discovery'}`);
  if (objetivo)    parts.push(`Objetivo do vendedor: ${objetivo}`);
  if (contexto)    parts.push(`Contexto atual: ${contexto}`);
  else             parts.push(`Contexto: não informado`);
  if (preocupacoes) parts.push(`Preocupações/objeções conhecidas: ${preocupacoes}`);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: `Você é um coach comercial sênior especializado em vendas B2B de logística e e-commerce no Brasil, com profundo conhecimento da Mandaê/Nuvem Envio.
Prepare vendedores para reuniões com clientes e prospects.
Entregue briefings diretos, práticos e acionáveis — não teoria, não genérico.
Regras:
- Perguntas de abertura devem ser abertas, específicas ao contexto, nunca genéricas
- Talking points devem conectar serviços da Mandaê/Nuvem Envio com a realidade descrita
- Objeções esperadas devem ser realistas para o tipo e momento do funil
- Próximo passo deve ser específico com prazo sugerido
- Discovery sem contexto: foque 80% em perguntas, minimize talking points
- Reativação: reconheça o silêncio antes de qualquer pitch
- QBR: adicione bloco extra '📊 DADOS PARA LEVAR' após o bloco de objetivo
- Tom: direto, como colega experiente antes da call
- Máximo 350 palavras no total
Estruture SEMPRE em blocos com esses títulos exatos:
🎯 OBJETIVO DA REUNIÃO
❓ PERGUNTAS DE ABERTURA
💬 TALKING POINTS
⚠️ OBJEÇÕES ESPERADAS
✅ PRÓXIMO PASSO IDEAL`,
      messages: [{ role: 'user', content: parts.join('\n') }],
    }),
  });

  const data = await response.json();
  const message = data.content?.[0]?.text || 'Erro ao gerar briefing.';
  res.status(200).json({ message });
}

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } },
};
