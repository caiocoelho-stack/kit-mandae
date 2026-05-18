import base64, gzip, re, sys
sys.stdout.reconfigure(encoding="utf-8")
with open("index.html","r",encoding="utf-8") as f: c=f.read()
uuid = "54d7da79-68d8-4252-ba50-aa935e750bde"
pat = '"' + uuid + '":{"mime":"application/javascript","compressed":true,"data":"([A-Za-z0-9+/=]+)"}'
m = re.search(pat, c)
js = gzip.decompress(base64.b64decode(m.group(1))).decode("utf-8")
original = js

COLETA_WIDGET = '''function ColetaWidget(){
  const [busca,setBusca]=React.useState('');
  const D0=[
    {c:'ARAQUARI',t:'Compacto',h:'14h30'},{c:'BALNEARIO CAMBORIU',t:'Compacto',h:'14h'},
    {c:'BLUMENAU',t:'Compacto',h:'15h'},{c:'BRUSQUE',t:'Compacto',h:'14h'},
    {c:'CAMBORIU',t:'Compacto',h:'15h'},{c:'GASPAR',t:'Compacto',h:'16h'},
    {c:'GUABIRUBA',t:'Compacto',h:'15h'},{c:'ILHOTA',t:'Compacto',h:'15h'},
    {c:'INDAIAL',t:'Compacto',h:'16h'},{c:'ITAJAI',t:'Compacto',h:'14h30'},
    {c:'ITAPEMA',t:'Compacto',h:'13h'},{c:'JARAGUA DO SUL',t:'Compacto',h:'15h'},
    {c:'JOINVILLE',t:'Compacto',h:'14h'},{c:'NAVEGANTES',t:'Compacto',h:'15h'},
    {c:'POMERODE',t:'Compacto',h:'15h'},{c:'SAO BENTO DO SUL',t:'Compacto',h:'13h'},
    {c:'TIMBO',t:'Compacto',h:'15h'}
  ];
  const D1=[
    {c:'BARRA VELHA',t:'DV3',h:'Tarde'},{c:'COCAL DO SUL',t:'DV3',h:'Tarde'},
    {c:'CRICIUMA',t:'DV3',h:'Manhã'},{c:'FLORIANÓPOLIS',t:'DV3',h:'Tarde'},
    {c:'GAROPABA',t:'DV3',h:'Tarde'},{c:'LAURENTINO',t:'DV3',h:'Manhã'},
    {c:'PALHOÇA',t:'DV3',h:'Manhã'},{c:'RIO DO SUL',t:'BLIXX',h:'18h'},
    {c:'SÃO JOSÉ',t:'DV3',h:'Manhã'},{c:'TIJUCAS',t:'DV3',h:'Manhã'},
    {c:'VIDEIRA',t:'DV3',h:'Manhã'}
  ];
  const todas=[...D0.map(x=>({...x,tipo:'D+0'})),...D1.map(x=>({...x,tipo:'D+1'}))];
  const q=busca.toUpperCase().trim();
  const filtradas=q?todas.filter(x=>x.c.includes(q)):null;
  const badge=(tipo)=>({background:tipo==='D+0'?'rgba(34,197,94,0.15)':'rgba(59,130,246,0.15)',color:tipo==='D+0'?'#4ade80':'#60a5fa',padding:'2px 8px',borderRadius:99,fontSize:11,fontWeight:700});
  return <div style={{background:'linear-gradient(135deg,#0f172a,#1e293b)',borderRadius:16,padding:20,color:'#f1f5f9',marginTop:16}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
      <span style={{fontWeight:700,fontSize:13,letterSpacing:1,color:'#94a3b8'}}>🗺️ COLETA SC</span>
      <a href="https://docs.google.com/spreadsheets/d/1IlsTMNRye6lAAJ7cLnt7hP_fK2pyOVDT/edit" target="_blank" rel="noreferrer" style={{fontSize:11,color:'#6366f1',textDecoration:'none',fontWeight:600}}>Ver outros estados →</a>
    </div>
    <input placeholder="🔍 Buscar cidade em SC..." value={busca} onChange={e=>setBusca(e.target.value)} style={{width:'100%',padding:'8px 12px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#f1f5f9',fontSize:13,marginBottom:12,boxSizing:'border-box',outline:'none'}}/>
    {filtradas?(
      filtradas.length>0?<div>{filtradas.map(x=><div key={x.c} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
        <span style={{fontSize:13,fontWeight:600}}>{x.c}</span>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <span style={badge(x.tipo)}>{x.tipo}</span>
          <span style={{fontSize:11,color:'#94a3b8'}}>{x.t} · {x.h}</span>
        </div>
      </div>)}</div>
      :<p style={{color:'#64748b',fontSize:12,textAlign:'center',margin:'8px 0'}}>Cidade não encontrada em SC — <a href="https://docs.google.com/spreadsheets/d/1IlsTMNRye6lAAJ7cLnt7hP_fK2pyOVDT/edit" target="_blank" rel="noreferrer" style={{color:'#6366f1'}}>verificar outros estados</a></p>
    ):(
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div>
          <div style={{background:'rgba(34,197,94,0.1)',color:'#4ade80',fontWeight:700,fontSize:11,padding:'4px 10px',borderRadius:6,marginBottom:8}}>⚡ D+0 · Compacto</div>
          {D0.map(x=><div key={x.c} style={{display:'flex',justifyContent:'space-between',padding:'3px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
            <span style={{fontSize:12}}>{x.c}</span>
            <span style={{fontSize:11,color:'#94a3b8'}}>{x.h}</span>
          </div>)}
        </div>
        <div>
          <div style={{background:'rgba(59,130,246,0.1)',color:'#60a5fa',fontWeight:700,fontSize:11,padding:'4px 10px',borderRadius:6,marginBottom:8}}>📦 D+1</div>
          {D1.map(x=><div key={x.c} style={{display:'flex',justifyContent:'space-between',padding:'3px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
            <span style={{fontSize:12}}>{x.c}</span>
            <span style={{fontSize:11,color:'#94a3b8'}}>{x.t} · {x.h}</span>
          </div>)}
        </div>
      </div>
    )}
  </div>;
}

function JiraMonitor'''

# 1. Injeta componente antes de JiraMonitor
OLD_JIRA = 'function JiraMonitor'
if OLD_JIRA in js:
    js = js.replace(OLD_JIRA, COLETA_WIDGET, 1)
    print("1. ColetaWidget injetado: OK")
else:
    print("1. ColetaWidget: FALHOU")

# 2. Adiciona <ColetaWidget /> na home (apos alertas-row)
OLD_ALERTAS = '<JiraMonitor />\n      </div>'
NEW_ALERTAS = '<JiraMonitor />\n      </div>\n      <ColetaWidget />'
if OLD_ALERTAS in js:
    js = js.replace(OLD_ALERTAS, NEW_ALERTAS, 1)
    print("2. ColetaWidget na home: OK")
else:
    print("2. ColetaWidget na home: FALHOU - tentando alternativa")
    OLD2 = '<JiraMonitor/>\n      </div>'
    if OLD2 in js:
        js = js.replace(OLD2, '<JiraMonitor/>\n      </div>\n      <ColetaWidget />', 1)
        print("2. ColetaWidget na home (alt): OK")

print(f"\nAlterado: {js != original}")
if js != original:
    comp = base64.b64encode(gzip.compress(js.encode("utf-8"))).decode("ascii")
    new_c = re.sub('"'+uuid+'":{"mime":"application/javascript","compressed":true,"data":"[A-Za-z0-9+/=]+"','"'+uuid+'":{"mime":"application/javascript","compressed":true,"data":"'+comp+'"',c,count=1)
    with open("index.html","w",encoding="utf-8") as f: f.write(new_c)
    print("Salvo!")
