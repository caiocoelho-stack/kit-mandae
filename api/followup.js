export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { nomeCliente, empresa, momento, canal, tom, contexto, diasSemResposta } = req.body;

  let userPrompt = `Gere um follow-up para:\n`;
  if (nomeCliente) userPrompt += `- Cliente: ${nomeCliente}\n`;
  if (empresa)     userPrompt += `- Empresa: ${empresa}\n`;
  userPrompt += `- Momento: ${momento}\n`;
  userPrompt += `- Canal: ${canal}\n`;
  userPrompt += `- Tom: ${tom}\n`;
  if (momento === 'Sem resposta há dias' && diasSemResposta)
    userPrompt += `- Dias sem resposta: ${diasSemResposta}\n`;
  if (contexto) userPrompt += `- Contexto / última interação: ${contexto}\n`;

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
      system: `Você é especialista em comunicação comercial B2B para a Mandaê/Nuvem Envio, plataforma de logística para e-commerce brasileiro.
Regras obrigatórias:
- NUNCA use: "só passando para verificar", "tudo bem?", "espero que esteja bem", "como posso ajudar", "fico à disposição"
- Seja direto, humano, gere valor real em cada mensagem
- WhatsApp: máximo 5 linhas, linguagem próxima, sem formalidade
- E-mail: primeira linha "Assunto: [assunto]", depois corpo estruturado
- Ligação: três blocos exatos: [Abertura] / [Desenvolvimento] / [Fechamento]
- CTA claro e específico, uma ação só
- "Cliente sumiu": leve, sem cobrança, reativa interesse com valor
- "Renovação": foque no valor já entregue antes de qualquer pitch
- Responda APENAS com a mensagem, sem explicações, sem prefácio`,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  const data = await response.json();
  const message = data.content?.[0]?.text || 'Erro ao gerar mensagem.';
  res.status(200).json({ message });
}

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } },
};
