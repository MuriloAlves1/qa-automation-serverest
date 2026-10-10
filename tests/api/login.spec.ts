import { test, expect } from '@fixtures/api.fixture';
import { loginSucessoSchema } from '@schemas/login.schema';
import { messageSchema } from '@schemas/common.schema';

test.describe('POST /login', { tag: '@api' }, () => {
  test(
    'deve autenticar com credenciais válidas e retornar token JWT',
    { tag: '@smoke' },
    async ({ loginApi, admin }) => {
      const response = await loginApi.login({ email: admin.email, password: admin.password });

      expect(response.status()).toBe(200);
      expect(await response.json()).toMatchSchema(loginSucessoSchema);
    },
  );

  test('deve recusar senha incorreta', { tag: '@regression' }, async ({ loginApi, admin }) => {
    const response = await loginApi.login({ email: admin.email, password: 'senha-errada' });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toMatchSchema(messageSchema);
    expect(body.message).toBe('Email e/ou senha inválidos');
  });

  test('deve recusar e-mail não cadastrado', { tag: '@regression' }, async ({ loginApi }) => {
    const response = await loginApi.login({ email: 'nao.existe@teste.com', password: '123456' });

    expect(response.status()).toBe(401);
    expect((await response.json()).message).toBe('Email e/ou senha inválidos');
  });

  // Data-driven: um teste por regra de validação, com nome descritivo no relatório
  const validacoes = [
    { caso: 'sem e-mail', payload: { password: '123' }, campo: 'email', msg: 'email é obrigatório' },
    {
      caso: 'e-mail vazio',
      payload: { email: '', password: '123' },
      campo: 'email',
      msg: 'email não pode ficar em branco',
    },
    {
      caso: 'e-mail inválido',
      payload: { email: 'invalido', password: '123' },
      campo: 'email',
      msg: 'email deve ser um email válido',
    },
    { caso: 'sem senha', payload: { email: 'qa@teste.com' }, campo: 'password', msg: 'password é obrigatório' },
    {
      caso: 'senha vazia',
      payload: { email: 'qa@teste.com', password: '' },
      campo: 'password',
      msg: 'password não pode ficar em branco',
    },
  ];

  for (const { caso, payload, campo, msg } of validacoes) {
    test(`deve validar payload: ${caso}`, { tag: '@regression' }, async ({ loginApi }) => {
      const response = await loginApi.login(payload);

      expect(response.status()).toBe(400);
      expect(await response.json()).toMatchObject({ [campo]: msg });
    });
  }
});
