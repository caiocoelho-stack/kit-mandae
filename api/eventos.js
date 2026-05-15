export default async function handler(req, res) {
  try {
    const ESTADOS_INCLUIR = ['SP', 'MG', 'SC'];

    function parseCSV(csv) {
      const rows = [];
      const lines = csv.split('\n');
      function parseLine(line) {
        const cells = []; let cur = '', inQ = false;
        for (let i = 0; i < line.length; i++) {
          const c = line[i];
          if (c === '"') {
            if (inQ && line[i+1] === '"') { cur += '"'; i++; }
            else inQ = !inQ;
          } else if (c === ',' && !inQ) { cells.push(cur.trim()); cur = ''; }
          else cur += c;
        }
        cells.push(cur.trim());
        return cells;
      }
      const headers = parseLine(lines[0]);
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const vals = parseLine(lines[i]);
        const obj = {};
        headers.forEach((h, idx) => { obj[h] = vals[idx] || ''; });
        obj.__vals = vals;
        rows.push(obj);
      }
      return rows;
    }

    function sanitizeUrl(url) {
      if (!url) return '';
      const u = url.trim();
      if (!u) return '';
      if (u.startsWith('http://') || u.startsWith('https://')) return u;
      const knownDomains = ['drive.google','docs.google','forms.gle','luma.com','lu.ma','forms.google','calendar.google'];
      if (knownDomains.some(d => u.startsWith(d))) return 'https://' + u;
      return '';
    }

    function parseHtmlLinks(html) {
      const result = [];
      const trMatches = html.match(/<tr[\s\S]*?<\/tr>/gi) || [];
      trMatches.forEach((tr, i) => {
        if (i === 0) return;
        const tdMatches = tr.match(/<td[\s\S]*?<\/td>/gi) || [];
        const getHref = (td) => {
          if (!td) return '';
          const m = td.match(/href="([^"]+)"/i);
          if (!m) return '';
          let url = decodeURIComponent(m[1]);
          if (url.includes('google.com/url')) {
            const q = url.match(/[?&]q=([^&]+)/);
            if (q) url = decodeURIComponent(q[1]);
          }
          return url.startsWith('http') ? url : '';
        };
        result.push({
          inscricao: getHref(tdMatches[29]),
          convidados: getHref(tdMatches[30])
        });
      });
      return result;
    }

    const SHEET1 = '1DHeizS8DkCmfTMpRBZeD1dIsYgLR_lxRoOco6ryAsmw';
    const SHEET2 = '1tYtqaOxz_kHmbA54ZmbcyslNsg2eDXEAkQCF9YPu7Cc';
    const url1    = `https://docs.google.com/spreadsheets/d/${SHEET1}/gviz/tq?tqx=out:csv&sheet=Kit`;
    const url2csv = `https://docs.google.com/spreadsheets/d/${SHEET2}/gviz/tq?tqx=out:csv&sheet=Agenda%20Conecta%20D2C`;
    const url2html= `https://docs.google.com/spreadsheets/d/${SHEET2}/gviz/tq?tqx=out:html&sheet=Agenda%20Conecta%20D2C`;

    const [r1, r2csv, r2html] = await Promise.all([fetch(url1), fetch(url2csv), fetch(url2html)]);
    const [csv1, csv2, html2] = await Promise.all([r1.text(), r2csv.text(), r2html.text()]);

    console.log('Clara fetch status:', r1.status);

    const eventos1 = parseCSV(csv1)
      .filter(r => {
        const v = r.__vals || Object.values(r);
        const nome = v[0] || '';
        return nome && nome !== 'Nome' && !nome.toLowerCase().includes('conecta d2c');
      })
      .map(r => {
        const v = r.__vals || Object.values(r);
        return {
          nome: v[0] || '',
          data: v[1] || '',
          dataTexto: '',
          responsavel: v[2] || '',
          tipo: (v[3] || 'evento').toLowerCase(),
          cidade: '', uf: '', fonte: 'clara'
        };
      })
      .filter(e => e.nome);

    const allRows2  = parseCSV(csv2);
    const htmlLinks = parseHtmlLinks(html2);

    const eventos2 = allRows2
      .map((r, idx) => ({ r, idx }))
      .filter(({ r }) => {
        const v = r.__vals || [];
        const status    = (v[0]  || '').toLowerCase();
        const confirmado= (v[3]  || '').toLowerCase();
        const nome      =  v[8]  || '';
        const uf        = (v[21] || '').trim().toUpperCase();
        return nome && status === 'em andamento' && confirmado === 'sim' && ESTADOS_INCLUIR.includes(uf);
      })
      .map(({ r, idx }) => {
        const v      = r.__vals;
        const links  = htmlLinks[idx] || {};
        const inscricao  = links.inscricao  || sanitizeUrl(v[29]);
        const convidados = links.convidados || sanitizeUrl(v[30]);
        console.log(`[DEBUG] "${v[8]}" | inscricao="${inscricao}" | convidados="${convidados}"`);
        return {
          nome: v[8] || '',
          data: v[9] || '',
          dataTexto: '',
          responsavel: v[35] || v[7] || '',
          tipo: (v[16] || 'evento').toLowerCase(),
          cidade: v[20] || '',
          uf: v[21] || '',
          inscricao,
          convidados,
          fonte: 'agenda'
        };
      })
      .filter(e => e.nome);

    console.log('Agenda eventos parseados:', eventos2.length);

    const todos = [...eventos1, ...eventos2].sort((a, b) => {
      const p = s => {
        if (!s) return Infinity;
        const [d,m,y] = s.split('/');
        return new Date(+y, +m-1, +d).getTime();
      };
      return p(a.data) - p(b.data);
    });

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      events: todos,
      updatedAt: new Date().toISOString(),
      total: todos.length,
      fontes: { clara: eventos1.length, agenda: eventos2.length }
    });

  } catch(e) {
    console.error('Eventos error:', e);
    res.status(500).json({ error: e.message });
  }
}
