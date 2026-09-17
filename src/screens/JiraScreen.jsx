import React, { useState, useEffect, useRef } from 'react';
import JiraMonitorFull from '../components/JiraMonitorFull.jsx';

function JiraScreen({ setRoute }) {
  return (
    <div style={{ padding: '32px 40px', maxWidth: 860, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <button onClick={() => setRoute('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 13, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
            ← Voltar
          </button>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>🎫 Monitor de Tickets</h1>
        <p style={{ color: '#64748b', marginTop: 6, fontSize: 14 }}>
          Tickets INT em "Aguardando Comercial" parados há mais de 20 dias. Atualiza automaticamente a cada 5 min.
        </p>
      </div>
      <JiraMonitorFull />
    </div>
  );
}

export default JiraScreen;
