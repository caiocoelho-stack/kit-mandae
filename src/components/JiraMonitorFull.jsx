import React, { useState, useEffect, useRef } from 'react';

function JiraMonitorFull() {
  const [tickets, setTickets] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [erro, setErro] = React.useState('');
  const [lastUpdate, setLastUpdate] = React.useState('');
  const [countdown, setCountdown] = React.useState(0);

  React.useEffect(() => { carregar(); const t = setInterval(carregar, 5*60*1000); return () => clearInterval(t); }, []);

  async function carregar() {
    setLoading(true); setErro('');
    try {
      const r = await fetch('/api/jira');
      const d = await r.json();
      setTickets(d.issues || []);
      setLastUpdate(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    } catch(e) { setErro('Erro ao carregar tickets.'); }
    setLoading(false);
  }

  function handleRefresh() {
    if (countdown > 0 || loading) return;
    carregar();
    setCountdown(60);
    const iv = setInterval(() => { setCountdown(p => { if (p <= 1) { clearInterval(iv); return 0; } return p - 1; }); }, 1000);
  }

  const urg = (upd) => {
    const d = Math.floor((Date.now() - new Date(upd)) / 86400000);
    if (d >= 15) return { emoji: '🔴', label: 'Crítico',  cor: '#ef4444', bg: 'rgba(239,68,68,.1)',  d };
    if (d >= 8)  return { emoji: '🟠', label: 'Urgente',  cor: '#f97316', bg: 'rgba(249,115,22,.1)', d };
    return               { emoji: '🟡', label: 'Atenção', cor: '#eab308', bg: 'rgba(234,179,8,.1)',  d };
  };

  const adf = (body) => {
    try { return body?.content?.flatMap(b=>b.content??[])?.filter(n=>n.type==='text')?.map(n=>n.text)?.join('')??''; } catch(e) { return ''; }
  };

  const [filtroVendedor, setFiltroVendedor] = React.useState('todos');
  const [filtroAssignee, setFiltroAssignee] = React.useState('todos');
  const [cobrados, setCobrados] = React.useState(()=>{try{return JSON.parse(localStorage.getItem('hub_cobrados')||'{}')}catch{return{}}});
  const nV = tickets.filter(t => Math.floor((Date.now()-new Date(t.fields.created))/86400000)>=30).length;
  const nL = tickets.filter(t => { const d=Math.floor((Date.now()-new Date(t.fields.created))/86400000); return d>=20&&d<30; }).length;
  const nA = tickets.length - nV - nL;
  const vendedores=[...new Set(tickets.map(t=>t.fields.reporter?.displayName).filter(Boolean))];
  const assignees=[...new Set(tickets.map(t=>t.fields.assignee?.displayName).filter(Boolean))];
  const ticketsFiltrados=(filtroVendedor==='todos'?tickets:tickets.filter(t=>t.fields.reporter?.displayName===filtroVendedor)).filter(t=>filtroAssignee==='todos'||t.fields.assignee?.displayName===filtroAssignee);

  if (loading) return <div style={{textAlign:'center',padding:60,color:'#64748b'}}>Carregando tickets...</div>;
  if (erro)    return <div style={{textAlign:'center',padding:60,color:'#ef4444'}}>{erro}</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {nV>0 && <span style={{background:'rgba(239,68,68,.1)',color:'#ef4444',padding:'4px 12px',borderRadius:99,fontSize:12,fontWeight:700,border:'1px solid rgba(239,68,68,.3)'}}>🔴 {nV} crítico{nV>1?'s':''}</span>}
          {nL>0 && <span style={{background:'rgba(249,115,22,.1)',color:'#f97316',padding:'4px 12px',borderRadius:99,fontSize:12,fontWeight:700,border:'1px solid rgba(249,115,22,.3)'}}>🟠 {nL} urgente{nL>1?'s':''}</span>}
          
          {tickets.length===0 && <span style={{color:'#22c55e',fontWeight:600,fontSize:14}}>🎉 Nenhum ticket parado!</span>}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          {lastUpdate && <span style={{fontSize:12,color:'#94a3b8'}}>Atualizado às {lastUpdate}</span>}
          <button onClick={handleRefresh} disabled={countdown>0} style={{background:'none',border:'1px solid #e2e8f0',borderRadius:8,padding:'6px 12px',cursor:countdown>0?'not-allowed':'pointer',color:'#64748b',fontSize:12}}>
            {countdown>0?`${countdown}s`:'↻ Atualizar'}
          </button>
        </div>
      </div>

      {tickets.length > 0 && (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {tickets.length>1&&<div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:12,marginTop:4}}><button onClick={()=>setFiltroVendedor('todos')} style={{cursor:'pointer',padding:'4px 10px',borderRadius:99,fontSize:11,fontWeight:600,border:'none',background:filtroVendedor==='todos'?'#6366f1':'rgba(100,116,139,0.1)',color:filtroVendedor==='todos'?'#fff':'#64748b'}}>Todos ({tickets.length})</button>{vendedores.map(v=><button key={v} onClick={()=>setFiltroVendedor(v)} style={{cursor:'pointer',padding:'4px 10px',borderRadius:99,fontSize:11,fontWeight:600,border:'none',background:filtroVendedor===v?'#6366f1':'rgba(100,116,139,0.1)',color:filtroVendedor===v?'#fff':'#64748b'}}>{v.split(' ')[0]} ({tickets.filter(t=>t.fields.reporter?.displayName===v).length})</button>)}</div>}
        {assignees.length>1&&<div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:8,marginTop:-2,alignItems:'center'}}><span style={{fontSize:10,color:'#64748b',fontWeight:700,letterSpacing:1,marginRight:2}}>INT:</span>{['todos',...assignees].map(a=><button key={a} onClick={()=>setFiltroAssignee(a)} style={{cursor:'pointer',padding:'4px 10px',borderRadius:99,fontSize:11,fontWeight:600,border:'none',background:filtroAssignee===a?'#0ea5e9':'rgba(100,116,139,0.1)',color:filtroAssignee===a?'#fff':'#64748b'}}>{a==='todos'?'Todos INT':a.split(' ')[0]+' ('+tickets.filter(t=>t.fields.assignee?.displayName===a).length+')'}</button>)}</div>}
        {ticketsFiltrados.map(t => {
            const u = urg(t.fields.created);
            const last = t.fields.comment?.comments?.slice(-1)[0];
            const lastTxt = last ? adf(last.body) : '';
            return (
              <div key={t.key} style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:'16px 20px',borderLeft:`4px solid ${u.cor}`}}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,marginBottom:8}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                      <a href={`https://tiendanube.atlassian.net/browse/${t.key}`} target="_blank" rel="noreferrer"
                        style={{color:'#6366f1',fontWeight:700,fontSize:13,textDecoration:'none',background:'rgba(99,102,241,.08)',padding:'2px 8px',borderRadius:6}}>{t.key}</a>
                      <span style={{background:u.bg,color:u.cor,padding:'2px 8px',borderRadius:99,fontSize:11,fontWeight:700,border:`1px solid ${u.cor}44`}}>{u.emoji} {u.d}d · {u.label}</span>
                    </div>
                    <div style={{fontSize:15,fontWeight:600,color:'#1e293b',lineHeight:1.4}}>{t.fields.summary}</div>
                  </div>
                </div>
                <div style={{display:'flex',gap:16,fontSize:12,color:'#64748b'}}>
                  {t.fields.assignee && <span>👤 {t.fields.assignee.displayName}</span>}
                  {t.fields.reporter && <span>📋 {t.fields.reporter.displayName}</span>}
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
                {cnpj&&<span style={{background:'rgba(99,102,241,0.08)',color:'#818cf8',padding:'2px 7px',borderRadius:6,fontWeight:600}}>🏢 {cnpj}</span>}
                {rev&&<span style={{background:'rgba(34,197,94,0.08)',color:'#4ade80',padding:'2px 7px',borderRadius:6,fontWeight:600}}>💰 R$ {Number(rev).toLocaleString('pt-BR')}/mês</span>}
                {vol&&<span style={{background:'rgba(251,191,36,0.08)',color:'#fbbf24',padding:'2px 7px',borderRadius:6,fontWeight:600}}>📦 {Number(vol).toLocaleString('pt-BR')} vol/mês</span>}
                {diasFila&&<span style={{background:'rgba(239,68,68,0.08)',color:'#f87171',padding:'2px 7px',borderRadius:6,fontWeight:600}}>⏳ {diasFila}d em fila</span>}
                {prevStatus&&<span style={{background:'rgba(100,116,139,0.08)',color:'#94a3b8',padding:'2px 7px',borderRadius:6}}>← {prevStatus}</span>}
                {dtGo&&<span style={{background:'rgba(14,165,233,0.08)',color:'#38bdf8',padding:'2px 7px',borderRadius:6}}>🎯 Go-live: {dtGo}</span>}
              </div>;
            })()}
                </div>
                {lastTxt && (
                  <div style={{marginTop:10,background:'#f8fafc',borderRadius:8,padding:'8px 12px',fontSize:12,color:'#64748b',borderLeft:'2px solid #e2e8f0'}}>
                    💬 <em>{lastTxt.substring(0,150)}{lastTxt.length>150?'…':''}</em>
          {(()=>{const cb=cobrados[t.key];const cbHoje=cb&&(Date.now()-cb.time)<86400000;return <div style={{display:'flex',gap:8,marginTop:8,paddingTop:8,borderTop:'1px solid rgba(100,116,139,0.08)'}}>
            <button onClick={()=>{const n={...cobrados};if(cbHoje){delete n[t.key];}else{n[t.key]={time:Date.now()};}setCobrados(n);try{localStorage.setItem('hub_cobrados',JSON.stringify(n));}catch{}}} style={{cursor:'pointer',padding:'4px 12px',borderRadius:99,fontSize:11,fontWeight:600,border:'none',background:cbHoje?'rgba(34,197,94,0.15)':'rgba(100,116,139,0.1)',color:cbHoje?'#4ade80':'#94a3b8'}}>{cbHoje?'✅ Cobrei às '+new Date(cb.time).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):'📞 Cobrei hoje'}</button>
            <button onClick={async()=>{const txt=prompt('Comentário para '+t.key+' (vai aparecer no Jira):');if(!txt)return;const r=await fetch('/api/jira-comment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({issueKey:t.key,text:txt})});alert(r.ok?'✅ Comentário enviado!':'❌ Erro ao enviar.');}} style={{cursor:'pointer',padding:'4px 12px',borderRadius:99,fontSize:11,fontWeight:600,border:'none',background:'rgba(99,102,241,0.1)',color:'#818cf8'}}>💬 Comentar no Jira</button>
          </div>;})()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default JiraMonitorFull;
