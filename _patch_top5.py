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
# 1. Novos state vars: markComercial, generateTime, clienteDetectado, plano
# =========================================================================
OLD1 = "  const [showPreview, setShowPreview] = useState(false);"
NEW1 = (
    "  const [markComercial, setMarkComercial] = useState(false);\n"
    "  const [generateTime, setGenerateTime] = useState(0);\n"
    "  const [clienteDetectado, setClienteDetectado] = useState('');\n"
    "  const [plano, setPlano] = useState('');\n"
    "  const [showPreview, setShowPreview] = useState(false);"
)
assert OLD1 in js, "1. showPreview state not found"
js = js.replace(OLD1, NEW1, 1)
print("1. State vars adicionados (markComercial, generateTime, clienteDetectado, plano)")

# =========================================================================
# 2. Reescreve generate() — remove logs, adiciona timer + toggles + campos extraídos
# =========================================================================
NEW_GEN = (
    "  async function generate() {\n"
    "    if (!file) return;\n"
    '    setState("loading");\n'
    "    setApiError(null);\n"
    "    const _t0 = Date.now();\n"
    "    try {\n"
    "      const b64 = await readBase64(file);\n"
    "      const res = await fetch('/api/generate', {\n"
    "        method: 'POST',\n"
    "        headers: { 'Content-Type': 'application/json' },\n"
    "        body: JSON.stringify({ fileBase64: b64, mimeType: file.type || 'application/pdf', tone, sellerName, includeNuvem, includeNext, markComercial })\n"
    "      });\n"
    "      const data = await res.json();\n"
    "      if (!data?.message) throw new Error('Campo message ausente: ' + JSON.stringify(data));\n"
    "      if (!res.ok) throw new Error(data.error || 'Erro desconhecido');\n"
    "      setGeneratedMessage(data.message);\n"
    "      setClienteDetectado(data.clienteDetectado || '');\n"
    "      setPlano(data.plano || '');\n"
    "      setGenerateTime(Math.round((Date.now() - _t0) / 1000));\n"
    "      const _entry = { timestamp: new Date().toISOString(), sellerName, fileName: file?.name };\n"
    "      const _hist = JSON.parse(localStorage.getItem('historico') || '[]');\n"
    "      _hist.push(_entry);\n"
    "      localStorage.setItem('historico', JSON.stringify(_hist));\n"
    '      setState("success");\n'
    "    } catch (e) {\n"
    "      console.error('[generate]', e);\n"
    "      setApiError(e.message);\n"
    '      setState("uploaded");\n'
    "    }\n"
    "  }"
)
js, n2 = re.subn(
    r'  async function generate\(\) \{[\s\S]*?(?=\n\n  function copy\(\))',
    lambda _: NEW_GEN,
    js, count=1
)
assert n2 == 1, "2. generate() não encontrado"
print("2. generate() reescrito: timer, toggles passados à API, campos extraídos, sem console.logs")

# =========================================================================
# 3. "Cliente detectado" e "Plano" — exibe dados extraídos
# =========================================================================
OLD3 = (
    '            <div className="config-row">\n'
    '              <div className="field">\n'
    '                <div className="lbl">Cliente detectado</div>\n'
    '                <div className="val">\n'
    '                  <span style={{ color: "var(--md-muted)" }}>—</span>\n'
    '                </div>\n'
    '              </div>\n'
    '              <div className="field">\n'
    '                <div className="lbl">Plano</div>\n'
    '                <div className="val">\n'
    '                  <span style={{ color: "var(--md-muted)" }}>—</span>\n'
    '                </div>\n'
    '              </div>\n'
    '            </div>'
)
NEW3 = (
    '            <div className="config-row">\n'
    '              <div className="field">\n'
    '                <div className="lbl">Cliente detectado</div>\n'
    '                <div className="val">\n'
    "                  {clienteDetectado\n"
    '                    ? <span style={{ color: "var(--md-ink-2)", fontWeight: 500 }}>{clienteDetectado}</span>\n'
    '                    : <span style={{ color: "var(--md-muted)" }}>—</span>}\n'
    '                </div>\n'
    '              </div>\n'
    '              <div className="field">\n'
    '                <div className="lbl">Plano</div>\n'
    '                <div className="val">\n'
    "                  {plano\n"
    '                    ? <span style={{ color: "var(--md-ink-2)", fontWeight: 500 }}>{plano}</span>\n'
    '                    : <span style={{ color: "var(--md-muted)" }}>—</span>}\n'
    '                </div>\n'
    '              </div>\n'
    '            </div>'
)
assert OLD3 in js, "3. config-row (cliente/plano) não encontrado"
js = js.replace(OLD3, NEW3, 1)
print("3. Cliente detectado / Plano: exibe dados reais da API")

# =========================================================================
# 4. Fix toggle @comercial
# =========================================================================
OLD4 = '                <button className="switch" />'
NEW4 = '                <button className={"switch " + (markComercial ? "on" : "")} onClick={() => setMarkComercial(!markComercial)} />'
assert OLD4 in js, "4. Botão @comercial não encontrado"
js = js.replace(OLD4, NEW4, 1)
print("4. Toggle @comercial: estado e onClick funcionais")

# =========================================================================
# 5. Loading substeps: remove números fake
# =========================================================================
OLD5a = '                  <div className="row done"><span className="b">{I.check}</span> Lendo PDF (3 páginas)</div>'
NEW5a = '                  <div className="row done"><span className="b">{I.check}</span> Arquivo recebido e validado</div>'
assert OLD5a in js, "5a. Substep 1 não encontrado"
js = js.replace(OLD5a, NEW5a, 1)

OLD5b = '                  <div className="row done"><span className="b">{I.check}</span> Extraindo 24 campos cadastrais</div>'
NEW5b = '                  <div className="row done"><span className="b">{I.check}</span> Extraindo informações cadastrais</div>'
assert OLD5b in js, "5b. Substep 2 não encontrado"
js = js.replace(OLD5b, NEW5b, 1)
print("5. Loading substeps: números fake removidos")

# =========================================================================
# 6. Header do result card: nome dinâmico do cliente
# =========================================================================
OLD6 = '<span className="lbl">Mensagem para #grupo-mercazzo</span>'
NEW6 = '{clienteDetectado ? <span className="lbl">Mensagem para {clienteDetectado}</span> : <span className="lbl">Mensagem para o cliente</span>}'
assert OLD6 in js, "6. #grupo-mercazzo não encontrado"
js = js.replace(OLD6, NEW6, 1)
print("6. Header do resultado: nome dinâmico do cliente")

# =========================================================================
# 7. Reset link: limpa novos estados ao "Gerar para outro cliente"
# =========================================================================
OLD7 = """              <a className="reset-link" onClick={() => { setState("empty"); setFile(null); setGeneratedMessage(''); setApiError(null); }}>"""
NEW7 = """              <a className="reset-link" onClick={() => { setState("empty"); setFile(null); setGeneratedMessage(''); setApiError(null); setClienteDetectado(''); setPlano(''); setGenerateTime(0); }}>"""
assert OLD7 in js, "7. reset-link não encontrado"
js = js.replace(OLD7, NEW7, 1)
print("7. Reset link: limpa clienteDetectado, plano, generateTime")

# =========================================================================
# 8. Banner de sucesso com tempo de geração (detalhe engajante)
# =========================================================================
OLD8 = (
    '            {state === "success" ? (\n'
    '              <>\n'
    '                <div className="message">'
)
NEW8 = (
    '            {state === "success" ? (\n'
    '              <>\n'
    "                <div style={{ margin: '0 0 10px', padding: '7px 12px', borderRadius: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#059669', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>\n"
    "                  ✨ Pronto em {generateTime}s — copie e envie no grupo!\n"
    "                </div>\n"
    '                <div className="message">'
)
assert OLD8 in js, "8. Success state opening não encontrado"
js = js.replace(OLD8, NEW8, 1)
print("8. Banner de sucesso: tempo de geração")

# =========================================================================
# 9. HomeScreen: frase motivacional rotativa por dia da semana
# =========================================================================
OLD9 = (
    '            <p className="page-subtitle">\n'
    '              Suas ferramentas internas em um lugar só. Comece pelo Boas-vindas ao Cliente para gerar a mensagem de boas-vindas do próximo cliente.\n'
    '            </p>'
)
NEW9 = (
    '            <p className="page-subtitle">\n'
    "              {(()=>{const f=["
    "'Cada onboarding bem-feito é um cliente que fica. 💪',"
    "'Consistência no processo = crescimento previsível. 🚀',"
    "'A primeira impressão do cliente começa aqui. ✨',"
    "'Mais velocidade, mais clientes bem atendidos. ⚡',"
    "'Fechar é ótimo. Onboarding bem-feito é melhor ainda. 🤝',"
    "'Seu kit de ferramentas para um onboarding perfeito. 🎯',"
    "'Hoje é dia de gerar mensagens e fechar negócios. 🔥'"
    "];return f[new Date().getDay()];})()} \n"
    '            </p>'
)
assert OLD9 in js, "9. Page subtitle não encontrado"
js = js.replace(OLD9, NEW9, 1)
print("9. HomeScreen: frase motivacional rotativa por dia da semana")

# =========================================================================
# Repack
# =========================================================================
new_b64 = base64.b64encode(gzip.compress(js.encode('utf-8'))).decode('ascii')
content = content[:m.start(2)] + new_b64 + content[m.end(2):]
print("Bundle repacked.")

with open(HTML, 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDone. index.html salvo.")
