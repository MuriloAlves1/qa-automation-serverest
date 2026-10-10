# Roadmap do PDI

**Objetivo (SMART):** construir e manter um framework de automação de testes UI + API integrado a CI/CD, com relatório público, como base para propor melhorias no processo de qualidade do time.

**Competências desenvolvidas:** automação de testes · arquitetura de testes · CI/CD · estratégia de qualidade · comunicação técnica.

## Fases

| #   | Fase         | Status       | Entregas (evidências)                                                                   |
| --- | ------------ | ------------ | --------------------------------------------------------------------------------------- |
| 1   | Fundação     | ✅ Concluída | Estrutura do projeto, padrões de código, CI básico, 33 testes de API com contrato       |
| 2   | API completa | ⏳ Próxima   | Carrinhos, fluxos encadeados, cenários de borda, cobertura de 100% dos endpoints        |
| 3   | UI           | 🔲 Planejada | Page Objects, jornadas críticas no front, setup via API                                 |
| 4   | CI/CD        | 🔲 Planejada | Sharding, multi-browser, nightly, relatório no GitHub Pages, quality gate em PR         |
| 5   | Maturidade   | 🔲 Planejada | Gestão de flaky tests, k6 (performance), axe (acessibilidade), apresentação para o time |

## Fase 1: Fundação ✅

**Entregas:**

- [x] Projeto Playwright + TypeScript (modo estrito) com path aliases
- [x] Configuração de ambiente validada (Zod + dotenv), com suporte a ambiente local e público
- [x] ServeRest local sobe automaticamente para os testes (sem dependência de ambiente externo)
- [x] Arquitetura em camadas: **clients → fixtures → testes**
- [x] Factories de dados dinâmicos (Faker pt_BR)
- [x] Validação de contrato com schemas estritos e matcher customizado `toMatchSchema`
- [x] 33 testes de API: login, usuários e produtos (funcional, negativo, contrato, autorização)
- [x] ESLint (com regras do Playwright), Prettier, Husky, lint-staged e Commitlint (Conventional Commits)
- [x] Pipeline de CI: lint → typecheck → testes de API, com relatório como artefato
- [x] Documento de estratégia de testes
- [x] Template de Pull Request com checklist de qualidade

**Métricas da fase:**

| Métrica                 | Valor                                |
| ----------------------- | ------------------------------------ |
| Testes de API           | 33 (5 smoke · 28 regression)         |
| Endpoints cobertos      | 10 de 16 (login, usuários, produtos) |
| Tempo de execução local | ~10s (paralelo)                      |
| Taxa de flakiness       | 0% (165 execuções: suíte × 5)        |

**Aprendizados:**

- _(preencha com suas palavras: o que foi novo, o que foi difícil, o que faria diferente)_
