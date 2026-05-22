import { db } from '../database/db';
import { cidades, ufs } from '../database/schema';
import { eq } from 'drizzle-orm';

export const cidadeService = {
  async inserir(nome: string, ufId: number) {
    return await db.insert(cidades).values({ nome, ufId }).returning();
  },

  async listarComUf() {
    return await db
      .select({
        id: cidades.id,
        nome: cidades.nome,
        ufId: cidades.ufId,
        uf_sigla: ufs.sigla, // Traz a sigla mapeada do relacionamento
      })
      .from(cidades)
      .innerJoin(ufs, eq(cidades.ufId, ufs.id))
      .orderBy(cidades.nome);
  },

  async deletar(id: number) {
    return await db.delete(cidades).where(eq(cidades.id, id));
  }
};