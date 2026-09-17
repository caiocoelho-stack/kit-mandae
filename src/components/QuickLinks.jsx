import React, { useState, useEffect, useRef } from 'react';

function QuickLinks() {
  const LINKS = [
    { emoji: "\u{1F517}", name: "Portal de Integrações", url: "https://sites.google.com/nuvemshop.com.br/integracoesnuvemenvio/início" },
    { emoji: "\u{1F4C4}", name: "Documentos Úteis",            url: "https://drive.google.com/drive/folders/16-o_2s-yrsHz_fV9zq11UedPLsgqnvk-" },
    { emoji: "⚖️", name: "Playbook Jurídico",       url: "https://docs.google.com/document/d/104pV8ls8EYtIWwizb-YrfOcoPzKRhJkH/edit" },
  ];
  return (
    <div className="quicklinks">
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--md-muted)', textTransform: 'uppercase', marginRight: 8 }}>Links rápidos</span>
      <span style={{ color: 'var(--md-line)', marginRight: 8 }}>|</span>
      {LINKS.map(l => (
        <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer" className="quicklinks-link">
          <span style={{ fontSize: 16 }}>{l.emoji}</span>
          <span>{l.name}</span>
          <span style={{ opacity: 0.45, fontSize: 11, fontWeight: 700 }}>{"→"}</span>
        </a>
      ))}
    </div>
  );
}



export default QuickLinks;
