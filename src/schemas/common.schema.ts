import { z } from 'zod';

/** ServeRest usa IDs alfanuméricos de 16 caracteres (NeDB) */
export const idSchema = z.string().regex(/^[A-Za-z0-9]{16}$/);

export const messageSchema = z.strictObject({
  message: z.string().min(1),
});

export const createdSchema = z.strictObject({
  message: z.literal('Cadastro realizado com sucesso'),
  _id: idSchema,
});
