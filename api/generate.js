export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { fileBase64, mimeType, tone, sellerName } = req.body;

  const toneMap = {
    informal: "próximo e descontraído",
    formal: "profissional e formal",
    direto: "direto e objetivo"
  };

  const seller = sellerName || "Time Comercial";
  const toneLabel = toneMap[tone] || "próximo e descontraído";

  const systemPrompt = `Você é assistente de vendas da Mandaê/Nuvem Envio. Gere uma mensagem de boas-vindas para grupo de WhatsApp seguindo EXATAMENTE este formato:

Pessoal, [saudação por horário: bom dia/boa tarde/boa noite] a todos! =))

Que alegria dar o pontapé inicial na nossa operação. 🚀

Nós em Nuvem Envio estamos super felizes com essa parceria. Nosso maior objetivo aqui é descomplicar o dia a dia de vocês.
Para garantirmos que nossa operação rode redondinha desde o dia 1, resumimos abaixo os nossos parâmetros de alinhamento. Dá uma conferida:

📦 *Tabela de Frete:* [extrair da ficha]
🚚 *Coleta Diária:* [extrair horário da ficha]
📍 *Local:* [endereço completo da ficha]
🔗 *Integrações:* [extrair da ficha]
🛡️ *Proteção:* Seguro contra extravio habilitado para todos os pedidos.
🔒 *Dica de Segurança:* Recomendamos que atualizem periodicamente a senha do portal Mandaê e removam/alterem logins de integração antigos, se houver.

📅 *Primeira coleta:* [extrair da ficha, ou informar que aguarda confirmação]
📈 *Rampagem:* Entendemos que a operação começa com um volume menor — sem problema! Seria muito valioso ter uma previsão semana a semana (ex: semana 1 → X pedidos, semana 2 → Y...).

👉 Se estiver tudo certinho nos pontos acima, é só mandar um OK aqui no grupo pra gente seguir! Caso tenham qualquer dúvida, é só falar.
(Por padrão do nosso sistema, se não houver pontuações em 5 dias úteis, consideramos tudo validado.)

— ${seller}, Comercial Mandaê/Nuvem Envio

Tom da mensagem: ${toneLabel}. Adapte o tom conforme solicitado, mantendo o formato acima.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{
        role: "user",
        content: [{
          type: "image",
          source: { type: "base64", media_type: mimeType, data: fileBase64 }
        }, {
          type: "text",
          text: "Gere a mensagem de boas-vindas para o grupo do WhatsApp deste novo cliente."
        }]
      }]
    })
  });

  const data = await response.json();
  const message = data.content?.[0]?.text || "Erro ao gerar mensagem.";
  res.status(200).json({ message });
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
