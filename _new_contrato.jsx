function ContratoScreen({ setRoute }) {
  const [file, setFile] = useState(null);
  const [contexto, setContexto] = useState('');
  const [state, setState] = useState('empty');
  const [loadMsg, setLoadMsg] = useState('Lendo contrato...');
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const fileRef = useRef(null);

  const statusCfg = {
    ACEITAR:  { color: '#065f46', bg: '#d1fae5', dot: '🟢' },
    NEGOCIAR: { color: '#92400e', bg: '#fef3c7', dot: '🟡' },
    ESCALAR:  { color: '#991b1b', bg: '#fee2e2', dot: '🔴' },
  };

  function formatSize(bytes) {
    if (bytes < 1048576) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function renderEmailBlock(email) {
    const lines = (email || '').split('\n');
    const subjectLine = lines.find(l => l.startsWith('Assunto:')) || '';
    const body = lines.filter(l => !l.startsWith('Assunto:')).join('\n').trim();
    return <>
      {subjectLine && <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, padding: '6px 10px', background: 'var(--md-surface)', borderRadius: 6 }}>{subjectLine}</div>}
      <div style={{ fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{body}</div>
    </>;
  }

  const iStyle = { width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid var(--md-line)', background: 'var(--md-surface)', color: 'var(--md-ink)', fontSize: 13, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' };

  async function analisar() {
    if (!file) { setApiError('Selecione um arquivo .docx.'); return; }
    if (typeof mammoth === 'undefined') { setApiError('Biblioteca mammoth não carregada. Recarregue a página.'); return; }
    setState('loading');
    setApiError('');
    setResult(null);

    const msgs = ['Lendo contrato...', 'Comparando com o manual...', 'Gerando análise...'];
    let mi = 0;
    setLoadMsg(msgs[0]);
    const iv = setInterval(() => { mi = Math.min(mi + 1, msgs.length - 1); setLoadMsg(msgs[mi]); }, 2000);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const extraction = await mammoth.extractRawText({ arrayBuffer });
      const texto = extraction.value;

      const r = await fetch('/api/contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conteudoContrato: texto, contexto }),
      });
      const d = await r.json();
      if (d.error) { setApiError(d.error); setState('empty'); }
      else { setResult(d); setState('success'); }
    } catch (e) {
      setApiError('Erro ao processar: ' + e.message);
      setState('empty');
    } finally {
      clearInterval(iv);
    }
  }

  return (
    <main className="main">
      <div className="page-header">
        <div className="page-eyebrow">
          <span className="dot" />
          <span style={{ cursor: 'pointer' }} onClick={() => setRoute('home')}>Ferramentas</span>
          <span style={{ color: 'var(--md-muted-2)' }}>/</span>
          <span style={{ color: 'var(--md-ink-2)' }}>Auxiliar de Contrato</span>
        </div>
        <div className="page-title-row">
          <div>
            <h1 className="page-title">Auxiliar de Contrato<span className="accent-bar" /></h1>
            <p className="page-subtitle">Analisa cláusulas comentadas pelo cliente e compara com o manual de negociação interno.</p>
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
              <span className="h">Contrato comentado</span>
              <span className="step-pill">PASSO 1 DE 2</span>
            </div>

            {!file ? (
              <div className="dropzone" onClick={() => fileRef.current?.click()}>
                <input ref={fileRef} type="file" accept=".docx" style={{ display: 'none' }} onChange={e => { setFile(e.target.files?.[0] || null); setApiError(''); }} />
                <div className="dropzone-icon">{I.invoice}</div>
                <p className="dropzone-title">Arraste o contrato aqui ou <span className="browse">selecione</span></p>
                <p className="dropzone-sub">Arquivo .docx comentado pelo jurídico do cliente</p>
              </div>
            ) : (
              <div className="dropzone has-file">
                <div className="dropzone-icon">{I.fileAlt}</div>
                <div className="dropzone-info">
                  <p className="dropzone-title">{file.name}</p>
                  <div className="file-meta"><span>{formatSize(file.size)}</span></div>
                </div>
                <button className="file-x" onClick={e => { e.stopPropagation(); setFile(null); setState('empty'); }}>×</button>
              </div>
            )}

            <div className="field" style={{ marginTop: 8 }}>
              <div className="lbl">Contexto do deal (opcional)</div>
              <textarea style={{ ...iStyle, minHeight: 68, resize: 'vertical' }} value={contexto} onChange={e => setContexto(e.target.value)} placeholder="Nome do cliente, porte, urgência, pontos sensíveis..." />
            </div>

            <div className="field" style={{ marginTop: 8 }}>
              <div className="lbl">Manual de negociação</div>
              <div className="val">📋 Carregado (v. atual)</div>
            </div>

            <div className="action-row">
              {state === 'loading' ? (
                <button className="btn-primary loading" disabled>
                  <span className="spinner" />
                  {loadMsg}
                </button>
              ) : (
                <button className="btn-primary" onClick={analisar}>
                  {I.stars} Analisar contrato
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
                <span className="lbl">Análise de cláusulas</span>
                {state === 'success' && result && <span className="meta">· {result.clausulas?.length || 0} cláusula(s)</span>}
              </div>
            </div>

            {state === 'success' && result ? (
              <>
                <div className="message">
                  {(result.clausulas || []).map((cl, i) => {
                    const cfg = statusCfg[cl.status] || statusCfg.ESCALAR;
                    return (
                      <div key={i} style={{ borderRadius: 8, padding: '10px 12px', background: cfg.bg, border: '1px solid ' + cfg.color + '33', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: cfg.bg, color: cfg.color, border: '1px solid ' + cfg.color }}>{cfg.dot} {cl.status}</span>
                          {cl.is_nova && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#ede9fe', color: '#6d28d9', border: '1px solid #6d28d9' }}>NOVA</span>}
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--md-ink)' }}>{[cl.numero, cl.titulo].filter(Boolean).join(' — ')}</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--md-ink-2)', marginBottom: 3 }}><b>Pedido:</b> {cl.pedido_cliente}</div>
                        <div style={{ fontSize: 11, color: 'var(--md-ink-2)', marginBottom: 3 }}><b>Análise:</b> {cl.justificativa}</div>
                        <div style={{ fontSize: 11, color: 'var(--md-ink)' }}><b>Sugestão:</b> {cl.sugestao}</div>
                      </div>
                    );
                  })}

                  <div style={{ borderTop: '1px solid var(--md-line)', paddingTop: 14, marginTop: 6, marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--md-ink-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>E-mail de retorno</span>
                      <button className={"btn-copy " + (copiedEmail ? "copied" : "")} onClick={() => { navigator.clipboard?.writeText(result.email_retorno || ''); setCopiedEmail(true); setTimeout(() => setCopiedEmail(false), 2000); }}>
                        {copiedEmail ? <>{I.check} Copiado</> : <>{I.copy} Copiar e-mail</>}
                      </button>
                    </div>
                    {renderEmailBlock(result.email_retorno)}
                  </div>

                  <div style={{ borderTop: '1px solid var(--md-line)', paddingTop: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--md-ink-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Resumo executivo</div>
                    <p style={{ fontSize: 13, color: 'var(--md-ink)', lineHeight: 1.65, marginBottom: 10, marginTop: 0 }}>{result.resumo}</p>
                    <div style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--md-surface)', borderLeft: '3px solid var(--md-coral)' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--md-ink-2)', marginBottom: 3, textTransform: 'uppercase' }}>PRÓXIMO PASSO</div>
                      <div style={{ fontSize: 13, color: 'var(--md-ink)' }}>{result.proximo_passo}</div>
                    </div>
                  </div>
                </div>
                <div className="result-foot">
                  <a className="reset-link" onClick={() => { setState('empty'); setFile(null); setResult(null); setApiError(''); }}>
                    {I.refresh} Analisar outro contrato
                  </a>
                </div>
              </>
            ) : state === 'loading' ? (
              <div className="result-loading">
                <div className="big-spinner" />
                <div className="h">{loadMsg}</div>
                <div className="substeps">
                  <div className="row"><span className="b">1</span> Extraindo texto do documento…</div>
                  <div className="row"><span className="b">2</span> Comparando com manual de negociação…</div>
                  <div className="row"><span className="b">3</span> Classificando cláusulas e gerando e-mail…</div>
                </div>
              </div>
            ) : (
              <div className="result-empty">
                <div className="glyph">{I.invoice}</div>
                <div className="h">Nenhum contrato analisado ainda</div>
                <div className="s">Faça upload do contrato comentado e clique em <b style={{ color: 'var(--md-ink-2)' }}>Analisar contrato</b>. O semáforo de cláusulas aparece aqui.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
