import base64, gzip, re, sys
sys.stdout.reconfigure(encoding="utf-8")

HTML = "index.html"
UUID = "54d7da79-68d8-4252-ba50-aa935e750bde"

with open(HTML, "r", encoding="utf-8") as f:
    content = f.read()

pat = r"(\"" + UUID + r"\":\{\"mime\":\"application/javascript\",\"compressed\":true,\"data\":\")" + r"([A-Za-z0-9+/=]+)(\")"
m = re.search(pat, content)
assert m, "Bundle not found"
js = gzip.decompress(base64.b64decode(m.group(2))).decode("utf-8")
original = js

# 1. Remove "featured" class do card Boas-vindas
js = js.replace(
    'className="tool-card featured available" onClick={() => setRoute("inicio")}',
    'className="tool-card available" onClick={() => setRoute("inicio")}',
    1
)

# 2. Remove bloco featured-stat
js = re.sub(r'\s*<div className="featured-stat">[\s\S]*?</div>', '', js, count=1)

# 3. Remove span-2 do Auxiliar de Contrato
js = js.replace(
    'className="tool-card available span-2" onClick={() => setRoute("contrato")}',
    'className="tool-card available" onClick={() => setRoute("contrato")}',
    1
)

# 4. Adiciona badge IA nas ferramentas que usam IA
IA_BADGE = '<span className="badge ia">✦ IA</span>'
DISPONIVEL = '<span className="badge available">Disponível</span>'

def add_ia_badge(code, route):
    idx = code.find(f'setRoute("{route}")')
    if idx == -1:
        print(f"  [skip] rota nao encontrada: {route}")
        return code
    badge_idx = code.find(DISPONIVEL, idx)
    if badge_idx == -1:
        print(f"  [skip] badge nao encontrado para: {route}")
        return code
    ins = badge_idx + len(DISPONIVEL)
    return code[:ins] + IA_BADGE + code[ins:]

for rota in ["contrato", "followup", "slack", "concorrente", "briefing", "reuniao"]:
    js = add_ia_badge(js, rota)

# 5. Atualiza subtitulo da home
js = js.replace(
    "Suas ferramentas internas em um lugar só. Comece pelo Boas-vindas ao Cliente para gerar a mensagem de boas-vindas do próximo cliente.",
    "Suas ferramentas internas em um lugar só. Acelere seu ciclo comercial com automações e IA do time Mandaê / Nuvem Envio.",
    1
)

assert js != original, "ERRO: nenhuma alteracao aplicada"
print(f"OK — {js.count(IA_BADGE)} badges IA inseridos, featured removido, span-2 removido")

# Recomprime e salva
compressed = base64.b64encode(gzip.compress(js.encode("utf-8"))).decode("ascii")
new_content = content[:m.start(2)] + compressed + content[m.end(2):]

# Injeta CSS do badge IA antes de </head>
ia_css = '<style>.badge.ia{background:rgba(147,112,219,.13);color:#9370db;font-size:10px;padding:2px 7px;border-radius:99px;margin-left:4px;font-weight:600;letter-spacing:.3px}</style>'
new_content = new_content.replace("</head>", ia_css + "</head>", 1)

with open(HTML, "w", encoding="utf-8") as f:
    f.write(new_content)

print("index.html salvo com sucesso!")
