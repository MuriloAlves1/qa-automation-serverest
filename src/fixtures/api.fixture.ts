import { test as base } from '@playwright/test';
import { LoginClient } from '@api/login.client';
import { ProdutosClient } from '@api/produtos.client';
import { UsuariosClient } from '@api/usuarios.client';
import { buildUsuario } from '@factories/usuario.factory';
import type { NovoUsuario } from '@schemas/usuario.schema';
import { expect } from './matchers';

type UsuarioAutenticado = NovoUsuario & { _id: string; token: string };

type ApiFixtures = {
  usuariosApi: UsuariosClient;
  loginApi: LoginClient;
  produtosApi: ProdutosClient;
  /** Usuário administrador criado via API, já logado, removido ao final do teste */
  admin: UsuarioAutenticado;
  /** Usuário comum (não admin), já logado, removido ao final do teste */
  usuarioComum: UsuarioAutenticado;
};

async function criarUsuarioAutenticado(
  usuariosApi: UsuariosClient,
  loginApi: LoginClient,
  administrador: 'true' | 'false',
): Promise<UsuarioAutenticado> {
  const usuario = buildUsuario({ administrador });

  const cadastro = await usuariosApi.cadastrar(usuario);
  expect(cadastro.status(), 'setup: cadastro do usuário').toBe(201);
  const { _id } = await cadastro.json();

  const login = await loginApi.login({ email: usuario.email, password: usuario.password });
  expect(login.status(), 'setup: login do usuário').toBe(200);
  const { authorization } = await login.json();

  return { ...usuario, _id, token: authorization };
}

export const test = base.extend<ApiFixtures>({
  usuariosApi: async ({ request }, use) => use(new UsuariosClient(request)),
  loginApi: async ({ request }, use) => use(new LoginClient(request)),
  produtosApi: async ({ request }, use) => use(new ProdutosClient(request)),

  admin: async ({ usuariosApi, loginApi }, use) => {
    const user = await criarUsuarioAutenticado(usuariosApi, loginApi, 'true');
    await use(user);
    await usuariosApi.excluir(user._id); // teardown: não deixa lixo no ambiente
  },

  usuarioComum: async ({ usuariosApi, loginApi }, use) => {
    const user = await criarUsuarioAutenticado(usuariosApi, loginApi, 'false');
    await use(user);
    await usuariosApi.excluir(user._id);
  },
});

export { expect };
