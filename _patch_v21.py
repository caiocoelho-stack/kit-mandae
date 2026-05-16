import base64, gzip, re, sys
sys.stdout.reconfigure(encoding="utf-8")
with open("index.html","r",encoding="utf-8") as f: c=f.read()
uuid = "54d7da79-68d8-4252-ba50-aa935e750bde"
pat = '"' + uuid + '":{"mime":"application/javascript","compressed":true,"data":"([A-Za-z0-9+/=]+)"}'
m = re.search(pat, c)
js = gzip.decompress(base64.b64decode(m.group(1))).decode("utf-8")

# Troca updated por created nos calculos de urgencia do JiraMonitor
count = js.count("urg(t.fields.updated)")
js = js.replace("urg(t.fields.updated)", "urg(t.fields.created)")
print(f"OK — {count} ocorrencias trocadas")

comp = base64.b64encode(gzip.compress(js.encode("utf-8"))).decode("ascii")
new_c = c[:m.start(1)] + comp + c[m.end(1):]
with open("index.html","w",encoding="utf-8") as f: f.write(new_c)
print("Salvo!")
