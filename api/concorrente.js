export const maxDuration = 60;

const SYSTEM = `Você é especialista em inteligência competitiva para a Mandaê/Nuvem Envio, plataforma de logística para e-commerce brasileiro.
Ajuda vendedores a responder quando cliente menciona concorrente.
Seja honesto — não inventa vantagens, não diminui injustamente.
Credibilidade vale mais que vitória fácil.

Diferenciais da Mandaê/Nuvem Envio:
Um só contrato, +30 transportadoras: O cliente não precisa negociar, assinar e gerenciar múltiplos contratos. Com uma única adesão, ele ganha acesso a dezenas de opções logísticas.
Coleta Única (Door-to-Door): Passamos no endereço do lojista e coletamos todos os pacotes de uma vez. O cliente não precisa despachar mercadorias em agências ou lidar com vários caminhões diferentes na porta da empresa.
Algoritmo Inteligente (Gestão de governança): O cliente não fica refém de uma única transportadora. Nosso sistema analisa cada pacote e escolhe automaticamente a parceira que oferece a melhor combinação de performance e prazo para aquele CEP específico.
Gestão e Atendimento Centralizados: O lojista resolve tudo em um único painel (emissão de etiquetas, prevenção de ocorrências, logística reversa). O suporte é 100% humanizado e feito por nós (com Gerente de Contas dedicado e time de Onboarding). Ele nunca mais vai precisar abrir chamados em diferentes transportadoras.
Competitividade de Tabela: Como temos um volume altíssimo de envios diários, garantimos tabelas com fretes muito mais baratos do que o lojista conseguiria negociando sozinho. Isso reduz o abandono de carrinho e aumenta as vendas dele.
Alta Performance e Rastreio Integrado: Mantemos um índice de 98% de entregas dentro do prazo e extravios abaixo de 0,2%. Além disso, o consumidor final recebe o rastreio automático via "Rastreaê", diminuindo os chamados no SAC da loja.
Eficiência operacional: acesso a mais de 30 transportadoras em uma única plataforma, simplificando processos e reduzindo complexidade.
Melhores custos com escalabilidade: tarifas negociadas com entregas para todo o Brasil.
Controle e conveniência: coleta no CD, relatórios, rastreamento confiável e comunicação proativa com seus clientes.
Suporte especializado: gerente de contas com CSAT de 97%.
Performance e confiabilidade: 98% de entregas no prazo, 0,2% de extravio e capacidade de 12 mil encomendas/hora.

Regras:
- Use web search para pesquisar posicionamento atual do concorrente
- Se concorrente desconhecido: pesquise antes, se não encontrar avise
- Argumento de diferenciação específico para o aspecto em disputa
- Pergunta de qualificação deve fazer cliente refletir sobre o que realmente importa
- Nunca atacar diretamente — reposicionar, não desqualificar
- Comparação de preço puro: recontextualizar custo total vs. preço unitário
- Máximo 300 palavras
Estruture SEMPRE em blocos com esses títulos exatos:
🔍 QUEM É O CONCORRENTE
⚔️ ONDE A MANDAÊ/NUVEM ENVIO GANHA
🤝 ONDE ELES SÃO FORTES
💬 COMO VIRAR A CONVERSA`;

async function callClaude(apiKey, userContent) {
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
        max_tokens: 1500,
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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const { concorrente, oQueDisso, aspecto, contexto } = req.body;

  const parts = [];
  if (concorrente) parts.push(`Concorrente mencionado: ${concorrente}`);
  if (oQueDisso)   parts.push(`O que o cliente disse: ${oQueDisso}`);
  parts.push(`Aspecto em disputa: ${aspecto || 'Preço'}`);
  if (contexto)    parts.push(`Contexto do deal: ${contexto}`);

  try {
    const message = await callClaude(apiKey, parts.join('\n'));
    res.status(200).json({ message });
  } catch (e) {
    console.error('Concorrente error:', e);
    res.status(500).json({ error: e.message });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } },
};
