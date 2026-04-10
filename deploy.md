# Deploy — Agenda Católica (`agenda-catolica`)

**Leitura obrigatória:** sempre que for pedido “deploy”, ler este arquivo antes de executar comandos. Não assumir outro destino sem confirmação explícita do usuário.

---

## Onde o código é publicado (fonte da verdade)

| Artefacto | Destino |
|-----------|---------|
| **Repositório Git (código-fonte)** | **https://github.com/gfmcosta08/diario_catolico** |
| **Ramo predefinido** | `main` |
| **Pasta do projeto no disco (workspace típico)** | `d:\opencode\Agenda Catolica\agenda-catolica` |

O “deploy” por defeito neste projeto significa: **commit + push para `origin/main` no repositório acima**. Não existe outro alvo de Git configurado no âmbito deste documento.

---

## Pré-requisitos antes de push

1. **Não commitar** o arquivo `.env` (está no `.gitignore`). Variáveis: ver `.env.example`.
2. **Supabase:** migrações em `supabase/migrations/`; aplicar no projeto Supabase ligado às mesmas URLs/keys do ambiente de produção quando relevante.
3. **Áudio em segundo plano:** builds nativos (`expo prebuild` / EAS); não dependem do push para o GitHub em si.

---

## Fluxo padrão de deploy (código → GitHub)

Executar na pasta **`agenda-catolica`**:

```powershell
cd "d:\opencode\Agenda Catolica\agenda-catolica"
git status
git add -A
git commit -m "descreva a alteração em português claro"
git push origin main
```

Se `origin` não apontar para o repositório canónico:

```powershell
git remote -v
git remote set-url origin https://github.com/gfmcosta08/diario_catolico.git
```

---

## Outros tipos de “deploy” (não são o Git por defeito)

Só estes passos se o usuário pedir explicitamente **lojas**, **web estática** ou **EAS**:

| Objetivo | Onde fica o resultado | Notas |
|----------|------------------------|--------|
| **App Android/iOS (binários)** | Contas Google Play / Apple App Store via **EAS Build** | Configurar `eas.json`, conta Expo, credenciais das lojas. |
| **Web estática** | Pasta `dist/` após `npx expo export --platform web` | Alojar `dist/` num serviço à escolha (ex.: páginas estáticas); não definido neste repo até ser escolhido um host. |

Para estes casos, **perguntar ao usuário** o alvo exato (ex.: “EAS production”, “GitHub Pages”, “Vercel”) se não estiver escrito no pedido.

---

## Resumo para quem automatiza (ex.: agente de IA)

1. Ler **este arquivo** (`deploy.md`).
2. Tratar **GitHub `gfmcosta08/diario_catolico`**, ramo **`main`**, como destino padrão de “deploy”.
3. Trabalhar a partir de **`agenda-catolica`** (ou confirmar o caminho actual do clone).
4. Não sobrescrever `.env` sem confirmação do usuário.
5. Deploy de lojas/web só com pedido explícito e destino definido.

---

*Última atualização: alinhado ao repositório remoto `diario_catolico` e estrutura Expo do projeto `agenda-catolica`.*
