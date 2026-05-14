import base64, gzip, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('C:/Users/caio_/Documents/kit-mandae-deploy/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# ── Extrair bundle ────────────────────────────────────────────────────────
key = '54d7da79-68d8-4252-ba50-aa935e750bde'
idx = content.find(key)
ds = content.find('"data":"', idx) + len('"data":"')
de = content.find('"', ds)
js = gzip.decompress(base64.b64decode(content[ds:de])).decode('utf-8')

# helper: convert Python newlines → JSON-escaped \n (for template injection)
def jesc(s):
    return s.replace('\n', '\\n')

# ═══════════════════════════════════════════════════════════════════════════
# 1. Recursos do Time — redesign (JSX no bundle)
# ═══════════════════════════════════════════════════════════════════════════
old_recursos = (
    '      {/* Section: Recursos do Time */}\n'
    '      <div className="section-strip" style={{ marginTop: 32 }}>\n'
    '        <h3>Recursos do Time</h3>\n'
    '      </div>\n'
    '      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 }}>\n'
    '        {[\n'
    '          { icon: I.cog,     name: "Portal de Integrações", desc: "ERPs, plataformas e conectores",    url: "https://sites.google.com/nuvemshop.com.br/integracoesnuvemenvio/início" },\n'
    '          { icon: I.invoice, name: "Documentos Úteis",      desc: "Bids, contratos e documentos",     url: "https://drive.google.com/drive/folders/16-o_2s-yrsHz_fV9zq11UedPLsgqnvk-" },\n'
    '          { icon: I.lock,    name: "Playbook Jurídico",     desc: "Contratos, compliance e jurídico",  url: "https://docs.google.com/document/d/104pV8ls8EYtIWwizb-YrfOcoPzKRhJkH/edit" },\n'
    '        ].map(r => (\n'
    '          <a\n'
    '            key={r.name}\n'
    '            href={r.url}\n'
    '            target="_blank"\n'
    '            rel="noopener noreferrer"\n'
    '            style={{ textDecoration: "none" }}\n'
    '            className="resource-card"\n'
    '          >\n'
    '            <span className="resource-icon">{r.icon}</span>\n'
    '            <div className="resource-body">\n'
    '              <div className="resource-name">{r.name}</div>\n'
    '              <div className="resource-desc">{r.desc}</div>\n'
    '            </div>\n'
    '            <span className="resource-arrow">→</span>\n'
    '          </a>\n'
    '        ))}\n'
    '      </div>'
)

new_recursos = (
    '      {/* Section: Recursos do Time */}\n'
    '      <div className="section-strip" style={{ marginTop: 32 }}>\n'
    '        <h3>Recursos do Time</h3>\n'
    '      </div>\n'
    '      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>\n'
    '        {[\n'
    '          { emoji: "🔗", name: "Portal de Integrações", desc: "ERPs, plataformas e conectores",   url: "https://sites.google.com/nuvemshop.com.br/integracoesnuvemenvio/início" },\n'
    '          { emoji: "📄", name: "Documentos Úteis",      desc: "Bids, contratos e documentos",    url: "https://drive.google.com/drive/folders/16-o_2s-yrsHz_fV9zq11UedPLsgqnvk-" },\n'
    '          { emoji: "⚖️", name: "Playbook Jurídico",     desc: "Contratos, compliance e jurídico", url: "https://docs.google.com/document/d/104pV8ls8EYtIWwizb-YrfOcoPzKRhJkH/edit" },\n'
    '        ].map(r => (\n'
    '          <a\n'
    '            key={r.name}\n'
    '            href={r.url}\n'
    '            target="_blank"\n'
    '            rel="noopener noreferrer"\n'
    '            className="resource-card"\n'
    '          >\n'
    '            <span className="resource-emoji">{r.emoji}</span>\n'
    '            <div className="resource-body">\n'
    '              <div className="resource-name">{r.name}</div>\n'
    '              <div className="resource-desc">{r.desc}</div>\n'
    '            </div>\n'
    '            <span className="resource-arrow">→</span>\n'
    '          </a>\n'
    '        ))}\n'
    '      </div>'
)

assert old_recursos in js, "MISSING: recursos section"
js = js.replace(old_recursos, new_recursos, 1)
print('✓ 1. Recursos do Time redesenhado (emoji, vertical, sem SVG)')

# ═══════════════════════════════════════════════════════════════════════════
# 2. SOON → em breve no nav-badge (sidebar)
# ═══════════════════════════════════════════════════════════════════════════
old_soon = '<span className="nav-badge">SOON</span>'
new_soon = '<span className="nav-badge">em breve</span>'
count = js.count(old_soon)
assert count > 0, "MISSING: nav-badge SOON"
js = js.replace(old_soon, new_soon)
print(f'✓ 2. {count}x "SOON" → "em breve" no nav-badge')

# ═══════════════════════════════════════════════════════════════════════════
# Recomprimir bundle e substituir no HTML
# ═══════════════════════════════════════════════════════════════════════════
new_b64 = base64.b64encode(
    gzip.compress(js.encode('utf-8'), compresslevel=9, mtime=0)
).decode('ascii')
content = content[:ds] + new_b64 + content[de:]
print(f'   bundle {len(js)} chars | b64 {len(new_b64)} chars')

# ═══════════════════════════════════════════════════════════════════════════
# 3. CSS resource-card — substituir bloco antigo pelo novo (main HTML)
# ═══════════════════════════════════════════════════════════════════════════
old_rc_css = (
    '\n'
    '    /* ── Resource cards ─────────────────────────────────────────────────── */\n'
    '    .resource-card {\n'
    '      display: flex;\n'
    '      align-items: center;\n'
    '      gap: 12px;\n'
    '      padding: 16px;\n'
    '      border: 1px solid var(--md-line);\n'
    '      border-radius: 14px;\n'
    '      background: var(--md-paper);\n'
    '      cursor: pointer;\n'
    '      transition: border-color 0.15s, box-shadow 0.15s;\n'
    '      color: var(--md-ink);\n'
    '    }\n'
    '    .resource-card:hover {\n'
    '      border-color: var(--md-coral);\n'
    '      box-shadow: 0 0 0 3px rgba(232,97,74,0.08);\n'
    '    }\n'
    '    .resource-icon {\n'
    '      display: flex;\n'
    '      align-items: center;\n'
    '      justify-content: center;\n'
    '      width: 36px;\n'
    '      height: 36px;\n'
    '      border-radius: 9px;\n'
    '      background: var(--md-surface);\n'
    '      color: var(--md-coral);\n'
    '      flex-shrink: 0;\n'
    '    }\n'
    '    .resource-body { flex: 1; min-width: 0; }\n'
    '    .resource-name { font-size: 13px; font-weight: 600; color: var(--md-ink); }\n'
    '    .resource-desc { font-size: 11.5px; color: var(--md-muted); margin-top: 2px; }\n'
    '    .resource-arrow { font-size: 16px; color: var(--md-muted-2); flex-shrink: 0; }\n'
    '    .resource-card:hover .resource-arrow { color: var(--md-coral); }\n'
)

new_rc_css = (
    '\n'
    '    /* ── Resource cards ─────────────────────────────────────────────────── */\n'
    '    .resource-card {\n'
    '      display: flex;\n'
    '      align-items: center;\n'
    '      gap: 14px;\n'
    '      padding: 14px 18px;\n'
    '      border: 1px solid var(--md-line);\n'
    '      border-radius: 10px;\n'
    '      background: var(--md-paper);\n'
    '      cursor: pointer;\n'
    '      text-decoration: none;\n'
    '      transition: border-color 0.15s, transform 0.15s;\n'
    '      color: var(--md-ink);\n'
    '    }\n'
    '    .resource-card:hover {\n'
    '      border-color: var(--md-coral);\n'
    '      transform: translateY(-1px);\n'
    '    }\n'
    '    .resource-emoji {\n'
    '      display: flex;\n'
    '      align-items: center;\n'
    '      justify-content: center;\n'
    '      width: 36px;\n'
    '      height: 36px;\n'
    '      border-radius: 8px;\n'
    '      background: var(--md-coral-tint, rgba(232,97,74,0.08));\n'
    '      font-size: 18px;\n'
    '      flex-shrink: 0;\n'
    '      text-align: center;\n'
    '    }\n'
    '    .resource-body { flex: 1; min-width: 0; }\n'
    '    .resource-name { font-size: 13px; font-weight: 600; color: var(--md-ink); }\n'
    '    .resource-desc { font-size: 11.5px; color: var(--md-muted); margin-top: 2px; }\n'
    '    .resource-arrow { font-size: 16px; color: var(--md-muted-2); flex-shrink: 0; }\n'
    '    .resource-card:hover .resource-arrow { color: var(--md-coral); }\n'
)

assert old_rc_css in content, "MISSING: old resource-card CSS"
content = content.replace(old_rc_css, new_rc_css, 1)
print('✓ 3. CSS resource-card atualizado (emoji, padding, radius, transform)')

# ═══════════════════════════════════════════════════════════════════════════
# 4. CSS .tool-card.coming-soon — no template (antes do último </style>)
# ═══════════════════════════════════════════════════════════════════════════
# Anchor: end of last @media block before </style> in the template
css_inject_anchor = (
    '  .tool-card.featured, .tool-card.span-2 { grid-column: span 1; }\\n'
    '}\\n'
    '\\n'
    '<\\u002Fstyle>'
)

coming_soon_extra = jesc(
    '.tool-card.coming-soon { cursor: default; }\n'
    '.tool-card.coming-soon:hover { transform: none; box-shadow: none; border-color: var(--md-line); }\n'
)

new_css_inject_anchor = (
    '  .tool-card.featured, .tool-card.span-2 { grid-column: span 1; }\\n'
    '}\\n'
    '\\n'
    + coming_soon_extra + '\\n'
    + '<\\u002Fstyle>'
)

assert css_inject_anchor in content, "MISSING: template CSS anchor"
content = content.replace(css_inject_anchor, new_css_inject_anchor, 1)
print('✓ 4. CSS .tool-card.coming-soon injetado no template (cursor:default, sem hover transform)')

# ═══════════════════════════════════════════════════════════════════════════
# 5. Verificar posição: Recursos está antes da Atividade (já estava OK)
# ═══════════════════════════════════════════════════════════════════════════
pos_rec  = content.find('Recursos do Time')
pos_atv  = content.find('Atividade + Dica')
assert pos_rec < pos_atv, "ORDEM ERRADA: Recursos deve vir antes de Atividade"
print('✓ 5. Ordem confirmada: Recursos do Time antes de Atividade Recente')

# ── Salvar ────────────────────────────────────────────────────────────────
with open('C:/Users/caio_/Documents/kit-mandae-deploy/index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print(f'\nSalvo. HTML {len(content)} chars')
