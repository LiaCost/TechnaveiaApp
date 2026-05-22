```markdown
# 🚀 TechNaveia App & APIs - Ecossistema de Persistência

Este repositório contém o ecossistema completo da aplicação **TechNaveia**. O projeto foi modularizado para contemplar as diferentes etapas e exigências de arquitetura solicitadas, dividindo-se entre serviços de nuvem (API Remota) e armazenamento local (Offline Sync).

---

## 📁 Estrutura de Camadas e APIs

* **`api/` (API Centralizada na Nuvem):** Servidor backend Node.js que simula o ambiente em nuvem para gerenciamento global de `UFs`, `Cidades`, `Usuários` e `Produtos`.
* **`src-api/` (Persistência Local / SQLite do Dispositivo):** Módulo mobile nativo que roda 100% dentro do telemóvel para armazenar dados localmente (`UFs` e `Cidades`), garantindo o funcionamento offline do app.
* **`src/` (Aplicação Principal):** Interface e navegação base.

---

## 🛠️ Pré-requisitos
Antes de começar, certifique-se de que tem instalado na sua máquina:
- [Node.js](https://nodejs.org/) (Versão 18 ou superior)
- [Git](https://git-scm.com/)
- Um emulador Android/iOS configurado ou o app **Expo Go** instalado no telemóvel.

---

## 📦 1. Configuração do Backend Central (`api/`) - Etapa 1

Gerencia os fluxos globais do sistema.

### Passos para Executar:
1. Navegue até à pasta da API:
   ```bash
   cd api

```

2. Instale as dependências:
```bash
npm install

```


3. Sincronize e gere o banco de dados central (`sqlite.db`):
```bash
npx drizzle-kit push

```


4. Inicie o servidor:
```bash
npm run dev

```



*O servidor backend estará ativo em: `http://localhost:3333*`

---

## 📱 2. Configuração do App Mobile & Persistência Local (`src-api/`) - Etapa 2

Esta etapa cumpre os requisitos de **armazenamento relacional embarcado**. Utiliza o arquivo local `app.db` dentro do telemóvel.

### Arquitetura do Módulo Local (`src-api/`):

Seguindo as boas práticas de engenharia de software sugeridas:

* `database/db.ts`: Gerencia a conexão ativa do Expo SQLite com o Drizzle ORM.
* `services/`: Isolamento das regras de negócio e queries nativas (`ufService` e `cidadeService`).
* `screens/PersistenciaLocalScreen.tsx`: Interface com arquitetura de abas para gerenciamento fluido e tratamento de deleção em cascata (`ON DELETE CASCADE`).

### Passos para Executar:

1. Retorne à raiz e certifique-se de que está na pasta do aplicativo:
```bash
cd technaveia

```


2. Instale as dependências do ecossistema Expo:
```bash
npm install

```


3. Inicie o servidor do Expo Metro Bundler:
```bash
npx expo start

```



### Como testar no dispositivo:

* **Aba UFs e Cidades:** O aplicativo possui uma rotina automatizada (`CREATE TABLE IF NOT EXISTS`) que gera as tabelas locais no SQLite no momento em que a tela é aberta pela primeira vez.
* **Modo Isolado:** Para testar esta tela diretamente sem passar pelo fluxo de autenticação do grupo, o componente `<PersistenciaLocalScreen />` pode ser invocado diretamente no `App.tsx` da raiz.

---

## ⚙️ Tecnologias Utilizadas

* **Infraestrutura Web (Pasta `api`):** NodeJS, TypeScript, Drizzle ORM, SQLite.
* **Evolução Mobile (Pasta `src-api`):** React Native (Expo SDK 54), Expo SQLite, Drizzle ORM.

```
