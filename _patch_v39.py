import base64, gzip, re, sys
sys.stdout.reconfigure(encoding="utf-8")
with open("index.html","r",encoding="utf-8") as f: c=f.read()
uuid = "54d7da79-68d8-4252-ba50-aa935e750bde"
pat = '"' + uuid + '":{"mime":"application/javascript","compressed":true,"data":"([A-Za-z0-9+/=]+)"}'
m = re.search(pat, c)
js = gzip.decompress(base64.b64decode(m.group(1))).decode("utf-8")
original = js

# 1. NAV slack -> available true
js = re.sub(r'(\{ key: "slack"[^}]*?)available: false', r'\1available: true', js, count=1)
ok1 = bool(re.search(r'key: .slack.[^}]*available: true', js))
print(f"1. NAV slack: {'OK' if ok1 else 'FALHOU'}")

# 2. Reordena cards no bento: move slack (pos 5) para antes do primeiro coming-soon (pos 2)
positions = [m.start() for m in re.finditer(r'tool-card (?:available|coming-soon)', js)]
print(f"2. Cards encontrados: {len(positions)} em {positions}")

if len(positions) >= 6:
    def card_start(i):
        div = js.rfind('<div ', 0, positions[i])
        return js.rfind('\n', 0, div) + 1

    starts = [card_start(i) for i in range(len(positions))]
    starts_sorted = sorted(set(starts))

    def get_card(i):
        s = starts_sorted[i]
        e = starts_sorted[i+1] if i+1 < len(starts_sorted) else len(js)
        return js[s:e]

    n = len(starts_sorted)
    # Ordem atual: 0(inicio),1(eventos),2(coleta),3(contrato),4(followup),5(slack),6(briefing),7(concorrente)
    # Nova ordem:  0(inicio),1(eventos),5(slack),2(coleta),3(contrato),4(followup),6(briefing),7(concorrente)
    nova_ordem = [0,1,5,2,3,4] + list(range(6,n))
    novo_bloco = ''.join(get_card(i) for i in nova_ordem)
    js = js[:starts_sorted[0]] + novo_bloco
    print("3. Cards reordenados: OK")

print(f"\nAlterado: {js != original}")
if js != original:
    comp = base64.b64encode(gzip.compress(js.encode("utf-8"))).decode("ascii")
    new_c = re.sub('"'+uuid+'":{"mime":"application/javascript","compressed":true,"data":"[A-Za-z0-9+/=]+"','"'+uuid+'":{"mime":"application/javascript","compressed":true,"data":"'+comp+'"',c,count=1)
    with open("index.html","w",encoding="utf-8") as f: f.write(new_c)
    print("Salvo!")
