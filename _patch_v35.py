import base64, gzip, re, sys
sys.stdout.reconfigure(encoding="utf-8")
with open("index.html","r",encoding="utf-8") as f: c=f.read()
uuid = "54d7da79-68d8-4252-ba50-aa935e750bde"
pat = '"' + uuid + '":{"mime":"application/javascript","compressed":true,"data":"([A-Za-z0-9+/=]+)"}'
m = re.search(pat, c)
js = gzip.decompress(base64.b64decode(m.group(1))).decode("utf-8")
original = js

# 1. Novos estados: filtroAssignee + cobrados
OLD1 = "const [filtroVendedor, setFiltroVendedor] = React.useState('todos');"
NEW1 = "const [filtroVendedor, setFiltroVendedor] = React.useState('todos');\n  const [filtroAssignee, setFiltroAssignee] = React.useState('todos');\n  const [cobrados, setCobrados] = React.useState(()=>{try{return JSON.parse(localStorage.getItem('hub_cobrados')||'{}')}catch{return{}}});"
js = js.replace(OLD1, NEW1, 1)
print(f"1. estados: {'OK' if 'filtroAssignee' in js else 'FALHOU'}")

# 2. Atualiza ticketsFiltrados com filtro de assignee
OLD2 = "const vendedores=[...new Set(tickets.map(t=>t.fields.reporter?.displayName).filter(Boolean))];\n  const ticketsFiltrados=filtroVendedor==='todos'?tickets:tickets.filter(t=>t.fields.reporter?.displayName===filtroVendedor);"
NEW2 = "const vendedores=[...new Set(tickets.map(t=>t.fields.reporter?.displayName).filter(Boolean))];\n  const assignees=[...new Set(tickets.map(t=>t.fields.assignee?.displayName).filter(Boolean))];\n  const ticketsFiltrados=(filtroVendedor==='todos'?tickets:tickets.filter(t=>t.fields.reporter?.displayName===filtroVendedor)).filter(t=>filtroAssignee==='todos'||t.fields.assignee?.displayName===filtroAssignee);"
js = js.replace(OLD2, NEW2, 1)
print(f"2. ticketsFiltrados: {'OK' if 'assignees' in js else 'FALHOU'}")

# 3. Filtro de assignee INT antes do map
full_idx = js.find("function JiraMonitorFull")
map_idx = js.find("{ticketsFiltrados.map(t =>", full_idx)
ASSIGNEE_UI = "{assignees.length>1&&<div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:8,marginTop:-2,alignItems:'center'}}><span style={{fontSize:10,color:'#64748b',fontWeight:700,letterSpacing:1,marginRight:2}}>INT:</span>{['todos',...assignees].map(a=><button key={a} onClick={()=>setFiltroAssignee(a)} style={{cursor:'pointer',padding:'4px 10px',borderRadius:99,fontSize:11,fontWeight:600,border:'none',background:filtroAssignee===a?'#0ea5e9':'rgba(100,116,139,0.1)',color:filtroAssignee===a?'#fff':'#64748b'}}>{a==='todos'?'Todos INT':a.split(' ')[0]+' ('+tickets.filter(t=>t.fields.assignee?.displayName===a).length+')'}</button>)}</div>}\n        "
if map_idx > 0:
    js = js[:map_idx] + ASSIGNEE_UI + js[map_idx:]
    print("3. filtro INT: OK")
else:
    print("3. filtro INT: FALHOU")

# 4. Botoes Cobrei hoje + Comentar (apos lastTxt)
lastTxt_idx = js.find("lastTxt &&", full_idx)
chunk_end = js.find("\n", lastTxt_idx + 200)
lastTxt_line = js[lastTxt_idx:chunk_end]
BUTTONS = """\n          {(()=>{const cb=cobrados[t.key];const cbHoje=cb&&(Date.now()-cb.time)<86400000;return <div style={{display:'flex',gap:8,marginTop:8,paddingTop:8,borderTop:'1px solid rgba(100,116,139,0.08)'}}>
            <button onClick={()=>{const n={...cobrados};if(cbHoje){delete n[t.key];}else{n[t.key]={time:Date.now()};}setCobrados(n);try{localStorage.setItem('hub_cobrados',JSON.stringify(n));}catch{}}} style={{cursor:'pointer',padding:'4px 12px',borderRadius:99,fontSize:11,fontWeight:600,border:'none',background:cbHoje?'rgba(34,197,94,0.15)':'rgba(100,116,139,0.1)',color:cbHoje?'#4ade80':'#94a3b8'}}>{cbHoje?'✅ Cobrei às '+new Date(cb.time).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):'📞 Cobrei hoje'}</button>
            <button onClick={async()=>{const txt=prompt('Comentário para '+t.key+' (vai aparecer no Jira):');if(!txt)return;const r=await fetch('/api/jira-comment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({issueKey:t.key,text:txt})});alert(r.ok?'✅ Comentário enviado!':'❌ Erro ao enviar.');}} style={{cursor:'pointer',padding:'4px 12px',borderRadius:99,fontSize:11,fontWeight:600,border:'none',background:'rgba(99,102,241,0.1)',color:'#818cf8'}}>💬 Comentar no Jira</button>
          </div>;})()}"""
if lastTxt_idx > 0:
    js = js[:chunk_end] + BUTTONS + js[chunk_end:]
    print("4. botoes: OK")
else:
    print("4. botoes: FALHOU")

print(f"\nAlterado: {js != original}")
if js != original:
    comp = base64.b64encode(gzip.compress(js.encode("utf-8"))).decode("ascii")
    new_c = re.sub('"'+uuid+'":{"mime":"application/javascript","compressed":true,"data":"[A-Za-z0-9+/=]+"','"'+uuid+'":{"mime":"application/javascript","compressed":true,"data":"'+comp+'"',c,count=1)
    with open("index.html","w",encoding="utf-8") as f: f.write(new_c)
    print("Salvo!")
