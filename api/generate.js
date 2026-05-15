export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    let body = {};
    try { body = JSON.parse(Buffer.concat(chunks).toString()); } catch(e) {}

    const pdfData    = body.fileBase64 || body.pdfBase64 || body.base64 || '';
    const sellerName = body.sellerName || '';
    if (!pdfData) return res.status(400).json({ error: 'PDF nao recebido' });

    const fields = await extractFields(pdfData);
    console.log('[g] empresa:', fields.empresa, '| horario:', fields.horario);

    const msg = buildMessage(fields, sellerName);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ message: msg, clienteDetectado: fields.empresa || 'Cliente', plano: fields.plano || '' });
  } catch(e) {
    console.error('[g] error:', e.message);
    res.status(500).json({ error: e.message });
  }
}

async function extractFields(pdfBase64) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'pdfs-2024-09-25'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } },
          { type: 'text', text: 'Extraia os campos desta ficha cadastral. Retorne SOMENTE JSON valido, sem markdown:\n{"empresa":"","plano":"","horario":"","plataforma":"","erp":"","tms":"","lead":"","meta":"","endereco":"","cep":"","cidade":"","uf":""}\nMapeamento: empresa=RAZAO SOCIAL, plano=tabela de frete se houver, horario=HORARIO DE PREFERENCIA PARA COLETA, plataforma=PLATAFORMA PARA CALCULO DE FRETE, erp=ERP PARA IMPORTACAO DE PEDIDOS, tms=OUTRA PLATAFORMA TMS WMS, lead=plataforma de venda extraida do nome da empresa ou campo especifico, meta=MEDIA DE ENVIOS/MES, endereco=ENDERECO DE COLETA, cep=CEP DE COLETA, cidade e uf do endereco de coleta.' }
        ]
      }]
    })
  });
  const data = await r.json();
  const text = data.content?.[0]?.text || '{}';
  try { return JSON.parse(text.replace(/```json|```/g,'').trim()); }
  catch(e) { console.error('[g] json parse error:', text); return {}; }
}

const AC = v => v || 'A confirmar';

function buildMessage(f, sellerName) {
  const horario  = f.horario ? `às ${f.horario}` : 'a confirmar';
  const localArr = [
    f.endereco,
    f.cidade && f.uf ? `${f.cidade} - ${f.uf}` : (f.cidade || f.uf),
    f.cep ? `CEP: ${f.cep}` : ''
  ].filter(Boolean);
  const local   = localArr.length ? localArr.join(', ') : 'A confirmar';
  const tms     = f.tms || f.plataforma || 'A confirmar';
  const metaStr = f.meta ? ` A meta declarada é de ${f.meta} —` : '';

  return `---
Pessoal, boa tarde a todos! =))

Que alegria dar o pontapé inicial na nossa operação. 🚀
Nós da Nuvem Envio estamos super felizes com essa parceria. Nosso maior objetivo aqui é descomplicar o dia a dia de vocês.
Para garantirmos que essa operação rode redondinha desde o dia 1, resumimos abaixo os nossos parâmetros de alinhamento. Dá uma conferida:

🎯 Tabela de Frete: ${AC(f.plano)} — gentileza validar com o time comercial.
🕔 Coleta Diária: Frequência diária, com horário de preferência ${horario} (CD em funcionamento das 08h00 às 18h00).
📍 Local: ${local}
🔗 Integrações: Plataforma de frete: ${AC(f.plataforma)} | ERP (emissão de etiquetas): ${AC(f.erp)} | TMS/WMS: ${tms}
- Origem do lead: ${AC(f.lead)}
🛡️ Proteção: Seguro contra extravio habilitado para todos os pedidos.
🔒 Dica de Segurança: Recomendamos que atualizemos periodicamente a senha do portal Mandaê e removamos/alterem logins de integração antigos, se houver.
📅 Primeira coleta: Aguarda confirmação — por favor, nos informem a data prevista para inicio da operação.
📈 Rampagem: Entendemos que a operação começa com um volume menor — sem problema! Seria muito valioso ter uma previsão semana a semana (ex: semana 1 → X pedidos, semana 2 → Y...).${metaStr} vamos construir essa curva juntos! 👍
👍 Se estiver tudo certinho nos pontos acima, é só mandar um OK aqui no grupo pra gente seguir! Caso tenham qualquer dúvida, é só falar.
(Por padrão do nosso sistema, se não houver pontuações em 5 dias úteis, consideramos tudo validado.)
— ${sellerName || 'Comercial Mandaê / Nuvem Envio'}`;
}
