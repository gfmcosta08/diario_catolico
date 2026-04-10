# Backlog Priorizado - MVP -> V2

Data: 2026-04-09

## Legenda

- P0: crítico
- P1: alto
- P2: médio

## Sprint 0 - Segurança e Correções Base (P0)

1. Alinhar deep links de reset de senha (`agendacatolica` -> `leiabiblia365`).  
Critério: fluxo de reset fecha ciclo completo em mobile/web.

2. Revisar políticas RLS de `profiles` para reduzir enumeração ampla.  
Critério: leitura de perfil fora de contexto autorizado retorna vazio/erro.

3. Revisar exposição pública de `ministries` (ocultar `created_by` em visão pública).  
Critério: endpoint/tabela pública não expõe UUID sensível.

4. Bloquear fallback inseguro de env em produção.  
Critério: app falha de forma explícita quando variáveis obrigatórias estão ausentes.

## Sprint 1 - Operação de Ministérios (P0/P1)

1. Aplicar e validar `002_ministries.sql` em staging.  
Critério: smoke test completo de criar, pedir entrada, aprovar, postar e escalar.

2. Completar moderação de feed (editar/remover post por autor/admin).  
Critério: regras de permissão e auditoria básica funcionando.

3. Melhorar concorrência em ocupação de vagas (locks/transação).  
Critério: não há overbooking sob cliques simultâneos.

4. Notificação interna para novas vagas e mudanças de escala.  
Critério: membros elegíveis recebem alerta no app.

## Sprint 2 - Retenção e Experiência (P1)

1. Painel de engajamento (streak oração + participação em escalas).  
Critério: métricas por usuário visíveis no perfil.

2. Fluxo de pedidos de oração no feed (“Rezei por isso”).  
Critério: reação específica e contador por post.

3. Calendário de escalas com filtros por cargo/membro.  
Critério: navegação mensal sem perda de desempenho.

4. UX da Bíblia 365 com CTA de fonte oficial/licenciada.  
Critério: usuário entende claramente estado do conteúdo integral.

## Sprint 3 - Conteúdo Bíblico e Compliance (P0/P1)

1. Pipeline final para importação de conteúdo licenciado (JSON 365 dias).  
Critério: `import:licensed-bible` preenche 365 dias e registra metadados de licença.

2. Tela de transparência de fonte/licença no app.  
Critério: origem, licença e data de importação disponíveis ao usuário.

3. Política de governança de conteúdo (versionamento e rollback).  
Critério: troca de versão sem quebra e com rastreabilidade.

## Sprint 4 - Escala Avançada (P1/P2)

1. Prevenção automática de conflito cross-ministry (janela temporal configurável).  
Critério: bloqueio de dupla alocação em eventos sobrepostos.

2. Templates avançados de escala (duplicação semanal/mensal).  
Critério: coordenador cria mês inteiro com poucos cliques.

3. Relatórios de cobertura de vagas por ministério.  
Critério: visão de capacidade vs ocupação por período.

## Sprint 5 - Plataforma e Performance (P2)

1. Feed com paginação por cursor e otimizações de leitura.  
Critério: rolagem fluida em cenários de alta densidade.

2. Cabeçalhos de segurança web (CSP e correlatos) em produção.  
Critério: scanner básico sem alertas críticos.

3. Observabilidade mínima (erros de RPC, falhas de build, auth redirects).  
Critério: dashboards e logs acionáveis para suporte.

## Backlog de Pesquisa (Discovery)

1. Integração WhatsApp para alertas transacionais.
2. Integração liturgia diária e fontes oficiais externas.
3. Motor de sincronização áudio-texto por timestamp para Rosário/Bíblia.
4. Estratégia B2B2C comercial por paróquia/diocese.
