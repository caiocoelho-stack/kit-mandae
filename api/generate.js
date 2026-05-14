export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { fileBase64, mimeType, tone } = req.body;

  const toneMap = {
    informal: "próximo e descontraído",
    formal: "profissional e formal",
    direto: "direto e objetivo"
  };

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
      system: "Você é assistente de vendas da Mandaê-Nuvem Envio. Gere uma mensagem de boas-vindas para grupo de WhatsApp a partir da ficha cadastral anexada. Inclua: emoji de abertura, nome da empresa, segmento, parâmetros operacionais (coleta, endereço, integração, seguro), próximos passos. Formate com *negrito* para WhatsApp. Seja " + (toneMap[tone] || "próximo e descontraído") + ".",
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
