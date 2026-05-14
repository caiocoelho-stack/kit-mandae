export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { clausula, areas, nomeCliente, porte, pedidoCliente, urgencia, impacto } = req.body;

  const userPrompt = [
    clausula       && `Cláusula/assunto: ${clausula}`,
    areas?.length  && `Áreas responsáveis: ${areas.join(', ')}`,
    nomeCliente    && `Cliente: ${nomeCliente}`,
    porte          && `Porte: ${porte}`,
    pedidoCliente  && `O que o cliente quer: ${pedidoCliente}`,
    urgencia       && `Urgência: ${urgencia}`,
    impacto        && `Impacto se não aprovar: ${impacto}`,
  ].filter(Boolean).join('\n');

  try {
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
        system: `Você gera mensagens internas para o Slack da Mandaê/Nuvem Envio.
Tom: direto, objetivo, zero rodeio — comunicação entre colegas.
Estrutura obrigatória:
1. Linha de abertura: identificação rápida do assunto
2. Contexto: cliente + deal (1-2 linhas)
3. O que precisa de aprovação: pedido claro e objetivo
4. Prazo: quando precisa de resposta
5. Impacto: o que acontece se não aprovar a tempo
Formatação Slack: *negrito*, bullet com •, máximo 150 palavras.
🔴 se urgência CRÍTICO | 🟡 se URGENTE | sem emoji se NORMAL.
CRÍTICO → linha final obrigatória: 'Preciso de retorno hoje.'
Múltiplas áreas → uma mensagem mencionando todas.
Impacto vazio → inferir algo genérico sem inventar dados específicos.
Responda APENAS com a mensagem Slack, sem explicações.`,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    const data = await response.json();
    const message = data.content?.[0]?.text || 'Erro ao gerar mensagem.';
    res.status(200).json({ message });
  } catch (e) {
    console.error('Slack error:', e);
    res.status(500).json({ error: 'Erro interno ao gerar a mensagem Slack.' });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } },
};
