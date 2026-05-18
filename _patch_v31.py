import base64, gzip, re, sys
sys.stdout.reconfigure(encoding="utf-8")
with open("index.html","r",encoding="utf-8") as f: c=f.read()
uuid = "54d7da79-68d8-4252-ba50-aa935e750bde"
pat = '"' + uuid + '":{"mime":"application/javascript","compressed":true,"data":"([A-Za-z0-9+/=]+)"}'
m = re.search(pat, c)
js = gzip.decompress(base64.b64decode(m.group(1))).decode("utf-8")
original = js

# 1. Fix eventos nav (regex seguro)
js = re.sub(r'(\{ key: "eventos",[^}]+?)available: false', r'\1available: true', js, count=1)
print(f"1. eventos nav: {'OK' if js != original else 'nao alterado'}")

# 2. Adiciona coleta no nav (primeiro em breve, antes de followup)
js = js.replace(
    '{ key: "followup"',
    '{ key: "coleta", label: "Solicitar Horário de Coleta", icon: "stars", available: false },\n    { key: "followup"',
    1
)
print(f"2. coleta nav: {'OK' if 'coleta' in js else 'FALHOU'}")

# 3. Card coleta — ancora exata encontrada
ANCHOR = '</div>\n        </div>\n\n        {/* Auxiliar de Contrato */}\n        <div className="tool-card coming-soon">'
NEW_CARD = '</div>\n        </div>\n\n        {/* Solicitar Horario de Coleta */}\n        <div className="tool-card coming-soon">\n          <div className="tool-card-head">\n            <div className="tool-icon">{I.stars}</div>\n            <span className="badge coming-soon">Em breve</span>\n          </div>\n          <h3 className="tool-name">Solicitar Horário de Coleta</h3>\n          <p className="tool-desc">Solicite uma nova janela de coleta direto pelo Kit, sem abrir o portal. 1 clique.</p>\n          <div className="tool-foot"><span className="tool-cta">Em breve</span></div>\n        </div>\n\n        {/* Auxiliar de Contrato */}\n        <div className="tool-card coming-soon">'

if ANCHOR in js:
    js = js.replace(ANCHOR, NEW_CARD, 1)
    print("3. card coleta: OK")
else:
    print("3. card coleta: ANCORA NAO ENCONTRADA")

print(f"Alterado: {js != original}")
if js != original:
    comp = base64.b64encode(gzip.compress(js.encode("utf-8"))).decode("ascii")
    new_c = c[:m.start(1)] + comp + c[m.end(1):]
    with open("index.html","w",encoding="utf-8") as f: f.write(new_c)
    print("Salvo!")
else:
    print("ERRO: nenhuma alteracao")
