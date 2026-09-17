import React, { useState, useEffect, useRef } from 'react';
import { I } from '../icons.jsx';
import { NAV } from '../nav.js';
import BrandMark from './BrandMark.jsx';

function Sidebar({ route, setRoute, navOpen, onCloseNav }) {
  function goTo(key) {
    setRoute(key);
    onCloseNav?.();
  }
  return (
    <>
      {navOpen && <div className="sidebar-backdrop" onClick={onCloseNav} />}
      <aside className={"sidebar" + (navOpen ? " open" : "")}>
        <div className="sidebar-brand">
          <BrandMark size={28} />
          <div className="sidebar-wordmark">
            <b>Hub de Vendas</b><small style={{ display: "block", fontSize: 10, color: "var(--md-muted)", fontWeight: 400, marginTop: 1 }}>Mandaê / Nuvem Envio</small>
          </div>
        </div>

        <div className="sidebar-section-label">Ferramentas</div>
        <nav className="nav-list">
          <div
            className={"nav-item " + (route === "home" ? "active" : "")}
            onClick={() => goTo("home")}
          >
            <span className="nav-icon">{I.home}</span>
            <span>Início</span>
          </div>
          {NAV.map((n) => (
            <div
              key={n.key}
              className={"nav-item " + (route === n.key ? "active" : "") + (n.available ? "" : " disabled")}
              onClick={() => n.available && goTo(n.key)}
            >
              <span className="nav-icon">{I[n.icon]}</span>
              <span>{n.label}</span>
              {!n.available && <span className="nav-badge">em breve</span>}
            </div>
          ))}
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-user-card">
          <div className="avatar">RL</div>
          <div className="info">
            <div className="name">Vendedor(a)</div>
            <div className="role">Time Comercial · Mandaê / Nuvem Envio</div>
          </div>
          <button className="dots" title="Mais">⋯</button>
        </div>
      </aside>
    </>
  );
}


export default Sidebar;
