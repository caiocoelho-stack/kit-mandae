import base64, gzip, re, sys
sys.stdout.reconfigure(encoding="utf-8")
with open("index.html","r",encoding="utf-8") as f: c=f.read()
uuid = "54d7da79-68d8-4252-ba50-aa935e750bde"
pat = '"' + uuid + '":{"mime":"application/javascript","compressed":true,"data":"([A-Za-z0-9+/=]+)"}'
m = re.search(pat, c)
js = gzip.decompress(base64.b64decode(m.group(1))).decode("utf-8")

# Verifica ancora 1: estado filtroVendedor
idx1 = js.find("filtroVendedor, setFiltroVendedor")
print("1. filtroVendedor state:", repr(js[idx1:idx1+80]))

# Verifica ancora 2: ticketsFiltrados
idx2 = js.find("ticketsFiltrados=filtroVendedor")
print("2. ticketsFiltrados:", repr(js[idx2:idx2+120]))

# Verifica ancora 3: fim do filtro de vendedores (antes do map)
idx3 = js.find("ticketsFiltrados.map(t =>")
print("3. antes do map:", repr(js[max(0,idx3-100):idx3+30]))

# Ancora 4: busca variantes de lastTxt
for needle in ["lastTxt}", "lastTxt &&", "lastTxt ", "{lastTxt"]:
    idx = js.find(needle, idx3)
    if idx != -1:
        print(f"4. '{needle}' @ {idx}:", repr(js[max(0,idx-30):idx+100]))
        break
else:
    print("4. lastTxt nao encontrado apos o map - buscando 'last' generico:")
    idx = js.find("last", idx3)
    while idx != -1 and idx < idx3 + 3000:
        chunk = js[idx:idx+60]
        if "Txt" in chunk or "comment" in chunk or "Comment" in chunk:
            print(f"   @ {idx}:", repr(chunk))
        idx = js.find("last", idx+1)
