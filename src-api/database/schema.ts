import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// Tabela de UFs (Estados) idêntica ao banco da API e às regras do PDF
export const ufs = sqliteTable('ufs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull(),
  sigla: text('sigla').notNull().unique(), // Unique para evitar duplicados
});

// Tabela de Cidades com relacionamento de Chave Estrangeira (Foreign Key)
export const cidades = sqliteTable('cidades', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull(),
  ufId: integer('uf_id')
    .notNull()
    .references(() => ufs.id, { onDelete: 'cascade' }), // Se deletar a UF, deleta as cidades dela em cascata
});

// Tabelas de Usuários e Produtos (Caso queira expandir o teste local depois)
export const usuarios = sqliteTable('usuarios', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull(),
  email: text('email').notNull().unique(),
  senha: text('senha').notNull(),
});

export const produtos = sqliteTable('produtos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull(),
  preco: integer('preco').notNull(), // No SQLite guardamos centavos/inteiros para evitar quebra de ponto flutuante
  estoque: integer('estoque').notNull(),
});