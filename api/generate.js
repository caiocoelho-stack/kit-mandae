import { inflateSync } from 'zlib';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString();
    let body = {};
    try { body = JSON.parse(raw); } catch(e) {}

    const pdfData    = body.fileBase64 || body.pdfBase64 || body.base64 || '';
    const sellerName = body.sellerName || '';
    if (!pdfData) return res.status(400).json({ error: 'PDF nao recebido' });

    const text   = extractPdfText(Buffer.from(pdfData, 'base64'));
    const fields = extractFields(text);
    const msg    = buildMessage(fields, sellerName);
    console.log('[g] empresa:', fields.empresa, '| texto chars:', text.length);

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ message: msg, clienteDetectado: fields.empresa || 'Cliente', plano: fields.plano || '' });
  } catch(e) {
    console.error('[g] error:', e.message);
    res.status(500).json({ error: e.message });
  }
}

function extractPdfText(buffer) {
  const results = [];
  let pos = 0;
  while (pos < buffer.length) {
    const streamIdx = buffer.indexOf(Buffer.from('stream'), pos);
    if (streamIdx < 0) break;
    let dataStart = streamIdx + 6;
    if (buffer[dataStart] === 13) dataStart++;
    if (buffer[dataStart] === 10) dataStart++;
    const endIdx = buffer.indexOf(Buffer.from('endstream'), dataStart);
    if (endIdx < 0) break;
    const streamData = buffer.slice(dataStart, endIdx);
    let content = '';
    try { content = inflateSync(streamData).toString('utf8'); } catch(e) {
      content = streamData.toString('latin1');
    }
    const re = /\(([^)\\]{1,400})\)/g;
    let m;
    while ((m = re.exec(content)) !== null) {
      const t = m[1]
        .replace(/\\n/g,'\n').replace(/\\r/g,'').replace(/\\t/g,' ')
        .replace(/\\\\/g,'\\').replace(/\\\(/g,'(').replace(/\\\)/g,')')
        .trim();
      if (t.length > 1 && /[a-zA-ZÀ-ú0-9]/.test(t)) results.push(t);
    }
    pos = endIdx + 9;
  }
  return results.join('\n');
}

function extractFields(text) {
  const get = (...pats) => {
    for (const p of pats) {
      const m = text.match(p);
      if (m?.[1]) return m[1].trim().replace(/\s{2,}/g,' ').replace(/[*_]/g,'');
    }
    return '';
  };
  return {
    empresa:    get(/(?:Empresa|Razão Social|Nome da empresa|Cliente|Estabelecimento)[:\s\n]+([^\n\r:]{3,60})/i),
    plano:      get(/(?:Plano|Produto|Tabela de frete|Modalidade)[:\s\n]+([^\n\r:]+)/i),
    endereco:   get(/(?:Endereço|Logradouro|Rua\b|Av\.|Avenida)[:\s\n]?([^\n\r,]{5,80}(?:,\s*\d+[^\n\r]*)?)/i),
    cep:        get(/CEP[:\s\n]*([\d]{5}-?[\d]{3})/i, /([\d]{5}-[\d]{3})/),
    cidade:     get(/Cidade[:\s\n]+([^\n\r,/]{3,40})/i),
    uf:         get(/(?:\bUF\b|\bEstado\b)[:\s\n]+([A-Z]{2})\b/i),
    horario:    get(/(?:Horário|Horario)\s*(?:de\s*)?(?:preferência|coleta|saída)[:\s\n]+([^\n\r]+)/i,
                    /Janela\s*de\s*coleta[:\s\n]+([^\n\r]+)/i),
    plataforma: get(/Plataforma\s*de\s*frete[:\s\n]+([^\n\r|]+)/i,
                    /(Boxlink|Intelipost|Fretebras|Frenet|Direct|Melhor\s*Envio)/i),
    erp:        get(/ERP[:\s\n]+([^\n\r|]+)/i,
                    /(Bling|Tiny|SAP|TOTVS|Omie|Netsuite|Linx|Tray|Alterdata)/i),
    tms:        get(/(?:TMS|WMS)[:\s\n]+([^\n\r|]+)/i),
    lead:       get(/Origem\s*do\s*lead[:\s\n]+([^\n\r]+)/i,
                    /(Nuvemshop|Shopify|VTEX|Tray|WooCommerce|Loja\s*Integrada|Mercado\s*Livre)/i),
    meta:       get(/(?:Meta|Volume estimado|Pedidos\/mês|Volume)[:\s\n]+([^\n\r]+)/i,
                    /(\d+[\s]?[aà][\s]?\d+[\s]?(?:mil|k))/i),
  };
}

const AC = v => v || 'A confirmar';

function buildMessage(f, sellerName) {
  const horario  = f.horario ? `às ${f.horario}` : 'a confirmar';
  const localArr = [f.endereco, f.cidade && f.uf ? `${f.cidade} - ${f.uf}` : (f.cidade||f.uf), f.cep ? `CEP: ${f.cep}` : ''].filter(Boolean);
  const local    = localArr.length ? localArr.join(', ') : 'A confirmar';
  const tms      = f.tms || f.plataforma || 'A confirmar';
  const metaStr  = f.meta ? ` A meta declarada é de ${f.meta} —` : '';
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
