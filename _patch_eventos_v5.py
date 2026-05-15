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
# 1. Link inscrição: href → onClick + window.open
# =========================================================================
OLD1 = (
    '                      {ev.inscricao && (\n'
    '                        <a href={ev.inscricao} target="_blank"\n'
    "                          style={{fontSize:10,color:'var(--md-coral)',\n"
    "                            textDecoration:'none',padding:'2px 8px',\n"
    "                            borderRadius:10,border:'1px solid var(--md-coral-soft)',\n"
    "                            background:'var(--md-coral-tint)'}}>\n"
    '                          \U0001f517 Inscrição\n'
    '                        </a>\n'
    '                      )}'
)
NEW1 = (
    '                      {ev.inscricao && (\n'
    "                        <a onClick={() => window.open(ev.inscricao, '_blank')}\n"
    "                          style={{fontSize:10,color:'var(--md-coral)',\n"
    "                            textDecoration:'none',padding:'2px 8px',\n"
    "                            borderRadius:10,border:'1px solid var(--md-coral-soft)',\n"
    "                            background:'var(--md-coral-tint)',cursor:'pointer'}}>\n"
    '                          \U0001f517 Inscrição\n'
    '                        </a>\n'
    '                      )}'
)
assert OLD1 in js, "1. Link inscrição não encontrado"
js = js.replace(OLD1, NEW1, 1)
print("1. Link inscrição: href → onClick window.open")

# =========================================================================
# 2. Link convidados: href → onClick + window.open
# =========================================================================
OLD2 = (
    '                      {ev.convidados && (\n'
    '                        <a href={ev.convidados} target="_blank"\n'
    "                          style={{fontSize:10,color:'var(--md-ink-2)',\n"
    "                            textDecoration:'none',padding:'2px 8px',\n"
    "                            borderRadius:10,border:'1px solid var(--md-line)'}}>\n"
    '                          \U0001f465 Convidados\n'
    '                        </a>\n'
    '                      )}'
)
NEW2 = (
    '                      {ev.convidados && (\n'
    "                        <a onClick={() => window.open(ev.convidados, '_blank')}\n"
    "                          style={{fontSize:10,color:'var(--md-ink-2)',\n"
    "                            textDecoration:'none',padding:'2px 8px',\n"
    "                            borderRadius:10,border:'1px solid var(--md-line)',\n"
    "                            cursor:'pointer'}}>\n"
    '                          \U0001f465 Convidados\n'
    '                        </a>\n'
    '                      )}'
)
assert OLD2 in js, "2. Link convidados não encontrado"
js = js.replace(OLD2, NEW2, 1)
print("2. Link convidados: href → onClick window.open")

# Repack
new_b64 = base64.b64encode(gzip.compress(js.encode('utf-8'))).decode('ascii')
content = content[:m.start(2)] + new_b64 + content[m.end(2):]
print("Bundle repacked.")

with open(HTML, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done. index.html salvo.")
