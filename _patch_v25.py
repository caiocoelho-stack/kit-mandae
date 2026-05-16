import base64, gzip, re, sys
sys.stdout.reconfigure(encoding="utf-8")
with open("index.html","r",encoding="utf-8") as f: c=f.read()
uuid = "54d7da79-68d8-4252-ba50-aa935e750bde"
pat = '"' + uuid + '":{"mime":"application/javascript","compressed":true,"data":"([A-Za-z0-9+/=]+)"}'
m = re.search(pat, c)
js = gzip.decompress(base64.b64decode(m.group(1))).decode("utf-8")
original = js

# 1. Corrige subtitle
js = js.replace(
    'Tickets INT em \\"Aguardando Comercial\\" parados há mais de 5 dias.',
    'Tickets INT em \\"Aguardando Comercial\\" parados há mais de 20 dias.'
)
js = js.replace(
    "Tickets INT em \"Aguardando Comercial\" parados há mais de 5 dias.",
    "Tickets INT em \"Aguardando Comercial\" parados há mais de 20 dias."
)

# 2. Corrige contadores no JiraMonitorFull (usa created, novos thresholds)
old_counters = "const nV = tickets.filter(t => Math.floor((Date.now()-new Date(t.fields.updated))/86400000)>=15).length;\n  const nL = tickets.filter(t => { const d=Math.floor((Date.now()-new Date(t.fields.updated))/86400000); return d>=8&&d<15; }).length;\n  const nA = tickets.length - nV - nL;"
new_counters = "const nV = tickets.filter(t => Math.floor((Date.now()-new Date(t.fields.created))/86400000)>=30).length;\n  const nL = tickets.filter(t => { const d=Math.floor((Date.now()-new Date(t.fields.created))/86400000); return d>=20&&d<30; }).length;"
js = js.replace(old_counters, new_counters)

# 3. Remove badge amarelo do JiraMonitorFull
js = re.sub(r"\{nA>0 &&.*?aten.*?\}\)", "", js, flags=re.DOTALL)

# 4. Corrige contadores no JiraMonitor compacto (home widget)
old_compact = "const nV = tickets.filter(t => Math.floor((Date.now()-new Date(t.fields.updated))/86400000) >= 15).length;\n  const nL  = tickets.filter(t => { const d=Math.floor((Date.now()-new Date(t.fields.updated))/86400000); return d>=8&&d<15; }).length;"
new_compact = "const nV = tickets.filter(t => Math.floor((Date.now()-new Date(t.fields.created))/86400000) >= 30).length;\n  const nL = tickets.filter(t => { const d=Math.floor((Date.now()-new Date(t.fields.created))/86400000); return d>=20&&d<30; }).length;"
js = js.replace(old_compact, new_compact)

print(f"Alteracoes aplicadas: {js != original}")
comp = base64.b64encode(gzip.compress(js.encode("utf-8"))).decode("ascii")
new_c = c[:m.start(1)] + comp + c[m.end(1):]
with open("index.html","w",encoding="utf-8") as f: f.write(new_c)
print("Salvo!")
