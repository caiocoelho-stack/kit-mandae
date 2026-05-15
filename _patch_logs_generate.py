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

OLD = (
    '  async function generate() {\n'
    '    if (!file) return;\n'
    '    setState("loading");\n'
    '    setApiError(null);\n'
    '    try {\n'
    '      const b64 = await readBase64(file);\n'
    '      const res = await fetch(\'/api/generate\', {\n'
    '        method: \'POST\',\n'
    '        headers: { \'Content-Type\': \'application/json\' },\n'
    '        body: JSON.stringify({ fileBase64: b64, mimeType: file.type || \'application/pdf\', tone, sellerName })\n'
    '      });\n'
    '      const data = await res.json();\n'
    '      if (!res.ok) throw new Error(data.error || \'Erro desconhecido\');\n'
    '      setGeneratedMessage(data.message);\n'
    '      setState("success");\n'
    '    } catch (e) {\n'
    '      setApiError(e.message);\n'
    '      setState("uploaded");\n'
    '    }\n'
    '  }'
)

NEW = (
    '  async function generate() {\n'
    '    if (!file) return;\n'
    '    setState("loading");\n'
    '    setApiError(null);\n'
    '    try {\n'
    '      console.log(\'=== INICIANDO GERAÇÃO ===\');\n'
    '      console.log(\'File:\', file?.name, file?.size);\n'
    '      console.log(\'SellerName:\', sellerName);\n'
    '      console.log(\'Tone:\', tone);\n'
    '      const b64 = await readBase64(file);\n'
    '      console.log(\'Base64 length:\', b64?.length);\n'
    '      const res = await fetch(\'/api/generate\', {\n'
    '        method: \'POST\',\n'
    '        headers: { \'Content-Type\': \'application/json\' },\n'
    '        body: JSON.stringify({ fileBase64: b64, mimeType: file.type || \'application/pdf\', tone, sellerName })\n'
    '      });\n'
    '      console.log(\'Response status:\', res.status);\n'
    '      const data = await res.json();\n'
    '      console.log(\'Response data:\', data);\n'
    '      console.log(\'Message:\', data?.message);\n'
    '      if (!data?.message) throw new Error(\'Campo message ausente: \' + JSON.stringify(data));\n'
    '      if (!res.ok) throw new Error(data.error || \'Erro desconhecido\');\n'
    '      setGeneratedMessage(data.message);\n'
    '      setState("success");\n'
    '    } catch (e) {\n'
    '      console.error(\'=== ERRO GERAÇÃO ===\', e);\n'
    '      setApiError(e.message);\n'
    '      setState("uploaded");\n'
    '    }\n'
    '  }'
)

assert OLD in js, "generate() function not found in bundle"
js = js.replace(OLD, NEW, 1)
print("Logs adicionados ao generate()")

new_b64 = base64.b64encode(gzip.compress(js.encode('utf-8'))).decode('ascii')
content = content[:m.start(2)] + new_b64 + content[m.end(2):]

with open(HTML, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done. index.html salvo.")
