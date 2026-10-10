import { BaseClient } from './base.client';
import type { NovoProduto, Produto } from '@schemas/produto.schema';

export class ProdutosClient extends BaseClient {
  private readonly path = '/produtos';

  listar(filtros?: Partial<Produto>) {
    return this.get(this.path, { params: filtros });
  }

  buscarPorId(id: string) {
    return this.get(`${this.path}/${id}`);
  }

  cadastrar(produto: Partial<NovoProduto>, token?: string) {
    return this.post(this.path, { data: produto, token });
  }

  editar(id: string, produto: Partial<NovoProduto>, token?: string) {
    return this.put(`${this.path}/${id}`, { data: produto, token });
  }

  excluir(id: string, token?: string) {
    return this.delete(`${this.path}/${id}`, { token });
  }
}
