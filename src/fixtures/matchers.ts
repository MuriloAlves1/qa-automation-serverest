import { expect as baseExpect } from '@playwright/test';
import { z } from 'zod';

// Tipagem global do matcher: funciona inclusive quando o body é `any` (retorno de response.json())
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PlaywrightTest {
    interface Matchers<R> {
      toMatchSchema(schema: z.ZodType): R;
    }
  }
}

/**
 * Matcher customizado de contrato: `expect(body).toMatchSchema(schema)`.
 * Em caso de falha, mostra exatamente quais campos violaram o contrato.
 */
export const expect = baseExpect.extend({
  toMatchSchema(received: unknown, schema: z.ZodType) {
    const result = schema.safeParse(received);
    return {
      pass: result.success,
      name: 'toMatchSchema',
      message: () =>
        result.success
          ? 'Esperava que o body NÃO correspondesse ao schema, mas correspondeu'
          : `O body não respeita o contrato:\n${z.prettifyError(result.error)}\n\nBody recebido:\n${JSON.stringify(received, null, 2)}`,
    };
  },
});
