export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { fileBase64, mimeType, tone, sellerName, includeNuvem, includeNext, markComercial } = req.body;

  const toneMap = {
    informal: "próximo e descontraído",
    formal: "profissional e formal",
    direto: "direto e objetivo"
  };

  const seller = sellerName || "Time Comercial";
  const toneLabel = toneMap[tone] || "próximo e descontraído";

  const nuvemLine = includeNuvem !== false
    ? '• Origem do lead: [extrair da ficha se vier do Nuvem Envio / Nuvemshop]\n'
    : '';

  const nextStepsBlock = includeNext !== false ? `
📅 *Primeira coleta:* [extrair da ficha, ou informar que aguarda confirmação]
📈 *Rampagem:* Entendemos que a operação começa com um volume menor — sem problema! Seria muito valioso ter uma previsão semana a semana (ex: semana 1 → X pedidos, semana 2 → Y...).

👉 Se estiver tudo certinho nos pontos acima, é só mandar um OK aqui no grupo pra gente seguir! Caso tenham qualquer dúvida, é só falar.
(Por padrão do nosso sistema, se não houver pontuações em 5 dias úteis, consideramos tudo validado.)` : `
👉 Se estiver tudo certinho nos pontos acima, é só mandar um OK aqui no grupo pra gente seguir! Caso tenham qualquer dúvida, é só falar.`;

  const systemPrompt = `Você é assistente de vendas da Mandaê / Nuvem Envio.

IMPORTANTE: Na primeira linha da sua resposta, antes de tudo, escreva exatamente esta linha preenchida com dados extraídos da ficha:
DADOS:{"c":"<razão social do cliente>","p":"<plano contratado>"}

Depois pule uma linha e escreva a mensagem de boas-vindas para grupo de WhatsApp seguindo EXATAMENTE este formato:

Pessoal, [saudação por horário: bom dia/boa tarde/boa noite] a todos! =))

Que alegria dar o pontapé inicial na nossa operação. 🚀

Nós em Nuvem Envio estamos super felizes com essa parceria. Nosso maior objetivo aqui é descomplicar o dia a dia de vocês.
Para garantirmos que nossa operação rode redondinha desde o dia 1, resumimos abaixo os nossos parâmetros de alinhamento. Dá uma conferida:

📦 *Tabela de Frete:* [extrair da ficha]
🚚 *Coleta Diária:* [extrair horário da ficha]
📍 *Local:* [endereço completo da ficha]
🔗 *Integrações:* [extrair da ficha]
${nuvemLine}🛡️ *Proteção:* Seguro contra extravio habilitado para todos os pedidos.
🔒 *Dica de Segurança:* Recomendamos que atualizem periodicamente a senha do portal Mandaê e removam/alterem logins de integração antigos, se houver.
${nextStepsBlock}

— ${seller}, Comercial Mandaê / Nuvem Envio

Tom da mensagem: ${toneLabel}. Adapte o tom conforme solicitado, mantendo o formato acima.`;

  const isPdf = mimeType === 'application/pdf';
  const textBlock = {
    type: "text",
    text: "Extraia os dados cadastrais e gere a mensagem de boas-vindas para o grupo do WhatsApp deste novo cliente."
  };
  const fileBlock = isPdf
    ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: fileBase64 } }
    : { type: "image",    source: { type: "base64", media_type: mimeType,            data: fileBase64 } };

  const headers = {
    "Content-Type": "application/json",
    "x-api-key": process.env.ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01",
    ...(isPdf && { "anthropic-beta": "pdfs-2024-09-25" })
  };

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: [fileBlock, textBlock] }]
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || `Anthropic error ${response.status}`);

    const rawText = data.content?.[0]?.text || '';
    let clienteDetectado = '';
    let plano = '';
    let message = rawText;

    const dadosMatch = rawText.match(/^DADOS:\{"c":"([^"]*?)","p":"([^"]*?)"\}\n+/);
    if (dadosMatch) {
      clienteDetectado = dadosMatch[1].trim();
      plano = dadosMatch[2].trim();
      message = rawText.slice(dadosMatch[0].length).trim();
    }

    if (markComercial) {
      message = message + '\n\n@comercial';
    }

    res.status(200).json({ message, clienteDetectado, plano });
  } catch (error) {
    console.error('[generate]', error);
    return res.status(500).json({
      error: error.message,
      message: 'Erro interno: ' + error.message
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
