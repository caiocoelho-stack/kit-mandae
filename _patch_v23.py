import base64, gzip, re, sys
sys.stdout.reconfigure(encoding="utf-8")
with open("index.html","r",encoding="utf-8") as f: c=f.read()
uuid = "54d7da79-68d8-4252-ba50-aa935e750bde"
pat = '"' + uuid + '":{"mime":"application/javascript","compressed":true,"data":"([A-Za-z0-9+/=]+)"}'
m = re.search(pat, c)
js = gzip.decompress(base64.b64decode(m.group(1))).decode("utf-8")

# Atualiza ambas as funcoes urg (JiraMonitor compacto + JiraMonitorFull)
old_urg = "if (d >= 15) return { emoji: '\U0001f534', label: 'Critico',  cor: '#ef4444', d };\n    if (d >= 8)  return { emoji: '\U0001f7e0', label: 'Urgente',  cor: '#f97316', d };\n    return               { emoji: '\U0001f7e1', label: 'Atencao', cor: '#eab308', d };"
new_urg = "if (d >= 30) return { emoji: '\U0001f534', label: 'Critico', cor: '#ef4444', d };\n    return               { emoji: '\U0001f7e0', label: 'Urgente', cor: '#f97316', d };"

count = js.count(old_urg)
js = js.replace(old_urg, new_urg)
print(f"OK — {count} funcoes urg atualizadas")

comp = base64.b64encode(gzip.compress(js.encode("utf-8"))).decode("ascii")
new_c = c[:m.start(1)] + comp + c[m.end(1):]
with open("index.html","w",encoding="utf-8") as f: f.write(new_c)
print("Salvo!")
