import base64, gzip, re, sys
sys.stdout.reconfigure(encoding='utf-8')

HTML = 'index.html'
UUID = '54d7da79-68d8-4252-ba50-aa935e750bde'

with open(HTML, 'r', encoding='utf-8') as f:
    content = f.read()

pat = r'("' + UUID + r'":\{"mime":"application/javascript","compressed":true,"data":")([A-Za-z0-9+/=]+)(")'
m = re.search(pat, content)
assert m, "Bundle not found"
js = gzip.decompress(base64.b64decode(m.group(2))).decode('utf-8')

# =========================================================================
# PART 1 — BUNDLE JS
# =========================================================================

# 1a. Add ferramentas array + counter vars to HomeScreen
OLD_HOME_FN = 'function HomeScreen({ setRoute }) {\n  return ('
NEW_HOME_FN = (
    'function HomeScreen({ setRoute }) {\n'
    '  const ferramentas = [\n'
    '    { key: \'inicio\',    available: true  },\n'
    '    { key: \'contrato\',  available: true  },\n'
    '    { key: \'followup\',  available: true  },\n'
    '    { key: \'slack\',     available: true  },\n'
    '    { key: \'coming1\',   available: false },\n'
    '    { key: \'coming2\',   available: false },\n'
    '  ];\n'
    '  const total = ferramentas.length;\n'
    '  const disponiveis = ferramentas.filter(f => f.available).length;\n'
    '  return ('
)
assert OLD_HOME_FN in js, "HomeScreen function signature not found"
js = js.replace(OLD_HOME_FN, NEW_HOME_FN, 1)
print("1a. Added ferramentas array + counter vars to HomeScreen")

# 1b. Replace hardcoded counter with dynamic expression
OLD_COUNTER = '<span className="meta-pill"><span className="led" /> 1 de 6 disponível</span>'
NEW_COUNTER = '<span className="meta-pill"><span className="led" /> {disponiveis} de {total} disponível</span>'
assert OLD_COUNTER in js, "Counter pill not found"
js = js.replace(OLD_COUNTER, NEW_COUNTER, 1)
print("1b. Counter is now dynamic")

# 1c. Update QuickLinks JSX — label fontWeight, emoji size, arrow fontWeight
OLD_QL_JSX = (
    '      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: \'0.1em\', color: \'var(--md-muted)\', textTransform: \'uppercase\', marginRight: 8 }}>Links rápidos</span>\n'
    '      <span style={{ color: \'var(--md-line)\', marginRight: 8 }}>|</span>\n'
    '      {LINKS.map(l => (\n'
    '        <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer" className="quicklinks-link">\n'
    '          <span style={{ fontSize: 14 }}>{l.emoji}</span>\n'
    '          <span>{l.name}</span>\n'
    '          <span style={{ opacity: 0.45, fontSize: 11 }}>{"→"}</span>\n'
    '        </a>\n'
    '      ))}'
)
NEW_QL_JSX = (
    '      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: \'0.1em\', color: \'var(--md-muted)\', textTransform: \'uppercase\', marginRight: 8 }}>Links rápidos</span>\n'
    '      <span style={{ color: \'var(--md-line)\', marginRight: 8 }}>|</span>\n'
    '      {LINKS.map(l => (\n'
    '        <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer" className="quicklinks-link">\n'
    '          <span style={{ fontSize: 16 }}>{l.emoji}</span>\n'
    '          <span>{l.name}</span>\n'
    '          <span style={{ opacity: 0.45, fontSize: 11, fontWeight: 700 }}>{"→"}</span>\n'
    '        </a>\n'
    '      ))}'
)
assert OLD_QL_JSX in js, "QuickLinks JSX not found"
js = js.replace(OLD_QL_JSX, NEW_QL_JSX, 1)
print("1c. Updated QuickLinks JSX (label fw700, emoji 16px, arrow fw700)")

# Repack bundle
new_b64 = base64.b64encode(gzip.compress(js.encode('utf-8'))).decode('ascii')
content = content[:m.start(2)] + new_b64 + content[m.end(2):]
print("    Bundle repacked.")

# =========================================================================
# PART 2 — TEMPLATE CSS
# =========================================================================

# 2a. .quicklinks-link: color -> var(--md-ink), font-weight 500->600, add font-size 13px
OLD_QL_LINK = (
    '.quicklinks-link {\\n'
    '  display: inline-flex; align-items: center; gap: 6px;\\n'
    '  color: var(--md-ink-2); text-decoration: none; font-weight: 500;\\n'
    '  transition: color 150ms ease;\\n'
    '}'
)
NEW_QL_LINK = (
    '.quicklinks-link {\\n'
    '  display: inline-flex; align-items: center; gap: 6px;\\n'
    '  color: var(--md-ink); text-decoration: none; font-weight: 600; font-size: 13px;\\n'
    '  transition: color 150ms ease;\\n'
    '}'
)
assert OLD_QL_LINK in content, ".quicklinks-link CSS not found"
content = content.replace(OLD_QL_LINK, NEW_QL_LINK, 1)
print("2a. .quicklinks-link: color->md-ink, fw600, font-size 13px")

# =========================================================================
# Save
# =========================================================================
with open(HTML, 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDone. index.html saved.")
