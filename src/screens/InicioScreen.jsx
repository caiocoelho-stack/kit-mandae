import React, { useState, useEffect, useRef } from 'react';
import { I } from '../icons.jsx';

function ToolScreen({ setRoute }) {
  const [state, setState] = useState("empty");
  const [copied, setCopied] = useState(false);
  const [tone, setTone] = useState("formal");
  const [includeNuvem, setIncludeNuvem] = useState(true);
  const [includeNext, setIncludeNext] = useState(true);
  const [file, setFile] = useState(null);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [apiError, setApiError] = useState(null);
  const [sellerName, setSellerName] = useState('');
  const [markComercial, setMarkComercial] = useState(false);
  const [generateTime, setGenerateTime] = useState(0);
  const [clienteDetectado, setClienteDetectado] = useState('');
  const [plano, setPlano] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  function formatSize(bytes) {
    if (bytes < 1048576) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function readBase64(f) {
    return new Promise((ok, fail) => {
      const r = new FileReader();
      r.onload = () => ok(r.result.split(',')[1]);
      r.onerror = fail;
      r.readAsDataURL(f);
    });
  }

  async function generate() {
    if (!file) return;
    setState("loading");
    setApiError(null);
    const _t0 = Date.now();
    try {
      const b64 = await readBase64(file);
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileBase64: b64, mimeType: file.type || 'application/pdf', tone, sellerName, includeNuvem, includeNext, markComercial })
      });
      const data = await res.json();
      if (!data?.message) throw new Error('Campo message ausente: ' + JSON.stringify(data));
      if (!res.ok) throw new Error(data.error || 'Erro desconhecido');
      setGeneratedMessage(data.message);
      setClienteDetectado(data.clienteDetectado || '');
      setPlano(data.plano || '');
      setGenerateTime(Math.round((Date.now() - _t0) / 1000));
      const _entry = { timestamp: new Date().toISOString(), sellerName, fileName: file?.name };
      const _hist = JSON.parse(localStorage.getItem('historico') || '[]');
      _hist.push(_entry);
      localStorage.setItem('historico', JSON.stringify(_hist));
      setState("success");
    } catch (e) {
      console.error('[generate]', e);
      setApiError(e.message);
      setState("uploaded");
    }
  }

  function copy() {
    navigator.clipboard?.writeText(generatedMessage).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="main">
      <div className="page-header">
        <div className="page-eyebrow">
          <span className="dot" />
          <span style={{ cursor: "pointer" }} onClick={() => setRoute("home")}>Ferramentas</span>
          <span style={{ color: "var(--md-muted-2)" }}>/</span>
          <span style={{ color: "var(--md-ink-2)" }}>Boas-vindas ao Cliente</span>
        </div>
        <div className="page-title-row">
          <div>
            <h1 className="page-title">
              Boas-vindas ao Cliente<span className="accent-bar" />
            </h1>
            <p className="page-subtitle">
              Anexe a ficha cadastral do novo cliente e gere a mensagem pronta para o grupo do WhatsApp. Dados são extraídos automaticamente.
            </p>
          </div>
          <div className="page-meta">
            <span className="meta-pill"><span className="led" /> Ferramenta ativa</span>
          </div>
        </div>
      </div>

      <div className="tool-layout">
        {/* LEFT: upload + controls */}
        <div>
          <div className="upload-card">
            <div className="upload-card-head">
              <span className="h">1. Anexar ficha cadastral</span>
              <span className="step-pill">PASSO 1 DE 2</span>
            </div>

            {(state === "empty") ? (
              <div className="dropzone" onClick={() => fileInputRef.current?.click()}>
                <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.png,.jpeg" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); setState("uploaded"); setApiError(null); } }} />
                <div className="dropzone-icon">{I.upload}</div>
                <p className="dropzone-title">Arraste a ficha aqui ou <span className="browse">selecione um arquivo</span></p>
                <p className="dropzone-sub">PDF ou imagem até 10 MB · enviada pelo time de Implantação</p>
              </div>
            ) : (
              <div className="dropzone has-file">
                <div className="dropzone-icon">{I.fileAlt}</div>
                <div className="dropzone-info">
                  <p className="dropzone-title">{file?.name}</p>
                  <div className="file-meta">
                    <span>{file ? formatSize(file.size) : ''}</span>
                  </div>
                </div>
                <button className="file-x" onClick={(e) => { e.stopPropagation(); setState("empty"); setFile(null); }}>×</button>
              </div>
            )}

            <div className="config-row">
              <div className="field">
                <div className="lbl">Cliente detectado</div>
                <div className="val">
                  {clienteDetectado
                    ? <span style={{ color: "var(--md-ink-2)", fontWeight: 500 }}>{clienteDetectado}</span>
                    : <span style={{ color: "var(--md-muted)" }}>—</span>}
                </div>
              </div>
              <div className="field">
                <div className="lbl">Plano</div>
                <div className="val">
                  {plano
                    ? <span style={{ color: "var(--md-ink-2)", fontWeight: 500 }}>{plano}</span>
                    : <span style={{ color: "var(--md-muted)" }}>—</span>}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: "var(--md-ink-2)", marginBottom: 4 }}>Seu nome</div>
              <input
                type="text"
                placeholder="Ex: Caio Coelho"
                value={sellerName}
                onChange={e => setSellerName(e.target.value)}
                style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1px solid var(--md-line)", background: "var(--md-surface)", color: "var(--md-ink)", fontSize: 13, boxSizing: "border-box", outline: "none" }}
              />
            </div>

            <div className="action-row">
              {state === "loading" ? (
                <button className="btn-primary loading" disabled>
                  <span className="spinner" />
                  Processando ficha…
                </button>
              ) : (
                <button
                  className="btn-primary"
                  disabled={state === "empty"}
                  onClick={generate}
                >
                  {I.stars} Gerar mensagem
                </button>
              )}
              {state !== "loading" && (
                <button className="btn-ghost" onClick={() => setShowPreview(true)}>Pré-visualizar dados</button>
              )}
              <span className="hint-line">
                <span className="kbd">⌘</span>
                <span className="kbd">↵</span>
                para gerar
              </span>
            </div>
            {apiError && (
              <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8, background: "rgba(232,97,74,0.08)", border: "1px solid rgba(232,97,74,0.25)", color: "var(--md-coral)", fontSize: 13 }}>
                ⚠ {apiError}
              </div>
            )}
          </div>

          {/* Tone / delivery controls */}
          <div className="side-controls">
            <div className="ctl-h">Tom da mensagem</div>
            <div className="toggle-row">
              {["informal", "formal", "direto"].map(t => (
                <button
                  key={t}
                  className={"opt " + (tone === t ? "on" : "")}
                  onClick={() => setTone(t)}
                >
                  {t === "informal" ? "Próximo" : t === "formal" ? "Profissional" : "Direto ao ponto"}
                </button>
              ))}
            </div>

            <div className="flag-list">
              <div className="flag-row">
                <div className="l">
                  Incluir referência Nuvemshop
                  <small>Adiciona origem do lead se vier do Nuvem Envio</small>
                </div>
                <button className={"switch " + (includeNuvem ? "on" : "")} onClick={() => setIncludeNuvem(!includeNuvem)} />
              </div>
              <div className="flag-row">
                <div className="l">
                  Listar próximos passos
                  <small>Inclui kickoff, coleta-teste e acompanhamento</small>
                </div>
                <button className={"switch " + (includeNext ? "on" : "")} onClick={() => setIncludeNext(!includeNext)} />
              </div>
              <div className="flag-row">
                <div className="l">
                  Marcar @comercial no grupo
                  <small>Adiciona menção ao final da mensagem</small>
                </div>
                <button className={"switch " + (markComercial ? "on" : "")} onClick={() => setMarkComercial(!markComercial)} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: result */}
        <div>
          <div className="result-card">
            <div className="result-head">
              <div className="result-head-l">
                <span className="wa-dot" />
                {clienteDetectado ? <span className="lbl">Mensagem para {clienteDetectado}</span> : <span className="lbl">Mensagem para o cliente</span>}
                {state === "success" && <span className="meta">· {generatedMessage.length.toLocaleString('pt-BR')} caracteres</span>}
              </div>
              {state === "success" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button className={"btn-copy " + (copied ? "copied" : "")} onClick={copy}>
                    {copied ? (<>{I.check} Copiado</>) : (<>{I.copy} Copiar</>)}
                  </button>
                  <button className="btn-copy" style={{ color: "#25D366" }} onClick={() => window.open('https://wa.me/?text=' + encodeURIComponent(generatedMessage), '_blank')}>
                    {I.whatsapp} WhatsApp
                  </button>
                </div>
              )}
            </div>

            {state === "success" ? (
              <>
                <div style={{ margin: '0 0 10px', padding: '7px 12px', borderRadius: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#059669', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                  ✨ Pronto em {generateTime}s — copie e envie no grupo!
                </div>
                <div className="message">
                  {generatedMessage.split("\n").map((line, i) => (
                    <div key={i} dangerouslySetInnerHTML={{
                      __html: line
                        .replace(/\*(.+?)\*/g, '<span class="em">$1</span>')
                        .replace(/(📋|📦|👥|🚀|🎉) (.+?)$/m, (_, e, t) => `${e} <span class="label">${t}</span>`)
                    }} />
                  ))}
                </div>
                <div className="result-foot">
                  <a className="reset-link" onClick={() => { setState("empty"); setFile(null); setGeneratedMessage(''); setApiError(null); setClienteDetectado(''); setPlano(''); setGenerateTime(0); }}>
                    {I.refresh} Gerar para outro cliente
                  </a>
                  <div className="channels">
                    <span className="chan"><span style={{ color: "#25D366", display: "inline-flex" }}>{I.whatsapp}</span> WhatsApp</span>
                    <span className="chan nuvem">{I.paperPlane} Nuvem Envio</span>
                  </div>
                </div>
              </>
            ) : state === "loading" ? (
              <div className="result-loading">
                <div className="big-spinner" />
                <div className="h">Processando ficha…</div>
                <div className="substeps">
                  <div className="row done"><span className="b">{I.check}</span> Arquivo recebido e validado</div>
                  <div className="row done"><span className="b">{I.check}</span> Extraindo informações cadastrais</div>
                  <div className="row"><span className="b">3</span> Compondo mensagem no tom {tone === "informal" ? "próximo" : tone === "formal" ? "profissional" : "direto"}…</div>
                </div>
              </div>
            ) : (
              <div className="result-empty">
                <div className="glyph">{I.chat}</div>
                <div className="h">Nenhuma mensagem gerada ainda</div>
                <div className="s">
                  Anexe a ficha cadastral à esquerda e clique em <b style={{ color: "var(--md-ink-2)" }}>Gerar mensagem</b>. A prévia aparece aqui.
                </div>
              </div>
            )}
          </div>

          {/* secondary info card */}
          <div style={{ marginTop: 16, display: "flex", gap: 10, padding: "14px 16px", border: "1px solid var(--md-line)", borderRadius: 12, background: "var(--md-paper)", fontSize: 12.5, color: "var(--md-ink-2)", alignItems: "flex-start" }}>
            <span style={{ color: "var(--md-coral)", display: "inline-flex", marginTop: 1 }}>{I.lock}</span>
            <div>
              <b style={{ color: "var(--md-ink)" }}>Dados são processados internamente.</b> Nenhuma informação da ficha sai dos servidores Mandaê / Nuvem Envio. Histórico de mensagens fica disponível por 30 dias.
            </div>
          </div>
        </div>
      </div>
      {showPreview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowPreview(false)}>
          <div style={{ background: 'var(--md-paper)', borderRadius: 16, padding: '28px 32px', maxWidth: 420, width: '90%', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, color: 'var(--md-ink)' }}>Pré-visualização da ficha</h3>
            {!file ? (
              <p style={{ color: 'var(--md-muted)', fontSize: 13.5, margin: 0 }}>Faça o upload da ficha primeiro para pré-visualizar.</p>
            ) : (
              <div style={{ fontSize: 13.5, color: 'var(--md-ink-2)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div><b style={{ color: 'var(--md-ink)' }}>Arquivo:</b> {file.name}</div>
                <div><b style={{ color: 'var(--md-ink)' }}>Tamanho:</b> {formatSize(file.size)}</div>
                <div><b style={{ color: 'var(--md-ink)' }}>Tipo:</b> {file.type || 'application/pdf'}</div>
                <p style={{ color: 'var(--md-muted)', fontSize: 12, margin: '8px 0 0' }}>Os campos serão extraídos automaticamente ao gerar a mensagem.</p>
              </div>
            )}
            <button style={{ marginTop: 20, width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--md-line)', background: 'transparent', color: 'var(--md-ink)', cursor: 'pointer', fontSize: 13.5 }} onClick={() => setShowPreview(false)}>Fechar</button>
          </div>
        </div>
      )}
    </main>
  );
}

// Auth overlay removed for production deploy



export default ToolScreen;
