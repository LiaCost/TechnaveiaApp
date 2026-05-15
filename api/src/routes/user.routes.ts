import { Router } from 'express';
import { db } from '../db/index.js';      // Adicionado /index.js
import { usuarios } from '../db/schema.js'; // Adicionado .js
import { eq } from 'drizzle-orm';           // Pacotes da node_modules não precisam de .js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const userRoutes = Router();

const JWT_SECRET = 'sua_chave_secreta_aqui'; // Em produção, use variáveis de ambiente

// LISTAR TODOS (Read)
userRoutes.get('/', async (req, res) => {
  try {
    const allUsers = await db.select({
      id: usuarios.id,
      nome: usuarios.nome,
      email: usuarios.email,
      role: usuarios.role
    }).from(usuarios);
    
    return res.json(allUsers);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
});

// ATUALIZAR (Update)
userRoutes.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, role } = req.body;

  try {
    const updatedUser = await db.update(usuarios)
      .set({ nome, role })
      .where(eq(usuarios.id, Number(id)))
      .returning();

    return res.json(updatedUser);
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao atualizar.' });
  }
});

// DELETAR (Delete)
userRoutes.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db.delete(usuarios).where(eq(usuarios.id, Number(id)));
    return res.status(204).send(); // 204 significa "Sucesso, mas sem conteúdo para exibir"
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao deletar.' });
  }
});

// ROTA DE CADASTRO (Create do CRUD)
userRoutes.post('/register', async (req, res) => {
  try {
    const { nome, email, senha, role, cidadeId } = req.body;

    // Hasheando a senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    const newUser = await db.insert(usuarios).values({
      nome,
      email,
      senha: hashedPassword,
      role: role || 'cliente',
      cidadeId
    }).returning();

    return res.status(201).json(newUser[0]);

  } catch (error) {
    return res.status(400).json({ error: 'Erro ao cadastrar usuário.' });
  }
});

// ROTA DE LOGIN (Autenticação)
userRoutes.post('/login', async (req, res) => {

  const { email, senha } = req.body;

  const user = await db.select().from(usuarios).where(eq(usuarios.email, email)).get();

  if (!user) {
    return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
  }

  const passwordMatch = await bcrypt.compare(senha, user.senha);

  if (!passwordMatch) {
    return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
  }

  // Gerando o Token JWT
  const token = jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  return res.json({
    user: { id: user.id, nome: user.nome, email: user.email, role: user.role },
    token
  });

});