import base64, gzip, re, sys
sys.stdout.reconfigure(encoding="utf-8")
with open("index.html","r",encoding="utf-8") as f: c=f.read()
uuid = "54d7da79-68d8-4252-ba50-aa935e750bde"
pat = '"' + uuid + '":{"mime":"application/javascript","compressed":true,"data":"([A-Za-z0-9+/=]+)"}'
m = re.search(pat, c)
js = gzip.decompress(base64.b64decode(m.group(1))).decode("utf-8")
original = js

# 1. Reabilita no nav
js = js.replace(
    '{ key: "eventos",     label: "Agenda de Eventos",       icon: "stars",      available: false }',
    '{ key: "eventos",     label: "Agenda de Eventos",       icon: "stars",      available: true }'
)

# 2. Reabilita card na home
js = js.replace(
    'className="tool-card coming-soon">\n          <div className="tool-card-head">\n            <div className="tool-icon">{I.stars}',
    'className="tool-card available" onClick={() => setRoute("eventos")}>\n          <div className="tool-card-head">\n            <div className="tool-icon">{I.stars}'
)
js = js.replace(
    '<span className="badge coming-soon">Em breve</span>\n          </div>\n          <h3 className="tool-name">Agenda de Eventos',
    '<span className="badge available">Disponível</span>\n          </div>\n          <h3 className="tool-name">Agenda de Eventos'
)

print(f"Alterado: {js != original}")
if js != original:
    comp = base64.b64encode(gzip.compress(js.encode("utf-8"))).decode("ascii")
    new_c = c[:m.start(1)] + comp + c[m.end(1):]
    with open("index.html","w",encoding="utf-8") as f: f.write(new_c)
    print("Salvo!")
else:
    print("AVISO - string nao encontrada, verificar manualmente")
