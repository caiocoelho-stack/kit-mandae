import base64, gzip, re, sys
sys.stdout.reconfigure(encoding="utf-8")
with open("index.html","r",encoding="utf-8") as f: c=f.read()
uuid = "54d7da79-68d8-4252-ba50-aa935e750bde"
pat = '"' + uuid + '":{"mime":"application/javascript","compressed":true,"data":"([A-Za-z0-9+/=]+)"}'
m = re.search(pat, c)
js = gzip.decompress(base64.b64decode(m.group(1))).decode("utf-8")
orig_js, orig_c = js, c
js = js.replace("Kit Vendedor", "Hub de Vendas", 10)
js = js.replace("Hub do time comercial. Ferramentas, eventos e intelig\u00eancia.", "Hub de Vendas Manda\u00ea / Nuvem Envio. Ferramentas, eventos e intelig\u00eancia.")
c = c.replace("Kit Vendedor", "Hub de Vendas")
c = c.replace("Kit Manda\u00ea", "Hub de Vendas")
c = c.replace("Kit Manda", "Hub de Vendas")
comp = base64.b64encode(gzip.compress(js.encode("utf-8"))).decode("ascii")
c = re.sub('"' + uuid + '":{"mime":"application/javascript","compressed":true,"data":"[A-Za-z0-9+/=]+"', '"' + uuid + '":{"mime":"application/javascript","compressed":true,"data":"' + comp + '"', c, count=1)
print("bundle:", js != orig_js, "| html:", c != orig_c)
with open("index.html","w",encoding="utf-8") as f: f.write(c)
print("Salvo!")
