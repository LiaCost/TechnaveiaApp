import { Router } from 'express';
import { db } from '../db/index.js';
import { produtos } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const produtoRoutes = Router();

produtoRoutes.get('/', async (req, res) => {
  const result = await db.select().from(produtos);
  return res.json(result);
});

produtoRoutes.post('/', async (req, res) => {
  const { nome, descricao, preco, estoque } = req.body;
  const result = await db.insert(produtos).values({
    nome,
    descricao,
    preco: Number(preco),
    estoque: Number(estoque)
  }).returning();
  return res.status(201).json(result);
});

produtoRoutes.put('/:id', async (req, res) => {
  const { nome, descricao, preco, estoque } = req.body;
  const result = await db.update(produtos)
    .set({ nome, descricao, preco: Number(preco), estoque: Number(estoque) })
    .where(eq(produtos.id, Number(req.params.id)))
    .returning();
  return res.json(result);
});

produtoRoutes.delete('/:id', async (req, res) => {
  await db.delete(produtos).where(eq(produtos.id, Number(req.params.id)));
  return res.status(204).send();
});