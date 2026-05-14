import base64, gzip, re, sys
sys.stdout.reconfigure(encoding='utf-8')

HTML = 'index.html'
UUID = '54d7da79-68d8-4252-ba50-aa935e750bde'

with open(HTML, 'r', encoding='utf-8') as f:
    content = f.read()

# ── Extract bundle ────────────────────────────────────────────────────────────
pat = r'("' + UUID + r'":\{"mime":"application/javascript","compressed":true,"data":")([A-Za-z0-9+/=]+)(")'
m = re.search(pat, content)
assert m, "Bundle not found"
js = gzip.decompress(base64.b64decode(m.group(2))).decode('utf-8')

# =========================================================================
# PART 1 — BUNDLE JS: update QuickLinks JSX
# =========================================================================

OLD_QL = (
    '    <div className="quicklinks">\n'
    '      {LINKS.map(l => (\n'
    '        <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer" className="quicklinks-link">\n'
    '          <span>{l.emoji}</span>\n'
    '          <span>{l.name}</span>\n'
    '          <span style={{ opacity: 0.45, fontSize: 11 }}>{"→"}</span>\n'
    '        </a>\n'
    '      ))}\n'
    '    </div>'
)

NEW_QL = (
    '    <div className="quicklinks">\n'
    '      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: \'0.1em\', color: \'var(--md-muted)\', textTransform: \'uppercase\', marginRight: 8 }}>Links rápidos</span>\n'
    '      <span style={{ color: \'var(--md-line)\', marginRight: 8 }}>|</span>\n'
    '      {LINKS.map(l => (\n'
    '        <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer" className="quicklinks-link">\n'
    '          <span style={{ fontSize: 14 }}>{l.emoji}</span>\n'
    '          <span>{l.name}</span>\n'
    '          <span style={{ opacity: 0.45, fontSize: 11 }}>{"→"}</span>\n'
    '        </a>\n'
    '      ))}\n'
    '    </div>'
)

assert OLD_QL in js, "QuickLinks JSX return block not found"
js = js.replace(OLD_QL, NEW_QL, 1)
print("1. Updated QuickLinks JSX (label + separator + emoji size)")

# Repack bundle
new_b64 = base64.b64encode(gzip.compress(js.encode('utf-8'))).decode('ascii')
content = content[:m.start(2)] + new_b64 + content[m.end(2):]
print("   Bundle repacked.")

# =========================================================================
# PART 2 — TEMPLATE CSS
# =========================================================================

# 2a. .bento grid-auto-rows: 180px -> minmax(180px, auto)
OLD_BENTO = 'grid-auto-rows: 180px;'
NEW_BENTO = 'grid-auto-rows: minmax(180px, auto);'
assert OLD_BENTO in content, ".bento grid-auto-rows not found"
content = content.replace(OLD_BENTO, NEW_BENTO, 1)
print("2a. .bento grid-auto-rows -> minmax(180px, auto)")

# 2b. .tool-foot margin-top: 16px -> auto
OLD_FOOT = '.tool-foot {\\n  margin-top: 16px;\\n'
NEW_FOOT = '.tool-foot {\\n  margin-top: auto;\\n'
assert OLD_FOOT in content, ".tool-foot margin-top not found"
content = content.replace(OLD_FOOT, NEW_FOOT, 1)
print("2b. .tool-foot margin-top -> auto")

# 2c. .quicklinks: add border-top, update padding 8px -> 10px
OLD_QL_CSS = (
    '.quicklinks {\\n'
    '  grid-column: 2 / 3;\\n'
    '  background: var(--md-surface);\\n'
    '  border-bottom: 1px solid var(--md-line);\\n'
    '  padding: 8px 40px;\\n'
    '  display: flex; gap: 24px; align-items: center;\\n'
    '  font-size: 12px;\\n'
    '}'
)
NEW_QL_CSS = (
    '.quicklinks {\\n'
    '  grid-column: 2 / 3;\\n'
    '  background: var(--md-surface);\\n'
    '  border-top: 1px solid var(--md-line);\\n'
    '  border-bottom: 1px solid var(--md-line);\\n'
    '  padding: 10px 40px;\\n'
    '  display: flex; gap: 24px; align-items: center;\\n'
    '  font-size: 12px;\\n'
    '}'
)
assert OLD_QL_CSS in content, ".quicklinks CSS block not found"
content = content.replace(OLD_QL_CSS, NEW_QL_CSS, 1)
print("2c. .quicklinks: added border-top, padding 10px")

# 2d. .quicklinks-link: add font-weight: 500
OLD_QL_LINK = (
    '.quicklinks-link {\\n'
    '  display: inline-flex; align-items: center; gap: 6px;\\n'
    '  color: var(--md-ink-2); text-decoration: none;\\n'
    '  transition: color 150ms ease;\\n'
    '}'
)
NEW_QL_LINK = (
    '.quicklinks-link {\\n'
    '  display: inline-flex; align-items: center; gap: 6px;\\n'
    '  color: var(--md-ink-2); text-decoration: none; font-weight: 500;\\n'
    '  transition: color 150ms ease;\\n'
    '}'
)
assert OLD_QL_LINK in content, ".quicklinks-link CSS not found"
content = content.replace(OLD_QL_LINK, NEW_QL_LINK, 1)
print("2d. .quicklinks-link: font-weight 500")

# 2e. .quicklinks-link:hover: add font-weight: 600
OLD_QL_HOVER = '.quicklinks-link:hover { color: var(--md-coral); }'
NEW_QL_HOVER = '.quicklinks-link:hover { color: var(--md-coral); font-weight: 600; }'
assert OLD_QL_HOVER in content, ".quicklinks-link:hover not found"
content = content.replace(OLD_QL_HOVER, NEW_QL_HOVER, 1)
print("2e. .quicklinks-link:hover: font-weight 600")

# =========================================================================
# Save
# =========================================================================
with open(HTML, 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDone. index.html saved.")
