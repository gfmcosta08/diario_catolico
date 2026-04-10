# Modo Gratuito (Catolico, Dominio Publico)

Existe um gerador de base publica para estudos internos, mas ele usa OCR historico e pode ter erros.

Fonte:
- https://archive.org/details/bibliasagradacon00figu

## Comando do gerador

```bash
npm run generate:public-domain
```

## Regra de fidelidade ativa no app

Para garantir fidelidade da Biblia Catolica Apostolica Romana, o app esta em modo estrito:
- exibe texto integral somente de fonte oficial/licenciada
- nao exibe texto OCR como texto biblico oficial

Ou seja, sem licenca oficial, a tela mostra apenas as referencias do dia.
