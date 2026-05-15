export default async function handler(req, res) {
  try {
    const ESTADOS_INCLUIR = ['SP', 'MG', 'SC'];

    const LINK_MAP = {
      0:  { i: 'https://luma.com/xy1ar15j', c: 'https://docs.google.com/spreadsheets/d/1OIJsZNY2y80HG9PUo7XtIc8Sa8yWyexn/edit?usp=sharing' },
      1:  { i: 'https://www.sympla.com.br/evento/conecta-by-pandorium---edicao-belo-horizonte/3422861?d=NUVEM100', c: 'https://docs.google.com/spreadsheets/d/1eAtSuGokLlXUPzpuqXaJfaCSWZ-75CXgNEwZ3Mzq-lQ/edit?usp=sharing' },
      2:  { i: '', c: 'https://docs.google.com/spreadsheets/d/1UdTMjjeStWp2xKppnyWl99RMgY-Rb0aK9_UaQZUEe28/edit?usp=drive_link' },
      3:  { i: 'https://www.sympla.com.br/evento/conecta-d2c-ribeirao-preto-2026/3320471', c: 'https://docs.google.com/spreadsheets/d/1E9e4aRMjEV7rY-FlM_OOGw0__gKv5m3e3eYY4SqURio/edit?usp=drive_link' },
      4:  { i: '', c: 'https://docs.google.com/spreadsheets/d/11EQd6j9X35A4BvU6iP1SwPy8Hve7Ij_6CRprs6zqQaQ/edit?usp=drive_link' },
      5:  { i: '', c: 'https://docs.google.com/spreadsheets/d/1xEHTPuqlMXjz3THK7WZLkWEO_8mtAnziBZ27P9e88XA/edit?usp=drive_link' },
      6:  { i: '', c: 'https://docs.google.com/spreadsheets/d/16bfMKrpVAHZtQJRSdiRb_YoWoGMaIvkc0Q5nWMfaPUw/edit?usp=drive_link' },
      7:  { i: '', c: 'https://docs.google.com/spreadsheets/d/1Bwqe8fCdok8LhYdJc5aPqEbbjBA3TJrvPNUmLZdEzwA/edit?usp=drive_link' },
      9:  { i: '', c: 'https://docs.google.com/spreadsheets/d/1Aiiba9Klu6C7_I5xKAwJ2NnwxSLcnzUh9PHarWXAVfg/edit?usp=drive_link' },
      29: { i: '', c: 'https://docs.google.com/spreadsheets/d/1fbR4OvxGgYuUeDDjBgLfTH7ZfUrMC0mhj0S3Lj5LMGM/edit?usp=sharing' },
      40: { i: 'https://www.sympla.com.br/evento/conecta-d2c-ribeirao-preto-2026/3320471', c: 'https://docs.google.com/spreadsheets/d/1q96itqAjWzIJYILA4xuY3NjBsxWO0HkdH0Qz5u7JNXw/edit?usp=drive_link' },
      41: { i: 'https://luma.com/dyeculh3', c: 'https://docs.google.com/spreadsheets/d/1fbR4OvxGgYuUeDDjBgLfTH7ZfUrMC0mhj0S3Lj5LMGM/edit?usp=drive_link' },
      42: { i: 'https://www.sympla.com.br/evento/d2c-conecta-divinopolis-nuvemshop-weethub/3349202', c: 'https://docs.google.com/spreadsheets/d/125uozYFKV3W4lmO7JFrCjOmS6tvz-u0oF_Zi-6ewvfc/edit?usp=drive_link' },
      43: { i: 'https://luma.com/nj2dhypp', c: 'https://docs.google.com/spreadsheets/d/162Oo96UgzYMLJbVaLTYrg_JLkVh2XtLwuZVcubAaETs/edit?usp=drive_link' },
      44: { i: 'https://luma.com/hkuzjqnc', c: 'https://docs.google.com/spreadsheets/d/1n1WUznC0lChbIhXtOejxA5rkBCP7HT-H_U9s4-oGyYs/edit?usp=drive_link' },
      45: { i: 'https://luma.com/nrz4mn5e', c: 'https://docs.google.com/spreadsheets/d/1XSFXAG6GQ-mb6yhu2gouFwQVO3WzORJtxRsjahOO1eo/edit?usp=drive_link' },
    };

    const MESES = {
      'JANEIRO':'01','FEVEREIRO':'02','MARCO':'03','MARÇO':'03',
      'ABRIL':'04','MAIO':'05','JUNHO':'06','JULHO':'07',
      'AGOSTO':'08','SETEMBRO':'09','OUTUBRO':'10',
      'NOVEMBRO':'11','DEZEMBRO':'12'
    };

    function buildData(v) {
      if (v[9]) return v[9];
      const dia = (v[10] || '').trim();
      const mesNome = (v[11] || '').trim().toUpperCase();
      if (!dia || !mesNome) return '';
      const mes = MESES[mesNome];
      if (!mes) return '';
      const ano = new Date().getFullYear();
      return `${dia.padStart(2,'0')}/${mes}/${ano}`;
    }

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
        const lm = LINK_MAP[idx] || {};
        return {
          nome: v[8]||'',
          data: buildData(v),
          dataTexto: '',
          responsavel: v[35]||v[7]||'',
          tipo: (v[16]||'evento').toLowerCase(),
          cidade: v[20]||'',
          uf: v[21]||'',
          inscricao: lm.i || '',
          convidados: lm.c || '',
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
