export default async function handler(req, res) {
  try {
    const ESTADOS_EXCLUIR = ['SP', 'MG', 'SC'];

    // Fonte 1 — Planilha da Clara (aba Kit)
    const url1 = `https://docs.google.com/spreadsheets/d/1DHeizS8DkCmfTMpRBZeD1dIsYgLR_lxRoOco6ryAsmw/gviz/tq?tqx=out:csv&sheet=Kit`;

    // Fonte 2 — Agenda Conecta D2C (exclui SP, MG, SC)
    const url2 = `https://docs.google.com/spreadsheets/d/1tYtqaOxz_kHmbA54ZmbcyslNsg2eDXEAkQCF9YPu7Cc/gviz/tq?tqx=out:csv&sheet=Agenda%20Conecta%20D2C`;

    const parseCSV = (csv) => {
      const lines = csv.trim().split('\n');
      const headers = lines[0].match(/("([^"]*)"|[^,]+)/g)
        .map(h => h.replace(/"/g, '').trim());
      return lines.slice(1)
        .filter(l => l.trim())
        .map(line => {
          const values = line.match(/("([^"]*)"|[^,]*)/g) || [];
          const obj = {};
          headers.forEach((h, i) => {
            obj[h] = (values[i] || '').replace(/"/g, '').trim();
          });
          return obj;
        });
    };

    const [res1, res2] = await Promise.all([fetch(url1), fetch(url2)]);
    const [csv1, csv2] = await Promise.all([res1.text(), res2.text()]);

    // Fonte 1: usa colunas Nome, Data, Responsável, Tipo
    const eventos1 = parseCSV(csv1)
      .filter(r => r['Nome'])
      .map(r => ({
        nome: r['Nome'],
        data: r['Data'] || 'TBD',
        responsavel: r['Responsável'] || '',
        tipo: r['Tipo'] || 'evento',
        cidade: '',
        uf: '',
        fonte: 'clara'
      }));

    // Fonte 2: usa colunas Nome do Evento, Data, Agência,
    // Tipo, Cidade, UF — exclui SP/MG/SC e Cancelados
    const eventos2 = parseCSV(csv2)
      .filter(r => {
        const uf = (r['UF'] || r['Estado'] || '').trim().toUpperCase();
        const status = (r['Status'] || '').toLowerCase();
        return r['Nome do Evento'] &&
               !ESTADOS_EXCLUIR.includes(uf) &&
               status !== 'cancelado';
      })
      .map(r => ({
        nome: r['Nome do Evento'],
        data: r['Data'] || 'TBD',
        responsavel: r['Agência'] || '',
        tipo: (r['Tipo'] || 'evento').toLowerCase(),
        cidade: r['Cidade'] || '',
        uf: r['UF'] || r['Estado'] || '',
        fonte: 'agenda'
      }));

    // Mescla e ordena por data
    const todos = [...eventos1, ...eventos2].sort((a, b) => {
      const parseD = s => {
        if (!s || s === 'TBD') return Infinity;
        const [d, m, y] = s.split('/');
        return new Date(y, m - 1, d).getTime();
      };
      return parseD(a.data) - parseD(b.data);
    });

    res.setHeader('Cache-Control', 's-maxage=300');
    res.status(200).json({
      events: todos,
      updatedAt: new Date().toISOString(),
      total: todos.length,
      fontes: { clara: eventos1.length, agenda: eventos2.length }
    });

  } catch (e) {
    console.error('Eventos error:', e);
    res.status(500).json({ error: e.message });
  }
}
