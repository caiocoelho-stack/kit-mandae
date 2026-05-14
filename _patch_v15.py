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

# ── Replace BriefingScreen placeholder ───────────────────────────────────────
OLD_BRIEFING = (
    'function BriefingScreen({ setRoute }) {\n'
    '  return <div style={{padding:40}}>Em construção...</div>;\n'
    '}'
)

NEW_BRIEFING = r'''function BriefingScreen({ setRoute }) {
  const [nomeCliente, setNomeCliente] = useState('');
  const [tipoReuniao, setTipoReuniao] = useState('Discovery');
  const [objetivo, setObjetivo] = useState('');
  const [contexto, setContexto] = useState('');
  const [preocupacoes, setPreocupacoes] = useState('');
  const [state, setState] = useState('empty');
  const [message, setMessage] = useState('');
  const [apiError, setApiError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showContextWarn, setShowContextWarn] = useState(false);

  const TIPOS = ['Discovery', 'Apresentação de proposta', 'Negociação', 'Renovação', 'QBR', 'Check-in', 'Reativação'];
  const HEADERS = ['🎯', '❓', '💬', '⚠️', '✅', '📊'];

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

  async function gerar() {
    if (!contexto.trim()) setShowContextWarn(true);
    else setShowContextWarn(false);
    setState('loading');
    setApiError('');
    try {
      const r = await fetch('/api/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipoReuniao, nomeCliente, empresa: '', objetivo, contexto, preocupacoes }),
      });
      const d = await r.json();
      if (d.message) {
        setMessage(d.message);
        setState('success');
        saveToHistory('briefing', (nomeCliente || 'Cliente') + ' · ' + tipoReuniao, d.message);
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
          <span style={{ color: 'var(--md-ink-2)' }}>Briefing de Reunião</span>
        </div>
        <div className="page-title-row">
          <div>
            <h1 className="page-title">Briefing de Reunião<span className="accent-bar" /></h1>
            <p className="page-subtitle">Prepare-se antes da call. Perguntas, talking points, objeções esperadas e próximo passo ideal.</p>
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
              <span className="h">Briefing de Reunião</span>
              <span className="step-pill">Pré-call</span>
            </div>

            <div className="field" style={{ marginTop: 4 }}>
              <div className="lbl">Nome do cliente e empresa</div>
              <input style={iStyle} value={nomeCliente} onChange={e => setNomeCliente(e.target.value)} placeholder="Ex: João Silva — Loja XYZ" />
            </div>

            <div className="field" style={{ marginTop: 8 }}>
              <div className="lbl">Tipo de reunião</div>
              <select style={{ ...iStyle, cursor: 'pointer' }} value={tipoReuniao} onChange={e => setTipoReuniao(e.target.value)}>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="field" style={{ marginTop: 8 }}>
              <div className="lbl">Objetivo do vendedor</div>
              <textarea style={{ ...iStyle, minHeight: 60, resize: 'vertical' }} value={objetivo} onChange={e => setObjetivo(e.target.value)} placeholder="O que você quer que aconteça ao fim dessa reunião?" />
            </div>

            <div className="field" style={{ marginTop: 8 }}>
              <div className="lbl">Contexto atual</div>
              <textarea style={{ ...iStyle, minHeight: 72, resize: 'vertical' }} value={contexto} onChange={e => { setContexto(e.target.value); if (e.target.value.trim()) setShowContextWarn(false); }} placeholder="Onde está no funil, o que já foi discutido, o que o cliente sinalizou" />
            </div>

            <div className="field" style={{ marginTop: 8 }}>
              <div className="lbl">Preocupações conhecidas <span style={{ opacity: 0.5, fontWeight: 400 }}>(opcional)</span></div>
              <textarea style={{ ...iStyle, minHeight: 52, resize: 'vertical' }} value={preocupacoes} onChange={e => setPreocupacoes(e.target.value)} placeholder="Alguma objeção ou dúvida que o cliente já levantou?" />
            </div>

            {showContextWarn && (
              <div style={{ margin: '6px 0 2px', padding: '6px 10px', borderRadius: 6, background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 600 }}>
                ⚡ Quanto mais contexto, melhor o briefing
              </div>
            )}

            <div className="action-row">
              {state === 'loading' ? (
                <button className="btn-primary loading" disabled>
                  <span className="spinner" />
                  Preparando briefing…
                </button>
              ) : (
                <button className="btn-primary" onClick={gerar}>
                  {I.stars} Gerar briefing
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
                <span className="lbl">Briefing</span>
                {state === 'success' && (
                  <span style={{ background: 'var(--md-surface)', border: '1px solid var(--md-line)', borderRadius: 20, padding: '2px 8px', fontSize: 11, color: 'var(--md-ink-2)' }}>{tipoReuniao}</span>
                )}
              </div>
              {state === 'success' && (
                <button className={"btn-copy " + (copied ? "copied" : "")} onClick={copy}>
                  {copied ? <>{I.check} Copiado</> : <>{I.copy} Copiar briefing</>}
                </button>
              )}
            </div>

            {state === 'success' ? (
              <>
                <div className="message">{renderMessage(message)}</div>
                <div className="result-foot">
                  <a className="reset-link" onClick={() => { setState('empty'); setMessage(''); setApiError(''); }}>
                    {I.refresh} Novo briefing
                  </a>
                  <button className="btn-copy" onClick={gerar}>{I.refresh} Gerar outra versão</button>
                </div>
              </>
            ) : state === 'loading' ? (
              <div className="result-loading">
                <div className="big-spinner" />
                <div className="h">Preparando seu briefing...</div>
              </div>
            ) : (
              <div className="result-empty">
                <div className="glyph">{I.stats}</div>
                <div className="h">Nenhum briefing gerado ainda</div>
                <div className="s">Preencha o contexto ao lado e gere o briefing antes da sua próxima call.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}'''

assert OLD_BRIEFING in js, "BriefingScreen placeholder not found"
js = js.replace(OLD_BRIEFING, NEW_BRIEFING, 1)
print("1. BriefingScreen implementada")

# ── Repack ────────────────────────────────────────────────────────────────────
new_b64 = base64.b64encode(gzip.compress(js.encode('utf-8'))).decode('ascii')
content = content[:m.start(2)] + new_b64 + content[m.end(2):]
print("   Bundle repacked.")

with open(HTML, 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDone. index.html saved.")
