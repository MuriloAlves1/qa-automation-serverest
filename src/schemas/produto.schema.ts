import { z } from 'zod';
import { idSchema } from './common.schema';

export const produtoSchema = z.strictObject({
  nome: z.string(),
  preco: z.number().int().positive(),
  descricao: z.string(),
  quantidade: z.number().int().nonnegative(),
  _id: idSchema,
});

export const listaProdutosSchema = z.strictObject({
  quantidade: z.number().int().nonnegative(),
  produtos: z.array(produtoSchema),
});

export type Produto = z.infer<typeof produtoSchema>;
export type NovoProduto = Omit<Produto, '_id'>;
