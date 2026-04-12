# Continuidade do Projeto

Data de atualização: 2026-04-05

## Resumo Executivo

O projeto **Leia a Bíblia em 365 dias** (Expo + Supabase) evoluiu com foco em estabilidade, UX do plano bíblico, **fidelidade do texto bíblico** (modo estrito), e passou a incluir um **módulo social de Ministérios** (convites, pedidos de entrada, fórum com respostas e escalas com calendário mensal), com **backend Supabase** e **frontend web preparado para Vercel**.

Decisões relevantes registradas nesta continuidade:
- Texto integral da Bíblia no app continua condicionado a **fonte licenciada** (`STRICT_FIDELITY_MODE = true`), salvo mudança futura de produto (ex.: links externos ou domínio público com aviso explícito).
- Sem contrato de tradução, **não** há caminho juridicamente seguro para publicar texto integral de uma Bíblia católica moderna dentro do binário; alternativas seguras foram mapeadas em planejamento (links externos com revisão de ToS, ou PD com transparência, ou licença futura).

## Entregas Concluídas (histórico base)

1. Base do plano bíblico consolidada (365 dias, referências, clamp `1..365`).
2. Branding “Leia a Bíblia em 365 dias”; `scheme` atual do app: `leiabiblia365`.
3. UX do plano: percentual, meta semanal, filtros na lista de dias.
4. `scripts/check-reading-plan.js` e validações do plano.
5. Pipeline texto licenciado: `readingPlanBodyData.ts`, `import-licensed-bible`, `docs/licensed-bible-import.md`.
6. Pipeline domínio público (apoio técnico / OCR): `generate-public-domain-bible.py`, `docs/public-domain-mode.md`.
7. `STRICT_FIDELITY_MODE = true` em `data/readingPlan.ts`; tela `bible/[day].tsx` transparente sobre presença ou ausência de texto integral.

## Entregas Concluídas (sessão recente)

### Ministérios (Supabase + app)

- Migração SQL: [`supabase/migrations/002_ministries.sql`](supabase/migrations/002_ministries.sql) — perfis, ministérios, membros, pedidos de entrada, posts (fórum), eventos, cargos, atribuições, RLS, RPCs `approve_ministry_join_request`, `reject_ministry_join_request`, `grant_ministry_member_role`, triggers (dono ao criar ministério, vagas na escala, validação de `parent_id` no fórum).
- Telas e rotas:
  - Configurações: [`app/(app)/settings.tsx`](app/(app)/settings.tsx) — ID do usuário, perfil, criar ministério, lista.
  - Pública: [`app/m/[slug].tsx`](app/m/[slug].tsx) + [`app/m/_layout.tsx`](app/m/_layout.tsx); registro do grupo `m` em [`app/_layout.tsx`](app/_layout.tsx).
  - Área membro: [`app/(app)/ministry/[ministryId]/index.tsx`](app/(app)/ministry/[ministryId]/index.tsx) — abas Sobre, Fórum, Escalas.
  - Componentes em [`components/ministry/`](components/ministry/) (calendário mensal, abas).
- Convites: [`lib/ministryInvite.ts`](lib/ministryInvite.ts), `expo-clipboard`; URL web via `EXPO_PUBLIC_SITE_URL` + deep link `leiabiblia365://m/{slug}`.
- Helpers: [`lib/siteUrl.ts`](lib/siteUrl.ts), [`lib/slug.ts`](lib/slug.ts), [`lib/ministryCreate.ts`](lib/ministryCreate.ts).
- Início: card para Configurações em [`app/(app)/index.tsx`](app/(app)/index.tsx) (usuário logado).

### Deploy web (Vercel)

- [`vercel.json`](vercel.json): `npm run build:web` → `expo export -p web` → pasta `dist`, rewrites SPA para rotas como `/m/...`.
- Script [`package.json`](package.json): `build:web`.
- [`.env.example`](.env.example): variáveis Supabase + `EXPO_PUBLIC_SITE_URL`.

### Qualidade

- `npx tsc --noEmit` validado após as mudanças do módulo ministérios.
- `npm run build:web` (export) validado; atenção: evitar BOM UTF-8 em `package.json` (quebra o parser do Expo).

## Principais Arquivos (referência rápida)

| Área | Arquivos |
|------|----------|
| Bíblia 365 | `data/readingPlan.ts`, `data/readingPlanData.ts`, `data/readingPlanBodyData.ts`, `app/(app)/bible/*` |
| Ministérios | `supabase/migrations/002_ministries.sql`, `app/m/*`, `app/(app)/settings.tsx`, `app/(app)/ministry/*`, `components/ministry/*` |
| Auth / Supabase | `context/AuthContext.tsx`, `lib/supabase.ts` |
| Deploy | `vercel.json`, `package.json` (`build:web`) |

## Revisão SaaS (recomendações registradas, não necessariamente implementadas)

Itens levantados em auditoria para endurecimento futuro:

1. **Privacidade:** política `profiles` com `SELECT` amplo para qualquer usuário autenticado permite enumerar perfis; considerar restringir leitura ou expor nomes só no contexto de ministério (view/RPC).
2. **Dados públicos:** `ministries` legíveis por `anon` expõem `created_by`; considerar view pública sem UUID do criador.
3. **Auth:** `resetPasswordForEmail` usa `redirectTo` com scheme `agendacatolica://` enquanto `app.json` usa `leiabiblia365` — alinhar e conferir URLs no painel Supabase.
4. **Produção:** evitar fallback para URL/chave placeholder em `lib/supabase.ts` quando env ausente (falhar build ou bloquear app).
5. **Vercel:** avaliar headers de segurança (CSP, etc.) e `EXPO_PUBLIC_SITE_URL` por ambiente (preview vs produção).
6. **Fórum:** hoje não há DELETE/UPDATE de posts para autor ou admin (moderação).

## Pendências Atuais

1. **Bíblia 365 — texto integral:** `READING_PLAN_BODY_DATA` segue vazio até haver JSON licenciado **ou** decisão de produto alternativa (links externos com revisão de ToS; ou texto em domínio público com aviso honesto; ou parceria/licença futura).
2. **Supabase:** aplicar `002_ministries.sql` no projeto (SQL Editor ou CLI) se ainda não aplicado; revisar triggers em `auth.users` por conflito com templates existentes.
3. **Vercel:** configurar projeto com root `agenda-catolica`, variáveis de ambiente e domínio final de `EXPO_PUBLIC_SITE_URL`.
4. **Correções recomendadas:** (Resolvido: scheme corrigido para leiabiblia365) endurecimento RLS/views conforme tabela acima (priorizar conforme risco).

## Sugestões para a Próxima Interação

1. **Escolher rumo legal para a Bíblia:** confirmar se a prioridade é (A) referências + “Ler online” com URLs aprovadas juridicamente, (B) texto só em domínio público com disclaimers, ou (C) obtenção de licença + `import:licensed-bible` — isso destrava implementação e cópia na UI.
2. **Aplicar e testar a migração 002** em um projeto Supabase de staging: smoke test de criar ministério, pedido, aprovar, post, evento e vaga.
3. **Corrigir alinhamento** `agendacatolica` vs `leiabiblia365` no fluxo de recuperação de senha e na documentação de deep links.
4. **Implementar melhorias de privacidade** (perfis / landing de ministério) se o app for público além de um círculo fechado.
5. **Metadados de loja** e checklist de release (ícones, política de privacidade, menção a dados de terceiros se usar links externos).

## Próxima Ação Recomendada (condicional)

- **Se houver licença e arquivo JSON:** `npm run import:licensed-bible -- ./arquivo.json` e atualizar `LICENSED_BIBLE_SOURCE` em `readingPlanBodyData.ts`.
- **Se não houver licença:** priorizar desenho de UX “Ler online” ou documento jurídico mínimo antes de armazenar qualquer tradução integral no app.
