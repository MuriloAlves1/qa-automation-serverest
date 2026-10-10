import { BaseClient } from './base.client';
import type { Credenciais } from '@schemas/login.schema';

export class LoginClient extends BaseClient {
  login(credenciais: Partial<Credenciais>) {
    return this.post('/login', { data: credenciais });
  }
}
