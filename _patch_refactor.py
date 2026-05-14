import base64, gzip, re, sys

HTML = 'index.html'
UUID = '54d7da79-68d8-4252-ba50-aa935e750bde'

with open(HTML, 'r', encoding='utf-8') as f:
    content = f.read()

# ── Extract bundle ────────────────────────────────────────────────────────────
pat = r'("' + UUID + r'":\{"mime":"application/javascript","compressed":true,"data":")([A-Za-z0-9+/=]+)(")'
m = re.search(pat, content)
assert m, "Bundle not found"
b64 = m.group(2)
js = gzip.decompress(base64.b64decode(b64)).decode('utf-8')

# ── Helper: find and replace a full function body ─────────────────────────────
def replace_fn(js, start_sig, next_sig, new_body, label):
    idx_start = js.find(start_sig)
    assert idx_start >= 0, f"{label}: start not found: {repr(start_sig[:60])}"
    idx_end = js.find(next_sig, idx_start)
    assert idx_end >= 0, f"{label}: end marker not found: {repr(next_sig[:60])}"
    old = js[idx_start:idx_end]
    js2 = js[:idx_start] + new_body + js[idx_end:]
    assert js2 != js, f"{label}: no change after replacement"
    print(f"{label}: replaced {len(old)} -> {len(new_body)} chars")
    return js2

# ── Load new component bodies ─────────────────────────────────────────────────
with open('_new_followup.jsx', 'r', encoding='utf-8') as f:
    new_followup = f.read().strip()

with open('_new_contrato.jsx', 'r', encoding='utf-8') as f:
    new_contrato = f.read().strip()

with open('_new_slack.jsx', 'r', encoding='utf-8') as f:
    new_slack = f.read().strip()

# ── Replace each screen ───────────────────────────────────────────────────────
js = replace_fn(js,
    'function FollowupScreen({ setRoute }) {',
    '\nfunction ContratoScreen({ setRoute }) {',
    new_followup + '\n',
    'FollowupScreen')

js = replace_fn(js,
    'function ContratoScreen({ setRoute }) {',
    '\nfunction SlackScreen({ setRoute }) {',
    new_contrato + '\n',
    'ContratoScreen')

js = replace_fn(js,
    'function SlackScreen({ setRoute }) {',
    '\n// ─── Tweaks panel',
    new_slack + '\n',
    'SlackScreen')

# ── Repack bundle ─────────────────────────────────────────────────────────────
new_b64 = base64.b64encode(gzip.compress(js.encode('utf-8'))).decode('ascii')
content2 = content[:m.start(2)] + new_b64 + content[m.end(2):]

# ── Fix .tool-cta CSS: add white-space:nowrap ─────────────────────────────────
# The template CSS is inside the JSON string, so CSS is literal text (with escaped quotes)
# Search for .tool-cta { in the HTML content (inside the template JSON string)
tool_cta_pat = r'(\.tool-cta\s*\{[^}]*?)(overflow:[^;]+;)?([^}]*?\})'
def add_nowrap(match):
    body = match.group(0)
    if 'white-space' not in body:
        # Insert white-space:nowrap before closing brace
        body = body.rstrip('}').rstrip() + ' white-space: nowrap; }'
    return body

content3, n = re.subn(r'\.tool-cta\s*\{[^}]+\}', add_nowrap, content2)
if n:
    print(f".tool-cta CSS patched ({n} occurrence(s))")
else:
    # Fallback: inject override rule near end of first <style> in template
    # Find the template's closing </style> (encoded as /style>)
    style_close = r'</style>'
    sc_idx = content2.find(style_close)
    if sc_idx >= 0:
        override = r'.tool-cta { white-space: nowrap; overflow: visible; }\n'
        content3 = content2[:sc_idx] + override + content2[sc_idx:]
        print(".tool-cta CSS: injected override rule before template </style>")
    else:
        content3 = content2
        print("WARNING: could not fix .tool-cta CSS")

with open(HTML, 'w', encoding='utf-8') as f:
    f.write(content3)

print("Done. All three screens refactored + bundle saved.")
