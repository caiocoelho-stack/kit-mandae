import base64, gzip, re, sys

HTML = 'index.html'
UUID = '54d7da79-68d8-4252-ba50-aa935e750bde'

with open(HTML, 'r', encoding='utf-8') as f:
    content = f.read()

# =========================================================================
# PART 1 — BUNDLE JS (UUID 54d7da79)
# =========================================================================
pat = r'("' + UUID + r'":\{"mime":"application/javascript","compressed":true,"data":")([A-Za-z0-9+/=]+)(")'
m = re.search(pat, content)
assert m, "Bundle not found"
b64 = m.group(2)
js = gzip.decompress(base64.b64decode(b64)).decode('utf-8')

# ------------------------------------------------------------------
# 1a. Remove "Recursos do Time" section from HomeScreen
# ------------------------------------------------------------------
RECURSOS_START = '\n\n\n      {/* Section: Recursos do Time */}'
NEXT_SECTION   = '\n\n      {/* Section: Atividade + Dica */}'

rs = js.find(RECURSOS_START)
re_idx = js.find(NEXT_SECTION, rs)
assert rs >= 0, "Recursos start not found"
assert re_idx >= 0, "Recursos end not found"
js = js[:rs] + '\n' + js[re_idx:]
print("1a. Removed Recursos do Time from HomeScreen")

# ------------------------------------------------------------------
# 1b. Add QuickLinks component (before HomeScreen)
# ------------------------------------------------------------------
QUICKLINKS_JSX = r'''
// ─── Quick links bar ─────────────────────────────────────────────────
function QuickLinks() {
  const LINKS = [
    { emoji: "\u{1F517}", name: "Portal de Integrações", url: "https://sites.google.com/nuvemshop.com.br/integracoesnuvemenvio/início" },
    { emoji: "\u{1F4C4}", name: "Documentos Úteis",            url: "https://drive.google.com/drive/folders/16-o_2s-yrsHz_fV9zq11UedPLsgqnvk-" },
    { emoji: "⚖️", name: "Playbook Jurídico",       url: "https://docs.google.com/document/d/104pV8ls8EYtIWwizb-YrfOcoPzKRhJkH/edit" },
  ];
  return (
    <div className="quicklinks">
      {LINKS.map(l => (
        <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer" className="quicklinks-link">
          <span>{l.emoji}</span>
          <span>{l.name}</span>
          <span style={{ opacity: 0.45, fontSize: 11 }}>{"→"}</span>
        </a>
      ))}
    </div>
  );
}

'''

HOME_COMMENT = '// ─── Home / Tool hub (bento) ─────────────────────────────────────────'
assert HOME_COMMENT in js, "HomeScreen comment not found"
js = js.replace(HOME_COMMENT, QUICKLINKS_JSX + HOME_COMMENT, 1)
print("1b. Added QuickLinks component")

# ------------------------------------------------------------------
# 1c. Add <QuickLinks /> to App render
# ------------------------------------------------------------------
OLD_APP = '        <Topbar route={route} />\n        {route === "home"'
NEW_APP = '        <Topbar route={route} />\n        <QuickLinks />\n        {route === "home"'
assert OLD_APP in js, "App Topbar not found"
js = js.replace(OLD_APP, NEW_APP, 1)
print("1c. Added <QuickLinks /> to App render")

# ------------------------------------------------------------------
# 1d. Remove Conta / Configuracoes from Sidebar
# ------------------------------------------------------------------
OLD_CONTA = (
    '\n      <div className="sidebar-section-label" style={{ marginTop: 4 }}>Conta</div>\n'
    '      <nav className="nav-list">\n'
    '        <div className="nav-item">\n'
    '          <span className="nav-icon">{I.cog}</span>\n'
    '          <span>Configurações</span>\n'
    '        </div>\n'
    '      </nav>\n'
    '\n'
    '      <div className="sidebar-spacer" />'
)
NEW_CONTA = '\n      <div className="sidebar-spacer" />'
assert OLD_CONTA in js, "Conta section not found"
js = js.replace(OLD_CONTA, NEW_CONTA, 1)
print("1d. Removed Conta/Configuracoes from Sidebar")

# Repack bundle
new_b64 = base64.b64encode(gzip.compress(js.encode('utf-8'))).decode('ascii')
content = content[:m.start(2)] + new_b64 + content[m.end(2):]
print("    Bundle repacked.")

# =========================================================================
# PART 2 — TEMPLATE CSS (inside <script type="__bundler/template">)
# In the JSON string, newlines are encoded as literal \n (backslash-n).
# In Python strings read from the file, these appear as \\n sequences.
# =========================================================================

# ------------------------------------------------------------------
# 2a. Add grid-template-rows to .app
# ------------------------------------------------------------------
OLD_APP_CSS = '.app {\\n  display: grid;\\n  grid-template-columns: 224px 1fr;\\n  min-height: 100vh;'
NEW_APP_CSS = '.app {\\n  display: grid;\\n  grid-template-columns: 224px 1fr;\\n  grid-template-rows: 60px auto 1fr;\\n  min-height: 100vh;'
assert OLD_APP_CSS in content, f".app CSS not found\nsearching: {repr(OLD_APP_CSS[:80])}"
content = content.replace(OLD_APP_CSS, NEW_APP_CSS, 1)
print("2a. Added grid-template-rows to .app")

# ------------------------------------------------------------------
# 2b. Update .sidebar to span 3 rows
# ------------------------------------------------------------------
OLD_SIDEBAR = 'grid-row: 1 / span 2;'
NEW_SIDEBAR = 'grid-row: 1 / span 3;'
assert OLD_SIDEBAR in content, ".sidebar grid-row not found"
content = content.replace(OLD_SIDEBAR, NEW_SIDEBAR, 1)
print("2b. Updated .sidebar to span 3 rows")

# ------------------------------------------------------------------
# 2c. Fix .tool-card overflow: hidden -> visible
# ------------------------------------------------------------------
OLD_CARD = (
    'display: flex; flex-direction: column;\\n'
    '  transition: transform 220ms cubic-bezier(.2,.8,.2,1), border-color 220ms ease, background 220ms ease;\\n'
    '  overflow: hidden;'
)
NEW_CARD = (
    'display: flex; flex-direction: column;\\n'
    '  transition: transform 220ms cubic-bezier(.2,.8,.2,1), border-color 220ms ease, background 220ms ease;\\n'
    '  overflow: visible;'
)
if OLD_CARD in content:
    content = content.replace(OLD_CARD, NEW_CARD, 1)
    print("2c. Fixed .tool-card overflow: hidden -> visible")
else:
    print("2c. WARN: .tool-card overflow pattern not found, skipping")

# ------------------------------------------------------------------
# 2d. Add .quicklinks CSS after .topbar block's opening neighbour
#     Inject before '.topbar-left {' which follows the topbar block
# ------------------------------------------------------------------
INJECT_BEFORE = '.topbar-left {'
QUICKLINKS_CSS = (
    '.quicklinks {\\n'
    '  grid-column: 2 / 3;\\n'
    '  background: var(--md-surface);\\n'
    '  border-bottom: 1px solid var(--md-line);\\n'
    '  padding: 8px 40px;\\n'
    '  display: flex; gap: 24px; align-items: center;\\n'
    '  font-size: 12px;\\n'
    '}\\n'
    '.quicklinks-link {\\n'
    '  display: inline-flex; align-items: center; gap: 6px;\\n'
    '  color: var(--md-ink-2); text-decoration: none;\\n'
    '  transition: color 150ms ease;\\n'
    '}\\n'
    '.quicklinks-link:hover { color: var(--md-coral); }\\n\\n'
)
assert INJECT_BEFORE in content, ".topbar-left not found"
content = content.replace(INJECT_BEFORE, QUICKLINKS_CSS + INJECT_BEFORE, 1)
print("2d. Added .quicklinks CSS")

# ------------------------------------------------------------------
# 2e. Fix .tool-cta: ensure overflow: visible; flex-shrink: 0
#     (second .tool-cta block after .tool-foot)
# ------------------------------------------------------------------
# Find the second .tool-cta in CSS (after .tool-foot)
tf_idx = content.find('.tool-foot')
tc2_idx = content.find('.tool-cta {', tf_idx)
if tc2_idx >= 0:
    close_idx = content.find('}', tc2_idx)
    old_tc = content[tc2_idx:close_idx + 1]
    if 'overflow: visible' not in old_tc:
        new_tc = old_tc.replace(' }', ' overflow: visible; flex-shrink: 0; }')
        content = content[:tc2_idx] + new_tc + content[close_idx + 1:]
        print("2e. Added overflow:visible + flex-shrink:0 to .tool-cta")
    else:
        print("2e. .tool-cta already has overflow:visible")
else:
    print("2e. WARN: second .tool-cta not found")

# =========================================================================
# Save
# =========================================================================
with open(HTML, 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDone. index.html saved.")
