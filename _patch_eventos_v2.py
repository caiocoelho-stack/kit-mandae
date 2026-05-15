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
# 1. Reordena NAV: move "eventos" para segunda posição
# =========================================================================
OLD1 = (
    'const NAV = [\n'
    '  { key: "inicio",    label: "Boas-vindas ao Cliente", icon: "chat",       available: true },\n'
    '  { key: "followup",  label: "Gerador de Follow-up",   icon: "chat",       available: true },\n'
    '  { key: "contrato",  label: "Auxiliar de Contrato",   icon: "invoice",    available: true },\n'
    '  { key: "slack",     label: "Aprovação Interna",      icon: "paperPlane", available: true },\n'
    '  { key: "briefing",    label: "Briefing de Reunião",    icon: "stats",      available: true  },\n'
    '  { key: "concorrente", label: "Análise de Concorrente", icon: "lock",       available: true  },\n'
    '  { key: "eventos",     label: "Agenda de Eventos",      icon: "stars",      available: true  },\n'
    '];'
)
NEW1 = (
    'const NAV = [\n'
    '  { key: "inicio",    label: "Boas-vindas ao Cliente", icon: "chat",       available: true },\n'
    '  { key: "eventos",     label: "Agenda de Eventos",      icon: "stars",      available: true  },\n'
    '  { key: "followup",  label: "Gerador de Follow-up",   icon: "chat",       available: true },\n'
    '  { key: "contrato",  label: "Auxiliar de Contrato",   icon: "invoice",    available: true },\n'
    '  { key: "slack",     label: "Aprovação Interna",      icon: "paperPlane", available: true },\n'
    '  { key: "briefing",    label: "Briefing de Reunião",    icon: "stats",      available: true  },\n'
    '  { key: "concorrente", label: "Análise de Concorrente", icon: "lock",       available: true  },\n'
    '];'
)
assert OLD1 in js, "1. NAV array não encontrado"
js = js.replace(OLD1, NEW1, 1)
print("1. NAV: 'eventos' movido para segunda posição")

# =========================================================================
# 2. Reordena ferramentas array: move "eventos" para segunda posição
# =========================================================================
OLD2 = (
    "    { key: 'inicio',    available: true  },\n"
    "    { key: 'contrato',  available: true  },\n"
    "    { key: 'followup',  available: true  },\n"
    "    { key: 'slack',     available: true  },\n"
    "    { key: 'briefing',    available: true  },\n"
    "    { key: 'concorrente', available: true  },\n"
    "    { key: 'eventos',     available: true  },\n"
)
NEW2 = (
    "    { key: 'inicio',    available: true  },\n"
    "    { key: 'eventos',     available: true  },\n"
    "    { key: 'contrato',  available: true  },\n"
    "    { key: 'followup',  available: true  },\n"
    "    { key: 'slack',     available: true  },\n"
    "    { key: 'briefing',    available: true  },\n"
    "    { key: 'concorrente', available: true  },\n"
)
assert OLD2 in js, "2. ferramentas array não encontrado"
js = js.replace(OLD2, NEW2, 1)
print("2. ferramentas array: 'eventos' movido para segunda posição")

# =========================================================================
# 3. Reposiciona bento card: remove eventos do final, insere após inicio
# =========================================================================
# Remove eventos card from current position (after concorrente, before bento closing </div>)
OLD3_REMOVE = (
    '\n'
    '\n'
    '        {/* Agenda de Eventos */}\n'
    '        <div className="tool-card available" onClick={() => setRoute("eventos")}>\n'
    '          <div className="tool-card-head">\n'
    '            <div className="tool-icon">{I.stars}</div>\n'
    '            <span className="badge available">Disponível</span>\n'
    '          </div>\n'
    '          <h3 className="tool-name">Agenda de Eventos</h3>\n'
    '          <p className="tool-desc">Calendário Nuvem Envio 2026 + Conecta D2C. Eventos fora de SP, MG e SC em um só lugar.</p>\n'
    '          <div className="tool-foot">\n'
    '            <span className="tool-cta">Ver agenda {I.arrowRight}</span>\n'
    '          </div>\n'
    '        </div>\n'
    '      </div>'
)
NEW3_REMOVE = '\n      </div>'
assert OLD3_REMOVE in js, "3a. eventos card (atual posição) não encontrado"
js = js.replace(OLD3_REMOVE, NEW3_REMOVE, 1)
print("3a. eventos card removido da posição atual (após concorrente)")

# Insert eventos card right after inicio featured card (before contrato)
OLD3_INSERT = '\n\n        {/* Auxiliar de Contrato */}'
NEW3_INSERT = (
    '\n'
    '\n'
    '        {/* Agenda de Eventos */}\n'
    '        <div className="tool-card available" onClick={() => setRoute("eventos")}>\n'
    '          <div className="tool-card-head">\n'
    '            <div className="tool-icon">{I.stars}</div>\n'
    '            <span className="badge available">Disponível</span>\n'
    '          </div>\n'
    '          <h3 className="tool-name">Agenda de Eventos</h3>\n'
    '          <p className="tool-desc">Calendário Nuvem Envio 2026 + Conecta D2C. Eventos fora de SP, MG e SC em um só lugar.</p>\n'
    '          <div className="tool-foot">\n'
    '            <span className="tool-cta">Ver agenda {I.arrowRight}</span>\n'
    '          </div>\n'
    '        </div>\n'
    '\n'
    '        {/* Auxiliar de Contrato */}'
)
assert OLD3_INSERT in js, "3b. separador antes de contrato não encontrado"
js = js.replace(OLD3_INSERT, NEW3_INSERT, 1)
print("3b. eventos card inserido como segundo card (após Boas-vindas ao Cliente)")

# =========================================================================
# 4. Substitui EventosScreen pelo novo layout
# =========================================================================
NEW_SCREEN = r'''function EventosScreen({ setRoute }) {
  const [events, setEvents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [updatedAt, setUpdatedAt] = React.useState(null);
  const [filtro, setFiltro] = React.useState('proximos');
  const [busca, setBusca] = React.useState('');

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
    if (!str || str === 'TBD' || !str.includes('/')) return null;
    const [d, m, y] = str.split('/');
    return new Date(parseInt(y), parseInt(m)-1, parseInt(d));
  };

  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const em7 = new Date(hoje); em7.setDate(hoje.getDate() + 7);

  const getStatus = (ev) => {
    const d = parseData(ev.data);
    if (!d) return 'tbd';
    if (d < hoje) return 'past';
    if (d <= em7) return 'soon';
    return 'future';
  };

  const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio',
    'Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const MESES_SHORT = ['jan','fev','mar','abr','mai','jun',
    'jul','ago','set','out','nov','dez'];

  const filtered = events.filter(ev => {
    const st = getStatus(ev);
    const q = busca.toLowerCase();
    const matchBusca = !busca ||
      ev.nome?.toLowerCase().includes(q) ||
      ev.responsavel?.toLowerCase().includes(q) ||
      ev.cidade?.toLowerCase().includes(q);
    if (!matchBusca) return false;
    if (filtro === 'proximos') return st !== 'past';
    if (filtro === 'feiras') return ev.tipo === 'feira';
    if (filtro === 'd2c') return ev.fonte === 'agenda';
    if (filtro === 'resp') return !!ev.responsavel;
    return true;
  });

  const grouped = {};
  filtered.forEach(ev => {
    const d = parseData(ev.data);
    const key = d
      ? `${d.getFullYear()}-${String(d.getMonth()).padStart(2,'0')}`
      : '9999-99';
    const label = d
      ? `${MESES[d.getMonth()]} ${d.getFullYear()}`
      : 'A confirmar';
    if (!grouped[key]) grouped[key] = { label, events: [] };
    grouped[key].events.push(ev);
  });
  const sortedKeys = Object.keys(grouped).sort();

  const proximoEv = events
    .map(e => ({ e, d: parseData(e.data) }))
    .filter(x => x.d && x.d >= hoje)
    .sort((a,b) => a.d - b.d)[0];
  const diffDias = proximoEv
    ? Math.ceil((proximoEv.d - hoje) / 86400000)
    : null;
  const esteMes = events.filter(ev => {
    const d = parseData(ev.data);
    return d && d.getMonth() === hoje.getMonth() &&
           d.getFullYear() === hoje.getFullYear();
  }).length;

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      <div style={{padding:'24px 40px 0',flexShrink:0}}>

        <div style={{display:'flex',justifyContent:'space-between',
          alignItems:'flex-start',marginBottom:16}}>
          <div>
            <h2 style={{fontSize:28,fontWeight:700,
              color:'var(--md-ink)',marginBottom:4}}>
              Agenda de Eventos
            </h2>
            <p style={{fontSize:13,color:'var(--md-ink-2)'}}>
              Calendário Nuvem Envio 2026 + Conecta D2C
              {updatedAt &&
                <span style={{color:'var(--md-coral)',marginLeft:8}}>
                  ● ao vivo
                </span>}
            </p>
          </div>
          <button className="btn-ghost" onClick={carregar}
            style={{display:'flex',alignItems:'center',gap:6,fontSize:12}}>
            {I.refresh} Atualizar
          </button>
        </div>

        {!loading && !error && (
          <div style={{display:'grid',
            gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
            {[
              {label:'Total de eventos', val: events.length},
              {label:'Este mês', val: esteMes},
              {label:'Próximo em', val: diffDias != null
                ? `${diffDias}d` : '—'}
            ].map(s => (
              <div key={s.label} style={{
                background:'var(--md-paper-deep)',
                borderRadius:10,padding:'12px 14px'}}>
                <div style={{fontSize:11,color:'var(--md-ink-2)',
                  textTransform:'uppercase',letterSpacing:'0.06em',
                  marginBottom:4}}>{s.label}</div>
                <div style={{fontSize:22,fontWeight:700,
                  color:'var(--md-ink)'}}>{s.val}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
          <input type="text" placeholder="Buscar evento, cidade ou responsável..."
            value={busca} onChange={e => setBusca(e.target.value)}
            style={{flex:1,minWidth:200,padding:'7px 12px',
              border:'1px solid var(--md-line)',borderRadius:8,
              fontSize:13,background:'var(--md-paper)',
              color:'var(--md-ink)'}} />
          {[
            {k:'proximos',l:'Próximos'},
            {k:'todos',l:'Todos'},
            {k:'feiras',l:'Feiras'},
            {k:'d2c',l:'Conecta D2C'},
            {k:'resp',l:'Com responsável'}
          ].map(f => (
            <button key={f.k} onClick={() => setFiltro(f.k)}
              style={{padding:'6px 14px',borderRadius:20,fontSize:12,
                border:'1px solid',cursor:'pointer',
                borderColor: filtro===f.k
                  ? 'var(--md-coral)' : 'var(--md-line)',
                background: filtro===f.k
                  ? 'var(--md-coral)' : 'transparent',
                color: filtro===f.k ? '#fff' : 'var(--md-ink-2)'}}>
              {f.l}
            </button>
          ))}
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'0 40px 40px'}}>
        {loading && (
          <div style={{display:'flex',flexDirection:'column',gap:8,
            marginTop:8}}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{height:56,borderRadius:10,
                background:'var(--md-line)',opacity:.3}} />
            ))}
          </div>
        )}

        {error && (
          <div style={{padding:16,borderRadius:10,marginTop:8,
            background:'#fff3f3',border:'1px solid #fcc',
            color:'#c00',fontSize:13}}>
            {error}
            <button onClick={carregar}
              style={{marginLeft:12,textDecoration:'underline',
                cursor:'pointer',background:'none',
                border:'none',color:'#c00'}}>
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

        {!loading && !error && sortedKeys.map(key => (
          <div key={key} style={{marginBottom:24}}>
            <div style={{fontSize:11,fontWeight:600,
              color:'var(--md-ink-2)',textTransform:'uppercase',
              letterSpacing:'0.1em',padding:'0 0 8px',
              borderBottom:'1px solid var(--md-line)',
              marginBottom:8}}>
              {grouped[key].label}
            </div>
            {grouped[key].events.map((ev, i) => {
              const st = getStatus(ev);
              const d = parseData(ev.data);
              const borderColor = st === 'soon'
                ? '#BA7517'
                : ev.tipo === 'feira'
                ? 'var(--md-coral)'
                : 'var(--md-line)';
              return (
                <div key={i} style={{
                  display:'grid',
                  gridTemplateColumns:'44px 1fr auto',
                  alignItems:'center',gap:14,
                  padding:'10px 12px',
                  borderRadius:10,
                  border:`1px solid var(--md-line)`,
                  borderLeft:`3px solid ${borderColor}`,
                  background:'var(--md-paper)',
                  marginBottom:6,
                  opacity: st === 'past' ? 0.4 : 1
                }}>
                  <div style={{textAlign:'center',flexShrink:0}}>
                    {d ? (
                      <>
                        <div style={{fontSize:20,fontWeight:700,
                          color:'var(--md-ink)',lineHeight:1}}>
                          {d.getDate()}
                        </div>
                        <div style={{fontSize:10,
                          color:'var(--md-ink-2)',
                          textTransform:'uppercase',
                          letterSpacing:'0.05em'}}>
                          {MESES_SHORT[d.getMonth()]}
                        </div>
                      </>
                    ) : (
                      <div style={{fontSize:10,
                        color:'var(--md-muted)',fontStyle:'italic'}}>
                        TBD
                      </div>
                    )}
                  </div>

                  <div style={{minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,
                      color:'var(--md-ink)',overflow:'hidden',
                      textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      {ev.nome}
                    </div>
                    <div style={{fontSize:11,color:'var(--md-ink-2)',
                      marginTop:2,display:'flex',gap:8,
                      alignItems:'center',flexWrap:'wrap'}}>
                      {ev.cidade && <span>{ev.cidade}{ev.uf ? ` · ${ev.uf}` : ''}</span>}
                      {ev.responsavel && (
                        <span style={{padding:'1px 7px',borderRadius:12,
                          background:'var(--md-coral-tint)',
                          color:'var(--md-coral)',fontSize:10,
                          fontWeight:500}}>
                          {ev.responsavel}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{display:'flex',flexDirection:'column',
                    gap:4,alignItems:'flex-end',flexShrink:0}}>
                    {st === 'soon' && (
                      <span style={{padding:'2px 8px',borderRadius:12,
                        fontSize:10,fontWeight:500,
                        background:'#FAEEDA',color:'#854F0B'}}>
                        Em breve
                      </span>
                    )}
                    {ev.tipo === 'feira' && (
                      <span style={{padding:'2px 8px',borderRadius:12,
                        fontSize:10,fontWeight:500,
                        background:'var(--md-coral-tint)',
                        color:'var(--md-coral)'}}>
                        Feira
                      </span>
                    )}
                    {ev.fonte === 'agenda' && (
                      <span style={{padding:'2px 8px',borderRadius:12,
                        fontSize:10,fontWeight:500,
                        background:'#EEEDFE',color:'#534AB7'}}>
                        Conecta D2C
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        <p style={{fontSize:11,color:'var(--md-muted)',
          textAlign:'center',marginTop:8}}>
          Calendário Nuvem Envio 2026 + Agenda Conecta D2C ·
          exclui SP, MG e SC · atualiza da planilha
        </p>
      </div>
    </div>
  );
}

'''

js, n4 = re.subn(
    r'function EventosScreen\(\{ setRoute \}\) \{[\s\S]*?\n\}\n\n',
    lambda _: NEW_SCREEN,
    js, count=1
)
assert n4 == 1, "4. EventosScreen não encontrado"
print("4. EventosScreen substituída pelo novo layout")

# =========================================================================
# Repack
# =========================================================================
new_b64 = base64.b64encode(gzip.compress(js.encode('utf-8'))).decode('ascii')
content = content[:m.start(2)] + new_b64 + content[m.end(2):]
print("Bundle repacked.")

with open(HTML, 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDone. index.html salvo.")
