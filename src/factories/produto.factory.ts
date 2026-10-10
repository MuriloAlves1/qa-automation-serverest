import { faker } from '@faker-js/faker/locale/pt_BR';
import type { NovoProduto } from '@schemas/produto.schema';

export function buildProduto(overrides: Partial<NovoProduto> = {}): NovoProduto {
  return {
    // Sufixo aleatório: o ServeRest não aceita nomes de produto duplicados
    nome: `${faker.commerce.productName()} ${faker.string.alphanumeric(8)}`,
    preco: faker.number.int({ min: 1, max: 5000 }),
    descricao: faker.commerce.productDescription(),
    quantidade: faker.number.int({ min: 1, max: 500 }),
    ...overrides,
  };
}
