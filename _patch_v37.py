import base64, gzip, re, sys
sys.stdout.reconfigure(encoding="utf-8")
with open("index.html","r",encoding="utf-8") as f: c=f.read()
uuid = "54d7da79-68d8-4252-ba50-aa935e750bde"
pat = '"' + uuid + '":{"mime":"application/javascript","compressed":true,"data":"([A-Za-z0-9+/=]+)"}'
m = re.search(pat, c)
js = gzip.decompress(base64.b64decode(m.group(1))).decode("utf-8")
original = js

# 1. Ativa slack no nav
js = re.sub(r'(\{ key: "slack",[^}]+?)available: false', r'\1available: true', js, count=1)
print(f"1. nav slack: {'OK' if 'slack' in js else 'FALHOU'}")

# 2. Componente AprovacaoScreen
APROVA_SCREEN = '''function AprovacaoScreen({setRoute}){
  const [form,setForm]=React.useState({solicitante:'',oque:'',just:'',prazo:'',urgencia:'normal'});
  const [copiado,setCopiado]=React.useState(false);
  const F=(k,v)=>setForm(p=>({...p,[k]:v}));
  const linhas=[
    '✏️ *Pedido de Aprovação — Hub de Vendas*','',
    form.oque?'📌 *O que precisa:* '+form.oque:'',
    form.just?'💡 *Por quê:* '+form.just:'',
    '⏰ *Prazo:* '+(form.prazo||'Sem prazo definido'),
    form.urgencia==='urgente'?'🔴 *URGENTE*':'🟡 Prioridade normal','',
    '_Solicitante: '+(form.solicitante||'não informado')+'_'
  ].filter(Boolean);
  const msg=form.oque?linhas.join('\\n'):'';
  const copiar=()=>{navigator.clipboard.writeText(msg).then(()=>{setCopiado(true);setTimeout(()=>setCopiado(false),2500);})};
  const inp={width:'100%',padding:'10px 14px',background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text-primary)',fontSize:14,boxSizing:'border-box',outline:'none'};
  return <div style={{maxWidth:680,margin:'0 auto',padding:'32px 24px'}}>
    <button onClick={()=>setRoute('home')} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:14,marginBottom:24,padding:0}}>← Voltar</button>
    <h1 style={{fontSize:24,fontWeight:700,color:'var(--text-primary)',marginBottom:6}}>✉️ Aprovação Interna</h1>
    <p style={{color:'var(--text-muted)',fontSize:14,marginBottom:32}}>Gera a mensagem formatada para copiar direto no Slack.</p>
    <div style={{display:'grid',gap:16}}>
      <div><label style={{fontSize:12,color:'var(--text-muted)',fontWeight:600,display:'block',marginBottom:6}}>SEU NOME</label>
        <input style={inp} placeholder="Ex: Caio Coelho" value={form.solicitante} onChange={e=>F('solicitante',e.target.value)}/></div>
      <div><label style={{fontSize:12,color:'var(--text-muted)',fontWeight:600,display:'block',marginBottom:6}}>O QUE PRECISA</label>
        <input style={inp} placeholder="Ex: Aprovar desconto de 15% para cliente X" value={form.oque} onChange={e=>F('oque',e.target.value)}/></div>
      <div><label style={{fontSize:12,color:'var(--text-muted)',fontWeight:600,display:'block',marginBottom:6}}>JUSTIFICATIVA</label>
        <input style={inp} placeholder="Ex: Cliente está migrando de concorrente, é estratégico" value={form.just} onChange={e=>F('just',e.target.value)}/></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div><label style={{fontSize:12,color:'var(--text-muted)',fontWeight:600,display:'block',marginBottom:6}}>PRAZO</label>
          <input style={inp} placeholder="Ex: Hoje até 18h" value={form.prazo} onChange={e=>F('prazo',e.target.value)}/></div>
        <div><label style={{fontSize:12,color:'var(--text-muted)',fontWeight:600,display:'block',marginBottom:6}}>URGÊNCIA</label>
          <select style={{...inp,cursor:'pointer'}} value={form.urgencia} onChange={e=>F('urgencia',e.target.value)}>
            <option value="normal">🟡 Normal</option>
            <option value="urgente">🔴 Urgente</option>
          </select></div>
      </div>
    </div>
    {msg&&<div style={{marginTop:32,background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:20}}>
      <div style={{fontSize:12,color:'var(--text-muted)',fontWeight:600,marginBottom:12}}>PRÉVIA DA MENSAGEM</div>
      <pre style={{whiteSpace:'pre-wrap',fontFamily:'inherit',fontSize:14,color:'var(--text-primary)',margin:0,lineHeight:1.7}}>{msg}</pre>
      <button onClick={copiar} style={{marginTop:16,width:'100%',padding:'12px',borderRadius:8,border:'none',background:copiado?'#22c55e':'var(--accent)',color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}}>
        {copiado?'✅ Copiado! Cole no Slack':'📋 Copiar para Slack'}
      </button>
    </div>}
  </div>;
}

function ColetaWidget'''

if 'function ColetaWidget' in js:
    js = js.replace('function ColetaWidget', APROVA_SCREEN, 1)
    print("2. AprovacaoScreen: OK")
else:
    print("2. AprovacaoScreen: FALHOU")

# 3. Routing para slack
OLD_ROUTE = "route==='jira'"
NEW_ROUTE = "route==='slack'?<AprovacaoScreen setRoute={setRoute}/>:route==='jira'"
if OLD_ROUTE in js:
    js = js.replace(OLD_ROUTE, NEW_ROUTE, 1)
    print("3. routing: OK")
else:
    print("3. routing: FALHOU")

# 4. Card na home — muda coming-soon de Aprovação para available
OLD_CARD = 'className="tool-card coming-soon">\n          <div className="tool-card-head">\n            <div className="tool-icon">{I.paperPlane}</div>\n            <span className="badge coming-soon">Em breve</span>'
NEW_CARD = 'className="tool-card available" onClick={()=>setRoute("slack")}>\n          <div className="tool-card-head">\n            <div className="tool-icon">{I.paperPlane}</div>\n            <span className="badge available">Disponível</span>'
if OLD_CARD in js:
    js = js.replace(OLD_CARD, NEW_CARD, 1)
    print("4. card home: OK")
else:
    print("4. card home: FALHOU - tentando alternativa")
    OLD2 = 'Aprovação Interna'
    idx = js.find(OLD2)
    print(f"   Aprovacao idx: {idx}, context: {repr(js[max(0,idx-200):idx+50])}")

print(f"\nAlterado: {js != original}")
if js != original:
    comp = base64.b64encode(gzip.compress(js.encode("utf-8"))).decode("ascii")
    new_c = re.sub('"'+uuid+'":{"mime":"application/javascript","compressed":true,"data":"[A-Za-z0-9+/=]+"','"'+uuid+'":{"mime":"application/javascript","compressed":true,"data":"'+comp+'"',c,count=1)
    with open("index.html","w",encoding="utf-8") as f: f.write(new_c)
    print("Salvo!")
