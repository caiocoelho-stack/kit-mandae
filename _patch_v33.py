import base64, gzip, re, sys
sys.stdout.reconfigure(encoding="utf-8")
with open("index.html","r",encoding="utf-8") as f: c=f.read()
uuid = "54d7da79-68d8-4252-ba50-aa935e750bde"
pat = '"' + uuid + '":{"mime":"application/javascript","compressed":true,"data":"([A-Za-z0-9+/=]+)"}'
m = re.search(pat, c)
js = gzip.decompress(base64.b64decode(m.group(1))).decode("utf-8")
original = js

# 1. Adiciona estado filtroVendedor antes de nV
OLD1 = 'const nV = tickets.filter(t => Math.floor((Date.now()-new Date(t.fields.created))/86400000)>=30).length;'
NEW1 = "const [filtroVendedor, setFiltroVendedor] = React.useState('todos');\n  " + OLD1
js = js.replace(OLD1, NEW1, 1)
print(f"1: {'OK' if OLD1 not in js else 'FALHOU'}")

# 2. Adiciona variaveis computadas apos nL
OLD2 = 'return d>=20&&d<30; }).length;\n\n  if (loading)'
NEW2 = "return d>=20&&d<30; }).length;\n  const vendedores=[...new Set(tickets.map(t=>t.fields.reporter?.displayName).filter(Boolean))];\n  const ticketsFiltrados=filtroVendedor==='todos'?tickets:tickets.filter(t=>t.fields.reporter?.displayName===filtroVendedor);\n\n  if (loading)"
js = js.replace(OLD2, NEW2, 1)
print(f"2: {'OK' if 'ticketsFiltrados' in js else 'FALHOU'}")

# 3. Adiciona UI de filtro + substitui tickets.map APENAS no JiraMonitorFull
full_idx = js.find("function JiraMonitorFull")
map_idx = js.find("{tickets.map(t =>", full_idx)
if map_idx > 0:
    FILTER_UI = "{tickets.length>1&&<div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:12,marginTop:4}}><button onClick={()=>setFiltroVendedor('todos')} style={{cursor:'pointer',padding:'4px 10px',borderRadius:99,fontSize:11,fontWeight:600,border:'none',background:filtroVendedor==='todos'?'#6366f1':'rgba(100,116,139,0.1)',color:filtroVendedor==='todos'?'#fff':'#64748b'}}>Todos ({tickets.length})</button>{vendedores.map(v=><button key={v} onClick={()=>setFiltroVendedor(v)} style={{cursor:'pointer',padding:'4px 10px',borderRadius:99,fontSize:11,fontWeight:600,border:'none',background:filtroVendedor===v?'#6366f1':'rgba(100,116,139,0.1)',color:filtroVendedor===v?'#fff':'#64748b'}}>{v.split(' ')[0]} ({tickets.filter(t=>t.fields.reporter?.displayName===v).length})</button>)}</div>}\n        {ticketsFiltrados.map(t =>"
    js = js[:map_idx] + FILTER_UI + js[map_idx+len("{tickets.map(t =>"):]
    print("3: OK")
else:
    print("3: FALHOU - map_idx nao encontrado")

print(f"Alterado: {js != original}")
if js != original:
    comp = base64.b64encode(gzip.compress(js.encode("utf-8"))).decode("ascii")
    new_c = re.sub('"'+uuid+'":{"mime":"application/javascript","compressed":true,"data":"[A-Za-z0-9+/=]+"','"'+uuid+'":{"mime":"application/javascript","compressed":true,"data":"'+comp+'"',c,count=1)
    with open("index.html","w",encoding="utf-8") as f: f.write(new_c)
    print("Salvo!")
