import express from 'express';
import cors from 'cors';

// Importação de todas as rotas (Lembre-se do .js no final!)
import { userRoutes } from './routes/user.routes.js';
import { ufRoutes } from './routes/uf.routes.js';
import { cidadeRoutes } from './routes/cidade.routes.js';
import { produtoRoutes } from './routes/produto.routes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Registro das Rotas
app.use('/users', userRoutes);
app.use('/ufs', ufRoutes);
app.use('/cidades', cidadeRoutes);
app.use('/produtos', produtoRoutes);

// Rota de Boas-vindas (Teste de fumaça)
app.get('/', (req, res) => {
  res.send('🚀 API Technaveia rodando a todo vapor!');
});

const PORT = 3333;
app.listen(PORT, () => {
  console.log(`\n✅ Servidor iniciado com sucesso!`);
  console.log(`🔗 Local: http://localhost:${PORT}`);
  console.log(`📡 Pronto para receber requisições.\n`);
});