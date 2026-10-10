import { faker } from '@faker-js/faker/locale/pt_BR';
import type { NovoUsuario } from '@schemas/usuario.schema';

/**
 * Gera usuários únicos a cada chamada — testes nunca dependem de massa fixa
 * nem colidem entre si quando rodam em paralelo.
 */
export function buildUsuario(overrides: Partial<NovoUsuario> = {}): NovoUsuario {
  return {
    nome: faker.person.fullName(),
    email: `qa.${faker.string.alphanumeric(10).toLowerCase()}@teste.com`,
    password: faker.internet.password({ length: 12 }),
    administrador: 'true',
    ...overrides,
  };
}
