import base64, gzip, re, sys
sys.stdout.reconfigure(encoding="utf-8")
with open("index.html","r",encoding="utf-8") as f: c=f.read()
uuid = "54d7da79-68d8-4252-ba50-aa935e750bde"
pat = '"' + uuid + '":{"mime":"application/javascript","compressed":true,"data":"([A-Za-z0-9+/=]+)"}'
m = re.search(pat, c)
js = gzip.decompress(base64.b64decode(m.group(1))).decode("utf-8")
original = js

# 1. Adiciona diasNaFila e camposExtras no map de cada ticket (antes do return do card)
# Ancora: o reporter span que ja existe no card
OLD_REPORTER = '{t.fields.reporter && <span>\U0001f4cb {t.fields.reporter.displayName}</span>}'
NEW_REPORTER = '''{t.fields.reporter && <span>\U0001f4cb {t.fields.reporter.displayName}</span>}
            {(()=>{
              const cnpj=t.fields.customfield_13646;
              const rev=t.fields.customfield_13670;
              const vol=t.fields.customfield_13672;
              const tktMed=t.fields.customfield_13693;
              const intPor=t.fields.customfield_13698?.displayName||t.fields.customfield_13698;
              const dtExp=t.fields.customfield_10222;
              const dtGo=t.fields.customfield_10223;
              const entrada=t.changelog?.histories?.filter(h=>h.items?.some(i=>i.field==='status'&&i.toString==='Aguardando Comercial'))?.sort((a,b)=>new Date(b.created)-new Date(a.created))[0];
              const diasFila=entrada?Math.floor((Date.now()-new Date(entrada.created))/86400000):null;
              const prevStatus=entrada?.items?.find(i=>i.field==='status')?.fromString;
              if(!cnpj&&!rev&&!vol&&!diasFila) return null;
              return <div style={{marginTop:6,display:'flex',gap:8,flexWrap:'wrap',fontSize:11,color:'#94a3b8'}}>
                {cnpj&&<span style={{background:'rgba(99,102,241,0.08)',color:'#818cf8',padding:'2px 7px',borderRadius:6,fontWeight:600}}>\U0001f3e2 {cnpj}</span>}
                {rev&&<span style={{background:'rgba(34,197,94,0.08)',color:'#4ade80',padding:'2px 7px',borderRadius:6,fontWeight:600}}>\U0001f4b0 R$ {Number(rev).toLocaleString('pt-BR')}/mês</span>}
                {vol&&<span style={{background:'rgba(251,191,36,0.08)',color:'#fbbf24',padding:'2px 7px',borderRadius:6,fontWeight:600}}>\U0001f4e6 {Number(vol).toLocaleString('pt-BR')} vol/mês</span>}
                {diasFila&&<span style={{background:'rgba(239,68,68,0.08)',color:'#f87171',padding:'2px 7px',borderRadius:6,fontWeight:600}}>⏳ {diasFila}d em fila</span>}
                {prevStatus&&<span style={{background:'rgba(100,116,139,0.08)',color:'#94a3b8',padding:'2px 7px',borderRadius:6}}>← {prevStatus}</span>}
                {dtGo&&<span style={{background:'rgba(14,165,233,0.08)',color:'#38bdf8',padding:'2px 7px',borderRadius:6}}>\U0001f3af Go-live: {dtGo}</span>}
              </div>;
            })()}'''

if OLD_REPORTER in js:
    js = js.replace(OLD_REPORTER, NEW_REPORTER, 1)
    print("OK - campos extras adicionados ao card")
else:
    print("FALHOU - ancora nao encontrada")

print(f"Alterado: {js != original}")
if js != original:
    comp = base64.b64encode(gzip.compress(js.encode("utf-8"))).decode("ascii")
    new_c = re.sub('"'+uuid+'":{"mime":"application/javascript","compressed":true,"data":"[A-Za-z0-9+/=]+"','"'+uuid+'":{"mime":"application/javascript","compressed":true,"data":"'+comp+'"',c,count=1)
    with open("index.html","w",encoding="utf-8") as f: f.write(new_c)
    print("Salvo!")
else:
    print("ERRO: nenhuma alteracao")
