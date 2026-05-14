# Kit Mandaê — Deploy Vercel

App estático (single HTML). Sem build, sem dependências de servidor.

## Como subir no Vercel (3 opções)

### 1. Drag-and-drop (mais fácil, 30 segundos)
1. Abre https://vercel.com/new
2. Login com GitHub/Google (grátis)
3. Arrasta a pasta inteira (`kit-manda-deploy/`) pra área de upload
4. Clica "Deploy"
5. Ganha um link tipo `kit-manda-xxx.vercel.app`

### 2. GitHub + auto-deploy (melhor pra atualizar depois)
1. Cria um repo no GitHub (público ou privado)
2. Sobe esses arquivos
3. Em vercel.com/new → "Import Git Repository" → escolhe o repo
4. Deploy automático
5. Cada `git push` republica

### 3. Vercel CLI
```bash
npm i -g vercel
cd kit-manda-deploy
vercel --prod
```

## Domínio personalizado
No painel do Vercel → Settings → Domains. Funciona com qualquer domínio que você tenha (ex: `kit.suaempresa.com.br`).

## Quando precisar atualizar
- Drag-and-drop: faz tudo de novo, gera novo link.
- GitHub: substitui o `index.html` no repo e dá push.
- CLI: substitui o arquivo e roda `vercel --prod` de novo.

## Limites do plano grátis (Hobby)
- 100 GB de banda/mês — sobra muito pra time interno.
- Deploys ilimitados.
- Não pode usar pra projetos comerciais segundo os termos. Pra ferramenta interna de empresa, considera o plano Pro ($20/mês) pra ficar dentro dos termos de uso.
