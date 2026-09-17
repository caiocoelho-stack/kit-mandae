import React, { useState, useEffect, useRef } from 'react';
import { I } from '../icons.jsx';
import { NAV } from '../nav.js';

function Topbar({ route, setRoute }) {
  const [q, setQ] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const crumb =
    route === "home" ? null :
    route === "inicio" ? "Boas-vindas ao Cliente" :
    NAV.find(n => n.key === route)?.label;
  const results = q.trim()
    ? NAV.filter(n => n.available && n.label.toLowerCase().includes(q.toLowerCase()))
    : [];
  React.useEffect(() => {
    if (results.length === 1) {
      setRoute(results[0].key); setQ(''); setOpen(false);
    }
  }, [results.length]);
  function handleKey(e) {
    if (e.key === 'Escape') { setQ(''); setOpen(false); }
  }
  return (
    <header className="topbar">
      <div className="topbar-left">
        {crumb ? (
          <div className="topbar-crumb">
            Ferramentas <span style={{ opacity: 0.5 }}>/</span> <b>{crumb}</b>
          </div>
        ) : (
          <div className="topbar-crumb">Painel <span style={{ opacity: 0.5 }}>/</span> <b>Home</b></div>
        )}
      </div>
      <div className="topbar-right" style={{position:'relative'}}>
        <div className="topbar-search">
          <span style={{ color: "var(--md-muted)", display: "inline-flex" }}>{I.search}</span>
          <input type="text" value={q}
            onChange={e => { setQ(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={handleKey}
            placeholder="Buscar ferramenta... ⌘K"
            style={{border:'none',outline:'none',background:'transparent',
              fontSize:13,color:'var(--md-ink)',width:180}} />
        </div>
        {open && q.trim() && results.length > 1 && (
          <div style={{position:'absolute',top:'100%',right:0,marginTop:4,
            background:'var(--md-paper)',border:'1px solid var(--md-line)',
            borderRadius:10,boxShadow:'0 4px 20px rgba(0,0,0,0.1)',
            minWidth:220,zIndex:200,overflow:'hidden'}}>
            {results.map(n => (
              <button key={n.key}
                onMouseDown={() => { setRoute(n.key); setQ(''); setOpen(false); }}
                style={{display:'block',width:'100%',textAlign:'left',
                  padding:'9px 14px',border:'none',background:'transparent',
                  cursor:'pointer',fontSize:13,color:'var(--md-ink)'}}>
                {n.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}



export default Topbar;
