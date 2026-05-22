import { db } from '../database/db';
import { ufs } from '../database/schema';
import { eq } from 'drizzle-orm';

export const ufService = {
  async inserir(nome: string, sigla: string) {
    return await db.insert(ufs).values({ nome, sigla: sigla.toUpperCase() }).returning();
  },

  async listar() {
    return await db.select().from(ufs).orderBy(ufs.nome);
  },

  async deletar(id: number) {
    return await db.delete(ufs).where(eq(ufs.id, id));
  }
};