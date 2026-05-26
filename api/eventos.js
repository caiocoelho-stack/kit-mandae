export default async function handler(req, res) {
  try {
    const ESTADOS_INCLUIR = ['SP', 'MG', 'SC'];

    const LINK_MAP = {
      1:  { i: "https://www.sympla.com.br/evento/conecta-by-pandorium---edicao-belo-horizonte/3422861?d=NUVEM100", c: "https://docs.google.com/spreadsheets/d/1eAtSuGokLlXUPzpuqXaJfaCSWZ-75CXgNEwZ3Mzq-lQ/edit?usp=sharing" },
      2:  { i: "https://www.sympla.com.br/evento/conecta-d2c-bauru-nuvemshop-blu-assessoria/3384071", c: "https://docs.google.com/spreadsheets/d/1UdTMjjeStWp2xKppnyWl99RMgY-Rb0aK9_UaQZUEe28/edit?usp=drive_link" },
      3:  { i: "https://www.sympla.com.br/evento/conecta-d2c-franca-2026/3412879", c: "https://docs.google.com/spreadsheets/d/1E9e4aRMjEV7rY-FlM_OOGw0__gKv5m3e3eYY4SqURio/edit?usp=drive_link" },
      4:  { i: "https://luma.com/zv7mfmnm", c: "https://docs.google.com/spreadsheets/d/11EQd6j9X35A4BvU6iP1SwPy8Hve7Ij_6CRprs6zqQaQ/edit?usp=drive_link" },
      5:  { i: "https://luma.com/1atrtp3o", c: "https://docs.google.com/spreadsheets/d/1xEHTPuqlMXjz3THK7WZLkWEO_8mtAnziBZ27P9e88XA/edit?usp=drive_link" },
      6:  { i: "", c: "https://docs.google.com/spreadsheets/d/1Aiiba9Klu6C7_I5xKAwJ2NnwxSLcnzUh9PHarWXAVfg/edit?usp=drive_link" },
      7:  { i: "https://luma.com/y0xzgpia", c: "" },
      11: { i: "", c: "https://docs.google.com/spreadsheets/d/1Bwqe8fCdok8LhYdJc5aPqEbbjBA3TJrvPNUmLZdEzwA/edit?usp=drive_link" },
      29: { i: "", c: "https://docs.google.com/spreadsheets/d/16bfMKrpVAHZtQJRSdiRb_YoWoGMaIvkc0Q5nWMfaPUw/edit?usp=drive_link" },
      41: { i: "https://luma.com/dyeculh3", c: "https://docs.google.com/spreadsheets/d/1fbR4OvxGgYuUeDDjBgLfTH7ZfUrMC0mhj0S3Lj5LMGM/edit?usp=drive_link" },
      42: { i: "https://www.sympla.com.br/evento/d2c-conecta-divinopolis-nuvemshop-weethub/3349202", c: "https://docs.google.com/spreadsheets/d/125uozYFKV3W4lmO7JFrCjOmS6tvz-u0oF_Zi-6ewvfc/edit?usp=drive_link" },
      43: { i: "https://luma.com/nj2dhypp", c: "https://docs.google.com/spreadsheets/d/162Oo96UgzYMLJbVaLTYrg_JLkVh2XtLwuZVcubAaETs/edit?usp=drive_link" },
      44: { i: "https://luma.com/hkuzjqnc", c: "https://docs.google.com/spreadsheets/d/1n1WUznC0lChbIhXtOejxA5rkBCP7HT-H_U9s4-oGyYs/edit?usp=drive_link" },
      46: { i: "https://luma.com/nrz4mn5e", c: "https://docs.google.com/spreadsheets/d/1XSFXAG6GQ-mb6yhu2gouFwQVO3WzORJtxRsjahOO1eo/edit?usp=drive_link" },
    };

    const MESES = {
      'JANEIRO':'01','FEVEREIRO':'02','MARCO':'03','MARCO':'03',
      'ABRIL':'04','MAIO':'05','JUNHO':'06','JULHO':'07',
      'AGOSTO':'08','SETEMBRO':'09','OUTUBRO':'10',
      'NOVEMBRO':'11','DEZEMBRO':'12'
    };

    function parseDataTexto(str) {
      if (!str) return '';
      if (/^\d{1,2}\/\d{2}\/\d{4}$/.test(str.trim())) return str.trim();
      const m = str.match(/(\d{1,2})\s+de\s+([A-Za-z]+)/i);
      if (m) {
        const dia = m[1].padStart(2, '0');
        const mesKey = m[2].toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
        const mes = MESES[mesKey];
        if (mes) return dia + '/' + mes + '/' + new Date().getFullYear();
      }
      return '';
    }

    function parseCSV(csv) {
      const lines = csv.split('\n');
      function parseLine(line) {
        const cells = []; let cur = '', inQ = false;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (ch === '"') {
            if (inQ && line[i+1] === '"') { cur += '"'; i++; }
            else inQ = !inQ;
          } else if (ch === ',' && !inQ) { cells.push(cur.trim()); cur = ''; }
          else cur += ch;
        }
        cells.push(cur.trim());
        return cells;
      }
      return lines.filter(l => l.trim()).map(parseLine);
    }

    const SHEET1 = '1DHeizS8DkCmfTMpRBZeD1dIsYgLR_lxRoOco6ryAsmw';
    const SHEET2 = '1tYtqaOxz_kHmbA54ZmbcyslNsg2eDXEAkQCF9YPu7Cc';
    const url1 = 'https://docs.google.com/spreadsheets/d/' + SHEET1 + '/gviz/tq?tqx=out:csv&sheet=Kit';
    const url2 = 'https://docs.google.com/spreadsheets/d/' + SHEET2 + '/gviz/tq?tqx=out:csv&sheet=Agenda%20Conecta%20D2C';

    const [r1, r2] = await Promise.all([fetch(url1), fetch(url2)]);
    const [csv1, csv2] = await Promise.all([r1.text(), r2.text()]);

    const rows1 = parseCSV(csv1);
    const seen = new Set();
    const eventos1 = [];
    for (const v of rows1) {
      const nome = (v[0] || '').trim();
      const dataRaw = (v[1] || '').trim();
      const responsavel = (v[2] || '').trim();
      const tipo = (v[3] || 'evento').trim().toLowerCase();
      if (!nome || nome === 'Nome' || nome === 'Eventos Feiras') continue;
      const data = parseDataTexto(dataRaw);
      const chave = nome.toLowerCase() + '|' + data;
      if (seen.has(chave)) continue;
      seen.add(chave);
      eventos1.push({ nome, data, dataTexto: data ? '' : dataRaw, responsavel, tipo, cidade: '', uf: '', fonte: 'kit' });
    }

    function buildData(v) {
      // col 10 = data formatada se existir, col 11 = Dia, col 12 = Mes
      if (v[10]) return v[10];
      const dia = (v[11] || '').trim();
      const mesNome = (v[12] || '').trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
      if (!dia || !mesNome) return '';
      const mes = MESES[mesNome];
      if (!mes) return '';
      return dia.padStart(2,'0') + '/' + mes + '/' + new Date().getFullYear();
    }

    const rows2 = parseCSV(csv2);
    const eventos2 = rows2.slice(1)
      .map((v, idx) => ({ v, idx }))
      .filter(({ v }) =>
        v[9] &&
        (v[0] || '').toLowerCase() === 'em andamento' &&
        (v[3] || '').toLowerCase() === 'sim' &&
        ESTADOS_INCLUIR.includes((v[22] || '').trim().toUpperCase())
      )
      .map(({ v, idx }) => {
        const lm = LINK_MAP[idx] || {};
        return {
          nome: v[9] || '',
          data: buildData(v),
          dataTexto: '',
          responsavel: '',
          tipo: (v[17] || 'evento').toLowerCase(),
          cidade: v[21] || '',
          uf: v[22] || '',
          inscricao: lm.i || '',
          convidados: lm.c || '',
          vendedores: v[29] || '',
          fonte: 'agenda'
        };
      })
      .filter(e => e.nome);

    const parseData = (s) => {
      if (!s || !s.includes('/')) return Infinity;
      const [d, mo, y] = s.split('/');
      return new Date(+y, +mo - 1, +d).getTime();
    };

    const todos = [...eventos1, ...eventos2].sort((a, b) => parseData(a.data) - parseData(b.data));

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      events: todos,
      updatedAt: new Date().toISOString(),
      total: todos.length,
      fontes: { kit: eventos1.length, agenda: eventos2.length }
    });

  } catch (e) {
    console.error('Eventos error:', e);
    res.status(500).json({ error: e.message });
  }
}


