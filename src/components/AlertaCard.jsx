import React, { useState, useEffect, useRef } from 'react';
import { I } from '../icons.jsx';

function AlertaCard() {
  const [alerta, setAlerta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [lastUpdate, setLastUpdate] = useState('');

  useEffect(() => {
    const hoje = new Date().toDateString();
    try {
      const cached = JSON.parse(localStorage.getItem('alerta_mercado') || 'null');
      if (cached?.data === hoje) {
        setAlerta(cached.resultado);
        setLastUpdate(cached.update || '');
        return;
      }
    } catch {}
    buscar();
  }, []);

  function fmtHora() {
    return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  async function buscar() {
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/alerta', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      const d = await r.json();
      if (d.titulo) {
        const hora = fmtHora();
        setAlerta(d);
        setLastUpdate(hora);
        try { localStorage.setItem('alerta_mercado', JSON.stringify({ data: new Date().toDateString(), resultado: d, update: hora })); } catch {}
      } else {
        setError('Não foi possível obter alertas.');
      }
    } catch {
      setError('Erro de conexão.');
    }
    setLoading(false);
  }

  function handleRefresh() {
    if (countdown > 0 || loading) return;
    try { localStorage.removeItem('alerta_mercado'); } catch {}
    buscar();
    setCountdown(60);
    const iv = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(iv); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  const btnStyle = {
    background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
    width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: (countdown > 0 || loading) ? 'not-allowed' : 'pointer',
    color: '#fff', fontSize: 11, opacity: (countdown > 0 || loading) ? 0.55 : 1,
    transition: 'opacity 150ms', flexShrink: 0,
  };

  return (
    <div className="tip-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="tip-eyebrow" style={{ marginBottom: 0 }}>🔔 ALERTA DE MERCADO</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {lastUpdate && <span style={{ fontSize: 10, opacity: 0.5, color: '#fff' }}>{lastUpdate}</span>}
          <button style={btnStyle} onClick={handleRefresh} disabled={countdown > 0 || loading}
            title={countdown > 0 ? `Aguarde ${countdown}s para atualizar` : 'Atualizar'}>
            {countdown > 0 ? countdown + 's' : I.refresh}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '16px 0', opacity: 0.85 }}>
          <div className="big-spinner" style={{ width: 22, height: 22, borderWidth: 2 }} />
          <span style={{ fontSize: 12, color: '#fff' }}>Buscando alertas de mercado...</span>
        </div>
      ) : error ? (
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.82)' }}>
          <p style={{ margin: '0 0 10px' }}>Atualizando informações...</p>
          <button onClick={buscar} style={{ fontSize: 12, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', color: '#fff' }}>
            Tentar novamente
          </button>
        </div>
      ) : alerta ? (
        <>
          <h4 style={{ margin: '0 0 12px', fontSize: 14.5, fontWeight: 700, lineHeight: 1.35, color: '#fff' }}>{alerta.titulo}</h4>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--md-coral-soft)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>O que está acontecendo</div>
          <p style={{ fontSize: 12.5, lineHeight: 1.6, margin: '0 0 10px', color: 'rgba(255,255,255,0.88)' }}>{alerta.o_que_esta_acontecendo}</p>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--md-coral-soft)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Por que importa pro seu cliente</div>
          <p style={{ fontSize: 12.5, lineHeight: 1.6, margin: '0 0 10px', color: 'rgba(255,255,255,0.88)' }}>{alerta.por_que_importa}</p>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
            <div style={{ fontSize: 12.5, lineHeight: 1.55, color: 'rgba(255,255,255,0.92)', fontStyle: 'italic' }}>💬 {alerta.gancho_para_call}</div>
          </div>
          <div style={{ fontSize: 10, opacity: 0.5, color: '#fff' }}>Fonte: {alerta.fonte}</div>
        </>
      ) : null}
    </div>
  );
}


export default AlertaCard;
