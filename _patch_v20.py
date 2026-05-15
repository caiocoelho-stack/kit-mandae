import base64, gzip, re, sys
sys.stdout.reconfigure(encoding="utf-8")

HTML = "index.html"
UUID = "54d7da79-68d8-4252-ba50-aa935e750bde"

with open(HTML, "r", encoding="utf-8") as f:
    content = f.read()

pat = '"' + UUID + '":{"mime":"application/javascript","compressed":true,"data":"([A-Za-z0-9+/=]+)"}'
m = re.search(pat, content)
assert m, "Bundle not found"
js = gzip.decompress(base64.b64decode(m.group(1))).decode("utf-8")
original = js

# 1. Troca ordem: JiraMonitor sobe, AlertaCard desce
assert '<AlertaCard /><JiraMonitor />' in js, "Ordem nao encontrada"
js = js.replace('<AlertaCard /><JiraMonitor />', '<JiraMonitor /><AlertaCard />', 1)
print("OK — ordem trocada")

# 2. Adiciona nav item apos concorrente
OLD_NAV = '{ key: "concorrente",'
idx = js.find(OLD_NAV)
assert idx > 0, "Nav concorrente nao encontrado"
idx_end = js.find('},', idx) + 2
JIRA_NAV = '\n  { key: "jira", label: "Monitor de Tickets", icon: "stats", available: true },'
js = js[:idx_end] + JIRA_NAV + js[idx_end:]
print("OK — nav item adicionado")

# 3. Cria JiraScreen (tela dedicada full-page)
JIRA_SCREEN = r"""
function JiraScreen({ setRoute }) {
  return (
    <div style={{ padding: '32px 40px', maxWidth: 860, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <button onClick={() => setRoute('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 13, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
            ← Voltar
          </button>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>🎫 Monitor de Tickets</h1>
        <p style={{ color: '#64748b', marginTop: 6, fontSize: 14 }}>
          Tickets INT em "Aguardando Comercial" parados há mais de 5 dias. Atualiza automaticamente a cada 5 min.
        </p>
      </div>
      <JiraMonitorFull />
    </div>
  );
}

function JiraMonitorFull() {
  const [tickets, setTickets] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [erro, setErro] = React.useState('');
  const [lastUpdate, setLastUpdate] = React.useState('');
  const [countdown, setCountdown] = React.useState(0);

  React.useEffect(() => { carregar(); const t = setInterval(carregar, 5*60*1000); return () => clearInterval(t); }, []);

  async function carregar() {
    setLoading(true); setErro('');
    try {
      const r = await fetch('/api/jira');
      const d = await r.json();
      setTickets(d.issues || []);
      setLastUpdate(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    } catch(e) { setErro('Erro ao carregar tickets.'); }
    setLoading(false);
  }

  function handleRefresh() {
    if (countdown > 0 || loading) return;
    carregar();
    setCountdown(60);
    const iv = setInterval(() => { setCountdown(p => { if (p <= 1) { clearInterval(iv); return 0; } return p - 1; }); }, 1000);
  }

  const urg = (upd) => {
    const d = Math.floor((Date.now() - new Date(upd)) / 86400000);
    if (d >= 15) return { emoji: '🔴', label: 'Crítico',  cor: '#ef4444', bg: 'rgba(239,68,68,.1)',  d };
    if (d >= 8)  return { emoji: '🟠', label: 'Urgente',  cor: '#f97316', bg: 'rgba(249,115,22,.1)', d };
    return               { emoji: '🟡', label: 'Atenção', cor: '#eab308', bg: 'rgba(234,179,8,.1)',  d };
  };

  const adf = (body) => {
    try { return body?.content?.flatMap(b=>b.content??[])?.filter(n=>n.type==='text')?.map(n=>n.text)?.join('')??''; } catch(e) { return ''; }
  };

  const nV = tickets.filter(t => Math.floor((Date.now()-new Date(t.fields.updated))/86400000)>=15).length;
  const nL = tickets.filter(t => { const d=Math.floor((Date.now()-new Date(t.fields.updated))/86400000); return d>=8&&d<15; }).length;
  const nA = tickets.length - nV - nL;

  if (loading) return <div style={{textAlign:'center',padding:60,color:'#64748b'}}>Carregando tickets...</div>;
  if (erro)    return <div style={{textAlign:'center',padding:60,color:'#ef4444'}}>{erro}</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {nV>0 && <span style={{background:'rgba(239,68,68,.1)',color:'#ef4444',padding:'4px 12px',borderRadius:99,fontSize:12,fontWeight:700,border:'1px solid rgba(239,68,68,.3)'}}>🔴 {nV} crítico{nV>1?'s':''}</span>}
          {nL>0 && <span style={{background:'rgba(249,115,22,.1)',color:'#f97316',padding:'4px 12px',borderRadius:99,fontSize:12,fontWeight:700,border:'1px solid rgba(249,115,22,.3)'}}>🟠 {nL} urgente{nL>1?'s':''}</span>}
          {nA>0 && <span style={{background:'rgba(234,179,8,.1)',color:'#eab308',padding:'4px 12px',borderRadius:99,fontSize:12,fontWeight:700,border:'1px solid rgba(234,179,8,.3)'}}>🟡 {nA} atenção</span>}
          {tickets.length===0 && <span style={{color:'#22c55e',fontWeight:600,fontSize:14}}>🎉 Nenhum ticket parado!</span>}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          {lastUpdate && <span style={{fontSize:12,color:'#94a3b8'}}>Atualizado às {lastUpdate}</span>}
          <button onClick={handleRefresh} disabled={countdown>0} style={{background:'none',border:'1px solid #e2e8f0',borderRadius:8,padding:'6px 12px',cursor:countdown>0?'not-allowed':'pointer',color:'#64748b',fontSize:12}}>
            {countdown>0?`${countdown}s`:'↻ Atualizar'}
          </button>
        </div>
      </div>

      {tickets.length > 0 && (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {tickets.map(t => {
            const u = urg(t.fields.updated);
            const last = t.fields.comment?.comments?.slice(-1)[0];
            const lastTxt = last ? adf(last.body) : '';
            return (
              <div key={t.key} style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:'16px 20px',borderLeft:`4px solid ${u.cor}`}}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,marginBottom:8}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                      <a href={`https://tiendanube.atlassian.net/browse/${t.key}`} target="_blank" rel="noreferrer"
                        style={{color:'#6366f1',fontWeight:700,fontSize:13,textDecoration:'none',background:'rgba(99,102,241,.08)',padding:'2px 8px',borderRadius:6}}>{t.key}</a>
                      <span style={{background:u.bg,color:u.cor,padding:'2px 8px',borderRadius:99,fontSize:11,fontWeight:700,border:`1px solid ${u.cor}44`}}>{u.emoji} {u.d}d · {u.label}</span>
                    </div>
                    <div style={{fontSize:15,fontWeight:600,color:'#1e293b',lineHeight:1.4}}>{t.fields.summary}</div>
                  </div>
                </div>
                <div style={{display:'flex',gap:16,fontSize:12,color:'#64748b'}}>
                  {t.fields.assignee && <span>👤 {t.fields.assignee.displayName}</span>}
                  {t.fields.reporter && <span>📋 {t.fields.reporter.displayName}</span>}
                </div>
                {lastTxt && (
                  <div style={{marginTop:10,background:'#f8fafc',borderRadius:8,padding:'8px 12px',fontSize:12,color:'#64748b',borderLeft:'2px solid #e2e8f0'}}>
                    💬 <em>{lastTxt.substring(0,150)}{lastTxt.length>150?'…':''}</em>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
"""

# Injeta JiraScreen antes de JiraMonitor
assert '\nfunction JiraMonitor()' in js, "JiraMonitor nao encontrado"
js = js.replace('\nfunction JiraMonitor()', JIRA_SCREEN + '\nfunction JiraMonitor()', 1)
print("OK — JiraScreen criado")

# 4. Adiciona rota "jira" no router principal
# Procura pelo padrao de rota do concorrente para adicionar jira depois
OLD_ROUTE = 'route === "concorrente" ? <ConcorrenteScreen setRoute={setRoute} />'
assert OLD_ROUTE in js, "Rota concorrente nao encontrada"
JIRA_ROUTE = 'route === "jira"        ? <JiraScreen        setRoute={setRoute} /> :\n         ' + OLD_ROUTE
js = js.replace(OLD_ROUTE, JIRA_ROUTE, 1)
print("OK — rota jira adicionada")

assert js != original
compressed = base64.b64encode(gzip.compress(js.encode("utf-8"))).decode("ascii")
new_content = content[:m.start(1)] + compressed + content[m.end(1):]

with open(HTML, "w", encoding="utf-8") as f:
    f.write(new_content)
print("index.html salvo!")
