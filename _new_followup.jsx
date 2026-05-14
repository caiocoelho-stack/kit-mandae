function FollowupScreen({ setRoute }) {
  const [nomeCliente, setNomeCliente] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [momento, setMomento] = useState('Após reunião');
  const [canal, setCanal] = useState('WhatsApp');
  const [tom, setTom] = useState('Próximo');
  const [contexto, setContexto] = useState('');
  const [diasSemResposta, setDiasSemResposta] = useState('');
  const [state, setState] = useState('empty');
  const [message, setMessage] = useState('');
  const [apiError, setApiError] = useState('');
  const [copied, setCopied] = useState(false);

  const momentos = ['Após reunião','Proposta enviada','Sem resposta há dias','Cliente sumiu','Renovação','Pós onboarding'];
  const canais   = ['WhatsApp','E-mail','Ligação'];
  const tons     = ['Próximo','Profissional','Direto'];

  const tomEfetivo = (momento === 'Cliente sumiu' && tom === 'Profissional') ? 'Misto' : tom;
  const showTomWarning = momento === 'Cliente sumiu' && tom === 'Profissional';

  const iStyle = { width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid var(--md-line)', background: 'var(--md-surface)', color: 'var(--md-ink)', fontSize: 13, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' };

  async function gerar() {
    setState('loading');
    setApiError('');
    try {
      const r = await fetch('/api/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomeCliente, empresa, momento, canal, tom: tomEfetivo, contexto, diasSemResposta }),
      });
      const d = await r.json();
      if (d.message) { setMessage(d.message); setState('success'); }
      else { setApiError('Resposta inesperada da API.'); setState('empty'); }
    } catch (e) {
      setApiError('Erro de conexão com a API.');
      setState('empty');
    }
  }

  function copy() {
    navigator.clipboard?.writeText(message).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function renderResult() {
    if (canal === 'Ligação') {
      const parts = message.match(/\[(Abertura|Desenvolvimento|Fechamento)\][^\[]+/g) || [];
      const colors = { Abertura: '#3b82f6', Desenvolvimento: '#8b5cf6', Fechamento: '#10b981' };
      return ['Abertura', 'Desenvolvimento', 'Fechamento'].map(lbl => {
        const part = parts.find(p => p.startsWith('[' + lbl + ']')) || '';
        const text = part.replace('[' + lbl + ']', '').trim();
        return (
          <div key={lbl} style={{ borderRadius: 8, borderLeft: '3px solid ' + colors[lbl], padding: '10px 12px', marginBottom: 8, background: 'var(--md-surface)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: colors[lbl], marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{lbl}</div>
            <div style={{ fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{text}</div>
          </div>
        );
      });
    }
    if (canal === 'E-mail') {
      const lines = message.split('\n');
      const subjectLine = lines.find(l => l.startsWith('Assunto:')) || '';
      const body = lines.filter(l => !l.startsWith('Assunto:')).join('\n').trim();
      return <>
        {subjectLine && <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, padding: '6px 10px', background: 'var(--md-surface)', borderRadius: 6 }}>{subjectLine}</div>}
        <div style={{ fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{body}</div>
      </>;
    }
    return <div style={{ fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{message}</div>;
  }

  return (
    <main className="main">
      <div className="page-header">
        <div className="page-eyebrow">
          <span className="dot" />
          <span style={{ cursor: 'pointer' }} onClick={() => setRoute('home')}>Ferramentas</span>
          <span style={{ color: 'var(--md-muted-2)' }}>/</span>
          <span style={{ color: 'var(--md-ink-2)' }}>Gerador de Follow-up</span>
        </div>
        <div className="page-title-row">
          <div>
            <h1 className="page-title">Gerador de Follow-up<span className="accent-bar" /></h1>
            <p className="page-subtitle">Mensagens de follow-up B2B prontas por momento, canal e tom. Sem clichês, com CTA claro.</p>
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
              <span className="h">Dados do follow-up</span>
              <span className="step-pill">PASSO 1 DE 2</span>
            </div>

            <div className="config-row">
              <div className="field">
                <div className="lbl">Nome do cliente</div>
                <input style={iStyle} value={nomeCliente} onChange={e => setNomeCliente(e.target.value)} placeholder="Ex: João Silva" />
              </div>
              <div className="field">
                <div className="lbl">Empresa</div>
                <input style={iStyle} value={empresa} onChange={e => setEmpresa(e.target.value)} placeholder="Ex: Loja XYZ" />
              </div>
            </div>

            <div className="field" style={{ marginTop: 8 }}>
              <div className="lbl">Momento</div>
              <select style={{ ...iStyle, cursor: 'pointer' }} value={momento} onChange={e => setMomento(e.target.value)}>
                {momentos.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="config-row" style={{ marginTop: 8 }}>
              <div className="field">
                <div className="lbl">Canal</div>
                <select style={{ ...iStyle, cursor: 'pointer' }} value={canal} onChange={e => setCanal(e.target.value)}>
                  {canais.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="field">
                <div className="lbl">Tom</div>
                <select style={{ ...iStyle, cursor: 'pointer' }} value={tom} onChange={e => setTom(e.target.value)}>
                  {tons.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="field" style={{ marginTop: 8 }}>
              <div className="lbl">Contexto / última interação (opcional)</div>
              <textarea style={{ ...iStyle, minHeight: 72, resize: 'vertical' }} value={contexto} onChange={e => setContexto(e.target.value)} placeholder="Ex: Enviamos proposta na semana passada com 15% de desconto na tabela SP." />
            </div>

            {momento === 'Sem resposta há dias' && (
              <div className="field" style={{ marginTop: 8 }}>
                <div className="lbl">Dias sem resposta</div>
                <input style={iStyle} type="number" min="1" value={diasSemResposta} onChange={e => setDiasSemResposta(e.target.value)} placeholder="Ex: 5" />
              </div>
            )}

            {showTomWarning && (
              <div style={{ margin: '6px 0 2px', padding: '6px 10px', borderRadius: 6, background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 600 }}>
                ⚠ Tom ajustado para "Misto" — "Profissional" não funciona bem para cliente sumido.
              </div>
            )}

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
                <span className="lbl">Mensagem gerada</span>
                {state === 'success' && <span className="meta">· {message.length.toLocaleString('pt-BR')} caracteres</span>}
              </div>
              {state === 'success' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className={"btn-copy " + (copied ? "copied" : "")} onClick={copy}>
                    {copied ? <>{I.check} Copiado</> : <>{I.copy} Copiar</>}
                  </button>
                </div>
              )}
            </div>

            {state === 'success' ? (
              <>
                <div className="message">{renderResult()}</div>
                <div className="result-foot">
                  <a className="reset-link" onClick={() => { setState('empty'); setMessage(''); setApiError(''); }}>
                    {I.refresh} Gerar para outro cliente
                  </a>
                  <div className="channels">
                    {canal === 'WhatsApp' && (
                      <button className="btn-copy" style={{ color: '#25D366' }} onClick={() => window.open('https://wa.me/?text=' + encodeURIComponent(message), '_blank')}>
                        {I.whatsapp} Abrir no WhatsApp
                      </button>
                    )}
                    <button className="btn-copy" onClick={gerar}>{I.refresh} Gerar outra versão</button>
                  </div>
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
                <div className="s">Preencha os campos à esquerda e clique em <b style={{ color: 'var(--md-ink-2)' }}>Gerar mensagem</b>. A prévia aparece aqui.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
