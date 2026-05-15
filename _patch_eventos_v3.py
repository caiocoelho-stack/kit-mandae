import base64, gzip, re, sys
sys.stdout.reconfigure(encoding='utf-8')

HTML = 'index.html'
UUID = '54d7da79-68d8-4252-ba50-aa935e750bde'

with open(HTML, 'r', encoding='utf-8') as f:
    content = f.read()

pat = r'("' + UUID + r'":\{"mime":"application/javascript","compressed":true,"data":")([A-Za-z0-9+/=]+)(")'
m = re.search(pat, content)
assert m, "Bundle not found"
js = gzip.decompress(base64.b64decode(m.group(2))).decode('utf-8')

# =========================================================================
# Substitui EventosScreen pelo novo layout com grid 2 colunas + paginação
# =========================================================================
NEW_SCREEN = '''function EventosScreen({ setRoute }) {
  const [events, setEvents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [updatedAt, setUpdatedAt] = React.useState(null);
  const [filtro, setFiltro] = React.useState('proximos');
  const [busca, setBusca] = React.useState('');
  const [pagina, setPagina] = React.useState(1);

  const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const MESES_SHORT = ['jan','fev','mar','abr','mai','jun',
    'jul','ago','set','out','nov','dez'];
  const POR_PAGINA = 20;

  const carregar = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/eventos');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEvents(data.events);
      setUpdatedAt(data.updatedAt);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  React.useEffect(() => { carregar(); }, []);

  const parseData = (str) => {
    if (!str || !str.includes('/')) return null;
    const [d,m,y] = str.split('/');
    return new Date(+y, +m-1, +d);
  };

  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const em7 = new Date(hoje); em7.setDate(hoje.getDate()+7);

  const getStatus = (ev) => {
    const d = parseData(ev.data);
    if (!d) return 'tbd';
    if (d < hoje) return 'past';
    if (d <= em7) return 'soon';
    return 'future';
  };

  const filtered = events.filter(ev => {
    const st = getStatus(ev);
    const q = busca.toLowerCase();
    const match = !busca ||
      ev.nome?.toLowerCase().includes(q) ||
      ev.responsavel?.toLowerCase().includes(q) ||
      ev.cidade?.toLowerCase().includes(q);
    if (!match) return false;
    if (filtro==='proximos') return st !== 'past';
    if (filtro==='feiras') return ev.tipo==='feira';
    if (filtro==='d2c') return ev.fonte==='agenda';
    if (filtro==='resp') return !!ev.responsavel;
    return true;
  }).sort((a,b) => {
    const p = e => { const d = parseData(e.data); return d ? d.getTime() : Infinity; };
    return p(a) - p(b);
  });

  const totalPags = Math.ceil(filtered.length / POR_PAGINA);
  const pagAtual = filtered.slice((pagina-1)*POR_PAGINA, pagina*POR_PAGINA);
  React.useEffect(() => { setPagina(1); }, [filtro, busca]);

  const proximoEv = events
    .map(e => ({e, d: parseData(e.data)}))
    .filter(x => x.d && x.d >= hoje)
    .sort((a,b) => a.d-b.d)[0];
  const diffDias = proximoEv ? Math.ceil((proximoEv.d-hoje)/86400000) : null;
  const esteMes = events.filter(ev => {
    const d = parseData(ev.data);
    return d && d.getMonth()===hoje.getMonth() && d.getFullYear()===hoje.getFullYear();
  }).length;

  const PillBtn = ({k,l}) => (
    <button onClick={() => setFiltro(k)} style={{
      padding:'6px 14px',borderRadius:20,fontSize:12,border:'1px solid',
      cursor:'pointer',whiteSpace:'nowrap',
      borderColor: filtro===k ? 'var(--md-coral)' : 'var(--md-line)',
      background: filtro===k ? 'var(--md-coral)' : 'transparent',
      color: filtro===k ? '#fff' : 'var(--md-ink-2)'}}>
      {l}
    </button>
  );

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>

      {/* ── Header ── */}
      <div style={{padding:'24px 40px 0',flexShrink:0}}>
        <div style={{display:'flex',justifyContent:'space-between',
          alignItems:'flex-start',marginBottom:16}}>
          <div>
            <h2 style={{fontSize:26,fontWeight:700,color:'var(--md-ink)',marginBottom:4}}>
              Agenda de Eventos
            </h2>
            <p style={{fontSize:13,color:'var(--md-ink-2)',margin:0}}>
              Calendário Nuvem Envio 2026 + Conecta D2C
              {updatedAt && <span style={{color:'var(--md-coral)',marginLeft:8}}>● ao vivo</span>}
            </p>
          </div>
          <button className="btn-ghost" onClick={carregar}
            style={{display:'flex',alignItems:'center',gap:6,fontSize:12,flexShrink:0}}>
            {I.refresh} Atualizar
          </button>
        </div>

        {/* Stats */}
        {!loading && !error && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',
            gap:10,marginBottom:16}}>
            {[
              {label:'Total de eventos', val: events.length},
              {label:'Este mês', val: esteMes},
              {label:'Próximo em', val: diffDias != null ? `${diffDias}d` : '—'}
            ].map(s => (
              <div key={s.label} style={{background:'var(--md-paper-deep)',
                borderRadius:10,padding:'12px 14px'}}>
                <div style={{fontSize:11,color:'var(--md-ink-2)',
                  textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:4}}>
                  {s.label}
                </div>
                <div style={{fontSize:22,fontWeight:700,color:'var(--md-ink)'}}>
                  {s.val}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filtros + busca */}
        <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
          <input type="text" placeholder="Buscar evento, cidade ou responsável..."
            value={busca} onChange={e => setBusca(e.target.value)}
            style={{flex:1,minWidth:180,padding:'7px 12px',
              border:'1px solid var(--md-line)',borderRadius:8,
              fontSize:13,background:'var(--md-paper)',color:'var(--md-ink)'}} />
          <PillBtn k="proximos" l="Próximos" />
          <PillBtn k="todos" l="Todos" />
          <PillBtn k="feiras" l="Feiras" />
          <PillBtn k="d2c" l="Conecta D2C" />
          <PillBtn k="resp" l="Com responsável" />
        </div>
      </div>

      {/* ── Lista ── */}
      <div style={{flex:1,overflowY:'auto',padding:'0 40px 32px'}}>

        {/* Skeleton */}
        {loading && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:4}}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{height:90,borderRadius:10,
                background:'var(--md-line)',opacity:.25}} />
            ))}
          </div>
        )}

        {/* Erro */}
        {error && (
          <div style={{padding:16,borderRadius:10,marginTop:8,
            background:'#fff3f3',border:'1px solid #fcc',color:'#c00',fontSize:13}}>
            {error}
            <button onClick={carregar}
              style={{marginLeft:12,textDecoration:'underline',
                cursor:'pointer',background:'none',border:'none',color:'#c00'}}>
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p style={{color:'var(--md-ink-2)',fontSize:13,
            textAlign:'center',padding:40}}>
            Nenhum evento encontrado.
          </p>
        )}

        {/* Grid 2 colunas */}
        {!loading && !error && pagAtual.length > 0 && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {pagAtual.map((ev, i) => {
              const st = getStatus(ev);
              const d = parseData(ev.data);
              const borderTop = st==='soon' ? '#BA7517'
                : ev.tipo==='feira' ? 'var(--md-coral)'
                : 'var(--md-line)';
              return (
                <div key={i} style={{
                  borderRadius:10,
                  border:'1px solid var(--md-line)',
                  borderTop:`3px solid ${borderTop}`,
                  background:'var(--md-paper)',
                  padding:'12px 14px',
                  opacity: st==='past' ? 0.4 : 1,
                  display:'flex',flexDirection:'column',gap:6
                }}>
                  {/* Linha 1: data + badges */}
                  <div style={{display:'flex',justifyContent:'space-between',
                    alignItems:'flex-start',gap:6}}>
                    <div>
                      {d ? (
                        <span style={{fontSize:22,fontWeight:700,
                          color:'var(--md-ink)',lineHeight:1}}>
                          {d.getDate()} <span style={{fontSize:13,
                            fontWeight:400,color:'var(--md-ink-2)'}}>
                            {MESES_SHORT[d.getMonth()]} {d.getFullYear()}
                          </span>
                        </span>
                      ) : (
                        <span style={{fontSize:12,color:'var(--md-muted)',fontStyle:'italic'}}>
                          {ev.dataTexto || 'A confirmar'}
                        </span>
                      )}
                    </div>
                    <div style={{display:'flex',gap:4,flexWrap:'wrap',
                      justifyContent:'flex-end',flexShrink:0}}>
                      {st==='soon' && (
                        <span style={{padding:'2px 7px',borderRadius:10,fontSize:10,
                          fontWeight:500,background:'#FAEEDA',color:'#854F0B'}}>
                          Em breve
                        </span>
                      )}
                      {ev.tipo==='feira' && (
                        <span style={{padding:'2px 7px',borderRadius:10,fontSize:10,
                          fontWeight:500,background:'var(--md-coral-tint)',
                          color:'var(--md-coral)'}}>
                          Feira
                        </span>
                      )}
                      {ev.fonte==='agenda' && (
                        <span style={{padding:'2px 7px',borderRadius:10,fontSize:10,
                          fontWeight:500,background:'#EEEDFE',color:'#534AB7'}}>
                          D2C
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Linha 2: nome */}
                  <div style={{fontSize:13,fontWeight:600,color:'var(--md-ink)',
                    overflow:'hidden',textOverflow:'ellipsis',
                    display:'-webkit-box',WebkitLineClamp:2,
                    WebkitBoxOrient:'vertical'}}>
                    {ev.nome}
                  </div>

                  {/* Linha 3: cidade + responsável */}
                  <div style={{display:'flex',gap:6,alignItems:'center',
                    flexWrap:'wrap',marginTop:'auto'}}>
                    {(ev.cidade||ev.uf) && (
                      <span style={{fontSize:11,color:'var(--md-ink-2)'}}>
                        {[ev.cidade,ev.uf].filter(Boolean).join(' · ')}
                      </span>
                    )}
                    {ev.responsavel && (
                      <span style={{padding:'1px 7px',borderRadius:10,
                        background:'var(--md-coral-tint)',color:'var(--md-coral)',
                        fontSize:10,fontWeight:500}}>
                        {ev.responsavel}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginação */}
        {!loading && !error && totalPags > 1 && (
          <div style={{display:'flex',justifyContent:'center',alignItems:'center',
            gap:6,marginTop:20,flexWrap:'wrap'}}>
            <button onClick={() => setPagina(p => Math.max(1,p-1))}
              disabled={pagina===1}
              style={{padding:'5px 12px',borderRadius:8,border:'1px solid var(--md-line)',
                background:'transparent',color:'var(--md-ink-2)',cursor:'pointer',
                opacity:pagina===1?0.4:1}}>
              ←
            </button>
            {Array.from({length:totalPags},(_,i)=>i+1)
              .filter(n => n===1||n===totalPags||Math.abs(n-pagina)<=1)
              .reduce((acc,n,i,arr) => {
                if(i>0 && n-arr[i-1]>1) acc.push('…');
                acc.push(n); return acc;
              }, [])
              .map((n,i) => n==='…'
                ? <span key={`e${i}`} style={{color:'var(--md-muted)',fontSize:13}}>…</span>
                : <button key={n} onClick={() => setPagina(n)}
                    style={{padding:'5px 10px',borderRadius:8,
                      border:'1px solid',cursor:'pointer',fontSize:13,
                      borderColor: pagina===n ? 'var(--md-coral)' : 'var(--md-line)',
                      background: pagina===n ? 'var(--md-coral)' : 'transparent',
                      color: pagina===n ? '#fff' : 'var(--md-ink-2)'}}>
                    {n}
                  </button>
              )}
            <button onClick={() => setPagina(p => Math.min(totalPags,p+1))}
              disabled={pagina===totalPags}
              style={{padding:'5px 12px',borderRadius:8,border:'1px solid var(--md-line)',
                background:'transparent',color:'var(--md-ink-2)',cursor:'pointer',
                opacity:pagina===totalPags?0.4:1}}>
              →
            </button>
            <span style={{fontSize:11,color:'var(--md-muted)',marginLeft:4}}>
              {filtered.length} evento{filtered.length!==1?'s':''}
            </span>
          </div>
        )}

        <p style={{fontSize:11,color:'var(--md-muted)',textAlign:'center',marginTop:16}}>
          Calendário Nuvem Envio 2026 + Agenda Conecta D2C · exclui SP, MG e SC · atualiza da planilha
        </p>
      </div>
    </div>
  );
}

'''

js, n = re.subn(
    r'function EventosScreen\(\{ setRoute \}\) \{[\s\S]*?\n\}\n\n',
    lambda _: NEW_SCREEN,
    js, count=1
)
assert n == 1, "EventosScreen não encontrada no bundle"
print("EventosScreen substituída pelo novo layout (grid 2col + paginação)")

# =========================================================================
# Repack
# =========================================================================
new_b64 = base64.b64encode(gzip.compress(js.encode('utf-8'))).decode('ascii')
content = content[:m.start(2)] + new_b64 + content[m.end(2):]
print("Bundle repacked.")

with open(HTML, 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDone. index.html salvo.")
