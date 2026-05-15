import { inflateSync } from 'zlib';

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

    const text   = extractPdfText(Buffer.from(pdfData, 'base64'));
    const fields = extractFields(text);
    console.log('[g] empresa:', fields.empresa, '| horario:', fields.horario, '| chars:', text.length);

    const msg = buildMessage(fields, sellerName);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ message: msg, clienteDetectado: fields.empresa || 'Cliente', plano: fields.plano || '' });
  } catch(e) {
    console.error('[g] error:', e.message);
    res.status(500).json({ error: e.message });
  }
}

function extractPdfText(buf) {
  const parts = [];
  let pos = 0;
  while (pos < buf.length) {
    const si = buf.indexOf(Buffer.from('stream'), pos);
    if (si < 0) break;
    let ds = si + 6;
    if (buf[ds] === 13) ds++;
    if (buf[ds] === 10) ds++;
    const ei = buf.indexOf(Buffer.from('endstream'), ds);
    if (ei < 0) break;
    const sd = buf.slice(ds, ei);
    let txt = '';
    try { txt = inflateSync(sd).toString('utf8'); } catch(e) {
      try { txt = inflateSync(sd).toString('latin1'); } catch(e2) {
        txt = sd.toString('latin1');
      }
    }
    // Extract strings from parentheses
    const re = /\(([^)\\]{1,400})\)/g;
    let m;
    while ((m = re.exec(txt)) !== null) {
      const t = m[1]
        .replace(/\\n/g,'\n').replace(/\\r/g,'').replace(/\\t/g,' ')
        .replace(/\\\\/g,'\\').replace(/\\\(/g,'(').replace(/\\\)/g,')')
        .trim();
      if (t.length >= 1) parts.push(t);
    }
    pos = ei + 9;
  }
  // Join fragments: se muitos tokens de 1-2 chars seguidos, colapsa
  const lines = [];
  let cur = '';
  for (const p of parts) {
    if (p.length <= 2 && cur.length > 0 && cur.length <= 30) { cur += p; }
    else { if (cur) lines.push(cur); cur = p; }
  }
  if (cur) lines.push(cur);
  return lines.join('\n');
}

function extractFields(text) {
  // next: pega a linha logo após o label
  const next = (label) => {
    const esc = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const m = text.match(new RegExp(esc + '[^\\n]*\\n([^\\n]+)', 'i'));
    return m?.[1]?.trim().replace(/\s{2,}/g,' ') || '';
  };
  // skip1: pula uma linha após o label (desc) e pega a seguinte
  const skip1 = (label) => {
    const esc = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const m = text.match(new RegExp(esc + '[^\\n]*\\n[^\\n]*\\n([^\\n]+)', 'i'));
    return m?.[1]?.trim().replace(/\s{2,}/g,' ') || '';
  };

  const empresaRaw = next('RAZÃO SOCIAL');
  const leadMatch  = empresaRaw.match(/(Nuvemshop|Shopify|VTEX|Tray|WooCommerce|Loja Integrada|Mercado Livre)/i);
  const lead       = leadMatch?.[1] || next('ORIGEM DO LEAD') || next('CANAL');
  const empresa    = empresaRaw.replace(/\s*[-–]\s*(Nuvemshop|Shopify|VTEX|Tray|WooCommerce).*$/i,'').trim();

  const horario    = next('HORÁRIO DE PREFERÊNCIA PARA COLETA');
  const plataforma = skip1('PLATAFORMA PARA CÁLCULO DE FRETE') || next('PLATAFORMA PARA CÁLCULO DE FRETE');
  const erp        = next('ERP PARA IMPORTAÇÃO DE PEDIDOS E EMISSÃO DE ETIQUETAS');
  const tms        = next('OUTRA PLATAFORMA? TMS? WMS?');
  const meta       = next('MÉDIA DE ENVIOS/MÊS');

  // Endereço de coleta: skip "O mesmo para todos os CNPJs"
  const endBlock = text.match(/ENDEREÇO DE COLETA[^\n]*\n[^\n]*\n([^\n]+)\n([^\n]+)\n([^\n]+)/i);
  const endereco = endBlock?.[1]?.trim() || next('ENDEREÇO FISCAL');
  const cepRaw   = skip1('CEP DE COLETA') || next('CEP DE COLETA');
  const cep      = (cepRaw.match(/([\d]{5}-[\d]{3})/)||[])[1] || (text.match(/([\d]{5}-[\d]{3})/)||[])[1] || '';
  const lastLine = endBlock?.[3] || '';
  const cidade   = lastLine.split(/[-–,]/)?.[0]?.trim() || '';
  const uf       = (lastLine.match(/\b([A-Z]{2})\s*$/)||[])[1] || '';

  return { empresa, plano:'', horario, plataforma, erp, tms, meta, endereco, cep, cidade, uf, lead };
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
