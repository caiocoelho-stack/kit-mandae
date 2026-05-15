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

    const SHEET1 = '1DHeizS8DkCmfTMpRBZeD1dIsYgLR_lxRoOco6ryAsmw';
    const SHEET2 = '1tYtqaOxz_kHmbA54ZmbcyslNsg2eDXEAkQCF9YPu7Cc';
    const url1    = `https://docs.google.com/spreadsheets/d/${SHEET1}/gviz/tq?tqx=out:csv&sheet=Kit`;
    const url2csv = `https://docs.google.com/spreadsheets/d/${SHEET2}/gviz/tq?tqx=out:csv&sheet=Agenda%20Conecta%20D2C`;
    const url2html= `https://docs.google.com/spreadsheets/d/${SHEET2}/gviz/tq?tqx=out:html&sheet=Agenda%20Conecta%20D2C`;

    const [r1, r2csv, r2html] = await Promise.all([fetch(url1), fetch(url2csv), fetch(url2html)]);
    const [csv1, csv2, html2] = await Promise.all([r1.text(), r2csv.text(), r2html.text()]);

    // DIAGNOSTICO HTML
    console.log('[HTML] status:', r2html.status);
    console.log('[HTML] tamanho:', html2.length);
    console.log('[HTML] tem href:', html2.includes('href'));
    console.log('[HTML] qtd <tr>:', (html2.match(/<tr/gi)||[]).length);
    console.log('[HTML] primeiros 1000 chars:', html2.substring(0, 1000));

    const eventos1 = parseCSV(csv1)
      .filter(r => {
        const v = r.__vals || Object.values(r);
        const nome = v[0] || '';
        return nome && nome !== 'Nome' && !nome.toLowerCase().includes('conecta d2c');
      })
      .map(r => {
        const v = r.__vals || Object.values(r);
        return { nome: v[0]||'', data: v[1]||'', dataTexto:'', responsavel: v[2]||'', tipo: (v[3]||'evento').toLowerCase(), cidade:'', uf:'', fonte:'clara' };
      })
      .filter(e => e.nome);

    const allRows2 = parseCSV(csv2);

    const eventos2 = allRows2
      .map((r, idx) => ({ r, idx }))
      .filter(({ r }) => {
        const v = r.__vals || [];
        return v[8] && (v[0]||'').toLowerCase() === 'em andamento' && (v[3]||'').toLowerCase() === 'sim' && ESTADOS_INCLUIR.includes((v[21]||'').trim().toUpperCase());
      })
      .map(({ r, idx }) => {
        const v = r.__vals;
        return {
          nome: v[8]||'', data: v[9]||'', dataTexto:'',
          responsavel: v[35]||v[7]||'', tipo: (v[16]||'evento').toLowerCase(),
          cidade: v[20]||'', uf: v[21]||'',
          inscricao: sanitizeUrl(v[29]),
          convidados: sanitizeUrl(v[30]),
          fonte: 'agenda'
        };
      })
      .filter(e => e.nome);

    const todos = [...eventos1, ...eventos2].sort((a, b) => {
      const p = s => { if (!s) return Infinity; const [d,m,y] = s.split('/'); return new Date(+y,+m-1,+d).getTime(); };
      return p(a.data) - p(b.data);
    });

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ events: todos, updatedAt: new Date().toISOString(), total: todos.length, fontes: { clara: eventos1.length, agenda: eventos2.length } });

  } catch(e) {
    console.error('Eventos error:', e);
    res.status(500).json({ error: e.message });
  }
}
