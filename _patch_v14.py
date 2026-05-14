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

# ── 1. NAV array ──────────────────────────────────────────────────────────────
OLD_NAV_RESUMO    = '{ key: "resumo",    label: "Resumo do Cliente",      icon: "fileAlt",    available: false }'
NEW_NAV_BRIEFING  = '{ key: "briefing",    label: "Briefing de Reunião",    icon: "stats",      available: true  }'
assert OLD_NAV_RESUMO in js, "NAV resumo not found"
js = js.replace(OLD_NAV_RESUMO, NEW_NAV_BRIEFING, 1)
print("1a. NAV: Resumo -> Briefing de Reunião")

OLD_NAV_TEMPL      = '{ key: "templates", label: "Templates de E-mail",    icon: "mail",       available: false }'
NEW_NAV_CONCORRENTE = '{ key: "concorrente", label: "Análise de Concorrente", icon: "lock",       available: true  }'
assert OLD_NAV_TEMPL in js, "NAV templates not found"
js = js.replace(OLD_NAV_TEMPL, NEW_NAV_CONCORRENTE, 1)
print("1b. NAV: Templates -> Análise de Concorrente")

# ── 2. Bento: Resumo card ─────────────────────────────────────────────────────
OLD_CARD_RESUMO = (
    '{/* Resumo — wide */}\n'
    '        <div className="tool-card coming-soon span-2">\n'
    '          <div className="tool-card-head">\n'
    '            <div className="tool-icon">{I.fileAlt}</div>\n'
    '            <span className="badge soon">Em breve</span>\n'
    '          </div>\n'
    '          <h3 className="tool-name">Resumo do Cliente</h3>\n'
    '          <p className="tool-desc">Ficha consolidada para reuniões, follow-ups e handoff.</p>\n'
    '        </div>'
)
NEW_CARD_BRIEFING = (
    '{/* Briefing de Reunião — wide */}\n'
    '        <div className="tool-card available span-2" onClick={() => setRoute("briefing")}>\n'
    '          <div className="tool-card-head">\n'
    '            <div className="tool-icon">{I.stats}</div>\n'
    '            <span className="badge available">Disponível</span>\n'
    '          </div>\n'
    '          <h3 className="tool-name">Briefing de Reunião</h3>\n'
    '          <p className="tool-desc">Prepare-se antes da call. Perguntas, talking points, objeções esperadas e próximo passo ideal.</p>\n'
    '          <div className="tool-foot">\n'
    '            <span className="tool-cta">Abrir ferramenta {I.arrowRight}</span>\n'
    '          </div>\n'
    '        </div>'
)
assert OLD_CARD_RESUMO in js, "Resumo card not found"
js = js.replace(OLD_CARD_RESUMO, NEW_CARD_BRIEFING, 1)
print("2a. Bento: Resumo do Cliente -> Briefing de Reunião")

# ── 3. Bento: Templates card ──────────────────────────────────────────────────
OLD_CARD_TEMPL = (
    '{/* Templates — wide */}\n'
    '        <div className="tool-card coming-soon span-2">\n'
    '          <div className="tool-card-head">\n'
    '            <div className="tool-icon">{I.mail}</div>\n'
    '            <span className="badge soon">Em breve</span>\n'
    '          </div>\n'
    '          <h3 className="tool-name">Templates de E-mail</h3>\n'
    '          <p className="tool-desc">Modelos prontos para cada etapa do onboarding do cliente.</p>\n'
    '        </div>'
)
NEW_CARD_CONCORRENTE = (
    '{/* Análise de Concorrente — wide */}\n'
    '        <div className="tool-card available span-2" onClick={() => setRoute("concorrente")}>\n'
    '          <div className="tool-card-head">\n'
    '            <div className="tool-icon">{I.lock}</div>\n'
    '            <span className="badge available">Disponível</span>\n'
    '          </div>\n'
    '          <h3 className="tool-name">Análise de Concorrente</h3>\n'
    '          <p className="tool-desc">Cliente mencionou um concorrente? Receba diferenciação específica e pronta para usar na hora.</p>\n'
    '          <div className="tool-foot">\n'
    '            <span className="tool-cta">Abrir ferramenta {I.arrowRight}</span>\n'
    '          </div>\n'
    '        </div>'
)
assert OLD_CARD_TEMPL in js, "Templates card not found"
js = js.replace(OLD_CARD_TEMPL, NEW_CARD_CONCORRENTE, 1)
print("2b. Bento: Templates de E-mail -> Análise de Concorrente")

# ── 4. Placeholder screens (before Tweaks panel) ──────────────────────────────
TWEAKS_MARKER = '\n// ─── Tweaks panel'
PLACEHOLDERS = (
    '\nfunction BriefingScreen({ setRoute }) {\n'
    '  return <div style={{padding:40}}>Em construção...</div>;\n'
    '}\n'
    'function ConcorrenteScreen({ setRoute }) {\n'
    '  return <div style={{padding:40}}>Em construção...</div>;\n'
    '}\n'
)
assert TWEAKS_MARKER in js, "Tweaks panel marker not found"
js = js.replace(TWEAKS_MARKER, PLACEHOLDERS + TWEAKS_MARKER, 1)
print("3. Added BriefingScreen and ConcorrenteScreen placeholders")

# ── 5. App routing ────────────────────────────────────────────────────────────
OLD_ROUTES = (
    'route === "slack"    ? <SlackScreen   setRoute={setRoute} /> :\n'
    '         <ToolScreen setRoute={setRoute} />}'
)
NEW_ROUTES = (
    'route === "slack"       ? <SlackScreen      setRoute={setRoute} /> :\n'
    '         route === "briefing"    ? <BriefingScreen    setRoute={setRoute} /> :\n'
    '         route === "concorrente" ? <ConcorrenteScreen setRoute={setRoute} /> :\n'
    '         <ToolScreen setRoute={setRoute} />}'
)
assert OLD_ROUTES in js, "App routing not found"
js = js.replace(OLD_ROUTES, NEW_ROUTES, 1)
print("4. Added briefing/concorrente routes to App()")

# ── 6. Ferramentas counter array ──────────────────────────────────────────────
OLD_FERRAMENTAS = (
    "    { key: 'coming1',   available: false },\n"
    "    { key: 'coming2',   available: false },\n"
)
NEW_FERRAMENTAS = (
    "    { key: 'briefing',    available: true  },\n"
    "    { key: 'concorrente', available: true  },\n"
)
assert OLD_FERRAMENTAS in js, "Ferramentas coming entries not found"
js = js.replace(OLD_FERRAMENTAS, NEW_FERRAMENTAS, 1)
print("5. Counter: 6 de 6 disponível")

# ── Repack ────────────────────────────────────────────────────────────────────
new_b64 = base64.b64encode(gzip.compress(js.encode('utf-8'))).decode('ascii')
content = content[:m.start(2)] + new_b64 + content[m.end(2):]
print("   Bundle repacked.")

with open(HTML, 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDone. index.html saved.")
