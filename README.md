# Kit Mandaê — Hub de Vendas

App interno de vendas (Mandaê / Nuvem Envio), em React + Vite, com funções serverless (`api/`) deployadas no Vercel.

## Desenvolvimento local

```bash
npm install
npm i -g vercel   # se ainda não tiver
vercel dev        # serve o frontend (Vite) + as functions em api/ juntos
```

Sem as env vars corretas (veja `.env.example`), as ferramentas que dependem de IA/Jira/KV não funcionam, mas a navegação e o layout funcionam normalmente.

Para rodar só o frontend (sem as functions), `npm run dev` também funciona, mas chamadas a `/api/*` vão falhar.

## Estrutura

```
src/
  main.jsx              ponto de entrada
  App.jsx               shell + roteamento por estado (sem router de URL)
  nav.js                itens do menu lateral
  icons.jsx             ícones (Nimbus design system + marca Mandaê)
  components/           Sidebar, Topbar, QuickLinks, widgets da home
  screens/               uma tela por ferramenta
  styles/global.css     design tokens (Nimbus) + estilos globais
api/                    funções serverless do Vercel (Jira, Slack, IA, eventos...)
public/fonts/            Geist / Geist Mono self-hosted
```

## Deploy

Push numa branch → PR → merge na `main` → Vercel builda (`vite build`) e publica automaticamente. Sem passos manuais.

## Variáveis de ambiente

Ver `.env.example`. Configuradas no dashboard do Vercel (Settings → Environment Variables), não neste repo.
