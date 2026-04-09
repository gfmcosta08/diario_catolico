# Deploy no Render (Servico Unico + Postgres)

## Estrutura

- Frontend e backend no mesmo `web service` Render
- Backend: `backend/` (Node + Express + Prisma)
- Frontend: raiz Expo Web (gerado em `dist/`)
- Banco: Render Postgres

## Como funciona

1. O build gera o frontend web (`dist/`).
2. O backend sobe e serve:
- API em `/api/*`
- App web nas demais rotas (`index.html`)

## Variaveis principais

- `DATABASE_URL` (Render Postgres)
- `JWT_SECRET`
- `CLIENT_ORIGIN` (URL publica do app, ex: `https://agenda-catolica.onrender.com`)
- `APP_URL` (mesma URL publica para links de reset)
- `EXPO_PUBLIC_API_URL` pode ficar vazio em producao (usa mesma origem)

## Deploy

1. Conecte o repositorio no Render.
2. Use o `render.yaml` da raiz.
3. O Render criara:
- `agenda-catolica` (web service)
- `agenda-catolica-db` (postgres)

## Teste rapido pos-deploy

1. Abra `https://SEU-APP.onrender.com/api/health` e confirme `{ "ok": true }`.
2. Abra `https://SEU-APP.onrender.com`.
3. Cadastre usuario, faça login, crie ministerio e teste feed/escala.
4. Teste progresso da Biblia e Rosario.
