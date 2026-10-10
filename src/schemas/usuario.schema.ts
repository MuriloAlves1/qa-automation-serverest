import { z } from 'zod';
import { idSchema } from './common.schema';

export const usuarioSchema = z.strictObject({
  nome: z.string(),
  email: z.email(),
  password: z.string(),
  administrador: z.enum(['true', 'false']),
  _id: idSchema,
});

export const listaUsuariosSchema = z.strictObject({
  quantidade: z.number().int().nonnegative(),
  usuarios: z.array(usuarioSchema),
});

export type Usuario = z.infer<typeof usuarioSchema>;
export type NovoUsuario = Omit<Usuario, '_id'>;
