import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('C:/Users/caio_/Documents/kit-mandae-deploy/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

def jesc(s):
    return s.replace('\n', '\\n')

# ═══════════════════════════════════════════════════════════════════════════
# 3. CSS resource-card — substituir pelo novo (âncora segura sem o comment)
# ═══════════════════════════════════════════════════════════════════════════
old_rc_css = (
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

assert old_rc_css in content, "MISSING: resource-card CSS"
content = content.replace(old_rc_css, new_rc_css, 1)
print('✓ 3. CSS resource-card atualizado (emoji, padding:14px 18px, radius:10px, transform)')

# ═══════════════════════════════════════════════════════════════════════════
# 4. CSS .tool-card.coming-soon — no template (antes do último </style>)
# ═══════════════════════════════════════════════════════════════════════════
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
print('✓ 4. CSS .tool-card.coming-soon injetado (cursor:default, sem hover transform)')

# 5. Ordem já confirmada na sessão anterior
pos_rec = content.find('Recursos do Time')
pos_atv = content.find('Atividade + Dica')
assert pos_rec < pos_atv
print('✓ 5. Ordem: Recursos antes de Atividade Recente')

# ── Verificações finais ───────────────────────────────────────────────────
checks = [
    ('resource-emoji class',  'resource-emoji'),
    ('padding 14px 18px',     'padding: 14px 18px'),
    ('transform translateY',  'translateY(-1px)'),
    ('coming-soon cursor',    'coming-soon { cursor: default;'),
    ('nav-badge em breve',    'nav-badge">em breve'),
    ('emoji 🔗',              '🔗'),
    ('emoji 📄',              '📄'),
    ('emoji ⚖️',              '⚖'),
]
print()
for label, snippet in checks:
    print(f"  {'✓' if snippet in content else '✗ MISSING'} {label}")

with open('C:/Users/caio_/Documents/kit-mandae-deploy/index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print(f'\nSalvo. HTML {len(content)} chars')
