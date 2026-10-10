import { z } from 'zod';

export const loginSucessoSchema = z.strictObject({
  message: z.literal('Login realizado com sucesso'),
  authorization: z.string().regex(/^Bearer [\w-]+\.[\w-]+\.[\w-]+$/, 'deve ser um JWT no formato Bearer'),
});

export type Credenciais = { email: string; password: string };
