# QA Automation — ServeRest

<!-- Troque MuriloAlves1 pelo seu usuário do GitHub após publicar o repositório -->

[![CI](https://github.com/MuriloAlves1/qa-automation-serverest/actions/workflows/ci.yml/badge.svg)](https://github.com/MuriloAlves1/qa-automation-serverest/actions/workflows/ci.yml)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-FE5196?logo=conventionalcommits&logoColor=white)

Framework de automação de testes **API + UI** para a aplicação [ServeRest](https://serverest.dev), com **Playwright + TypeScript**, validação de contrato e pipeline de **CI/CD no GitHub Actions**.

> Projeto desenvolvido como parte do meu PDI (Plano de Desenvolvimento Individual) em Qualidade de Software. Veja o [roadmap](docs/pdi-roadmap.md) e a [estratégia de testes](docs/test-strategy.md).

## ✨ Destaques

- **Validação de contrato** com schemas estritos (Zod) e matcher customizado `expect(body).toMatchSchema(schema)`
- **Ambiente isolado:** o ServeRest sobe localmente de forma automática, sem depender de ambiente compartilhado
- **Dados dinâmicos** com factories (Faker) e **teardown automático** via fixtures. Testes 100% independentes e paralelizáveis
- **Arquitetura em camadas:** clients de API → fixtures → testes (os testes não montam HTTP "na mão")
- **Quality gates:** ESLint com regras do Playwright (proíbe `test.only` e `waitForTimeout`), Prettier, typecheck estrito, Husky e Commitlint
- **CI/CD:** lint → typecheck → testes, com relatório HTML e JUnit como artefatos

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│ tests/api/*.spec.ts   → cenários (o QUÊ testar)          │
├─────────────────────────────────────────────────────────┤
│ src/fixtures          → injeção de clients, usuários     │
│                         autenticados, teardown, matchers │
├──────────────────┬──────────────────┬───────────────────┤
│ src/api          │ src/factories    │ src/schemas       │
│ clients por      │ massa de dados   │ contratos (Zod)   │
│ recurso (COMO)   │ dinâmica         │                   │
├──────────────────┴──────────────────┴───────────────────┤
│ src/config/env.ts → variáveis de ambiente validadas     │
└─────────────────────────────────────────────────────────┘
```

```
.
├── .github/
│   ├── workflows/ci.yml          # Pipeline de CI
│   └── pull_request_template.md  # Checklist de qualidade para PRs
├── docs/
│   ├── test-strategy.md          # Estratégia de testes
│   └── pdi-roadmap.md            # Roadmap e evidências do PDI
├── src/
│   ├── api/                      # Clients HTTP (BaseClient + 1 por recurso)
│   ├── config/                   # Configuração de ambiente
│   ├── factories/                # Geradores de dados de teste
│   ├── fixtures/                 # Fixtures do Playwright + matchers customizados
│   └── schemas/                  # Contratos da API (Zod)
├── tests/
│   └── api/                      # Testes de API
└── playwright.config.ts
```

## 🚀 Como executar

**Pré-requisito:** Node.js 20.19+

```bash
npm ci
npx playwright test
```

Pronto. O ServeRest local sobe e desce automaticamente.

| Comando                   | Descrição                                 |
| ------------------------- | ----------------------------------------- |
| `npm test`                | Executa toda a suíte                      |
| `npm run test:api`        | Apenas testes de API                      |
| `npm run test:smoke`      | Apenas testes críticos (`@smoke`)         |
| `npm run test:regression` | Regressão completa (`@regression`)        |
| `npm run report`          | Abre o último relatório HTML              |
| `npm run lint`            | Análise estática                          |
| `npm run typecheck`       | Checagem de tipos                         |
| `npm run serverest`       | Sobe o ServeRest manualmente (porta 3000) |

### Executar contra o ambiente público

```bash
cp .env.example .env
# edite: API_URL=https://serverest.dev
```

## 🧪 Cobertura atual

| Recurso   | Cenários | Tipos de validação                                        |
| --------- | -------- | --------------------------------------------------------- |
| Login     | 8        | Sucesso, credenciais inválidas, validação de payload, JWT |
| Usuários  | 14       | CRUD, persistência, duplicidade, filtros, contrato        |
| Produtos  | 11       | CRUD, autorização (401/403), duplicidade, validações      |
| **Total** | **33**   | 5 `@smoke` · 28 `@regression`                             |

## 📐 Padrões do projeto

- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/pt-br/) validados no `commit-msg` (ex: `feat(api): adiciona testes de carrinho`)
- **Pre-commit:** lint + format dos arquivos alterados + typecheck
- **Nomenclatura dos testes:** em português, descrevendo o comportamento esperado (`deve ...` / `não deve ...`)
- **Cada teste:** independente, cria os próprios dados, limpa o que criou

## 🗺️ Roadmap

- [x] **Fase 1:** Fundação + testes de API com contrato
- [ ] **Fase 2:** API completa (carrinhos e fluxos encadeados)
- [ ] **Fase 3:** Testes de UI (Page Objects + setup via API)
- [ ] **Fase 4:** CI/CD avançado (sharding, multi-browser, GitHub Pages)
- [ ] **Fase 5:** Performance (k6), acessibilidade (axe) e gestão de flaky tests

Detalhes em [docs/pdi-roadmap.md](docs/pdi-roadmap.md).
