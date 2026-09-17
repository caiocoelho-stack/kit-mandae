import React, { useState, useEffect, useRef } from 'react';
import JiraMonitorFull from '../components/JiraMonitorFull.jsx';

function JiraScreen({ setRoute }) {
  return (
    <main className="main">
      <div className="page-header">
        <div className="page-eyebrow">
          <span className="dot" />
          <span style={{ cursor: 'pointer' }} onClick={() => setRoute('home')}>Ferramentas</span>
          <span style={{ color: 'var(--md-muted-2)' }}>/</span>
          <span style={{ color: 'var(--md-ink-2)' }}>Tickets Parados · INT</span>
        </div>
        <div className="page-title-row">
          <div>
            <h1 className="page-title">🎫 Monitor de Tickets<span className="accent-bar" /></h1>
            <p className="page-subtitle">Tickets INT em "Aguardando Comercial" parados há mais de 20 dias. Atualiza automaticamente a cada 5 min.</p>
          </div>
        </div>
      </div>

      <JiraMonitorFull />
    </main>
  );
}

export default JiraScreen;
