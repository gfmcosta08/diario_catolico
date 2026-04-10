# Importar Texto Biblico Licenciado (Catolico)

Este projeto suporta texto integral para os 365 dias usando uma fonte licenciada.

## Formato do JSON de entrada

```json
{
  "translation": "Bíblia X (Católica Apostólica Romana)",
  "license": "Contrato 2026-04",
  "days": [
    { "day": 1, "body": "Texto completo do dia 1..." },
    { "day": 2, "body": "Texto completo do dia 2..." }
  ]
}
```

Regras:
- `days` deve ter exatamente 365 itens.
- Cada item deve ter `day` entre 1 e 365.
- Cada item deve ter `body` com texto nao vazio.

## Comando

```bash
npm run import:licensed-bible -- ./caminho/arquivo.json
```

## Resultado

O comando sobrescreve:
- `data/readingPlanBodyData.ts`

A tela do dia passa a mostrar o texto integral automaticamente.
