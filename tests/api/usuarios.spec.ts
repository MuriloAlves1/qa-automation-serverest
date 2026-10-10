import { test, expect } from '@fixtures/api.fixture';
import { buildUsuario } from '@factories/usuario.factory';
import { createdSchema, messageSchema } from '@schemas/common.schema';
import { listaUsuariosSchema, usuarioSchema } from '@schemas/usuario.schema';

test.describe('/usuarios', { tag: '@api' }, () => {
  // Rastreia o que cada teste cria para limpar depois, mesmo se o teste falhar
  let criados: string[] = [];

  test.afterEach(async ({ usuariosApi }) => {
    await Promise.all(criados.map((id) => usuariosApi.excluir(id)));
    criados = [];
  });

  test.describe('POST /usuarios', () => {
    test('deve cadastrar usuário e persistir os dados', { tag: '@smoke' }, async ({ usuariosApi }) => {
      const usuario = buildUsuario();

      const response = await usuariosApi.cadastrar(usuario);

      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body).toMatchSchema(createdSchema);
      criados.push(body._id);

      // Não basta o 201: confirma que o registro foi persistido corretamente
      const consulta = await usuariosApi.buscarPorId(body._id);
      expect(await consulta.json()).toEqual({ ...usuario, _id: body._id });
    });

    test('não deve permitir e-mail duplicado', { tag: '@regression' }, async ({ usuariosApi, admin }) => {
      const response = await usuariosApi.cadastrar(buildUsuario({ email: admin.email }));

      expect(response.status()).toBe(400);
      expect(await response.json()).toEqual({ message: 'Este email já está sendo usado' });
    });

    const validacoes = [
      {
        caso: 'e-mail inválido',
        override: { email: 'invalido' },
        campo: 'email',
        msg: 'email deve ser um email válido',
      },
      { caso: 'nome vazio', override: { nome: '' }, campo: 'nome', msg: 'nome não pode ficar em branco' },
      { caso: 'senha vazia', override: { password: '' }, campo: 'password', msg: 'password não pode ficar em branco' },
      {
        caso: 'administrador inválido',
        override: { administrador: 'sim' as 'true' },
        campo: 'administrador',
        msg: "administrador deve ser 'true' ou 'false'",
      },
    ];

    for (const { caso, override, campo, msg } of validacoes) {
      test(`deve validar payload: ${caso}`, { tag: '@regression' }, async ({ usuariosApi }) => {
        const response = await usuariosApi.cadastrar(buildUsuario(override));

        expect(response.status()).toBe(400);
        expect(await response.json()).toMatchObject({ [campo]: msg });
      });
    }
  });

  test.describe('GET /usuarios', () => {
    test('deve listar usuários respeitando o contrato', { tag: '@smoke' }, async ({ usuariosApi, admin }) => {
      const response = await usuariosApi.listar();

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toMatchSchema(listaUsuariosSchema);
      expect(body.quantidade).toBe(body.usuarios.length);
      expect(body.usuarios.map((u: { _id: string }) => u._id)).toContain(admin._id);
    });

    test('deve filtrar usuários por e-mail', { tag: '@regression' }, async ({ usuariosApi, admin }) => {
      const response = await usuariosApi.listar({ email: admin.email });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.quantidade).toBe(1);
      expect(body.usuarios[0]._id).toBe(admin._id);
    });

    test('deve buscar usuário por ID', { tag: '@regression' }, async ({ usuariosApi, admin }) => {
      const response = await usuariosApi.buscarPorId(admin._id);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toMatchSchema(usuarioSchema);
      expect(body.email).toBe(admin.email);
    });

    test('deve retornar erro para ID inexistente', { tag: '@regression' }, async ({ usuariosApi }) => {
      const response = await usuariosApi.buscarPorId('0000000000000000');

      expect(response.status()).toBe(400);
      expect(await response.json()).toEqual({ message: 'Usuário não encontrado' });
    });
  });

  test.describe('PUT /usuarios/{id}', () => {
    test('deve editar usuário existente', { tag: '@regression' }, async ({ usuariosApi, admin }) => {
      const novosDados = buildUsuario({ email: admin.email, administrador: 'false' });

      const response = await usuariosApi.editar(admin._id, novosDados);

      expect(response.status()).toBe(200);
      expect(await response.json()).toEqual({ message: 'Registro alterado com sucesso' });

      const consulta = await usuariosApi.buscarPorId(admin._id);
      expect(await consulta.json()).toEqual({ ...novosDados, _id: admin._id });
    });

    // Comportamento documentado do ServeRest (upsert): PUT em ID inexistente cria o registro
    test('deve cadastrar quando o ID não existe (upsert)', { tag: '@regression' }, async ({ usuariosApi }) => {
      const response = await usuariosApi.editar('0000000000000000', buildUsuario());

      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body).toMatchSchema(createdSchema);
      criados.push(body._id);
    });
  });

  test.describe('DELETE /usuarios/{id}', () => {
    test('deve excluir usuário', { tag: '@regression' }, async ({ usuariosApi }) => {
      const cadastro = await usuariosApi.cadastrar(buildUsuario());
      const { _id } = await cadastro.json();

      const response = await usuariosApi.excluir(_id);

      expect(response.status()).toBe(200);
      expect(await response.json()).toEqual({ message: 'Registro excluído com sucesso' });
      expect((await usuariosApi.buscarPorId(_id)).status()).toBe(400);
    });

    test('deve informar quando nenhum registro foi excluído', { tag: '@regression' }, async ({ usuariosApi }) => {
      const response = await usuariosApi.excluir('0000000000000000');

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toMatchSchema(messageSchema);
      expect(body.message).toBe('Nenhum registro excluído');
    });
  });
});
