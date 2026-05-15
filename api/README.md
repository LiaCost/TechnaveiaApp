```markdown
# 🚀 Technaveia API - Full CRUD & Relational Database

Esta é uma API robusta desenvolvida com **Node.js**, **TypeScript** e **Drizzle ORM**. O projeto implementa um sistema completo de gestão que conecta Localidades (UFs e Cidades), Usuários e Catálogo de Produtos, utilizando **SQLite** para persistência de dados.

## 🛠️ Tecnologias e Conceitos

* **Runtime:** Node.js (ESM)
* **ORM:** Drizzle ORM (com `db:push` para sincronização)
* **Banco de Dados:** SQLite (LibSQL)
* **Relacionamentos:** 1:N (Um para Muitos) entre UFs e Cidades.
* **Segurança:** Tratamento de erros com `try/catch` para evitar quedas do servidor por violação de regras de banco (ex: siglas duplicadas).

---

## ⚙️ Como Executar o Projeto

### 1. Instalar as dependências
```bash
npm install

```

### 2. Sincronizar o Banco de Dados

Sempre execute este comando após alterar o arquivo `schema.ts`:

```bash
npm run db:push

```

### 3. Rodar o Servidor (Desenvolvimento)

```bash
npm run dev

```

Acesse em: `http://localhost:3333`

---

## 📡 Documentação das Rotas (Endpoints)

### 🗺️ UFs (`/ufs`)

* `GET /ufs`: Lista todos os estados.
* `POST /ufs`: Cadastra UF (Sigla deve ser única).
* `PUT /ufs/:id`: Atualiza nome ou sigla.
* `DELETE /ufs/:id`: Remove uma UF.

### 📍 Cidades (`/cidades`)

* `GET /cidades`: Lista todas as cidades.
* `POST /cidades`: Cadastra cidade vinculada a um `ufId`.
* `PUT /cidades/:id`: Altera nome ou vínculo de estado.
* `DELETE /cidades/:id`: Remove uma cidade.

### 👤 Usuários (`/users`)

* `POST /users/register`: Cria conta de usuário vinculada a uma cidade.
* `POST /users/login`: Autenticação e geração de token.
* `GET /users`: Lista de membros.
* `DELETE /users/:id`: Remove conta.

### 📦 Produtos (`/produtos`)

* `GET /produtos`: Lista o catálogo completo.
* `POST /produtos`: Adiciona novo item (Preço e Estoque tratados como números).
* `PUT /produtos/:id`: Atualiza informações do produto.
* `DELETE /produtos/:id`: Remove do catálogo.

---

## 📝 Regras de Negócio Implementadas

* **Integridade Referencial:** Não é possível cadastrar uma cidade sem um `ufId` válido.
* **Normalização:** Siglas de UFs são convertidas automaticamente para maiúsculas.
* **Resiliência:** O servidor não encerra processos em caso de erros de entrada de dados do usuário (Bad Requests).

```
