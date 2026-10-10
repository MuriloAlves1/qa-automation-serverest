import { test, expect } from '@fixtures/api.fixture';
import { buildProduto } from '@factories/produto.factory';
import { createdSchema } from '@schemas/common.schema';
import { listaProdutosSchema, produtoSchema } from '@schemas/produto.schema';

const TOKEN_INVALIDO_MSG = 'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais';

test.describe('/produtos', { tag: '@api' }, () => {
  let criados: string[] = [];

  test.afterEach(async ({ produtosApi, admin }) => {
    await Promise.all(criados.map((id) => produtosApi.excluir(id, admin.token)));
    criados = [];
  });

  test('deve listar produtos respeitando o contrato', { tag: '@smoke' }, async ({ produtosApi }) => {
    const response = await produtosApi.listar();

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toMatchSchema(listaProdutosSchema);
    expect(body.quantidade).toBe(body.produtos.length);
  });

  test('administrador deve cadastrar produto', { tag: '@smoke' }, async ({ produtosApi, admin }) => {
    const produto = buildProduto();

    const response = await produtosApi.cadastrar(produto, admin.token);

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toMatchSchema(createdSchema);
    criados.push(body._id);

    const consulta = await produtosApi.buscarPorId(body._id);
    const persistido = await consulta.json();
    expect(persistido).toMatchSchema(produtoSchema);
    expect(persistido).toEqual({ ...produto, _id: body._id });
  });

  test('não deve permitir produto com nome duplicado', { tag: '@regression' }, async ({ produtosApi, admin }) => {
    const produto = buildProduto();
    const primeiro = await produtosApi.cadastrar(produto, admin.token);
    criados.push((await primeiro.json())._id);

    const response = await produtosApi.cadastrar(produto, admin.token);

    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ message: 'Já existe produto com esse nome' });
  });

  test.describe('Autorização', () => {
    test('deve bloquear cadastro sem token', { tag: '@regression' }, async ({ produtosApi }) => {
      const response = await produtosApi.cadastrar(buildProduto());

      expect(response.status()).toBe(401);
      expect(await response.json()).toEqual({ message: TOKEN_INVALIDO_MSG });
    });

    test('deve bloquear cadastro com token inválido', { tag: '@regression' }, async ({ produtosApi }) => {
      const response = await produtosApi.cadastrar(buildProduto(), 'Bearer token.invalido.123');

      expect(response.status()).toBe(401);
      expect(await response.json()).toEqual({ message: TOKEN_INVALIDO_MSG });
    });

    test(
      'deve bloquear cadastro por usuário não administrador',
      { tag: '@regression' },
      async ({ produtosApi, usuarioComum }) => {
        const response = await produtosApi.cadastrar(buildProduto(), usuarioComum.token);

        expect(response.status()).toBe(403);
        expect(await response.json()).toEqual({ message: 'Rota exclusiva para administradores' });
      },
    );
  });

  test('administrador deve excluir produto', { tag: '@regression' }, async ({ produtosApi, admin }) => {
    const cadastro = await produtosApi.cadastrar(buildProduto(), admin.token);
    const { _id } = await cadastro.json();

    const response = await produtosApi.excluir(_id, admin.token);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ message: 'Registro excluído com sucesso' });
    expect((await produtosApi.buscarPorId(_id)).status()).toBe(400);
  });

  const validacoes = [
    { caso: 'preço negativo', override: { preco: -10 }, campo: 'preco', msg: 'preco deve ser um número positivo' },
    { caso: 'preço decimal', override: { preco: 10.5 }, campo: 'preco', msg: 'preco deve ser um inteiro' },
    {
      caso: 'quantidade negativa',
      override: { quantidade: -1 },
      campo: 'quantidade',
      msg: 'quantidade deve ser maior ou igual a 0',
    },
    { caso: 'nome vazio', override: { nome: '' }, campo: 'nome', msg: 'nome não pode ficar em branco' },
  ];

  for (const { caso, override, campo, msg } of validacoes) {
    test(`deve validar payload: ${caso}`, { tag: '@regression' }, async ({ produtosApi, admin }) => {
      const response = await produtosApi.cadastrar(buildProduto(override), admin.token);

      expect(response.status()).toBe(400);
      expect(await response.json()).toMatchObject({ [campo]: msg });
    });
  }
});
