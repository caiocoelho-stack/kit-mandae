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

NEW_JIRA = r"""
function JiraMonitor() {
  const [tickets, setTickets] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [erro, setErro] = React.useState('');
  const [lastUpdate, setLastUpdate] = React.useState('');
  const [countdown, setCountdown] = React.useState(0);

  React.useEffect(() => {
    carregar();
    const t = setInterval(carregar, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  async function carregar() {
    setLoading(true); setErro('');
    try {
      const r = await fetch('/api/jira');
      const d = await r.json();
      setTickets(d.issues || []);
      setLastUpdate(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    } catch(e) { setErro('Erro de conexao.'); }
    setLoading(false);
  }

  function handleRefresh() {
    if (countdown > 0 || loading) return;
    carregar();
    setCountdown(60);
    const iv = setInterval(() => {
      setCountdown(prev => { if (prev <= 1) { clearInterval(iv); return 0; } return prev - 1; });
    }, 1000);
  }

  const btnStyle = {
    background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
    width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: (countdown > 0 || loading) ? 'not-allowed' : 'pointer',
    color: '#fff', fontSize: 11, opacity: (countdown > 0 || loading) ? 0.55 : 1,
    transition: 'opacity 150ms', flexShrink: 0,
  };

  const urg = (upd) => {
    const d = Math.floor((Date.now() - new Date(upd)) / 86400000);
    if (d >= 15) return { emoji: '🔴', label: 'Critico',  cor: '#ef4444', d };
    if (d >= 8)  return { emoji: '🟠', label: 'Urgente',  cor: '#f97316', d };
    return               { emoji: '🟡', label: 'Atencao', cor: '#eab308', d };
  };

  const adf = (body) => {
    try { return body?.content?.flatMap(b => b.content ?? [])?.filter(n => n.type === 'text')?.map(n => n.text)?.join('') ?? ''; }
    catch(e) { return ''; }
  };

  const nV = tickets.filter(t => Math.floor((Date.now() - new Date(t.fields.updated)) / 86400000) >= 15).length;
  const nL = tickets.filter(t => { const d = Math.floor((Date.now() - new Date(t.fields.updated)) / 86400000); return d >= 8 && d < 15; }).length;

  return (
    <div className="tip-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="tip-eyebrow" style={{ marginBottom: 0 }}>{'🎫'} TICKETS PARADOS</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {lastUpdate && <span style={{ fontSize: 10, opacity: 0.5, color: '#fff' }}>{lastUpdate}</span>}
          <button style={btnStyle} onClick={handleRefresh} disabled={countdown > 0 || loading}
            title={countdown > 0 ? `Aguarde ${countdown}s` : 'Atualizar'}>
            {countdown > 0 ? countdown + 's' : '↻'}
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 0', opacity: 0.7 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Buscando tickets...</span>
        </div>
      )}

      {!loading && erro && (
        <div style={{ fontSize: 13, color: '#fca5a5', padding: '8px 0' }}>{erro}</div>
      )}

      {!loading && !erro && tickets.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>{'🎉'}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Nenhum ticket parado!</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Time comercial em dia</div>
        </div>
      )}

      {!loading && tickets.length > 0 && (
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {nV > 0 && <span style={{ background: 'rgba(239,68,68,.2)', color: '#fca5a5', padding: '3px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{'🔴'} {nV} crítico{nV > 1 ? 's' : ''}</span>}
            {nL > 0 && <span style={{ background: 'rgba(249,115,22,.2)', color: '#fdba74', padding: '3px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{'🟠'} {nL} urgente{nL > 1 ? 's' : ''}</span>}
            <span style={{ background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.55)', padding: '3px 8px', borderRadius: 99, fontSize: 11 }}>{tickets.length} no total</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
            {tickets.map(t => {
              const u = urg(t.fields.updated);
              const last = t.fields.comment?.comments?.slice(-1)[0];
              const lastTxt = last ? adf(last.body) : '';
              return (
                <div key={t.key} style={{ background: 'rgba(255,255,255,.06)', borderRadius: 8, padding: '10px 12px', borderLeft: `3px solid ${u.cor}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <a href={`https://tiendanube.atlassian.net/browse/${t.key}`} target="_blank" rel="noreferrer"
                      style={{ color: '#a5b4fc', fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>{t.key}</a>
                    <span style={{ color: u.cor, fontSize: 11, fontWeight: 600 }}>{u.emoji} {u.d}d &middot; {u.label}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.85)', lineHeight: 1.4, marginBottom: 3 }}>{t.fields.summary}</div>
                  {t.fields.assignee && <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)' }}>{'👤'} {t.fields.assignee.displayName}</div>}
                  {lastTxt && <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', fontStyle: 'italic', marginTop: 3 }}>{'💬'} {lastTxt.substring(0, 90)}{lastTxt.length > 90 ? '…' : ''}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
"""

# Substitui JiraMonitor antigo (entre inicio da funcao e inicio de AlertaCard)
start_marker = "\nfunction JiraMonitor() {"
end_marker   = "\nfunction AlertaCard("
idx_start = js.find(start_marker)
idx_end   = js.find(end_marker)
assert idx_start > 0 and idx_end > idx_start, "JiraMonitor nao encontrado"
js = js[:idx_start] + NEW_JIRA + js[idx_end:]
print("OK — JiraMonitor redesenhado")

assert js != original, "Nenhuma alteracao"

compressed = base64.b64encode(gzip.compress(js.encode("utf-8"))).decode("ascii")
new_content = content[:m.start(1)] + compressed + content[m.end(1):]

# CSS: alertas-row lado a lado, mesma altura
css = """<style>
.alertas-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px}
.alertas-row .tip-card{margin:0!important;position:relative!important;bottom:auto!important;right:auto!important;width:auto!important;max-width:none!important}
@media(max-width:900px){.alertas-row{grid-template-columns:1fr}}
</style>"""
new_content = new_content.replace("</head>", css + "</head>", 1)

with open(HTML, "w", encoding="utf-8") as f:
    f.write(new_content)
print("index.html salvo!")
