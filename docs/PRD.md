# PRD - Plataforma SaaS Católica Integrada

Data: 2026-04-09  
Produto: Leia a Bíblia em 365 dias + Ministérios

## 1. Visão do Produto

Plataforma SaaS híbrida (B2B2C) para comunidade católica que unifica:
- devoção pessoal (Rosário, Bíblia 365),
- operação comunitária (ministérios, feed, escalas),
- coordenação pastoral com governança de acesso.

## 2. Problema

Paróquias e ministérios sofrem com:
- escalas em planilhas frágeis,
- comunicação dispersa em múltiplos canais,
- baixa confirmação de presença,
- dificuldade de retenção do fiel em ferramentas exclusivamente administrativas.

Fiéis sofrem com:
- falta de continuidade de oração/leituras,
- ausência de vínculo entre serviço ministerial e vida espiritual diária.

## 3. Objetivos

1. Centralizar gestão ministerial em ambiente controlado.
2. Aumentar retenção diária com práticas espirituais no mesmo app.
3. Reduzir conflitos de escala e faltas operacionais.
4. Preservar fidelidade doutrinal e jurídica no texto bíblico integral.

## 4. Não Objetivos (nesta fase)

- ERP paroquial completo (financeiro/contábil/cúria).
- marketplace externo de conteúdo sem curadoria.
- publicação de tradução bíblica moderna sem licença.

## 5. Perfis de Usuário

- Coordenador de ministério.
- Membro voluntário.
- Fiel devocional (sem vínculo ministerial inicial).

## 6. Escopo Funcional

## 6.1 Identidade e Acesso

- Cadastro/login com Supabase Auth.
- Perfil único global (CatholicID conceitual no domínio da aplicação).
- Recuperação de senha e gestão de sessão.

## 6.2 Bíblia 365

- Plano diário com referências estruturadas.
- Progresso persistente por usuário.
- Regra de fidelidade ativa:
  - texto integral somente se fonte oficial/licenciada.
  - sem licença: exibir referências e orientação de leitura.

## 6.3 Rosário

- Fluxo diário e completo com progresso.
- Base preparada para sincronização áudio-texto por timestamp.

## 6.4 Ministérios

- Criação de ministério por usuário autenticado.
- Convite por link/slug.
- Pedido de entrada, aprovação/rejeição por coordenação.
- Papéis: admin/coordenador/membro/pendente.

## 6.5 Feed interno (microblogging privado)

- Postagens por ministério.
- Respostas em thread.
- Prioridade cronológica.
- Política para evolução de moderação (edição/remoção).

## 6.6 Escalas

- Eventos por data/horário.
- Cargos e capacidade por evento.
- Ocupação e desocupação de vaga.
- Base para notificações operacionais.

## 7. Requisitos Não Funcionais

- Segurança por RLS em todas as tabelas de domínio.
- Escalabilidade em arquitetura multi-tenant lógica (shared schema + isolamento por políticas).
- Observabilidade mínima para erros críticos.
- Build web para Vercel e build mobile com Expo.

## 8. Métricas de Sucesso

- WAU/MAU dos membros de ministério.
- Taxa de confirmação/ocupação de vagas.
- Redução de vagas em aberto próximas ao evento.
- Streak médio de uso devocional.
- Retenção D30 de usuários com ministério ativo.

## 9. Restrições Legais e de Conteúdo

- Não publicar texto integral de tradução protegida sem licença.
- Manter trilha de fonte/licença para qualquer conteúdo importado.
- Exibir transparência de origem no app.

## 10. Roadmap de Produto

## Fase MVP

- Bíblia 365 (referências + progresso).
- Módulo ministérios com ingresso e escalas.
- Feed básico por ministério.
- Deploy web + mobile.

## Fase V1

- Moderação de feed.
- Notificações transacionais de escala.
- Hardening de privacidade/RLS.
- Correção completa de fluxos de reset/deep link.

## Fase V2

- Prevenção automática de conflito cross-ministry.
- Gamificação de serviço e devoção.
- Sincronização avançada áudio-texto (karaokê espiritual).
- Integrações litúrgicas externas com governança.

## 11. Critérios de Aceite (alto nível)

1. Usuário cria/entra em ministério com aprovação e acesso isolado.
2. Coordenador cria evento e vagas; membro ocupa/desocupa vaga com consistência.
3. Feed mostra apenas conteúdo do ministério autorizado.
4. Bíblia 365 mantém progresso e respeita modo de fidelidade estrita.
5. Sistema compila e executa com build web e typecheck sem erro.
