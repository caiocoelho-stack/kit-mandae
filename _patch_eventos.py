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

# =========================================================================
# 1. Adiciona "eventos" ao NAV array (após concorrente)
# =========================================================================
OLD1 = (
    '  { key: "concorrente", label: "Análise de Concorrente", icon: "lock",       available: true  },\n'
    '];'
)
NEW1 = (
    '  { key: "concorrente", label: "Análise de Concorrente", icon: "lock",       available: true  },\n'
    '  { key: "eventos",     label: "Agenda de Eventos",      icon: "stars",      available: true  },\n'
    '];'
)
assert OLD1 in js, "1. NAV concorrente entry não encontrado"
js = js.replace(OLD1, NEW1, 1)
print("1. NAV: 'eventos' adicionado")

# =========================================================================
# 2. Adiciona "eventos" ao array ferramentas do HomeScreen
# =========================================================================
OLD2 = (
    "    { key: 'concorrente', available: true  },\n"
    "  ];\n"
    "  const total = ferramentas.length;"
)
NEW2 = (
    "    { key: 'concorrente', available: true  },\n"
    "    { key: 'eventos',     available: true  },\n"
    "  ];\n"
    "  const total = ferramentas.length;"
)
assert OLD2 in js, "2. ferramentas array (concorrente) não encontrado"
js = js.replace(OLD2, NEW2, 1)
print("2. ferramentas array: 'eventos' adicionado")

# =========================================================================
# 3. Bento card "Agenda de Eventos" (insere após concorrente, antes do </div> do bento)
# =========================================================================
OLD3 = (
    '          <p className="tool-desc">Cliente mencionou um concorrente? Receba diferenciação específica e pronta para usar na hora.</p>\n'
    '          <div className="tool-foot">\n'
    '            <span className="tool-cta">Abrir ferramenta {I.arrowRight}</span>\n'
    '          </div>\n'
    '        </div>\n'
    '      </div>'
)
NEW3 = (
    '          <p className="tool-desc">Cliente mencionou um concorrente? Receba diferenciação específica e pronta para usar na hora.</p>\n'
    '          <div className="tool-foot">\n'
    '            <span className="tool-cta">Abrir ferramenta {I.arrowRight}</span>\n'
    '          </div>\n'
    '        </div>\n'
    '\n'
    '        {/* Agenda de Eventos */}\n'
    '        <div className="tool-card available" onClick={() => setRoute("eventos")}>\n'
    '          <div className="tool-card-head">\n'
    '            <div className="tool-icon">{I.stars}</div>\n'
    '            <span className="badge available">Disponível</span>\n'
    '          </div>\n'
    '          <h3 className="tool-name">Agenda de Eventos</h3>\n'
    '          <p className="tool-desc">Calendário Nuvem Envio 2026 + Conecta D2C. Eventos fora de SP, MG e SC em um só lugar.</p>\n'
    '          <div className="tool-foot">\n'
    '            <span className="tool-cta">Ver agenda {I.arrowRight}</span>\n'
    '          </div>\n'
    '        </div>\n'
    '      </div>'
)
assert OLD3 in js, "3. Concorrente card closing + bento closing não encontrado"
js = js.replace(OLD3, NEW3, 1)
print("3. Bento card 'Agenda de Eventos' inserido")

# =========================================================================
# 4. Insere componente EventosScreen antes de AppTweaks
# =========================================================================
EVENTOS_SCREEN = (
    'function EventosScreen({ setRoute }) {\n'
    "  const [eventos, setEventos] = React.useState([]);\n"
    "  const [loading, setLoading] = React.useState(true);\n"
    "  const [apiError, setApiError] = React.useState(null);\n"
    "  const [fontes, setFontes] = React.useState({ clara: 0, agenda: 0 });\n"
    "  const [updatedAt, setUpdatedAt] = React.useState('');\n"
    '\n'
    '  React.useEffect(() => {\n'
    "    fetch('/api/eventos')\n"
    '      .then(r => r.json())\n'
    '      .then(d => {\n'
    "        setEventos(d.events || []);\n"
    "        setFontes(d.fontes || { clara: 0, agenda: 0 });\n"
    "        setUpdatedAt(d.updatedAt || '');\n"
    '        setLoading(false);\n'
    '      })\n'
    '      .catch(e => {\n'
    '        setApiError(e.message);\n'
    '        setLoading(false);\n'
    '      });\n'
    '  }, []);\n'
    '\n'
    '  function fmtData(s) {\n'
    "    if (!s || s === 'TBD') return 'A confirmar';\n"
    '    return s;\n'
    '  }\n'
    '\n'
    '  return (\n'
    '    <main className="main">\n'
    '      <div className="page-header">\n'
    '        <div className="page-eyebrow">\n'
    '          <span className="dot" />\n'
    '          <span style={{ cursor: "pointer" }} onClick={() => setRoute("home")}>Ferramentas</span>\n'
    '          <span style={{ color: "var(--md-muted-2)" }}>/</span>\n'
    '          <span style={{ color: "var(--md-ink-2)" }}>Agenda de Eventos</span>\n'
    '        </div>\n'
    '        <div className="page-title-row">\n'
    '          <div>\n'
    '            <h1 className="page-title">Agenda de Eventos<span className="accent-bar" /></h1>\n'
    '            <p className="page-subtitle">Calendário Nuvem Envio 2026 + Conecta D2C — exclui SP, MG e SC.</p>\n'
    '          </div>\n'
    '          <div className="page-meta">\n'
    "            <span className=\"meta-pill\"><span className=\"led\" /> {loading ? '…' : eventos.length + ' eventos'}</span>\n"
    '          </div>\n'
    '        </div>\n'
    '      </div>\n'
    '\n'
    '      {loading ? (\n'
    "        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '60px 0', color: 'var(--md-muted)' }}>\n"
    '          <div className="big-spinner" />\n'
    '          <span>Carregando eventos…</span>\n'
    '        </div>\n'
    '      ) : apiError ? (\n'
    "        <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(232,97,74,0.08)', border: '1px solid rgba(232,97,74,0.25)', color: 'var(--md-coral)', fontSize: 13 }}>\n"
    '          ⚠ {apiError}\n'
    '        </div>\n'
    '      ) : (\n'
    '        <>\n'
    "          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>\n"
    '            {eventos.map((ev, i) => (\n'
    "              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '13px 18px', borderRadius: 12, border: '1px solid var(--md-line)', background: 'var(--md-paper)' }}>\n"
    "                <div style={{ minWidth: 80, textAlign: 'center', paddingTop: 2 }}>\n"
    "                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--md-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Data</div>\n"
    "                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--md-ink-2)', marginTop: 2 }}>{fmtData(ev.data)}</div>\n"
    '                </div>\n'
    "                <div style={{ flex: 1, minWidth: 0 }}>\n"
    "                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>\n"
    "                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--md-ink)' }}>{ev.nome}</span>\n"
    "                    {ev.fonte === 'agenda' && (\n"
    "                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: 'rgba(139,92,246,0.12)', color: '#7c3aed', letterSpacing: '0.03em' }}>Conecta D2C</span>\n"
    '                    )}\n'
    '                    {ev.tipo && (\n'
    "                      <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 20, background: 'var(--md-bg-2)', color: 'var(--md-ink-3)' }}>{ev.tipo}</span>\n"
    '                    )}\n'
    '                  </div>\n'
    '                  {(ev.cidade || ev.uf) && (\n'
    "                    <div style={{ fontSize: 12.5, color: 'var(--md-muted)', marginTop: 3 }}>\n"
    "                      \U0001f4cd {[ev.cidade, ev.uf].filter(Boolean).join(', ')}\n"
    '                    </div>\n'
    '                  )}\n'
    '                  {ev.responsavel && (\n'
    "                    <div style={{ fontSize: 12, color: 'var(--md-ink-3)', marginTop: 2 }}>{ev.responsavel}</div>\n"
    '                  )}\n'
    '                </div>\n'
    '              </div>\n'
    '            ))}\n'
    '            {eventos.length === 0 && (\n'
    "              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--md-muted)', fontSize: 14 }}>Nenhum evento encontrado.</div>\n"
    '            )}\n'
    '          </div>\n'
    "          <div style={{ fontSize: 12, color: 'var(--md-muted)', borderTop: '1px solid var(--md-line)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>\n"
    '            <span>Fonte: Calendário Nuvem Envio 2026 ({fontes.clara}) + Agenda Conecta D2C ({fontes.agenda}) · exclui SP, MG e SC</span>\n'
    "            {updatedAt && <span>Atualizado: {new Date(updatedAt).toLocaleString('pt-BR')}</span>}\n"
    '          </div>\n'
    '        </>\n'
    '      )}\n'
    '    </main>\n'
    '  );\n'
    '}\n'
    '\n'
)

OLD4 = 'function AppTweaks({ tweaks, setTweak, route, setRoute }) {'
NEW4 = EVENTOS_SCREEN + OLD4
assert OLD4 in js, "4. AppTweaks function não encontrado"
js = js.replace(OLD4, NEW4, 1)
print("4. EventosScreen inserido")

# =========================================================================
# 5. Adiciona rota "eventos" no App router
# =========================================================================
OLD5 = (
    '         route === "concorrente" ? <ConcorrenteScreen setRoute={setRoute} /> :\n'
    '         <ToolScreen setRoute={setRoute} />}'
)
NEW5 = (
    '         route === "concorrente" ? <ConcorrenteScreen setRoute={setRoute} /> :\n'
    '         route === "eventos"     ? <EventosScreen     setRoute={setRoute} /> :\n'
    '         <ToolScreen setRoute={setRoute} />}'
)
assert OLD5 in js, "5. App router (concorrente) não encontrado"
js = js.replace(OLD5, NEW5, 1)
print("5. Rota 'eventos' adicionada ao App")

# =========================================================================
# Repack
# =========================================================================
new_b64 = base64.b64encode(gzip.compress(js.encode('utf-8'))).decode('ascii')
content = content[:m.start(2)] + new_b64 + content[m.end(2):]
print("Bundle repacked.")

with open(HTML, 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDone. index.html salvo.")
