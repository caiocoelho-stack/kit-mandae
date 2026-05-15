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
# Insere links inscrição/convidados no card de evento (após responsavel block)
# =========================================================================
OLD = (
    "                    {ev.responsavel && (\n"
    "                      <span style={{padding:'1px 7px',borderRadius:10,\n"
    "                        fontSize:10,fontWeight:500,\n"
    "                        background:'var(--md-coral-tint)',\n"
    "                        color:'var(--md-coral)'}}>\n"
    "                        {ev.responsavel}\n"
    "                      </span>\n"
    "                    )}\n"
    "                  </div>\n"
    "                </div>\n"
    "              );\n"
    "            })}\n"
    "          </div>\n"
    "        )}\n"
)
NEW = (
    "                    {ev.responsavel && (\n"
    "                      <span style={{padding:'1px 7px',borderRadius:10,\n"
    "                        fontSize:10,fontWeight:500,\n"
    "                        background:'var(--md-coral-tint)',\n"
    "                        color:'var(--md-coral)'}}>\n"
    "                        {ev.responsavel}\n"
    "                      </span>\n"
    "                    )}\n"
    "                  </div>\n"
    "                  {(ev.inscricao || ev.convidados) && (\n"
    "                    <div style={{display:'flex',gap:6,marginTop:6}}>\n"
    "                      {ev.inscricao && (\n"
    "                        <a href={ev.inscricao} target=\"_blank\"\n"
    "                          style={{fontSize:10,color:'var(--md-coral)',\n"
    "                            textDecoration:'none',padding:'2px 8px',\n"
    "                            borderRadius:10,border:'1px solid var(--md-coral-soft)',\n"
    "                            background:'var(--md-coral-tint)'}}>\n"
    "                          \U0001f517 Inscrição\n"
    "                        </a>\n"
    "                      )}\n"
    "                      {ev.convidados && (\n"
    "                        <a href={ev.convidados} target=\"_blank\"\n"
    "                          style={{fontSize:10,color:'var(--md-ink-2)',\n"
    "                            textDecoration:'none',padding:'2px 8px',\n"
    "                            borderRadius:10,border:'1px solid var(--md-line)'}}>\n"
    "                          \U0001f465 Convidados\n"
    "                        </a>\n"
    "                      )}\n"
    "                    </div>\n"
    "                  )}\n"
    "                </div>\n"
    "              );\n"
    "            })}\n"
    "          </div>\n"
    "        )}\n"
)
assert OLD in js, "Card closing block não encontrado"
js = js.replace(OLD, NEW, 1)
print("Links inscrição/convidados adicionados ao card de evento")

# Repack
new_b64 = base64.b64encode(gzip.compress(js.encode('utf-8'))).decode('ascii')
content = content[:m.start(2)] + new_b64 + content[m.end(2):]
print("Bundle repacked.")

with open(HTML, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done. index.html salvo.")
