function SlackScreen({ setRoute }) {
  const [clausula, setClausula] = useState('');
  const [areas, setAreas] = useState([]);
  const [nomeCliente, setNomeCliente] = useState('');
  const [porte, setPorte] = useState('Médio');
  const [pedidoCliente, setPedidoCliente] = useState('');
  const [urgencia, setUrgencia] = useState('Normal (48h)');
  const [impacto, setImpacto] = useState('');
  const [state, setState] = useState('empty');
  const [message, setMessage] = useState('');
  const [apiError, setApiError] = useState('');
  const [copied, setCopied] = useState(false);

  const AREAS   = ['Jurídico', 'Financeiro', 'Operações', 'Produto', 'Diretoria'];
  const PORTES  = ['Pequeno', 'Médio', 'Grande', 'Enterprise'];
  const URGENCIAS = ['Normal (48h)', 'Urgente (24h)', 'Crítico (hoje)'];
  const areaHandles = { 'Jurídico': '@juridico', 'Financeiro': '@financeiro', 'Operações': '@operacoes', 'Produto': '@produto', 'Diretoria': '@diretoria' };

  const iStyle = { width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid var(--md-line)', background: 'var(--md-surface)', color: 'var(--md-ink)', fontSize: 13, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' };

  function toggleArea(a) { setAreas(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]); }

  function copy() {
    navigator.clipboard?.writeText(message).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function gerar() {
    setState('loading');
    setApiError('');
    try {
      const r = await fetch('/api/slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clausula, areas, nomeCliente, porte, pedidoCliente, urgencia, impacto }),
      });
      const d = await r.json();
      if (d.message) { setMessage(d.message); setState('success'); }
      else { setApiError('Resposta inesperada da API.'); setState('empty'); }
    } catch (e) {
      setApiError('Erro de conexão com a API.');
      setState('empty');
    }
  }

  function renderSlackPreview(text) {
    const parts = text.split(/(\*[^*]+\*)/g);
    return parts.map((p, i) =>
      p.startsWith('*') && p.endsWith('*')
        ? <strong key={i}>{p.slice(1, -1)}</strong>
        : <React.Fragment key={i}>{p}</React.Fragment>
    );
  }

  return (
    <main className="main">
      <div className="page-header">
        <div className="page-eyebrow">
          <span className="dot" />
          <span style={{ cursor: 'pointer' }} onClick={() => setRoute('home')}>Ferramentas</span>
          <span style={{ color: 'var(--md-muted-2)' }}>/</span>
          <span style={{ color: 'var(--md-ink-2)' }}>Aprovação Interna</span>
        </div>
        <div className="page-title-row">
          <div>
            <h1 className="page-title">Aprovação Interna<span className="accent-bar" /></h1>
            <p className="page-subtitle">Gera a mensagem de pedido de aprovação para o Slack interno. Formato padronizado, direto, sem rodeios.</p>
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
              <span className="h">Dados da aprovação</span>
              <span className="step-pill">PASSO 1 DE 2</span>
            </div>

            <div className="field" style={{ marginTop: 4 }}>
              <div className="lbl">Trecho da cláusula</div>
              <textarea style={{ ...iStyle, minHeight: 68, resize: 'vertical' }} value={clausula} onChange={e => setClausula(e.target.value)} placeholder="Cole o trecho exato ou descreva o que o cliente quer" />
            </div>

            <div className="side-controls">
              <div className="ctl-h">Área responsável</div>
              <div className="toggle-row" style={{ flexWrap: 'wrap' }}>
                {AREAS.map(a => (
                  <button key={a} className={"opt " + (areas.includes(a) ? "on" : "")} onClick={() => toggleArea(a)}>{a}</button>
                ))}
              </div>
            </div>

            <div className="config-row">
              <div className="field">
                <div className="lbl">Nome do cliente</div>
                <input style={iStyle} value={nomeCliente} onChange={e => setNomeCliente(e.target.value)} placeholder="Ex: Loja XYZ" />
              </div>
              <div className="field">
                <div className="lbl">Porte</div>
                <select style={{ ...iStyle, cursor: 'pointer' }} value={porte} onChange={e => setPorte(e.target.value)}>
                  {PORTES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="field" style={{ marginTop: 8 }}>
              <div className="lbl">O que o cliente quer exatamente</div>
              <textarea style={{ ...iStyle, minHeight: 68, resize: 'vertical' }} value={pedidoCliente} onChange={e => setPedidoCliente(e.target.value)} placeholder="Descreva o pedido específico do cliente..." />
            </div>

            <div className="side-controls">
              <div className="ctl-h">Urgência</div>
              <div className="toggle-row">
                {URGENCIAS.map(u => (
                  <button key={u} className={"opt " + (urgencia === u ? "on" : "")} onClick={() => setUrgencia(u)}>{u}</button>
                ))}
              </div>
            </div>

            <div className="field" style={{ marginTop: 8 }}>
              <div className="lbl">Impacto se não aprovar (opcional)</div>
              <textarea style={{ ...iStyle, minHeight: 52, resize: 'vertical' }} value={impacto} onChange={e => setImpacto(e.target.value)} placeholder="Ex: Perdemos o deal, cliente vai para concorrente..." />
            </div>

            <div className="action-row">
              {state === 'loading' ? (
                <button className="btn-primary loading" disabled>
                  <span className="spinner" />
                  Gerando mensagem…
                </button>
              ) : (
                <button className="btn-primary" onClick={gerar}>
                  {I.paperPlane} Gerar mensagem
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
                <span className="lbl">Preview Slack</span>
                {state === 'success' && <span className="meta">· #aprovacoes-comercial</span>}
              </div>
              {state === 'success' && (
                <button className={"btn-copy " + (copied ? "copied" : "")} onClick={copy}>
                  {copied ? <>{I.check} Copiado</> : <>{I.copy} Copiar</>}
                </button>
              )}
            </div>

            {state === 'success' ? (
              <>
                <div className="message" style={{ background: '#1a1a2e', padding: '16px', borderRadius: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 6, background: 'var(--md-coral)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>M</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, color: '#fff', fontSize: 13 }}>Comercial Mandaê</span>
                        <span style={{ fontSize: 10, color: '#6b7280' }}>Agora</span>
                      </div>
                      <div style={{ fontFamily: '"SF Mono", "Fira Code", monospace', fontSize: 13, lineHeight: 1.65, color: '#d1d5db', whiteSpace: 'pre-wrap' }}>
                        {renderSlackPreview(message)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="result-foot">
                  <a className="reset-link" onClick={gerar}>{I.refresh} Gerar outra versão</a>
                  {areas.length > 0 && (
                    <div className="channels">
                      {areas.map(a => <span key={a} className="chan" style={{ color: 'var(--md-coral)' }}>{areaHandles[a] || '@' + a.toLowerCase()}</span>)}
                    </div>
                  )}
                </div>
              </>
            ) : state === 'loading' ? (
              <div className="result-loading">
                <div className="big-spinner" />
                <div className="h">Gerando mensagem…</div>
              </div>
            ) : (
              <div className="result-empty">
                <div className="glyph">{I.paperPlane}</div>
                <div className="h">Nenhuma mensagem gerada ainda</div>
                <div className="s">Preencha os campos à esquerda e clique em <b style={{ color: 'var(--md-ink-2)' }}>Gerar mensagem</b>. O preview aparece aqui.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
