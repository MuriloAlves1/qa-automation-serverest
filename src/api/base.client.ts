import type { APIRequestContext, APIResponse } from '@playwright/test';

type RequestOptions = {
  data?: unknown;
  params?: Record<string, string | number | boolean>;
  token?: string;
};

/**
 * Client base: concentra a montagem das requisições (headers, auth, params).
 * Os clients de cada recurso só descrevem rotas — os testes nunca montam HTTP "na mão".
 * Sempre retorna o APIResponse cru para que o teste decida o que validar (status, headers, body).
 */
export abstract class BaseClient {
  constructor(protected readonly request: APIRequestContext) {}

  protected get(url: string, opts: RequestOptions = {}): Promise<APIResponse> {
    return this.request.get(url, this.build(opts));
  }

  protected post(url: string, opts: RequestOptions = {}): Promise<APIResponse> {
    return this.request.post(url, this.build(opts));
  }

  protected put(url: string, opts: RequestOptions = {}): Promise<APIResponse> {
    return this.request.put(url, this.build(opts));
  }

  protected delete(url: string, opts: RequestOptions = {}): Promise<APIResponse> {
    return this.request.delete(url, this.build(opts));
  }

  private build({ data, params, token }: RequestOptions) {
    return {
      data,
      params,
      headers: token ? { Authorization: token } : undefined,
    };
  }
}
