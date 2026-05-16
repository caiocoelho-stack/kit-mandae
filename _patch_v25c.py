import base64, gzip, re
with open("index.html","r",encoding="utf-8") as f: c=f.read()
uuid = "54d7da79-68d8-4252-ba50-aa935e750bde"
pat = '"' + uuid + '":{"mime":"application/javascript","compressed":true,"data":"([A-Za-z0-9+/=]+)"}'
m = re.search(pat, c)
js = gzip.decompress(base64.b64decode(m.group(1))).decode("utf-8")
original = js

OLD = "{nA>0 && <span style={{background:'rgba(234,179,8,.1)',color:'#eab308',padding:'4px 12px',borderRadius:99,fontSize:12,fontWeight:700,border:'1px solid rgba(234,179,8,.3)'}}>🟡 {nA} atenção</span>}"
count = js.count(OLD)
js = js.replace(OLD, "")
print(f"Ocorrencias removidas: {count}")
print(f"Alterado: {js != original}")

if js != original:
    comp = base64.b64encode(gzip.compress(js.encode("utf-8"))).decode("ascii")
    new_c = c[:m.start(1)] + comp + c[m.end(1):]
    with open("index.html","w",encoding="utf-8") as f: f.write(new_c)
    print("Salvo!")
else:
    print("AVISO: string nao encontrada")
