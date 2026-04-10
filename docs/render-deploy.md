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
- `CLIENT_ORIGIN` — URL publica exata do app com `https://`, ex: `https://agenda-catolica.onrender.com`. Use a mesma URL que os usuarios abrem no navegador. Se o front e a API estao no mesmo host, CORS raramente bloqueia; com origens diferentes, esta variavel deve listar a origem do front.
- `APP_URL` — mesma URL publica para links de recuperacao de senha (ex.: `https://agenda-catolica.onrender.com`)
- `EXPO_PUBLIC_API_URL` pode ficar vazio em producao (usa mesma origem no browser)

## Deploy

1. Conecte o repositorio no Render.
2. Use o `render.yaml` da raiz.
3. O Render criara:
- `agenda-catolica` (web service)
- `agenda-catolica-db` (postgres)

## Push no Git mas o deploy nao aparece no Render

1. **Dashboard do serviço web** → secção **Settings** → **Build & Deploy**:
   - **Branch** tem de ser `main` (ou a branch que você usa).
   - **Auto-Deploy** tem de estar **On** (ou “On commit”).
2. **Repositório ligado:** o serviço precisa mostrar `gfmcosta08/diario_catolico` (ou o repo certo). Se o serviço foi criado só com Docker/manual sem Git, pushes **não** disparam build.
3. **Blueprint:** se usou “Blueprint” pela primeira vez, alterações no código exigem que o serviço web esteja ligado ao mesmo repo. O `render.yaml` inclui `repo`, `branch: main` e `autoDeployTrigger: commit` para deixar isso explícito; após alterar o YAML, no Render abra o **Blueprint** e use **Manual sync** se pedido.
4. **GitHub:** em **Settings → Webhooks** do repositório, deve existir um webhook `api.render.com` com entregas recentes em verde. Se falhar, reinstale a integração GitHub em **Render → Account Settings → GitHub**.
5. **Deploy Hook (à prova de falhas):** no serviço → **Deploy Hook** → crie um URL; em GitHub → **Secrets** → `RENDER_DEPLOY_HOOK_URL`. Pode criar em `.github/workflows/` um YAML que em cada `push` em `main` execute `curl -fsS -X POST "$RENDER_DEPLOY_HOOK_URL"` (o token Git usado no `git push` precisa do scope **`workflow`** no GitHub para alterar ficheiros em `.github/workflows/`; sem isso, crie o workflow pela UI do GitHub ou use um PAT com esse scope).
6. **Deploy manual:** no serviço Render, botão **Manual Deploy** → **Deploy latest commit**.

## Build (render.yaml)

O comando de build compila o servidor dentro de `backend/` (`prisma generate` + `tsc`), volta a raiz e roda `npm run build:web`. Nao use um segundo `cd backend` apos ja estar em `backend/` (isso quebrava o build no Linux).

## Banco e start

- O `startCommand` executa `prisma db push` antes de subir o Node. Sem Postgres acessivel ou com `DATABASE_URL` invalida, o servico nao inicia.
- No plano free, o Postgres pode “dormir”; a primeira requisicao apos inatividade pode demorar ou falhar ate o banco acordar. Verifique os logs se `prisma:push` falhar.

## Teste rapido pos-deploy

1. Abra `https://SEU-APP.onrender.com/api/health` e confirme `{ "ok": true }`.
2. Abra `https://SEU-APP.onrender.com`.
3. Cadastre usuario, faça login, crie ministerio e teste feed/escala.
4. Teste progresso da Biblia e Rosario.

## Diagnostico: cadastro nao funciona

1. **Logs (Render):** Build — confirme que `npx tsc` e `build:web` terminam sem erro. Runtime — procure `Server running on port ... | web=enabled` e erros de `prisma db push`.
2. **Rede (DevTools):** ao cadastrar, veja o `POST .../api/auth/signup`: status HTTP e corpo JSON (`error` em 4xx/5xx).
3. **curl (substitua a URL):**

```bash
curl -s -o /dev/stderr -w "%{http_code}" -X POST "https://SEU-APP.onrender.com/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"teste+1@exemplo.com\",\"password\":\"123456\"}"
```

Esperado: HTTP `201` e JSON com `token` e `user`. `409` = e-mail ja cadastrado; `400` = validacao (email/senha).

4. **Health:**

```bash
curl -s "https://SEU-APP.onrender.com/api/health"
```

## Build local (mesma sequencia do Render)

Na raiz do repositorio:

```bash
npm install && cd backend && npm install && npm run prisma:generate && npx tsc && cd .. && npm run build:web
```

Para subir o servidor localmente (com `DATABASE_URL` apontando para um Postgres valido):

```bash
cd backend && npm run prisma:push && node dist/server.js
```
