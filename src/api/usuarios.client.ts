import { BaseClient } from './base.client';
import type { NovoUsuario, Usuario } from '@schemas/usuario.schema';

export class UsuariosClient extends BaseClient {
  private readonly path = '/usuarios';

  listar(filtros?: Partial<Usuario>) {
    return this.get(this.path, { params: filtros });
  }

  buscarPorId(id: string) {
    return this.get(`${this.path}/${id}`);
  }

  cadastrar(usuario: Partial<NovoUsuario>) {
    return this.post(this.path, { data: usuario });
  }

  editar(id: string, usuario: Partial<NovoUsuario>) {
    return this.put(`${this.path}/${id}`, { data: usuario });
  }

  excluir(id: string) {
    return this.delete(`${this.path}/${id}`);
  }
}
