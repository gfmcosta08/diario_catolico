# Continuidade do Projeto

Data de atualização: 2026-04-13

## Atualização de Hoje (2026-04-12)

### Resumo cronológico das entregas

1. Base visual e fluxo inicial do app foram estabilizados ao longo do dia, com ajustes de UI, navegação e deploys incrementais.

2. Estabilização Render + auth/base do app:
- `121a6ec` - fallback de demonstração para login/cadastro quando backend retorna 404.
- `8d009bf` - fallback adicional de DEMO_MODE para signup/login quando backend está indisponível.

3. Escalas por ministério reestruturadas:
- `2369475` - criação de evento com cargos dinâmicos em fluxo único.
- `b6f8106` - correção de crash ao abrir dia com eventos na agenda do ministério.

4. Exclusões owner-only:
- `36eec22` - exclusão de evento restrita ao owner e exclusão de ministério movida para a tela de detalhe do ministério.

5. Comunidade por ministério + timeline paginada:
- `63b0fe7` - seleção de comunidade por ministério e feed paginado por comunidade.

6. Correções de tradução/encoding:
- `301c459` - estabilização de idioma PT-BR no web + limpeza de erros TS.
- `fd44266` - remoção de textos com mojibake na comunidade/feed.

7. Perfil completo com identidade pública:
- `28894c3` - perfil expandido com identidade pública completa (displayName, username, contato e paróquias).

## Estado atual de produção

- Push realizado em `main` com deploy automático no Render (fluxo ativo).
- Health-check validado em produção:
  - `GET /api/health` -> `{"ok":true}` (validado em 2026-04-13).
- Observação operacional:
  - após deploy, o frontend pode levar alguns minutos para refletir integralmente cache/CDN, mesmo com backend já saudável.

## Decisões de produto consolidadas

- `displayName` é o nome público principal (Home, ministérios e comunidade).
- `username` é único global e tem cooldown de 30 dias para alteração.
- Convites permanecem por link nesta fase; base para fluxo por ID ficou preparada.
- Comunidade é mapeada em relação 1:1 com ministérios do usuário.

## Próximas 3 melhorias sugeridas

1. Convite por CatholicID com autocomplete e validação em tempo real.
2. Normalização definitiva de encoding/i18n (UTF-8 ponta a ponta + limpeza dos textos mojibake remanescentes).
3. Observabilidade de produção com logs estruturados por rotas críticas (`auth`, `profile`, `feed`, `escala`).

## Validação desta consolidação

- Existe apenas um arquivo de continuidade no repositório:
  - `D:\opencode\Agenda Catolica\agenda-catolica\continuidade.md`
- Commits citados acima conferem com o `git log` de 2026-04-12.
- Documento mantido em PT-BR, sem caracteres corrompidos.
- Seção de melhorias contém exatamente 3 itens acionáveis.
