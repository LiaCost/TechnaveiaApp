import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// 1. Entidade UF (Unidade Federativa)
export const ufs = sqliteTable('ufs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull(),
  sigla: text('sigla', { length: 2 }).notNull().unique(),
});

// 2. Entidade Cidade
export const cidades = sqliteTable('cidades', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull(),
  ufId: integer('uf_id').references(() => ufs.id),
});

// 3. Entidade Usuario (Autenticação e Perfis)
export const usuarios = sqliteTable('usuarios', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull(),
  email: text('email').notNull().unique(),
  senha: text('senha').notNull(),
  role: text('role').notNull().default('cliente'), // 'admin', 'cliente', 'tecnico'
  cidadeId: integer('cidade_id').references(() => cidades.id),
});

// 4. Entidade Produto (Nova!)
export const produtos = sqliteTable('produtos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull(),
  descricao: text('descricao'),
  preco: real('preco').notNull().default(0), // Usando 'real' para valores decimais
  estoque: integer('estoque').notNull().default(0),
});