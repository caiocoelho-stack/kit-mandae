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

    const SHEET1 = '1DHeizS8DkCmfTMpRBZeD1dIsYgLR_lxRoOco6ryAsmw';
    const SHEET2 = '1tYtqaOxz_kHmbA54ZmbcyslNsg2eDXEAkQCF9YPu7Cc';
    const url1 = `https://docs.google.com/spreadsheets/d/${SHEET1}/gviz/tq?tqx=out:csv&sheet=Kit`;
    const url2 = `https://docs.google.com/spreadsheets/d/${SHEET2}/gviz/tq?tqx=out:csv&sheet=Agenda%20Conecta%20D2C`;

    const [r1, r2] = await Promise.all([fetch(url1), fetch(url2)]);
    const [csv1, csv2] = await Promise.all([r1.text(), r2.text()]);

    const eventos1 = parseCSV(csv1)
      .filter(r => { const v = r.__vals||Object.values(r); const n=v[0]||''; return n&&n!=='Nome'&&!n.toLowerCase().includes('conecta d2c'); })
      .map(r => { const v=r.__vals||Object.values(r); return {nome:v[0]||'',data:v[1]||'',dataTexto:'',responsavel:v[2]||'',tipo:(v[3]||'evento').toLowerCase(),cidade:'',uf:'',fonte:'clara'}; })
      .filter(e => e.nome);

    const eventos2 = parseCSV(csv2)
      .map((r, idx) => ({ r, idx }))
      .filter(({ r }) => {
        const v = r.__vals || [];
        return v[8] &&
          (v[0]||'').toLowerCase() === 'em andamento' &&
          (v[3]||'').toLowerCase() === 'sim' &&
          ESTADOS_INCLUIR.includes((v[21]||'').trim().toUpperCase());
      })
      .map(({ r, idx }) => {
        const v = r.__vals;
        console.log(`[MAP] idx=${idx} nome="${v[8]}" data="${v[9]}" col10="${v[10]}" col11="${v[11]}"`);
        return {
          nome: v[8]||'',
          data: v[9]||'',
          dataTexto: '',
          responsavel: v[35]||v[7]||'',
          tipo: (v[16]||'evento').toLowerCase(),
          cidade: v[20]||'',
          uf: v[21]||'',
          inscricao: '',
          convidados: '',
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

  } catch(e) { console.error('Eventos error:', e); res.status(500).json({ error: e.message }); }
}
