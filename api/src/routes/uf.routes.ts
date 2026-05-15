import { Router } from 'express';
import { db } from '../db/index.js';
import { ufs } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const ufRoutes = Router();

ufRoutes.get('/', async (req, res) => {
  const result = await db.select().from(ufs);
  return res.json(result);
});

ufRoutes.post('/', async (req, res) => {
  try {
    const { nome, sigla } = req.body;
    const result = await db.insert(ufs).values({ 
      nome, 
      sigla: sigla.toUpperCase() 
    }).returning();
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ error: 'UF ou Sigla já cadastrada.' });
  }
});

ufRoutes.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, sigla } = req.body;
  try {
    const result = await db.update(ufs)
      .set({ nome, sigla: sigla?.toUpperCase() })
      .where(eq(ufs.id, Number(id)))
      .returning();
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao atualizar UF.' });
  }
});

ufRoutes.delete('/:id', async (req, res) => {
  try {
    await db.delete(ufs).where(eq(ufs.id, Number(req.params.id)));
    return res.status(204).send();
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao deletar UF.' });
  }
});