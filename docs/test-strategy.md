# Estratégia de Testes — ServeRest

> Documento vivo. Atualizado a cada fase do projeto.

## 1. Objetivo

Garantir a qualidade da aplicação ServeRest (API REST + front-end) com uma suíte automatizada **rápida, confiável e de fácil manutenção**, executada continuamente no pipeline de CI/CD como _quality gate_ para mudanças.

## 2. Escopo

| Recurso              | API         | UI     | Prioridade |
| -------------------- | ----------- | ------ | ---------- |
| Login / autenticação | ✅ Fase 1   | Fase 3 | Alta       |
| Usuários (CRUD)      | ✅ Fase 1   | Fase 3 | Alta       |
| Produtos (CRUD)      | ✅ Fase 1-2 | Fase 3 | Alta       |
| Carrinhos            | Fase 2      | Fase 3 | Média      |

**Fora do escopo:** testes de carga em escala, segurança aprofundada (pentest) e compatibilidade com navegadores legados.

## 3. Pirâmide de testes

```
        ▲  UI (E2E)       → poucos, só jornadas críticas do usuário
       ▲▲▲ API            → maioria: regras de negócio, validações, contrato, autorização
```

**Princípio:** toda regra que pode ser validada na API é validada na API. Testes de UI cobrem apenas o que só existe na UI (navegação, renderização, fluxo ponta a ponta) e usam a API para preparar dados (setup), nunca a própria UI.

**Motivo:** testes de API são ~10-50x mais rápidos e muito menos sujeitos a instabilidade (flakiness).

## 4. Tipos de validação em API

| Tipo                | O que garante                                   | Exemplo                                   |
| ------------------- | ----------------------------------------------- | ----------------------------------------- |
| Funcional           | Status code e mensagem corretos                 | `POST /usuarios` → 201                    |
| Contrato (schema)   | Estrutura e tipos do body, sem campos extras    | `toMatchSchema(listaProdutosSchema)`      |
| Persistência        | O dado realmente foi gravado como enviado       | `GET` após `POST` retorna o mesmo payload |
| Negativos/validação | Payload inválido é rejeitado com mensagem clara | e-mail inválido → 400                     |
| Autorização         | Acesso restrito por token e perfil              | não admin → 403; sem token → 401          |

Os schemas usam `z.strictObject`: **um campo novo ou removido na API quebra o teste**, detectando mudanças de contrato não comunicadas.

## 5. Gestão de dados de teste

- **Dados dinâmicos** com Faker (factories): cada teste cria sua própria massa, então não há dependência entre testes nem colisões em execução paralela.
- **Fixtures com teardown**: usuários e produtos criados são removidos ao final, mesmo em caso de falha.
- **Ambiente isolado**: por padrão, o ServeRest roda localmente (instância descartável), sem depender do ambiente público compartilhado.

## 6. Critérios de priorização (tags)

| Tag           | Quando usar                                | Quando roda                  |
| ------------- | ------------------------------------------ | ---------------------------- |
| `@smoke`      | Caminho feliz das funcionalidades críticas | Todo PR (rápido, bloqueante) |
| `@regression` | Cenários negativos, bordas, validações     | Push na main / nightly       |
| `@api` `@ui`  | Camada do teste                            | Filtragem por job            |

## 7. Critérios de entrada e saída

**Entrada (para automatizar):** requisito/rota documentada (Swagger), ambiente disponível, cenário com resultado esperado claro.

**Saída (para considerar pronto):**

- 100% dos testes `@smoke` passando
- Nenhum teste instável sem tag de rastreio
- Lint, formatação e typecheck sem erros
- Relatório publicado no pipeline

## 8. Riscos e mitigação

| Risco                                   | Mitigação                                                                      |
| --------------------------------------- | ------------------------------------------------------------------------------ |
| Ambiente público instável/compartilhado | ServeRest local no CI                                                          |
| Testes instáveis (flaky)                | Retries só no CI, trace/vídeo na falha, proibição de `waitForTimeout` via lint |
| Massa de dados suja                     | Dados únicos por teste + teardown automático                                   |
| Mudança de contrato silenciosa          | Schemas estritos                                                               |

## 9. Achados (observações sobre a aplicação)

Comportamentos identificados durante a automação, que mereceriam discussão em um projeto real:

- **`PUT /usuarios/{id}` com ID inexistente cria um novo registro (upsert)** em vez de retornar 404. Documentado pelo ServeRest, mas é um ponto de atenção de design de API.
- **`GET /usuarios/{id}` inexistente retorna 400**, quando o semanticamente esperado seria 404.
- **`DELETE` de recurso inexistente retorna 200** ("Nenhum registro excluído").
- **A API retorna a senha do usuário em texto puro** em `GET /usuarios`. Em produção, seria um problema de segurança grave.
