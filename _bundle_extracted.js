const { useState, useEffect, useRef } = React;

// ─── Brand mark (rounded square with cursive 'm' + arrow) ────────────
function BrandMark({ size = 28, glow = true }) {
  return (
    <div className="brand-mark" style={{ width: size, height: size, borderRadius: Math.round(size * 0.25), boxShadow: glow ? "0 0 0 2px rgba(232,97,74,0.18), 0 0 14px rgba(232,97,74,0.4)" : "none" }}>
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: size * 0.62, height: size * 0.62 }}>
        {/* stylized cursive 'm' */}
        <path d="M3.4 17.5 L3.4 8.5 Q3.4 6.8 4.7 6.6 Q5.8 6.4 6.6 7.2 Q7.1 7.7 7.4 8.7 Q8 7.1 9.3 6.6 Q10.6 6.1 11.6 6.9 Q12.5 7.6 12.5 9.1 L12.5 17.5"
              stroke="#fff" strokeWidth="2.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* arrow curving right */}
        <path d="M14.3 12.5 Q16.5 12.5 18 13.8 L17 12.7 M18 13.8 L16.7 14.9"
              stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────
const NAV = [
  { key: "inicio",    label: "Boas-vindas ao Cliente", icon: "chat",       available: true },
  { key: "followup",  label: "Gerador de Follow-up",   icon: "chat",       available: true },
  { key: "contrato",  label: "Auxiliar de Contrato",   icon: "invoice",    available: true },
  { key: "slack",     label: "Aprovação Interna",      icon: "paperPlane", available: true },
  { key: "resumo",    label: "Resumo do Cliente",      icon: "fileAlt",    available: false },
  { key: "templates", label: "Templates de E-mail",    icon: "mail",       available: false },
];

function Sidebar({ route, setRoute }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <BrandMark size={28} />
        <div className="sidebar-wordmark">
          Kit <span className="accent">Mandaê/Nuvem Envio</span>
        </div>
      </div>

      <div className="sidebar-section-label">Ferramentas</div>
      <nav className="nav-list">
        <div
          className={"nav-item " + (route === "home" ? "active" : "")}
          onClick={() => setRoute("home")}
        >
          <span className="nav-icon">{I.home}</span>
          <span>Início</span>
        </div>
        {NAV.map((n) => (
          <div
            key={n.key}
            className={"nav-item " + (route === n.key ? "active" : "") + (n.available ? "" : " disabled")}
            onClick={() => n.available && setRoute(n.key)}
          >
            <span className="nav-icon">{I[n.icon]}</span>
            <span>{n.label}</span>
            {!n.available && <span className="nav-badge">em breve</span>}
          </div>
        ))}
      </nav>

      <div className="sidebar-section-label" style={{ marginTop: 4 }}>Conta</div>
      <nav className="nav-list">
        <div className="nav-item">
          <span className="nav-icon">{I.cog}</span>
          <span>Configurações</span>
        </div>
      </nav>

      <div className="sidebar-spacer" />

      <div className="sidebar-user-card">
        <div className="avatar">RL</div>
        <div className="info">
          <div className="name">Vendedor(a)</div>
          <div className="role">Time Comercial · Mandaê/Nuvem Envio</div>
        </div>
        <button className="dots" title="Mais">⋯</button>
      </div>
    </aside>
  );
}

// ─── Topbar ──────────────────────────────────────────────────────────
function Topbar({ route }) {
  const crumb =
    route === "home" ? null :
    route === "inicio" ? "Boas-vindas ao Cliente" :
    NAV.find(n => n.key === route)?.label;
  return (
    <header className="topbar">
      <div className="topbar-left">
        {crumb ? (
          <div className="topbar-crumb">
            Ferramentas <span style={{ opacity: 0.5 }}>/</span> <b>{crumb}</b>
          </div>
        ) : (
          <div className="topbar-crumb">Painel <span style={{ opacity: 0.5 }}>/</span> <b>Home</b></div>
        )}
      </div>
      <div className="topbar-right">
        <div className="topbar-search">
          <span style={{ color: "var(--md-muted)", display: "inline-flex" }}>{I.search}</span>
          <span>Buscar ferramenta…</span>
          <span className="kbd">⌘K</span>
        </div>

      </div>
    </header>
  );
}

// ─── Home / Tool hub (bento) ─────────────────────────────────────────
function HomeScreen({ setRoute }) {
  return (
    <main className="main">
      <div className="page-header">
        <div className="page-eyebrow">
          <span className="dot" />
          Painel Comercial
          <span style={{ color: "var(--md-muted-2)" }}>·</span>
          Quarta-feira, 13 de maio
        </div>
        <div className="page-title-row">
          <div>
            <h1 className="page-title">
              {(()=>{const h=new Date().getHours();return h>=5&&h<12?"Bom dia, vendedor(a)":h>=12&&h<18?"Boa tarde, vendedor(a)":"Boa noite, vendedor(a)";})()}<span className="accent-bar" />
            </h1>
            <p className="page-subtitle">
              Suas ferramentas internas em um lugar só. Comece pelo Boas-vindas ao Cliente para gerar a mensagem de boas-vindas do próximo cliente.
            </p>
          </div>
          <div className="page-meta">
            <span className="meta-pill"><span className="led" /> 1 de 6 disponível</span>
          </div>
        </div>
      </div>

      <div className="bento">
        {/* Featured */}
        <div className="tool-card featured available" onClick={() => setRoute("inicio")}>
          <div className="tool-card-head">
            <div className="tool-icon">{I.chat}</div>
            <span className="badge available">Disponível</span>
          </div>
          <h3 className="tool-name">Boas-vindas ao Cliente</h3>
          <p className="tool-desc">
            Gera a mensagem de boas-vindas para o grupo do WhatsApp do novo cliente a partir da ficha cadastral. Pronto em segundos.
          </p>
          <div className="tool-foot">
            <span className="tool-cta">
              Abrir ferramenta {I.arrowRight}
            </span>
          </div>
          <div className="featured-stat">
            <span><b>148</b> mensagens</span>
            <span className="sep" />
            <span>este mês</span>
          </div>
        </div>

        {/* Auxiliar de Contrato */}
        <div className="tool-card available span-2" onClick={() => setRoute("contrato")}>
          <div className="tool-card-head">
            <div className="tool-icon">{I.invoice}</div>
            <span className="badge available">Disponível</span>
          </div>
          <h3 className="tool-name">Auxiliar de Contrato</h3>
          <p className="tool-desc">Analisa contratos comentados pelo jurídico do cliente. Semáforo de risco por cláusula + rascunho de e-mail de retorno.</p>
          <div className="tool-foot">
            <span className="tool-cta">Abrir ferramenta {I.arrowRight}</span>
          </div>
        </div>

        {/* Gerador de Follow-up */}
        <div className="tool-card available" onClick={() => setRoute("followup")}>
          <div className="tool-card-head">
            <div className="tool-icon">{I.chat}</div>
            <span className="badge available">Disponível</span>
          </div>
          <h3 className="tool-name">Gerador de Follow-up</h3>
          <p className="tool-desc">Mensagens de follow-up prontas por momento, canal e tom. Sem clichês, com CTA claro.</p>
          <div className="tool-foot">
            <span className="tool-cta">Abrir ferramenta {I.arrowRight}</span>
          </div>
        </div>

        {/* Aprovação Interna */}
        <div className="tool-card available" onClick={() => setRoute("slack")}>
          <div className="tool-card-head">
            <div className="tool-icon">{I.paperPlane}</div>
            <span className="badge available">Disponível</span>
          </div>
          <h3 className="tool-name">Aprovação Interna</h3>
          <p className="tool-desc">Gera a mensagem de pedido de aprovação para o Slack. Formato padronizado, direto, sem rodeios.</p>
          <div className="tool-foot">
            <span className="tool-cta">Abrir ferramenta {I.arrowRight}</span>
          </div>
        </div>

        {/* Resumo — wide */}
        <div className="tool-card coming-soon span-2">
          <div className="tool-card-head">
            <div className="tool-icon">{I.fileAlt}</div>
            <span className="badge soon">Em breve</span>
          </div>
          <h3 className="tool-name">Resumo do Cliente</h3>
          <p className="tool-desc">Ficha consolidada para reuniões, follow-ups e handoff.</p>
        </div>

        {/* Templates — wide */}
        <div className="tool-card coming-soon span-2">
          <div className="tool-card-head">
            <div className="tool-icon">{I.mail}</div>
            <span className="badge soon">Em breve</span>
          </div>
          <h3 className="tool-name">Templates de E-mail</h3>
          <p className="tool-desc">Modelos prontos para cada etapa do onboarding do cliente.</p>
        </div>
      </div>


      {/* Section: Recursos do Time */}
      <div className="section-strip" style={{ marginTop: 32 }}>
        <h3>Recursos do Time</h3>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
        {[
          { emoji: "🔗", name: "Portal de Integrações", desc: "ERPs, plataformas e conectores",   url: "https://sites.google.com/nuvemshop.com.br/integracoesnuvemenvio/início" },
          { emoji: "📄", name: "Documentos Úteis",      desc: "Bids, contratos e documentos",    url: "https://drive.google.com/drive/folders/16-o_2s-yrsHz_fV9zq11UedPLsgqnvk-" },
          { emoji: "⚖️", name: "Playbook Jurídico",     desc: "Contratos, compliance e jurídico", url: "https://docs.google.com/document/d/104pV8ls8EYtIWwizb-YrfOcoPzKRhJkH/edit" },
        ].map(r => (
          <a
            key={r.name}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="resource-card"
          >
            <span className="resource-emoji">{r.emoji}</span>
            <div className="resource-body">
              <div className="resource-name">{r.name}</div>
              <div className="resource-desc">{r.desc}</div>
            </div>
            <span className="resource-arrow">→</span>
          </a>
        ))}
      </div>

      {/* Section: Atividade + Dica */}
      <div className="section-strip">
        <h3>Sua atividade</h3>
        <span className="strip-link">Ver tudo →</span>
      </div>
      <div className="activity">
        <div className="activity-card">
          <h4 className="activity-title">Últimas mensagens geradas</h4>
          <div className="activity-row">
            <div className="av">MC</div>
            <div className="at"><b>Mercazzo Comércio Varejista</b> · ficha #M-2841 <span className="tag">whatsapp</span></div>
            <div className="when">há 12 min</div>
          </div>
          <div className="activity-row">
            <div className="av">BL</div>
            <div className="at"><b>Brisa Lar Casa &amp; Decoração</b> · ficha #M-2840 <span className="tag">whatsapp</span></div>
            <div className="when">hoje, 09:42</div>
          </div>
          <div className="activity-row">
            <div className="av">VV</div>
            <div className="at"><b>Verdee Vestuário Atacado LTDA</b> · ficha #M-2839 <span className="tag">whatsapp</span></div>
            <div className="when">ontem</div>
          </div>
          <div className="activity-row">
            <div className="av">PP</div>
            <div className="at"><b>Pão &amp; Pasta Distribuidora</b> · ficha #M-2838 <span className="tag">whatsapp</span></div>
            <div className="when">ontem</div>
          </div>
        </div>

        <div className="tip-card">
          <div className="tip-eyebrow">{I.stars} Dica do mês</div>
          <h4>Mandaê/Nuvem Envio: clientes integrados</h4>
          <p>Lojistas Nuvemshop com Nuvem Envio ativado já chegam com ficha pré-preenchida. Você economiza ~2 min por onboarding.</p>
          <a className="link">Ler nota interna {I.arrowRight}</a>
        </div>
      </div>
    </main>
  );
}

// ─── Boas-vindas ao Cliente tool screen ──────────────────────────────────
const SAMPLE_MESSAGE = `🎉 *Boas-vindas ao Cliente — Mercazzo Comércio Varejista*

Bem-vindo(a) à Mandaê/Nuvem Envio! A partir de hoje a Mercazzo está oficialmente operando com a gente. Aqui vai o resumo:

📋 *Dados do cliente*
• Razão social: MERCAZZO COMÉRCIO VAREJISTA LTDA
• CNPJ: 41.872.305/0001-94
• Plano contratado: Mandaê/Nuvem Envio *Pró* (até 2.500 envios/mês)
• Origem do lead: Nuvemshop · indicação Nuvem Envio

📦 *Operação*
• CEP de coleta: 04571-000 — Vila Olímpia, SP
• Janela de coleta: *seg–sex, 14h às 18h*
• Volume estimado: 1.800 envios/mês
• Modalidades habilitadas: Sedex, .Package, Mini-envios

👥 *Pontos de contato*
• Comercial: Time Comercial Mandaê/Nuvem Envio
• Operacional cliente: Joana Vieira (joana@mercazzo.com.br)
• Implantação: Camila Souza (camila@mandae.com.br)

🚀 *Próximos passos*
1. Camila agenda kickoff de implantação até *quarta, 20/05*
2. Primeira coleta-teste: *segunda, 25/05*
3. Acompanhamento semanal nas 4 primeiras semanas

Qualquer ajuste me avisa por aqui. Bora vender muito! 💪`;

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
    try {
      const b64 = await readBase64(file);
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileBase64: b64, mimeType: file.type || 'application/pdf', tone, sellerName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro desconhecido');
      setGeneratedMessage(data.message);
      setState("success");
    } catch (e) {
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
                  <span style={{ color: "var(--md-muted)" }}>—</span>
                </div>
              </div>
              <div className="field">
                <div className="lbl">Plano</div>
                <div className="val">
                  <span style={{ color: "var(--md-muted)" }}>—</span>
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
                <button className="btn-ghost">Pré-visualizar dados</button>
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
                <button className="switch" />
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
                <span className="lbl">Mensagem para #grupo-mercazzo</span>
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
                  <a className="reset-link" onClick={() => { setState("empty"); setFile(null); setGeneratedMessage(''); setApiError(null); }}>
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
                  <div className="row done"><span className="b">{I.check}</span> Lendo PDF (3 páginas)</div>
                  <div className="row done"><span className="b">{I.check}</span> Extraindo 24 campos cadastrais</div>
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
              <b style={{ color: "var(--md-ink)" }}>Dados são processados internamente.</b> Nenhuma informação da ficha sai dos servidores Nuvemshop/Mandaê/Nuvem Envio. Histórico de mensagens fica disponível por 30 dias.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Auth overlay removed for production deploy


// ─── Placeholder screens ──────────────────────────────────────────────
function FollowupScreen({ setRoute }) {
  const [nomeCliente, setNomeCliente] = React.useState('');
  const [empresa, setEmpresa] = React.useState('');
  const [momento, setMomento] = React.useState('Após reunião');
  const [canal, setCanal] = React.useState('WhatsApp');
  const [tom, setTom] = React.useState('Próximo');
  const [contexto, setContexto] = React.useState('');
  const [diasSemResposta, setDiasSemResposta] = React.useState('');
  const [state, setState] = React.useState('empty');
  const [message, setMessage] = React.useState('');
  const [apiError, setApiError] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  const tomEfetivo = (momento === 'Cliente sumiu' && tom === 'Profissional') ? 'Misto' : tom;
  const showTomWarning = momento === 'Cliente sumiu' && tom === 'Profissional';

  const momentos = ['Após reunião','Proposta enviada','Sem resposta há dias','Cliente sumiu','Renovação','Pós onboarding'];
  const canais   = ['WhatsApp','E-mail','Ligação'];
  const tons     = ['Próximo','Profissional','Direto'];

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '10px 12px', borderRadius: 8,
    border: '1.5px solid var(--md-ink-4)',
    background: 'var(--md-white)', color: 'var(--md-ink-1)',
    fontSize: 14, outline: 'none',
    fontFamily: 'inherit',
  };
  const lblStyle = {
    fontSize: 12, fontWeight: 600,
    color: 'var(--md-ink-2)', marginBottom: 4, display: 'block',
  };

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

  function renderResult() {
    if (canal === 'Ligação') {
      const blocks = message.split(/\[Abertura\]|\[Desenvolvimento\]|\[Fechamento\]/);
      const parts = message.match(/\[(Abertura|Desenvolvimento|Fechamento)\][^\[]+/g) || [];
      const colors = { Abertura: '#3b82f6', Desenvolvimento: '#8b5cf6', Fechamento: '#10b981' };
      const labels = ['Abertura', 'Desenvolvimento', 'Fechamento'];
      return (
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
          labels.map((lbl, i) => {
            const part = parts.find(p => p.startsWith('[' + lbl + ']')) || '';
            const text = part.replace('[' + lbl + ']', '').trim();
            return React.createElement('div', {
              key: lbl,
              style: {
                background: 'var(--md-bg-2)', borderRadius: 10,
                borderLeft: '4px solid ' + colors[lbl],
                padding: '12px 14px',
              }
            },
              React.createElement('div', { style: { fontSize: 11, fontWeight: 700, color: colors[lbl], marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' } }, lbl),
              React.createElement('div', { style: { fontSize: 14, color: 'var(--md-ink-1)', whiteSpace: 'pre-wrap', lineHeight: 1.6 } }, text)
            );
          })
        )
      );
    }
    if (canal === 'E-mail') {
      const lines = message.split('\n');
      const subjectLine = lines.find(l => l.startsWith('Assunto:')) || '';
      const body = lines.filter(l => !l.startsWith('Assunto:')).join('\n').trim();
      return (
        React.createElement('div', null,
          subjectLine && React.createElement('div', {
            style: {
              background: 'var(--md-bg-2)', borderRadius: 8,
              padding: '8px 12px', marginBottom: 10,
              fontSize: 13, fontWeight: 700, color: 'var(--md-ink-1)',
            }
          }, subjectLine),
          React.createElement('div', {
            style: { fontSize: 14, color: 'var(--md-ink-1)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }
          }, body)
        )
      );
    }
    return React.createElement('div', {
      style: { fontSize: 14, color: 'var(--md-ink-1)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }
    }, message);
  }

  return (
    React.createElement('div', { style: { padding: '32px 24px', maxWidth: 680, margin: '0 auto' } },
      React.createElement('h2', {
        style: { fontSize: 20, fontWeight: 700, color: 'var(--md-ink-1)', marginBottom: 6 }
      }, 'Gerador de Follow-up'),
      React.createElement('p', {
        style: { fontSize: 14, color: 'var(--md-ink-2)', marginBottom: 24 }
      }, 'Gera mensagens de follow-up B2B adaptadas ao momento e canal.'),

      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 16 } },
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
          React.createElement('div', null,
            React.createElement('label', { style: lblStyle }, 'Nome do cliente (opcional)'),
            React.createElement('input', {
              style: inputStyle, value: nomeCliente,
              onChange: e => setNomeCliente(e.target.value),
              placeholder: 'Ex: João Silva',
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { style: lblStyle }, 'Empresa (opcional)'),
            React.createElement('input', {
              style: inputStyle, value: empresa,
              onChange: e => setEmpresa(e.target.value),
              placeholder: 'Ex: Loja XYZ',
            })
          )
        ),

        React.createElement('div', null,
          React.createElement('label', { style: lblStyle }, 'Momento'),
          React.createElement('select', {
            style: { ...inputStyle, cursor: 'pointer' }, value: momento,
            onChange: e => setMomento(e.target.value),
          }, momentos.map(m => React.createElement('option', { key: m, value: m }, m)))
        ),

        momento === 'Sem resposta há dias' && React.createElement('div', null,
          React.createElement('label', { style: lblStyle }, 'Quantos dias sem resposta?'),
          React.createElement('input', {
            style: inputStyle, type: 'number', min: 1,
            value: diasSemResposta,
            onChange: e => setDiasSemResposta(e.target.value),
            placeholder: 'Ex: 5',
          })
        ),

        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
          React.createElement('div', null,
            React.createElement('label', { style: lblStyle }, 'Canal'),
            React.createElement('select', {
              style: { ...inputStyle, cursor: 'pointer' }, value: canal,
              onChange: e => setCanal(e.target.value),
            }, canais.map(c => React.createElement('option', { key: c, value: c }, c)))
          ),
          React.createElement('div', null,
            React.createElement('label', { style: lblStyle }, 'Tom'),
            React.createElement('select', {
              style: { ...inputStyle, cursor: 'pointer' }, value: tom,
              onChange: e => setTom(e.target.value),
            }, tons.map(t => React.createElement('option', { key: t, value: t }, t))),
            showTomWarning && React.createElement('div', {
              style: {
                marginTop: 6, padding: '4px 8px', borderRadius: 6,
                background: '#fef3c7', color: '#92400e',
                fontSize: 11, fontWeight: 600,
              }
            }, '⚠ Tom ajustado para "Misto" — "Profissional" não funciona bem para cliente sumido.')
          )
        ),

        React.createElement('div', null,
          React.createElement('label', { style: lblStyle }, 'Contexto / última interação (opcional)'),
          React.createElement('textarea', {
            style: { ...inputStyle, minHeight: 80, resize: 'vertical' },
            value: contexto,
            onChange: e => setContexto(e.target.value),
            placeholder: 'Ex: Enviamos proposta na semana passada com 15% de desconto na tabela SP.',
          })
        ),

        React.createElement('button', {
          onClick: gerar,
          disabled: state === 'loading',
          style: {
            padding: '12px 24px', borderRadius: 10, border: 'none',
            background: state === 'loading' ? 'var(--md-ink-4)' : 'var(--md-primary)',
            color: '#fff', fontWeight: 700, fontSize: 15,
            cursor: state === 'loading' ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }
        }, state === 'loading' ? 'Gerando...' : 'Gerar follow-up'),

        apiError && React.createElement('div', {
          style: {
            padding: '10px 14px', borderRadius: 8,
            background: '#fee2e2', color: '#991b1b', fontSize: 13,
          }
        }, apiError),

        state === 'success' && React.createElement('div', {
          style: {
            border: '1.5px solid var(--md-ink-4)', borderRadius: 12,
            padding: '18px 16px', background: 'var(--md-white)',
          }
        },
          React.createElement('div', {
            style: {
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 14,
            }
          },
            React.createElement('span', {
              style: { fontSize: 13, fontWeight: 700, color: 'var(--md-ink-2)' }
            }, canal + ' · ' + momento),
            React.createElement('div', { style: { display: 'flex', gap: 8 } },
              React.createElement('button', {
                onClick: () => { navigator.clipboard.writeText(message); setCopied(true); setTimeout(() => setCopied(false), 2000); },
                style: {
                  padding: '6px 12px', borderRadius: 7, border: '1.5px solid var(--md-ink-4)',
                  background: copied ? '#d1fae5' : 'var(--md-white)',
                  color: copied ? '#065f46' : 'var(--md-ink-1)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }
              }, copied ? '✓ Copiado' : 'Copiar'),
              canal === 'WhatsApp' && React.createElement('button', {
                onClick: () => window.open('https://wa.me/?text=' + encodeURIComponent(message), '_blank'),
                style: {
                  padding: '6px 12px', borderRadius: 7, border: 'none',
                  background: '#25d366', color: '#fff',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }
              }, 'Abrir no WhatsApp')
            )
          ),
          renderResult(),
          React.createElement('button', {
            onClick: gerar,
            style: {
              marginTop: 14, padding: '8px 16px', borderRadius: 8,
              border: '1.5px solid var(--md-ink-4)',
              background: 'var(--md-white)', color: 'var(--md-ink-2)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }
          }, 'Gerar outra versão')
        )
      )
    )
  );
}
function ContratoScreen({ setRoute }) {
  const [file, setFile] = React.useState(null);
  const [contexto, setContexto] = React.useState('');
  const [state, setState] = React.useState('empty');
  const [loadMsg, setLoadMsg] = React.useState('Lendo contrato...');
  const [result, setResult] = React.useState(null);
  const [apiError, setApiError] = React.useState('');
  const [copiedEmail, setCopiedEmail] = React.useState(false);
  const fileRef = React.useRef(null);

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '10px 12px', borderRadius: 8,
    border: '1.5px solid var(--md-ink-4)',
    background: 'var(--md-white)', color: 'var(--md-ink-1)',
    fontSize: 14, outline: 'none', fontFamily: 'inherit',
  };
  const lblStyle = {
    fontSize: 12, fontWeight: 600,
    color: 'var(--md-ink-2)', marginBottom: 4, display: 'block',
  };

  const statusCfg = {
    ACEITAR:  { color: '#065f46', bg: '#d1fae5', dot: '🟢' },
    NEGOCIAR: { color: '#92400e', bg: '#fef3c7', dot: '🟡' },
    ESCALAR:  { color: '#991b1b', bg: '#fee2e2', dot: '🔴' },
  };

  async function analisar() {
    if (!file) { setApiError('Selecione um arquivo .docx.'); return; }
    if (typeof mammoth === 'undefined') { setApiError('Biblioteca mammoth não carregada. Recarregue a página.'); return; }
    setState('loading');
    setApiError('');
    setResult(null);

    const msgs = ['Lendo contrato...', 'Comparando com o manual...', 'Gerando análise...'];
    let mi = 0;
    setLoadMsg(msgs[0]);
    const iv = setInterval(() => {
      mi = Math.min(mi + 1, msgs.length - 1);
      setLoadMsg(msgs[mi]);
    }, 2000);

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

  function EmailBlock({ email }) {
    const lines = (email || '').split('\n');
    const subjectLine = lines.find(l => l.startsWith('Assunto:')) || '';
    const body = lines.filter(l => !l.startsWith('Assunto:')).join('\n').trim();
    return React.createElement('div', null,
      subjectLine && React.createElement('div', {
        style: { fontWeight: 700, fontSize: 14, color: 'var(--md-ink-1)', marginBottom: 8 }
      }, subjectLine),
      React.createElement('div', {
        style: { fontSize: 13, color: 'var(--md-ink-1)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }
      }, body)
    );
  }

  return (
    React.createElement('div', { style: { padding: '32px 24px', maxWidth: 1100, margin: '0 auto' } },
      React.createElement('h2', {
        style: { fontSize: 20, fontWeight: 700, color: 'var(--md-ink-1)', marginBottom: 6 }
      }, 'Auxiliar de Contrato'),
      React.createElement('p', {
        style: { fontSize: 14, color: 'var(--md-ink-2)', marginBottom: 24 }
      }, 'Analisa cláusulas comentadas pelo cliente e compara com o manual de negociação.'),

      React.createElement('div', {
        style: { display: 'grid', gridTemplateColumns: state === 'success' ? '340px 1fr' : '400px', gap: 24 }
      },
        /* LEFT COLUMN */
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
          React.createElement('div', null,
            React.createElement('label', { style: lblStyle }, 'Contrato comentado pelo cliente (.docx)'),
            React.createElement('div', {
              onClick: () => fileRef.current.click(),
              style: {
                border: '2px dashed var(--md-ink-4)', borderRadius: 10,
                padding: '20px 16px', textAlign: 'center',
                cursor: 'pointer', background: 'var(--md-bg-2)',
                transition: 'border-color 0.2s',
              }
            },
              React.createElement('input', {
                ref: fileRef, type: 'file', accept: '.docx',
                style: { display: 'none' },
                onChange: e => { setFile(e.target.files[0] || null); setApiError(''); },
              }),
              file
                ? React.createElement('div', { style: { fontSize: 13, color: 'var(--md-ink-1)', fontWeight: 600 } },
                    '📄 ' + file.name)
                : React.createElement('div', { style: { fontSize: 13, color: 'var(--md-ink-3)' } },
                    'Clique para selecionar o arquivo .docx')
            )
          ),

          React.createElement('div', null,
            React.createElement('label', { style: lblStyle }, 'Contexto do deal (opcional)'),
            React.createElement('textarea', {
              style: { ...inputStyle, minHeight: 72, resize: 'vertical' },
              value: contexto,
              onChange: e => setContexto(e.target.value),
              placeholder: 'Nome do cliente, porte, urgência, pontos sensíveis...',
            })
          ),

          React.createElement('div', {
            style: {
              padding: '8px 12px', borderRadius: 8,
              background: 'var(--md-bg-2)', fontSize: 12,
              color: 'var(--md-ink-2)',
            }
          }, '📋 Manual de negociação: carregado (v. atual)'),

          React.createElement('button', {
            onClick: analisar,
            disabled: state === 'loading',
            style: {
              padding: '12px 20px', borderRadius: 10, border: 'none',
              background: state === 'loading' ? 'var(--md-ink-4)' : 'var(--md-primary)',
              color: '#fff', fontWeight: 700, fontSize: 15,
              cursor: state === 'loading' ? 'not-allowed' : 'pointer',
            }
          }, state === 'loading' ? loadMsg : 'Analisar contrato'),

          apiError && React.createElement('div', {
            style: {
              padding: '10px 14px', borderRadius: 8,
              background: '#fee2e2', color: '#991b1b', fontSize: 13,
            }
          }, apiError)
        ),

        /* RIGHT COLUMN */
        state === 'success' && result && React.createElement('div', {
          style: { display: 'flex', flexDirection: 'column', gap: 20 }
        },
          /* Clausulas */
          React.createElement('div', {
            style: {
              border: '1.5px solid var(--md-ink-4)', borderRadius: 12,
              padding: '18px 16px', background: 'var(--md-white)',
            }
          },
            React.createElement('h3', {
              style: { fontSize: 15, fontWeight: 700, color: 'var(--md-ink-1)', marginBottom: 14, marginTop: 0 }
            }, 'Cláusulas analisadas'),
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
              (result.clausulas || []).map((cl, i) => {
                const cfg = statusCfg[cl.status] || statusCfg.ESCALAR;
                return React.createElement('div', {
                  key: i,
                  style: {
                    borderRadius: 10, padding: '12px 14px',
                    background: cfg.bg,
                    border: '1px solid ' + cfg.color + '33',
                  }
                },
                  React.createElement('div', {
                    style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }
                  },
                    React.createElement('span', {
                      style: {
                        fontSize: 11, fontWeight: 700, padding: '2px 8px',
                        borderRadius: 20, background: cfg.bg,
                        color: cfg.color, border: '1px solid ' + cfg.color,
                      }
                    }, cfg.dot + ' ' + cl.status),
                    cl.is_nova && React.createElement('span', {
                      style: {
                        fontSize: 11, fontWeight: 700, padding: '2px 8px',
                        borderRadius: 20, background: '#ede9fe', color: '#6d28d9',
                        border: '1px solid #6d28d9',
                      }
                    }, 'NOVA'),
                    React.createElement('span', {
                      style: { fontSize: 13, fontWeight: 700, color: 'var(--md-ink-1)' }
                    }, [cl.numero, cl.titulo].filter(Boolean).join(' — '))
                  ),
                  React.createElement('div', { style: { fontSize: 12, color: 'var(--md-ink-2)', marginBottom: 4 } },
                    React.createElement('strong', null, 'Pedido: '), cl.pedido_cliente),
                  React.createElement('div', { style: { fontSize: 12, color: 'var(--md-ink-2)', marginBottom: 4 } },
                    React.createElement('strong', null, 'Análise: '), cl.justificativa),
                  React.createElement('div', { style: { fontSize: 12, color: 'var(--md-ink-1)' } },
                    React.createElement('strong', null, 'Sugestão: '), cl.sugestao)
                );
              })
            )
          ),

          /* Email de retorno */
          React.createElement('div', {
            style: {
              border: '1.5px solid var(--md-ink-4)', borderRadius: 12,
              padding: '18px 16px', background: 'var(--md-white)',
            }
          },
            React.createElement('div', {
              style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }
            },
              React.createElement('h3', {
                style: { fontSize: 15, fontWeight: 700, color: 'var(--md-ink-1)', margin: 0 }
              }, 'E-mail de retorno'),
              React.createElement('button', {
                onClick: () => {
                  navigator.clipboard.writeText(result.email_retorno || '');
                  setCopiedEmail(true);
                  setTimeout(() => setCopiedEmail(false), 2000);
                },
                style: {
                  padding: '6px 14px', borderRadius: 7,
                  border: '1.5px solid var(--md-ink-4)',
                  background: copiedEmail ? '#d1fae5' : 'var(--md-white)',
                  color: copiedEmail ? '#065f46' : 'var(--md-ink-1)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }
              }, copiedEmail ? '✓ Copiado' : 'Copiar e-mail')
            ),
            React.createElement(EmailBlock, { email: result.email_retorno })
          ),

          /* Resumo executivo */
          React.createElement('div', {
            style: {
              border: '1.5px solid var(--md-ink-4)', borderRadius: 12,
              padding: '18px 16px', background: 'var(--md-white)',
            }
          },
            React.createElement('h3', {
              style: { fontSize: 15, fontWeight: 700, color: 'var(--md-ink-1)', marginBottom: 10, marginTop: 0 }
            }, 'Resumo executivo'),
            React.createElement('p', {
              style: { fontSize: 13, color: 'var(--md-ink-1)', lineHeight: 1.7, marginBottom: 12, marginTop: 0 }
            }, result.resumo),
            React.createElement('div', {
              style: {
                padding: '10px 14px', borderRadius: 8,
                background: 'var(--md-bg-2)', borderLeft: '4px solid var(--md-primary)',
              }
            },
              React.createElement('div', { style: { fontSize: 11, fontWeight: 700, color: 'var(--md-ink-2)', marginBottom: 4 } }, 'PRÓXIMO PASSO'),
              React.createElement('div', { style: { fontSize: 13, color: 'var(--md-ink-1)' } }, result.proximo_passo)
            )
          )
        )
      )
    )
  );
}
function SlackScreen({ setRoute }) {
  const [clausula, setClausula] = React.useState('');
  const [areas, setAreas] = React.useState([]);
  const [nomeCliente, setNomeCliente] = React.useState('');
  const [porte, setPorte] = React.useState('Médio');
  const [pedidoCliente, setPedidoCliente] = React.useState('');
  const [urgencia, setUrgencia] = React.useState('Normal (48h)');
  const [impacto, setImpacto] = React.useState('');
  const [state, setState] = React.useState('empty');
  const [message, setMessage] = React.useState('');
  const [apiError, setApiError] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  const AREAS = ['Jurídico', 'Financeiro', 'Operações', 'Produto', 'Diretoria'];
  const PORTES = ['Pequeno', 'Médio', 'Grande', 'Enterprise'];
  const URGENCIAS = [
    { label: 'Normal (48h)',   badge: { bg: '#e5e7eb', color: '#374151' } },
    { label: 'Urgente (24h)', badge: { bg: '#fef3c7', color: '#92400e' } },
    { label: 'Crítico (hoje)', badge: { bg: '#fee2e2', color: '#991b1b' } },
  ];

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '10px 12px', borderRadius: 8,
    border: '1.5px solid var(--md-ink-4)',
    background: 'var(--md-white)', color: 'var(--md-ink-1)',
    fontSize: 14, outline: 'none', fontFamily: 'inherit',
  };
  const lblStyle = {
    fontSize: 12, fontWeight: 600,
    color: 'var(--md-ink-2)', marginBottom: 4, display: 'block',
  };

  function toggleArea(a) {
    setAreas(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  }

  const urgBadge = URGENCIAS.find(u => u.label === urgencia)?.badge || URGENCIAS[0].badge;

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
        ? React.createElement('strong', { key: i }, p.slice(1, -1))
        : React.createElement(React.Fragment, { key: i }, p)
    );
  }

  const areaHandles = {
    'Jurídico':   '@juridico',
    'Financeiro': '@financeiro',
    'Operações':  '@operacoes',
    'Produto':    '@produto',
    'Diretoria':  '@diretoria',
  };

  return (
    React.createElement('div', { style: { padding: '32px 24px', maxWidth: 1100, margin: '0 auto' } },
      React.createElement('h2', {
        style: { fontSize: 20, fontWeight: 700, color: 'var(--md-ink-1)', marginBottom: 6 }
      }, 'Aprovação Interna'),
      React.createElement('p', {
        style: { fontSize: 14, color: 'var(--md-ink-2)', marginBottom: 24 }
      }, 'Gera mensagem de aprovação para o Slack interno com o contexto certo.'),

      React.createElement('div', {
        style: { display: 'grid', gridTemplateColumns: state === 'success' ? '380px 1fr' : '420px', gap: 28 }
      },

        /* ── LEFT COLUMN ── */
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },

          React.createElement('div', null,
            React.createElement('label', { style: lblStyle }, 'Trecho da cláusula'),
            React.createElement('textarea', {
              style: { ...inputStyle, minHeight: 72, resize: 'vertical' },
              value: clausula, onChange: e => setClausula(e.target.value),
              placeholder: 'Cole o trecho exato ou descreva o que o cliente quer',
            })
          ),

          React.createElement('div', null,
            React.createElement('label', { style: lblStyle }, 'Área responsável'),
            React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8 } },
              AREAS.map(a =>
                React.createElement('button', {
                  key: a, onClick: () => toggleArea(a),
                  style: {
                    padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', border: '1.5px solid',
                    borderColor: areas.includes(a) ? 'var(--md-primary)' : 'var(--md-ink-4)',
                    background: areas.includes(a) ? 'var(--md-primary)' : 'var(--md-white)',
                    color: areas.includes(a) ? '#fff' : 'var(--md-ink-2)',
                    transition: 'all 0.15s',
                  }
                }, a)
              )
            )
          ),

          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
            React.createElement('div', null,
              React.createElement('label', { style: lblStyle }, 'Nome do cliente'),
              React.createElement('input', {
                style: inputStyle, value: nomeCliente,
                onChange: e => setNomeCliente(e.target.value),
                placeholder: 'Ex: Loja XYZ',
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { style: lblStyle }, 'Porte'),
              React.createElement('select', {
                style: { ...inputStyle, cursor: 'pointer' }, value: porte,
                onChange: e => setPorte(e.target.value),
              }, PORTES.map(p => React.createElement('option', { key: p, value: p }, p)))
            )
          ),

          React.createElement('div', null,
            React.createElement('label', { style: lblStyle }, 'O que o cliente quer exatamente'),
            React.createElement('textarea', {
              style: { ...inputStyle, minHeight: 72, resize: 'vertical' },
              value: pedidoCliente, onChange: e => setPedidoCliente(e.target.value),
              placeholder: 'Descreva o pedido específico do cliente...',
            })
          ),

          React.createElement('div', null,
            React.createElement('label', { style: lblStyle }, 'Urgência'),
            React.createElement('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
              URGENCIAS.map(u =>
                React.createElement('button', {
                  key: u.label, onClick: () => setUrgencia(u.label),
                  style: {
                    padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', border: '1.5px solid',
                    borderColor: urgencia === u.label ? u.badge.color : 'var(--md-ink-4)',
                    background: urgencia === u.label ? u.badge.bg : 'var(--md-white)',
                    color: urgencia === u.label ? u.badge.color : 'var(--md-ink-2)',
                    transition: 'all 0.15s',
                  }
                }, u.label)
              )
            )
          ),

          React.createElement('div', null,
            React.createElement('label', { style: lblStyle }, 'Impacto se não aprovar (opcional)'),
            React.createElement('textarea', {
              style: { ...inputStyle, minHeight: 60, resize: 'vertical' },
              value: impacto, onChange: e => setImpacto(e.target.value),
              placeholder: 'Ex: Perdemos o deal, cliente vai para concorrente...',
            })
          ),

          React.createElement('button', {
            onClick: gerar, disabled: state === 'loading',
            style: {
              padding: '12px 24px', borderRadius: 10, border: 'none',
              background: state === 'loading' ? 'var(--md-ink-4)' : 'var(--md-primary)',
              color: '#fff', fontWeight: 700, fontSize: 15,
              cursor: state === 'loading' ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }
          }, state === 'loading' ? 'Gerando...' : 'Gerar mensagem'),

          apiError && React.createElement('div', {
            style: {
              padding: '10px 14px', borderRadius: 8,
              background: '#fee2e2', color: '#991b1b', fontSize: 13,
            }
          }, apiError)
        ),

        /* ── RIGHT COLUMN ── */
        state === 'success' && React.createElement('div', {
          style: { display: 'flex', flexDirection: 'column', gap: 12 }
        },
          React.createElement('div', {
            style: {
              borderRadius: 12, overflow: 'hidden',
              border: '1.5px solid #2a2a4a',
            }
          },
            /* Slack chrome bar */
            React.createElement('div', {
              style: {
                background: '#3f0f40',
                padding: '10px 16px',
                display: 'flex', alignItems: 'center', gap: 8,
              }
            },
              React.createElement('div', { style: { width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' } }),
              React.createElement('div', { style: { width: 12, height: 12, borderRadius: '50%', background: '#febc2e' } }),
              React.createElement('div', { style: { width: 12, height: 12, borderRadius: '50%', background: '#28c840' } }),
              React.createElement('span', {
                style: { marginLeft: 8, fontSize: 12, color: '#e8d5e8', fontWeight: 600 }
              }, '#aprovacoes-comercial')
            ),
            /* Message area */
            React.createElement('div', {
              style: {
                background: '#1a1a2e', padding: '20px 16px',
                fontFamily: '"SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace',
                fontSize: 13.5, lineHeight: 1.65,
                color: '#d1d5db', whiteSpace: 'pre-wrap',
                minHeight: 140,
              }
            },
              /* Avatar + name row */
              React.createElement('div', {
                style: { display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 4 }
              },
                React.createElement('div', {
                  style: {
                    width: 36, height: 36, borderRadius: 6,
                    background: 'var(--md-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0,
                  }
                }, 'M'),
                React.createElement('div', { style: { flex: 1 } },
                  React.createElement('div', { style: { display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 4 } },
                    React.createElement('span', { style: { fontWeight: 700, color: '#fff', fontSize: 14, fontFamily: 'inherit' } }, 'Comercial Mandaê'),
                    React.createElement('span', { style: { fontSize: 11, color: '#6b7280', fontFamily: 'inherit' } }, 'Agora')
                  ),
                  React.createElement('div', null, renderSlackPreview(message))
                )
              )
            )
          ),

          /* Area chips */
          areas.length > 0 && React.createElement('div', {
            style: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }
          },
            React.createElement('span', { style: { fontSize: 12, color: 'var(--md-ink-3)' } }, 'Mencionar:'),
            areas.map(a =>
              React.createElement('span', {
                key: a,
                style: {
                  padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                  background: 'var(--md-primary)', color: '#fff',
                }
              }, areaHandles[a] || '@' + a.toLowerCase())
            )
          ),

          /* Copy button */
          React.createElement('button', {
            onClick: () => {
              navigator.clipboard.writeText(message);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            },
            style: {
              alignSelf: 'flex-start',
              padding: '8px 18px', borderRadius: 8,
              border: '1.5px solid var(--md-ink-4)',
              background: copied ? '#d1fae5' : 'var(--md-white)',
              color: copied ? '#065f46' : 'var(--md-ink-1)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s',
            }
          }, copied ? 'Copiado! ✓' : 'Copiar mensagem'),

          /* Regenerate */
          React.createElement('button', {
            onClick: gerar,
            style: {
              alignSelf: 'flex-start',
              padding: '8px 16px', borderRadius: 8,
              border: '1.5px solid var(--md-ink-4)',
              background: 'var(--md-white)', color: 'var(--md-ink-2)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }
          }, 'Gerar outra versão')
        )
      )
    )
  );
}
// ─── Tweaks panel ────────────────────────────────────────────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "screen": "tool",
  "accent": "#E8614A",
  "density": "comfortable"
}/*EDITMODE-END*/;

function AppTweaks({ tweaks, setTweak, route, setRoute }) {
  return (
    <window.TweaksPanel title="Tweaks">
      <window.TweakSection title="Tela atual">
        <window.TweakRadio
          value={route === "home" ? "home" : "tool"}
          onChange={v => setRoute(v === "home" ? "home" : "inicio")}
          options={[
            { value: "home", label: "Home" },
            { value: "tool", label: "Tool" },
          ]}
        />
      </window.TweakSection>

      <window.TweakSection title="Cor de acento">
        <window.TweakColor
          value={tweaks.accent}
          onChange={v => {
            setTweak("accent", v);
            document.documentElement.style.setProperty("--md-coral", v);
          }}
          options={["#E8614A", "#D9483B", "#F08A4B", "#2D5BFF", "#1F8B5F"]}
        />
      </window.TweakSection>

      <window.TweakSection title="Densidade">
        <window.TweakRadio
          value={tweaks.density}
          onChange={v => setTweak("density", v)}
          options={[
            { value: "comfortable", label: "Conforto" },
            { value: "compact", label: "Compacto" },
          ]}
        />
      </window.TweakSection>
    </window.TweaksPanel>
  );
}

// ─── App ─────────────────────────────────────────────────────────────
function App() {
  const tw = window.useTweaks(TWEAK_DEFAULTS);
  const tweaks = tw[0]; const setTweak = tw[1];
  const [route, setRoute] = useState("home"); // home | inicio
  // density toggle
  useEffect(() => {
    document.documentElement.style.setProperty("--md-density", tweaks.density);
    if (tweaks.density === "compact") {
      document.documentElement.style.setProperty("--md-gap", "12px");
    } else {
      document.documentElement.style.setProperty("--md-gap", "16px");
    }
  }, [tweaks.density]);

  // accent
  useEffect(() => {
    document.documentElement.style.setProperty("--md-coral", tweaks.accent);
  }, [tweaks.accent]);

  return (
    <>
      <div className="app">
        <Sidebar route={route} setRoute={setRoute} />
        <Topbar route={route} />
        {route === "home"     ? <HomeScreen    setRoute={setRoute} /> :
         route === "inicio"   ? <ToolScreen    setRoute={setRoute} /> :
         route === "followup" ? <FollowupScreen setRoute={setRoute} /> :
         route === "contrato" ? <ContratoScreen setRoute={setRoute} /> :
         route === "slack"    ? <SlackScreen   setRoute={setRoute} /> :
         <ToolScreen setRoute={setRoute} />}
      </div>
      <AppTweaks tweaks={tweaks} setTweak={setTweak} route={route} setRoute={setRoute} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
