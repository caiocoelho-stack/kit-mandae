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
# 1. Sidebar wordmark: "Kit Mandaê/Nuvem Envio" → "Kit Vendedor" + subtitle
# =========================================================================
OLD1 = (
    '        <div className="sidebar-wordmark">\n'
    '          Kit <span className="accent">Mandaê/Nuvem Envio</span>\n'
    '        </div>'
)
NEW1 = (
    '        <div className="sidebar-wordmark">\n'
    '          <b>Kit Vendedor</b>'
    '<small style={{ display: "block", fontSize: 10, color: "var(--md-muted)", fontWeight: 400, marginTop: 1 }}>Mandaê / Nuvem Envio</small>\n'
    '        </div>'
)
assert OLD1 in js, "1. Sidebar wordmark not found"
js = js.replace(OLD1, NEW1, 1)
print("1. Sidebar wordmark: Kit Vendedor + subtitle")

# =========================================================================
# 2. Data dinâmica
# =========================================================================
OLD2 = '          Quarta-feira, 13 de maio'
NEW2 = (
    "          {(()=>{"
    "const hoje=new Date();"
    "const dias=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];"
    "const meses=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];"
    "return `${dias[hoje.getDay()]}, ${hoje.getDate()} de ${meses[hoje.getMonth()]}`;})()}"
)
assert OLD2 in js, "2. Hardcoded date not found"
js = js.replace(OLD2, NEW2, 1)
print("2. Data dinâmica")

# =========================================================================
# 3. Métrica real via localStorage
# =========================================================================
OLD3 = (
    '          <div className="featured-stat">\n'
    '            <span><b>148</b> mensagens</span>\n'
    '            <span className="sep" />\n'
    '            <span>este mês</span>\n'
    '          </div>'
)
NEW3 = (
    '          <div className="featured-stat">\n'
    "            {(()=>{"
    "const count=JSON.parse(localStorage.getItem('historico')||'[]')"
    ".filter(h=>{const d=new Date(h.timestamp);const now=new Date();"
    "return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();}).length;"
    "return <><span><b>{count}</b> mensagem{count!==1?'s':''}</span>"
    "<span className=\"sep\" /><span>este mês</span></>;})()}\n"
    '          </div>'
)
assert OLD3 in js, "3. Featured-stat (148 mensagens) not found"
js = js.replace(OLD3, NEW3, 1)
print("3. Métrica real do localStorage")

# =========================================================================
# 4a. Remove clientes fictícios, substitui por feed do localStorage
# =========================================================================
OLD4a = (
    '          <h4 className="activity-title">Últimas mensagens geradas</h4>\n'
    '          <div className="activity-row">\n'
    '            <div className="av">MC</div>\n'
    '            <div className="at"><b>Mercazzo Comércio Varejista</b> · ficha #M-2841 <span className="tag">whatsapp</span></div>\n'
    '            <div className="when">há 12 min</div>\n'
    '          </div>\n'
    '          <div className="activity-row">\n'
    '            <div className="av">BL</div>\n'
    '            <div className="at"><b>Brisa Lar Casa &amp; Decoração</b> · ficha #M-2840 <span className="tag">whatsapp</span></div>\n'
    '            <div className="when">hoje, 09:42</div>\n'
    '          </div>\n'
    '          <div className="activity-row">\n'
    '            <div className="av">VV</div>\n'
    '            <div className="at"><b>Verdee Vestuário Atacado LTDA</b> · ficha #M-2839 <span className="tag">whatsapp</span></div>\n'
    '            <div className="when">ontem</div>\n'
    '          </div>\n'
    '          <div className="activity-row">\n'
    '            <div className="av">PP</div>\n'
    '            <div className="at"><b>Pão &amp; Pasta Distribuidora</b> · ficha #M-2838 <span className="tag">whatsapp</span></div>\n'
    '            <div className="when">ontem</div>\n'
    '          </div>'
)
NEW4a = (
    '          <h4 className="activity-title">Últimas mensagens geradas</h4>\n'
    "          {(()=>{"
    "const hist=JSON.parse(localStorage.getItem('historico')||'[]').slice(-4).reverse();"
    "if(!hist.length)return <div style={{color:'var(--md-muted)',fontSize:13,padding:'12px 0'}}>Nenhuma atividade ainda — gere sua primeira mensagem.</div>;"
    "return hist.map((h,i)=>{"
    "const ini=(h.sellerName||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();"
    "const d=new Date(h.timestamp);const now=new Date();"
    "const diff=Math.floor((now-d)/60000);"
    "const when=diff<60?`há ${diff} min`:diff<1440?`hoje, ${d.getHours().toString().padStart(2,'0')}h${d.getMinutes().toString().padStart(2,'0')}`:'ontem';"
    'return <div key={i} className="activity-row">'
    '<div className="av">{ini}</div>'
    "<div className=\"at\"><b>{h.sellerName||'Mensagem gerada'}</b> · {h.fileName||'ficha'} <span className=\"tag\">whatsapp</span></div>"
    '<div className="when">{when}</div>'
    '</div>;});})()}'
)
assert OLD4a in js, "4a. Fake activity rows not found"
js = js.replace(OLD4a, NEW4a, 1)
print("4a. Feed de atividade do localStorage (vazios → empty state)")

# =========================================================================
# 4b. Salvar no localStorage após generate() com sucesso
# =========================================================================
OLD4b = (
    '      setGeneratedMessage(data.message);\n'
    '      setState("success");'
)
NEW4b = (
    '      setGeneratedMessage(data.message);\n'
    "      const _entry = { timestamp: new Date().toISOString(), sellerName, fileName: file?.name };\n"
    "      const _hist = JSON.parse(localStorage.getItem('historico') || '[]');\n"
    '      _hist.push(_entry);\n'
    "      localStorage.setItem('historico', JSON.stringify(_hist));\n"
    '      setState("success");'
)
assert OLD4b in js, "4b. setGeneratedMessage line not found"
js = js.replace(OLD4b, NEW4b, 1)
print("4b. Salva entrada no localStorage após generate()")

# =========================================================================
# 5. Remove SAMPLE_MESSAGE (dados fake com CNPJ, emails, etc.)
# =========================================================================
js, n5 = re.subn(r'const SAMPLE_MESSAGE = `[\s\S]*?`;', "const SAMPLE_MESSAGE = '';", js, count=1)
assert n5 == 1, "5. SAMPLE_MESSAGE not found"
print("5. SAMPLE_MESSAGE zerado")

# =========================================================================
# 6. Nomenclatura: padronizar para "Mandaê / Nuvem Envio"
# =========================================================================
n6a = js.count('Nuvemshop/Mandaê/Nuvem Envio')
js = js.replace('Nuvemshop/Mandaê/Nuvem Envio', 'Mandaê / Nuvem Envio')
print(f"6a. 'Nuvemshop/Mandaê/Nuvem Envio' → 'Mandaê / Nuvem Envio' ({n6a}x)")

n6b = js.count('Mandaê/Nuvem Envio')
js = js.replace('Mandaê/Nuvem Envio', 'Mandaê / Nuvem Envio')
print(f"6b. 'Mandaê/Nuvem Envio' → 'Mandaê / Nuvem Envio' ({n6b}x)")

# =========================================================================
# 7a. Adiciona estado showPreview ao ToolScreen
# =========================================================================
OLD7a = "  const [sellerName, setSellerName] = useState('');"
NEW7a = (
    "  const [sellerName, setSellerName] = useState('');\n"
    "  const [showPreview, setShowPreview] = useState(false);"
)
assert OLD7a in js, "7a. sellerName useState not found"
js = js.replace(OLD7a, NEW7a, 1)
print("7a. Estado showPreview adicionado ao ToolScreen")

# =========================================================================
# 7b. onClick no botão "Pré-visualizar dados"
# =========================================================================
OLD7b = '                <button className="btn-ghost">Pré-visualizar dados</button>'
NEW7b = '                <button className="btn-ghost" onClick={() => setShowPreview(true)}>Pré-visualizar dados</button>'
assert OLD7b in js, "7b. Botão Pré-visualizar not found"
js = js.replace(OLD7b, NEW7b, 1)
print("7b. onClick adicionado ao botão Pré-visualizar")

# =========================================================================
# 7c. Modal de pré-visualização — insere antes do </main> do ToolScreen
# =========================================================================
MODAL = (
    "      {showPreview && (\n"
    "        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowPreview(false)}>\n"
    "          <div style={{ background: 'var(--md-paper)', borderRadius: 16, padding: '28px 32px', maxWidth: 420, width: '90%', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }} onClick={e => e.stopPropagation()}>\n"
    "            <h3 style={{ margin: '0 0 16px', fontSize: 16, color: 'var(--md-ink)' }}>Pré-visualização da ficha</h3>\n"
    "            {!file ? (\n"
    "              <p style={{ color: 'var(--md-muted)', fontSize: 13.5, margin: 0 }}>Faça o upload da ficha primeiro para pré-visualizar.</p>\n"
    "            ) : (\n"
    "              <div style={{ fontSize: 13.5, color: 'var(--md-ink-2)', display: 'flex', flexDirection: 'column', gap: 8 }}>\n"
    "                <div><b style={{ color: 'var(--md-ink)' }}>Arquivo:</b> {file.name}</div>\n"
    "                <div><b style={{ color: 'var(--md-ink)' }}>Tamanho:</b> {formatSize(file.size)}</div>\n"
    "                <div><b style={{ color: 'var(--md-ink)' }}>Tipo:</b> {file.type || 'application/pdf'}</div>\n"
    "                <p style={{ color: 'var(--md-muted)', fontSize: 12, margin: '8px 0 0' }}>Os campos serão extraídos automaticamente ao gerar a mensagem.</p>\n"
    "              </div>\n"
    "            )}\n"
    "            <button style={{ marginTop: 20, width: '100%', padding: '10px', borderRadius: 8, border: '1px solid var(--md-line)', background: 'transparent', color: 'var(--md-ink)', cursor: 'pointer', fontSize: 13.5 }} onClick={() => setShowPreview(false)}>Fechar</button>\n"
    "          </div>\n"
    "        </div>\n"
    "      )}\n"
)

OLD7c = (
    '        </div>\n'
    '      </div>\n'
    '    </main>\n'
    '  );\n'
    '}\n'
    '\n'
    '// Auth overlay removed for production deploy'
)
NEW7c = (
    '        </div>\n'
    '      </div>\n'
    + MODAL +
    '    </main>\n'
    '  );\n'
    '}\n'
    '\n'
    '// Auth overlay removed for production deploy'
)
assert OLD7c in js, "7c. ToolScreen closing </main> not found"
js = js.replace(OLD7c, NEW7c, 1)
print("7c. Modal de pré-visualização inserido")

# =========================================================================
# Repack bundle
# =========================================================================
new_b64 = base64.b64encode(gzip.compress(js.encode('utf-8'))).decode('ascii')
content = content[:m.start(2)] + new_b64 + content[m.end(2):]
print("Bundle repacked.")

# =========================================================================
# 8. Título da página (fora do bundle, no HTML)
# =========================================================================
OLD8 = '<title>Kit Mandaê · Ferramentas internas</title>'
NEW8 = '<title>Kit Vendedor · Mandaê / Nuvem Envio</title>'
assert OLD8 in content, "8. <title> not found"
content = content.replace(OLD8, NEW8, 1)
print("8. <title> atualizado")

# =========================================================================
# Save
# =========================================================================
with open(HTML, 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDone. index.html salvo.")
