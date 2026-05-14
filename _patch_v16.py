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

# ── Replace ConcorrenteScreen placeholder ────────────────────────────────────
OLD_CONCORRENTE = (
    'function ConcorrenteScreen({ setRoute }) {\n'
    '  return <div style={{padding:40}}>Em construção...</div>;\n'
    '}'
)

NEW_CONCORRENTE = r'''function ConcorrenteScreen({ setRoute }) {
  const [concorrente, setConcorrente] = useState('');
  const [oQueDisso, setOQueDisso] = useState('');
  const [aspecto, setAspecto] = useState('Preço');
  const [contexto, setContexto] = useState('');
  const [state, setState] = useState('empty');
  const [message, setMessage] = useState('');
  const [apiError, setApiError] = useState('');
  const [copied, setCopied] = useState(false);

  const ASPECTOS = ['Preço', 'Prazo de entrega', 'Cobertura', 'Integração', 'Suporte', 'Rastreio', 'Outro'];
  const HEADERS = ['🔍', '⚔️', '🤝', '💬'];

  const iStyle = { width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid var(--md-line)', background: 'var(--md-surface)', color: 'var(--md-ink)', fontSize: 13, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' };

  function saveToHistory(tool, label, msg) {
    try {
      const hist = JSON.parse(localStorage.getItem('kit_history') || '[]');
      hist.unshift({ tool, label, msg, ts: new Date().toISOString() });
      localStorage.setItem('kit_history', JSON.stringify(hist.slice(0, 20)));
    } catch {}
  }

  function copy() {
    navigator.clipboard?.writeText(message).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function analisar() {
    setState('loading');
    setApiError('');
    try {
      const r = await fetch('/api/concorrente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concorrente, oQueDisso, aspecto, contexto }),
      });
      const d = await r.json();
      if (d.message) {
        setMessage(d.message);
        setState('success');
        saveToHistory('concorrente', concorrente || 'Concorrente', d.message);
      } else {
        setApiError('Resposta inesperada da API.');
        setState('empty');
      }
    } catch {
      setApiError('Erro de conexão com a API.');
      setState('empty');
    }
  }

  function renderMessage(text) {
    return text.split('\n').map((line, i) => {
      if (HEADERS.some(h => line.startsWith(h))) {
        return <h4 key={i} style={{ margin: i === 0 ? '0 0 6px' : '16px 0 6px', color: 'var(--md-coral)', fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em' }}>{line}</h4>;
      }
      if (!line.trim()) return <div key={i} style={{ height: 4 }} />;
      return <div key={i} style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--md-ink)' }}>{line}</div>;
    });
  }

  return (
    <main className="main">
      <div className="page-header">
        <div className="page-eyebrow">
          <span className="dot" />
          <span style={{ cursor: 'pointer' }} onClick={() => setRoute('home')}>Ferramentas</span>
          <span style={{ color: 'var(--md-muted-2)' }}>/</span>
          <span style={{ color: 'var(--md-ink-2)' }}>Análise de Concorrente</span>
        </div>
        <div className="page-title-row">
          <div>
            <h1 className="page-title">Análise de Concorrente<span className="accent-bar" /></h1>
            <p className="page-subtitle">Cliente mencionou um concorrente? Receba diferenciação específica e pronta para usar na hora.</p>
          </div>
          <div className="page-meta">
            <span className="meta-pill"><span className="led" /> Ferramenta ativa</span>
          </div>
        </div>
      </div>

      <div className="tool-layout">
        <div>
          <div className="upload-card">
            <div className="upload-card-head">
              <span className="h">Análise de Concorrente</span>
              <span className="step-pill">Inteligência</span>
            </div>

            <div className="field" style={{ marginTop: 4 }}>
              <div className="lbl">Concorrente mencionado</div>
              <input style={iStyle} value={concorrente} onChange={e => setConcorrente(e.target.value)} placeholder="Ex: Jadlog, Total Express, Melhor Envio, Frenet..." />
            </div>

            <div className="field" style={{ marginTop: 8 }}>
              <div className="lbl">O que o cliente disse</div>
              <textarea style={{ ...iStyle, minHeight: 72, resize: 'vertical' }} value={oQueDisso} onChange={e => setOQueDisso(e.target.value)} placeholder="Como o concorrente foi mencionado? Elogio, comparação de preço, prazo?" />
            </div>

            <div className="field" style={{ marginTop: 8 }}>
              <div className="lbl">Aspecto em disputa</div>
              <select style={{ ...iStyle, cursor: 'pointer' }} value={aspecto} onChange={e => setAspecto(e.target.value)}>
                {ASPECTOS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div className="field" style={{ marginTop: 8 }}>
              <div className="lbl">Contexto do deal <span style={{ opacity: 0.5, fontWeight: 400 }}>(opcional)</span></div>
              <textarea style={{ ...iStyle, minHeight: 52, resize: 'vertical' }} value={contexto} onChange={e => setContexto(e.target.value)} placeholder="Fase da negociação, perfil do cliente, volume" />
            </div>

            <div style={{ margin: '10px 0 2px', padding: '8px 12px', borderRadius: 6, background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 600 }}>
              ⚠️ Preencha os diferenciais da Mandaê no system prompt antes de usar em produção.
            </div>

            <div className="action-row">
              {state === 'loading' ? (
                <button className="btn-primary loading" disabled>
                  <span className="spinner" />
                  Pesquisando concorrente…
                </button>
              ) : (
                <button className="btn-primary" onClick={analisar}>
                  {I.stats} Analisar
                </button>
              )}
            </div>

            {apiError && (
              <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 8, background: 'rgba(232,97,74,0.08)', border: '1px solid rgba(232,97,74,0.25)', color: 'var(--md-coral)', fontSize: 13 }}>
                ⚠ {apiError}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="result-card">
            <div className="result-head">
              <div className="result-head-l">
                <span className="lbl">Análise</span>
                {concorrente && (
                  <span style={{ background: 'var(--md-surface)', border: '1px solid var(--md-line)', borderRadius: 20, padding: '2px 8px', fontSize: 11, color: 'var(--md-ink-2)' }}>{concorrente}</span>
                )}
              </div>
              {state === 'success' && (
                <button className={"btn-copy " + (copied ? "copied" : "")} onClick={copy}>
                  {copied ? <>{I.check} Copiado</> : <>{I.copy} Copiar análise</>}
                </button>
              )}
            </div>

            {state === 'success' ? (
              <>
                <div className="message">{renderMessage(message)}</div>
                <div className="result-foot">
                  <a className="reset-link" onClick={() => { setState('empty'); setMessage(''); setApiError(''); }}>
                    {I.refresh} Nova análise
                  </a>
                  <button className="btn-copy" onClick={analisar}>{I.refresh} Gerar outra versão</button>
                </div>
              </>
            ) : state === 'loading' ? (
              <div className="result-loading">
                <div className="big-spinner" />
                <div className="h">Buscando informações sobre o concorrente...</div>
              </div>
            ) : (
              <div className="result-empty">
                <div className="glyph">{I.lock}</div>
                <div className="h">Nenhuma análise gerada ainda</div>
                <div className="s">Informe qual concorrente foi mencionado e o contexto da conversa.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}'''

assert OLD_CONCORRENTE in js, "ConcorrenteScreen placeholder not found"
js = js.replace(OLD_CONCORRENTE, NEW_CONCORRENTE, 1)
print("1. ConcorrenteScreen implementada")

# ── Repack ────────────────────────────────────────────────────────────────────
new_b64 = base64.b64encode(gzip.compress(js.encode('utf-8'))).decode('ascii')
content = content[:m.start(2)] + new_b64 + content[m.end(2):]
print("   Bundle repacked.")

with open(HTML, 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDone. index.html saved.")
