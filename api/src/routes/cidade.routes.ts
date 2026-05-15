import { Router } from 'express';
import { db } from '../db/index.js';
import { cidades } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const cidadeRoutes = Router();

cidadeRoutes.get('/', async (req, res) => {
  const result = await db.select().from(cidades);
  return res.json(result);
});

cidadeRoutes.post('/', async (req, res) => {
  try {
    const { nome, ufId } = req.body;
    const result = await db.insert(cidades).values({ 
      nome, 
      ufId: Number(ufId) 
    }).returning();
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao cadastrar cidade.' });
  }
});

cidadeRoutes.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, ufId } = req.body;
  const result = await db.update(cidades)
    .set({ nome, ufId: Number(ufId) })
    .where(eq(cidades.id, Number(id)))
    .returning();
  return res.json(result);
});

cidadeRoutes.delete('/:id', async (req, res) => {
  await db.delete(cidades).where(eq(cidades.id, Number(req.params.id)));
  return res.status(204).send();
});