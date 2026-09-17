import React, { useState, useEffect, useRef } from 'react';
import COBERTURA from '../data/coleta.json';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1IlsTMNRye6lAAJ7cLnt7hP_fK2pyOVDT/edit';
const MAX_RESULTS = 10;

function ColetaWidget() {
  const [busca, setBusca] = useState('');

  const porUf = React.useMemo(() => {
    const m = {};
    for (const c of COBERTURA) m[c.uf] = (m[c.uf] || 0) + 1;
    return m;
  }, []);

  const q = busca.trim().toLowerCase();
  const filtradas = q ? COBERTURA.filter(c => c.cidade.toLowerCase().includes(q)) : null;

  const badge = (prazo) => ({
    background: prazo === 'D+0' ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)',
    color: prazo === 'D+0' ? '#4ade80' : '#60a5fa',
    padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700, flexShrink: 0,
  });

  return (
    <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)', borderRadius: 16, padding: 20, color: '#f1f5f9', marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: 1, color: '#94a3b8' }}>🗺️ ABRANGÊNCIA DE COLETA</span>
        <a href={SHEET_URL} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>Ver planilha completa →</a>
      </div>

      <input
        placeholder="🔍 Buscar cidade (SP, MG, SC)..."
        value={busca}
        onChange={e => setBusca(e.target.value)}
        style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: 13, marginBottom: 12, boxSizing: 'border-box', outline: 'none' }}
      />

      {filtradas ? (
        filtradas.length > 0 ? (
          <div>
            {filtradas.slice(0, MAX_RESULTS).map(c => (
              <div key={c.cidade + c.uf} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.cidade} <span style={{ color: '#64748b', fontWeight: 400 }}>· {c.uf}</span>
                </span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{c.frequencia}</span>
                  <span style={badge(c.prazo)}>{c.prazo}</span>
                </div>
              </div>
            ))}
            {filtradas.length > MAX_RESULTS && (
              <p style={{ color: '#64748b', fontSize: 11, textAlign: 'center', margin: '8px 0 0' }}>
                +{filtradas.length - MAX_RESULTS} cidade{filtradas.length - MAX_RESULTS > 1 ? 's' : ''} — refine a busca
              </p>
            )}
          </div>
        ) : (
          <p style={{ color: '#64748b', fontSize: 12, textAlign: 'center', margin: '8px 0' }}>
            Cidade não encontrada em SP/MG/SC — <a href={SHEET_URL} target="_blank" rel="noreferrer" style={{ color: '#6366f1' }}>verificar planilha completa</a>
          </p>
        )
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 4 }}>
            {['SP', 'MG', 'SC'].map(uf => (
              <div key={uf} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{porUf[uf] || 0}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>cidades · {uf}</div>
              </div>
            ))}
          </div>
          <p style={{ color: '#64748b', fontSize: 11.5, textAlign: 'center', margin: '10px 0 0' }}>
            {COBERTURA.length} cidades cobertas · busque a sua acima
          </p>
        </>
      )}
    </div>
  );
}

export default ColetaWidget;
