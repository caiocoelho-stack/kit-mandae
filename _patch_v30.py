import base64, gzip, re, sys
sys.stdout.reconfigure(encoding="utf-8")
with open("index.html","r",encoding="utf-8") as f: c=f.read()
uuid = "54d7da79-68d8-4252-ba50-aa935e750bde"
pat = '"' + uuid + '":{"mime":"application/javascript","compressed":true,"data":"([A-Za-z0-9+/=]+)"}'
m = re.search(pat, c)
js = gzip.decompress(base64.b64decode(m.group(1))).decode("utf-8")
original = js

# 1. Adiciona no nav como primeiro em breve (apos eventos)
OLD_NAV = '{ key: "followup"'
NEW_NAV = '{ key: "coleta",      label: "Solicitar Horário de Coleta", icon: "stars",      available: false },\n    { key: "followup"'
js = js.replace(OLD_NAV, NEW_NAV, 1)
print(f"Nav: {'OK' if OLD_NAV not in js or NEW_NAV in js else 'FALHOU'}")

# 2. Adiciona card como primeiro Em breve no bento (antes do contrato)
NEW_CARD = '''<div className="tool-card coming-soon">
          <div className="tool-card-head">
            <div className="tool-icon">{I.stars}</div>
            <span className="badge coming-soon">Em breve</span>
          </div>
          <h3 className="tool-name">Solicitar Horário de Coleta</h3>
          <p className="tool-desc">Solicite uma nova janela de coleta direto pelo Kit, sem precisar abrir o portal. 1 clique.</p>
          <div className="tool-foot"><span className="tool-cta">Em breve</span></div>
        </div>
        '''

# Insere antes do card do contrato (primeiro coming-soon)
ANCHOR = 'className="tool-card coming-soon">\n          <div className="tool-card-head">\n            <div className="tool-icon">{I.invoice}'
if ANCHOR in js:
    js = js.replace(ANCHOR, NEW_CARD + ANCHOR, 1)
    print("Card: OK")
else:
    print("Card: ancora nao encontrada")

print(f"Alterado: {js != original}")
if js != original:
    comp = base64.b64encode(gzip.compress(js.encode("utf-8"))).decode("ascii")
    new_c = c[:m.start(1)] + comp + c[m.end(1):]
    with open("index.html","w",encoding="utf-8") as f: f.write(new_c)
    print("Salvo!")
