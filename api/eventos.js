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

    console.log('Buscando Clara em:', url1);

    const [r1, r2] = await Promise.all([fetch(url1), fetch(url2)]);
    const [csv1, csv2] = await Promise.all([r1.text(), r2.text()]);

    console.log('Clara fetch status:', r1.status);
    console.log('Clara CSV tamanho:', csv1.length);
    console.log('Clara primeiras linhas:', csv1.split('\n').slice(0,5).join(' || '));

    // Fonte 1 — Clara: datas em texto livre, aceita como dataTexto
    const eventos1 = parseCSV(csv1)
      .filter(r => r['Nome'])
      .map(r => {
        const dataRaw = r['Data'] || '';
        const isDD = /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dataRaw);
        return {
          nome: r['Nome'],
          data: isDD ? dataRaw : '',
          dataTexto: !isDD && dataRaw ? dataRaw : '',
          responsavel: r['Responsável'] || '',
          tipo: (r['Tipo'] || 'evento').toLowerCase(),
          cidade: '', uf: '', fonte: 'clara'
        };
      });

    console.log('Clara eventos encontrados:', eventos1.length);

    // Fonte 2 — por ÍNDICE de coluna (evita problema de header)
    // A=0 Status, H=7 Agência, I=8 Nome do Evento,
    // J=9 Data, Q=16 Tipo, U=20 Cidade, V=21 UF
    const eventos2 = parseCSV(csv2)
      .filter(r => {
        const v = r.__vals || [];
        const status = (v[0] || '').toLowerCase();
        const nome = v[8] || '';
        const uf = (v[21] || '').trim().toUpperCase();
        return nome &&
          !['cancelado','recusado','declinado'].includes(status) &&
          ESTADOS_INCLUIR.includes(uf);
      })
      .map(r => {
        const v = r.__vals;
        return {
          nome: v[8] || '',
          data: v[9] || '',
          dataTexto: '',
          responsavel: v[7] || '',
          tipo: (v[16] || 'evento').toLowerCase(),
          cidade: v[20] || '',
          uf: v[21] || '',
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
