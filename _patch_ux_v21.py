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
# 1. Subtitle da Home: troca array por dia por horário dinâmico
# =========================================================================
OLD1 = (
    "{(()=>{const f=['Cada onboarding bem-feito é um cliente que fica. \U0001f4aa',"
    "'Consistência no processo = crescimento previsível. \U0001f680',"
    "'A primeira impressão do cliente começa aqui. ✨',"
    "'Mais velocidade, mais clientes bem atendidos. ⚡',"
    "'Fechar é ótimo. Onboarding bem-feito é melhor ainda. \U0001f91d',"
    "'Seu kit de ferramentas para um onboarding perfeito. \U0001f3af',"
    "'Hoje é dia de gerar mensagens e fechar negócios. \U0001f525'];"
    "return f[new Date().getDay()];})()} "
)
NEW1 = (
    "{(()=>{"
    "const h=new Date().getHours();"
    "return h>=5&&h<12?'Bom dia de vendas. O que vai fechar hoje?'"
    ":h>=12&&h<18?'Hub do time comercial. Ferramentas, eventos e inteligência.'"
    ":'Encerrando o dia? Registre seus follow-ups antes de sair.';"
    "})()} "
)
assert OLD1 in js, "1. Subtitle array não encontrado"
js = js.replace(OLD1, NEW1, 1)
print("1. Subtitle: substituído por frases dinâmicas por horário")

# =========================================================================
# 2. Greeting: usa nome do localStorage
# =========================================================================
OLD2 = (
    '{(()=>{const h=new Date().getHours();'
    'return h>=5&&h<12?"Bom dia, vendedor(a)":h>=12&&h<18?"Boa tarde, vendedor(a)":"Boa noite, vendedor(a)";})()}'
)
NEW2 = (
    '{(()=>{'
    'const h=new Date().getHours();'
    "const nomeVendedor=localStorage.getItem('vendedor_nome');"
    "const primeiroNome=nomeVendedor?nomeVendedor.split(' ')[0]:'vendedor(a)';"
    'return h>=5&&h<12?`Bom dia, ${primeiroNome}`:h>=12&&h<18?`Boa tarde, ${primeiroNome}`:`Boa noite, ${primeiroNome}`;'
    '})()'
    '}'
)
assert OLD2 in js, "2. Greeting IIFE não encontrado"
js = js.replace(OLD2, NEW2, 1)
print("2. Greeting: usa primeiroNome do localStorage")

# =========================================================================
# 3. Eventos responsavel: atualiza ordem das props (garante consistência)
# =========================================================================
OLD3 = (
    "                    {ev.responsavel && (\n"
    "                      <span style={{padding:'1px 7px',borderRadius:10,\n"
    "                        background:'var(--md-coral-tint)',color:'var(--md-coral)',\n"
    "                        fontSize:10,fontWeight:500}}>\n"
    "                        {ev.responsavel}\n"
    "                      </span>\n"
    "                    )}"
)
NEW3 = (
    "                    {ev.responsavel && (\n"
    "                      <span style={{padding:'1px 7px',borderRadius:10,\n"
    "                        fontSize:10,fontWeight:500,\n"
    "                        background:'var(--md-coral-tint)',\n"
    "                        color:'var(--md-coral)'}}>\n"
    "                        {ev.responsavel}\n"
    "                      </span>\n"
    "                    )}"
)
assert OLD3 in js, "3. Responsavel block não encontrado"
js = js.replace(OLD3, NEW3, 1)
print("3. Eventos responsavel: props reordenadas (agência/vendedor via campo único)")

# =========================================================================
# 4a. Topbar: torna busca funcional
# =========================================================================
OLD4_FN = (
    'function Topbar({ route }) {\n'
    '  const crumb =\n'
    '    route === "home" ? null :\n'
    '    route === "inicio" ? "Boas-vindas ao Cliente" :\n'
    '    NAV.find(n => n.key === route)?.label;\n'
    '  return (\n'
    '    <header className="topbar">\n'
    '      <div className="topbar-left">\n'
    '        {crumb ? (\n'
    '          <div className="topbar-crumb">\n'
    '            Ferramentas <span style={{ opacity: 0.5 }}>/</span> <b>{crumb}</b>\n'
    '          </div>\n'
    '        ) : (\n'
    '          <div className="topbar-crumb">Painel <span style={{ opacity: 0.5 }}>/</span> <b>Home</b></div>\n'
    '        )}\n'
    '      </div>\n'
    '      <div className="topbar-right">\n'
    '        <div className="topbar-search">\n'
    '          <span style={{ color: "var(--md-muted)", display: "inline-flex" }}>{I.search}</span>\n'
    '          <span>Buscar ferramenta…</span>\n'
    '          <span className="kbd">⌘K</span>\n'
    '        </div>\n'
    '\n'
    '      </div>\n'
    '    </header>\n'
    '  );\n'
    '}'
)
NEW4_FN = (
    'function Topbar({ route, setRoute }) {\n'
    '  const [q, setQ] = React.useState(\'\');\n'
    '  const [open, setOpen] = React.useState(false);\n'
    '  const crumb =\n'
    '    route === "home" ? null :\n'
    '    route === "inicio" ? "Boas-vindas ao Cliente" :\n'
    '    NAV.find(n => n.key === route)?.label;\n'
    '  const results = q.trim()\n'
    '    ? NAV.filter(n => n.available && n.label.toLowerCase().includes(q.toLowerCase()))\n'
    '    : [];\n'
    '  React.useEffect(() => {\n'
    '    if (results.length === 1) {\n'
    '      setRoute(results[0].key); setQ(\'\'); setOpen(false);\n'
    '    }\n'
    '  }, [results.length]);\n'
    '  function handleKey(e) {\n'
    '    if (e.key === \'Escape\') { setQ(\'\'); setOpen(false); }\n'
    '  }\n'
    '  return (\n'
    '    <header className="topbar">\n'
    '      <div className="topbar-left">\n'
    '        {crumb ? (\n'
    '          <div className="topbar-crumb">\n'
    '            Ferramentas <span style={{ opacity: 0.5 }}>/</span> <b>{crumb}</b>\n'
    '          </div>\n'
    '        ) : (\n'
    '          <div className="topbar-crumb">Painel <span style={{ opacity: 0.5 }}>/</span> <b>Home</b></div>\n'
    '        )}\n'
    '      </div>\n'
    '      <div className="topbar-right" style={{position:\'relative\'}}>\n'
    '        <div className="topbar-search">\n'
    '          <span style={{ color: "var(--md-muted)", display: "inline-flex" }}>{I.search}</span>\n'
    '          <input type="text" value={q}\n'
    '            onChange={e => { setQ(e.target.value); setOpen(true); }}\n'
    '            onFocus={() => setOpen(true)}\n'
    '            onBlur={() => setTimeout(() => setOpen(false), 150)}\n'
    '            onKeyDown={handleKey}\n'
    '            placeholder="Buscar ferramenta... ⌘K"\n'
    '            style={{border:\'none\',outline:\'none\',background:\'transparent\',\n'
    '              fontSize:13,color:\'var(--md-ink)\',width:180}} />\n'
    '        </div>\n'
    '        {open && q.trim() && results.length > 1 && (\n'
    '          <div style={{position:\'absolute\',top:\'100%\',right:0,marginTop:4,\n'
    '            background:\'var(--md-paper)\',border:\'1px solid var(--md-line)\',\n'
    '            borderRadius:10,boxShadow:\'0 4px 20px rgba(0,0,0,0.1)\',\n'
    '            minWidth:220,zIndex:200,overflow:\'hidden\'}}>\n'
    '            {results.map(n => (\n'
    '              <button key={n.key}\n'
    '                onMouseDown={() => { setRoute(n.key); setQ(\'\'); setOpen(false); }}\n'
    '                style={{display:\'block\',width:\'100%\',textAlign:\'left\',\n'
    '                  padding:\'9px 14px\',border:\'none\',background:\'transparent\',\n'
    '                  cursor:\'pointer\',fontSize:13,color:\'var(--md-ink)\'}}>\n'
    '                {n.label}\n'
    '              </button>\n'
    '            ))}\n'
    '          </div>\n'
    '        )}\n'
    '      </div>\n'
    '    </header>\n'
    '  );\n'
    '}'
)
assert OLD4_FN in js, "4a. Topbar function não encontrada"
js = js.replace(OLD4_FN, NEW4_FN, 1)
print("4a. Topbar: busca funcional implementada")

# =========================================================================
# 4b. Adiciona setRoute na chamada do Topbar
# =========================================================================
OLD4_CALL = '<Topbar route={route} />'
NEW4_CALL = '<Topbar route={route} setRoute={setRoute} />'
assert OLD4_CALL in js, "4b. <Topbar> call não encontrada"
js = js.replace(OLD4_CALL, NEW4_CALL, 1)
print("4b. Topbar: setRoute adicionado à chamada")

# =========================================================================
# 5. Remove emoji 🎯 do texto fixo do bento card de eventos
# (o subtitle já foi trocado no passo 1, que eliminava o 🎯 da array)
# =========================================================================
# Apenas confirma que não sobrou nenhum 🎯 em textos fixos (fora do BriefingScreen)
remaining = [i for i in re.finditer('\U0001f3af', js)]
# O único 🎯 permitido é no array HEADERS do BriefingScreen
briefing_idx = js.find("const HEADERS = ['\U0001f3af'")
fixed_emojis = [r for r in remaining if abs(r.start() - briefing_idx) > 50]
assert len(fixed_emojis) == 0, f"5. Ainda existem 🎯 em textos fixos: {[r.start() for r in fixed_emojis]}"
print("5. Emoji 🎯: confirmado ausente de textos fixos")

# =========================================================================
# 6a. Remove "Eventos fora de SP, MG e SC em um só lugar." do card bento
# =========================================================================
OLD6A = 'Calendário Nuvem Envio 2026 + Conecta D2C. Eventos fora de SP, MG e SC em um só lugar.'
NEW6A = 'Calendário Nuvem Envio 2026 + Conecta D2C.'
assert OLD6A in js, "6a. Descrição do bento card eventos não encontrada"
js = js.replace(OLD6A, NEW6A, 1)
print("6a. Bento card eventos: descrição atualizada (sem 'fora de SP...')")

# =========================================================================
# 6b. Atualiza rodapé da EventosScreen
# =========================================================================
OLD6B = 'Calendário Nuvem Envio 2026 + Agenda Conecta D2C · exclui SP, MG e SC · atualiza da planilha'
NEW6B = 'Calendário Nuvem Envio 2026 + Conecta D2C · atualiza da planilha'
assert OLD6B in js, "6b. Rodapé EventosScreen não encontrado"
js = js.replace(OLD6B, NEW6B, 1)
print("6b. EventosScreen rodapé: simplificado")

# =========================================================================
# Repack
# =========================================================================
new_b64 = base64.b64encode(gzip.compress(js.encode('utf-8'))).decode('ascii')
content = content[:m.start(2)] + new_b64 + content[m.end(2):]
print("Bundle repacked.")

with open(HTML, 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDone. index.html salvo.")
