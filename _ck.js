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
  { key: "inicio",     label: "Boas-vindas ao Cliente", icon: "chat",    available: true },
  { key: "contrato",   label: "Gerador de Contrato", icon: "invoice", available: false },
  { key: "coleta",     label: "Janela de Coleta",    icon: "truck",   available: false },
  { key: "simulador",  label: "Simulador de Frete",  icon: "money",   available: false },
  { key: "resumo",     label: "Resumo do Cliente",   icon: "fileAlt", available: false },
  { key: "templates",  label: "Templates de E-mail", icon: "mail",    available: false },
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
            {!n.available && <span className="nav-badge">SOON</span>}
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

        {/* Gerador de Contrato — wide */}
        <div className="tool-card coming-soon span-2">
          <div className="tool-card-head">
            <div className="tool-icon">{I.invoice}</div>
            <span className="badge soon">Em breve</span>
          </div>
          <h3 className="tool-name">Gerador de Contrato</h3>
          <p className="tool-desc">Preenche o contrato com os dados do cliente automaticamente, pronto para assinar.</p>
          <div className="tool-foot">
            <span className="tool-cta">Notificar quando disponível</span>
          </div>
        </div>

        {/* Janela de Coleta — small */}
        <div className="tool-card coming-soon">
          <div className="tool-card-head">
            <div className="tool-icon">{I.truck}</div>
            <span className="badge soon">Em breve</span>
          </div>
          <h3 className="tool-name">Janela de Coleta</h3>
          <p className="tool-desc">Consulta e confirma horário de coleta por CEP.</p>
        </div>

        {/* Simulador — small */}
        <div className="tool-card coming-soon">
          <div className="tool-card-head">
            <div className="tool-icon">{I.money}</div>
            <span className="badge soon">Em breve</span>
          </div>
          <h3 className="tool-name">Simulador de Frete</h3>
          <p className="tool-desc">Estimativa rápida de frete para a proposta.</p>
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 }}>
        {[
          { icon: I.cog,     name: "Portal de Integrações", desc: "ERPs, plataformas e conectores",    url: "https://sites.google.com/nuvemshop.com.br/integracoesnuvemenvio/início" },
          { icon: I.invoice, name: "Documentos Úteis",      desc: "Bids, contratos e documentos",     url: "https://drive.google.com/drive/folders/16-o_2s-yrsHz_fV9zq11UedPLsgqnvk-" },
          { icon: I.lock,    name: "Playbook Jurídico",     desc: "Contratos, compliance e jurídico",  url: "https://docs.google.com/document/d/104pV8ls8EYtIWwizb-YrfOcoPzKRhJkH/edit" },
        ].map(r => (
          <a
            key={r.name}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
            className="resource-card"
          >
            <span className="resource-icon">{r.icon}</span>
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
        {route === "home" ? <HomeScreen setRoute={setRoute} /> : <ToolScreen setRoute={setRoute} />}
      </div>
      <AppTweaks tweaks={tweaks} setTweak={setTweak} route={route} setRoute={setRoute} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
