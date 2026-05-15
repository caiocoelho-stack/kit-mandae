import base64, gzip, re, sys
sys.stdout.reconfigure(encoding="utf-8")

HTML = "index.html"
UUID = "54d7da79-68d8-4252-ba50-aa935e750bde"

with open(HTML, "r", encoding="utf-8") as f:
    content = f.read()

pat = r"(\"" + UUID + r"\":\{\"mime\":\"application/javascript\",\"compressed\":true,\"data\":\")" + r"([A-Za-z0-9+/=]+)(\")"
m = re.search(pat, content)
assert m, "Bundle not found"
js = gzip.decompress(base64.b64decode(m.group(2))).decode("utf-8")
original = js

JIRA_MONITOR = r"""
function JiraMonitor() {
  const [tickets, setTickets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [erro, setErro] = React.useState(null);
  const [updated, setUpdated] = React.useState(null);

  const carregar = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/jira');
      const d = await r.json();
      setTickets(d.issues || []);
      setUpdated(new Date());
      setErro(null);
    } catch(e) { setErro('Nao foi possivel carregar.'); }
    finally { setLoading(false); }
  };

  React.useEffect(() => {
    carregar();
    const t = setInterval(carregar, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const urg = (upd) => {
    const d = Math.floor((Date.now() - new Date(upd)) / 86400000);
    if (d >= 15) return { emoji: '🔴', label: 'Critico',  cor: '#ef4444', d };
    if (d >= 8)  return { emoji: '🟠', label: 'Urgente',  cor: '#f97316', d };
    return               { emoji: '🟡', label: 'Atencao', cor: '#eab308', d };
  };

  const adf = (body) => {
    try { return body?.content?.flatMap(b=>b.content??[])?.filter(n=>n.type==='text')?.map(n=>n.text)?.join('')??''; }
    catch(e) { return ''; }
  };

  const nVermelhos = tickets.filter(t => Math.floor((Date.now()-new Date(t.fields.updated))/86400000) >= 15).length;
  const nLaranjas  = tickets.filter(t => { const d=Math.floor((Date.now()-new Date(t.fields.updated))/86400000); return d>=8&&d<15; }).length;

  return (
    <div className="jira-monitor">
      <div className="jira-head">
        <span className="jira-titulo">🎫 Tickets Parados</span>
        <div className="jira-contadores">
          {nVermelhos > 0 && <span className="jira-cnt" style={{background:'#ef444420',color:'#ef4444'}}>🔴 {nVermelhos}</span>}
          {nLaranjas  > 0 && <span className="jira-cnt" style={{background:'#f9731620',color:'#f97316'}}>🟠 {nLaranjas}</span>}
          {!loading && tickets.length === 0 && <span className="jira-cnt" style={{background:'#22c55e20',color:'#22c55e'}}>✓ OK</span>}
        </div>
        <button className="jira-refresh" onClick={carregar} title="Atualizar">↻</button>
      </div>

      {loading && <div className="jira-msg">Carregando tickets...</div>}
      {erro    && <div className="jira-msg jira-msg-erro">⚠️ {erro}</div>}
      {!loading && !erro && tickets.length === 0 && (
        <div className="jira-msg jira-msg-ok">🎉 Nenhum ticket parado no momento!</div>
      )}

      {!loading && tickets.length > 0 && (
        <div className="jira-lista">
          {tickets.map(t => {
            const u = urg(t.fields.updated);
            const last = t.fields.comment?.comments?.slice(-1)[0];
            const lastTxt = last ? adf(last.body) : '';
            return (
              <div key={t.key} className="jira-ticket" style={{borderLeft:`3px solid ${u.cor}`}}>
                <div className="jira-ticket-top">
                  <a href={`https://tiendanube.atlassian.net/browse/${t.key}`} target="_blank" rel="noreferrer" className="jira-key">{t.key}</a>
                  <span style={{color:u.cor,fontSize:'12px',fontWeight:600}}>{u.emoji} {u.d}d &middot; {u.label}</span>
                </div>
                <div className="jira-summary">{t.fields.summary}</div>
                {t.fields.assignee && <div className="jira-meta">👤 {t.fields.assignee.displayName}</div>}
                {lastTxt && <div className="jira-meta jira-comment">💬 {lastTxt.substring(0,100)}{lastTxt.length>100?'…':''}</div>}
              </div>
            );
          })}
        </div>
      )}
      {updated && <div className="jira-footer">↻ {updated.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</div>}
    </div>
  );
}
"""

# 1. Injeta componente JiraMonitor antes de AlertaCard
assert 'function AlertaCard(' in js, "AlertaCard nao encontrado"
js = js.replace('function AlertaCard(', JIRA_MONITOR + '\nfunction AlertaCard(', 1)

# 2. Coloca AlertaCard e JiraMonitor lado a lado
OLD_LAYOUT = '</div>\n\n        <AlertaCard />\n      </div>\n    </main>\n  );\n}'
NEW_LAYOUT = '</div>\n\n        <div className="alertas-row"><AlertaCard /><JiraMonitor /></div>\n      </div>\n    </main>\n  );\n}'
assert OLD_LAYOUT in js, "Layout nao encontrado"
js = js.replace(OLD_LAYOUT, NEW_LAYOUT, 1)

assert js != original, "Nenhuma alteracao aplicada"
print("OK — JiraMonitor injetado")

# Recomprime
compressed = base64.b64encode(gzip.compress(js.encode("utf-8"))).decode("ascii")
new_content = content[:m.start(2)] + compressed + content[m.end(2):]

# CSS do JiraMonitor + alertas-row
css = """<style>
.alertas-row{display:flex;gap:16px;margin-top:8px;align-items:flex-start}
.alertas-row>*{flex:1;min-width:0}
.jira-monitor{background:#1a1a2e;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px;color:#e2e8f0;font-size:13px;max-height:420px;display:flex;flex-direction:column;gap:8px}
.jira-head{display:flex;align-items:center;gap:8px}
.jira-titulo{font-weight:700;font-size:13px;flex:1}
.jira-contadores{display:flex;gap:4px}
.jira-cnt{padding:2px 7px;border-radius:99px;font-size:11px;font-weight:700}
.jira-refresh{background:none;border:none;color:#94a3b8;cursor:pointer;font-size:16px;padding:2px 6px;border-radius:6px;transition:color .2s}
.jira-refresh:hover{color:#e2e8f0}
.jira-msg{text-align:center;padding:20px;color:#64748b;font-size:13px}
.jira-msg-ok{color:#22c55e}
.jira-msg-erro{color:#ef4444}
.jira-lista{display:flex;flex-direction:column;gap:8px;overflow-y:auto;max-height:320px;padding-right:4px}
.jira-ticket{background:rgba(255,255,255,.04);border-radius:8px;padding:10px 12px;display:flex;flex-direction:column;gap:3px}
.jira-ticket-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
.jira-key{color:#818cf8;font-weight:700;font-size:12px;text-decoration:none}
.jira-key:hover{text-decoration:underline}
.jira-summary{font-size:13px;font-weight:500;color:#e2e8f0;line-height:1.4}
.jira-meta{font-size:11px;color:#64748b}
.jira-comment{font-style:italic}
.jira-footer{font-size:10px;color:#475569;text-align:right;margin-top:auto}
@media(max-width:768px){.alertas-row{flex-direction:column}}
</style>"""
new_content = new_content.replace("</head>", css + "</head>", 1)

with open(HTML, "w", encoding="utf-8") as f:
    f.write(new_content)
print("index.html salvo!")
