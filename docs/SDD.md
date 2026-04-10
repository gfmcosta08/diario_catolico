# SDD - Software Design Document

Data: 2026-04-09  
Stack principal: Expo/React Native + Supabase (PostgreSQL, Auth, Storage, RPC, RLS) + Web (Vercel)

## 1. Arquitetura Geral

- Frontend: Expo Router (mobile + web export).
- Backend: Supabase (sem backend Node dedicado).
- Modelo de tenancy: banco compartilhado com isolamento por `ministry_id` e RLS.

Fluxo macro:
- Cliente autenticado -> Supabase Auth
- Cliente -> tabelas com RLS
- Cliente -> RPCs para operações sensíveis (aprovação, papéis, etc.)

## 2. Componentes

## 2.1 Auth e Perfil

- Sessão via Supabase Auth.
- Perfil de aplicação em tabela de perfis.
- Atenção a alinhamento de scheme de deep link (`leiabiblia365`).

## 2.2 Domínio Bíblia 365

- `readingPlanData.ts`: referências canônicas do plano.
- `readingPlan.ts`: agregador de dados + regra de fidelidade.
- `readingPlanBodyData.ts`: fonte oficial/licenciada (quando disponível).
- `readingPlanPublicDomainData.ts`: base pública auxiliar (não exibida em modo estrito).

Regra crítica:
- `STRICT_FIDELITY_MODE = true`
- Exibição de texto integral apenas se `bodySource = licensed`.

## 2.3 Domínio Ministérios

- Tabelas principais da migração 002:
  - ministérios,
  - memberships,
  - join requests,
  - posts,
  - eventos,
  - posições/cargos,
  - assignments.
- RPCs para transições de estado com controle de papel.

## 2.4 Feed

- Modelo atual: leitura por ministério em banco relacional com RLS.
- Evolução recomendada: cache de timeline e paginação por cursor para cargas altas.

## 2.5 Escalas

- Eventos com data/hora.
- Vagas por cargo/capacidade.
- Ocupação de vaga por usuário.
- Evolução: lock transacional e verificação cross-ministry de conflito temporal.

## 3. Segurança

- RLS obrigatório em tabelas multi-tenant.
- `service_role` proibido no cliente.
- Operações privilegiadas encapsuladas em RPCs.
- Hardening pendente:
  - reduzir exposição de perfis,
  - revisar campos públicos de ministério,
  - fortalecer políticas de moderação.

## 4. Privacidade e Compliance

- Base legal e transparência para dados de membros e escalas.
- Registro explícito de origem/licença para textos bíblicos integrais.
- Não incorporar tradução protegida sem contrato.

## 5. Deploy e Ambientes

- Build web: `npm run build:web` (Expo export para `dist`).
- Hospedagem web: Vercel com rewrite SPA.
- Variáveis essenciais:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  - `EXPO_PUBLIC_SITE_URL`

## 6. Qualidade e Observabilidade

- Gate mínimo de CI local:
  - `npx tsc --noEmit`
  - `npm run check:reading-plan`
- Recomendações:
  - testes E2E dos fluxos de ministério,
  - logging estruturado de falhas de RPC,
  - monitoramento de erro em produção.

## 7. Riscos Técnicos

1. Esquemas de deep link divergentes em fluxos de auth.
2. Política RLS permissiva em entidades de perfil/publicação.
3. Corridas de concorrência em ocupação de vagas sem lock robusto.
4. Escala de feed sob alto volume sem camada de cache dedicada.

## 8. Decisões Atuais

- Priorizar confiabilidade e compliance do conteúdo bíblico sobre volume de texto exibido.
- Manter arquitetura Supabase-first para simplicidade operacional.
- Evoluir gradualmente para padrões de alta concorrência no feed/escalas conforme adoção.

## 9. Plano de Evolução Arquitetural

## Curto prazo

- Corrigir scheme/reset auth.
- Endurecer RLS de perfis e views públicas.
- Completar moderação de feed (editar/remover por papel).

## Médio prazo

- Implementar prevenção de conflito cross-ministry.
- Introduzir paginação por cursor e cache de feed.
- Notificações transacionais de escala.

## Longo prazo

- Motor de sincronização áudio-texto robusto.
- Integrações litúrgicas e camadas de recomendação.
- Preparação para multi-paróquia em escala diocesana.
