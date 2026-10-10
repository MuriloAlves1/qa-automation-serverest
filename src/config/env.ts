import 'dotenv/config';
import { z } from 'zod';

/**
 * Configuração centralizada e validada das variáveis de ambiente.
 * Se algo estiver faltando ou inválido, a execução falha logo no início
 * com uma mensagem clara, em vez de quebrar no meio de um teste.
 */
const envSchema = z.object({
  API_URL: z.url().default('http://localhost:3000'),
  UI_URL: z.url().default('https://front.serverest.dev'),
  // Sobe o ServeRest local automaticamente quando a API aponta para localhost
  START_LOCAL_SERVER: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Variáveis de ambiente inválidas:\n${z.prettifyError(parsed.error)}`);
}

export const env = parsed.data;
export const isLocalApi = /localhost|127\.0\.0\.1/.test(env.API_URL);
