# 📱 TechNaVeia — Frontend Mobile

Aplicativo mobile da plataforma **TechNaVeia**, que conecta clientes a técnicos de serviços diversos (manutenção, TI, elétrica, etc.). Desenvolvido com React Native e Expo.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Execução](#instalação-e-execução)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Funcionalidades](#funcionalidades)
- [Melhorias Futuras](#melhorias-futuras)

## Sobre o Projeto

O TechNaVeia é uma plataforma de marketplace de serviços técnicos com três perfis de usuário:

- **Cliente** — Solicita serviços, acompanha pedidos, realiza pagamentos e avalia técnicos.
- **Técnico** — Gerencia serviços oferecidos, agenda atendimentos, envia orçamentos e recebe pagamentos.
- **Admin** — Modera técnicos, gerencia usuários, acompanha finanças e comunicações.

## Tecnologias

| Tecnologia | Versão | Descrição |
|---|---|---|
| React Native | 0.81.5 | Framework mobile multiplataforma |
| Expo | SDK 54 | Plataforma de desenvolvimento e build |
| React | 19.1.0 | Biblioteca de UI |
| TypeScript | 5.9 | Tipagem estática |
| React Navigation | 7.x | Navegação (native-stack + bottom-tabs) |
| AsyncStorage | 2.2.0 | Persistência local de sessão |
| Expo Image Picker | 17.x | Seleção de imagens |
| React Native Calendars | 1.x | Componente de calendário |
| Jest | 30.x | Framework de testes |
| ESLint + Prettier | — | Linting e formatação |

## Estrutura do Projeto

```
src/
├── __tests__/           # Testes unitários
├── components/          # Componentes reutilizáveis (Button, Input, OTPInput, etc.)
├── contexts/            # Context API (AuthContext)
├── navigation/          # Navegação por stacks e tabs
│   ├── AuthStack.tsx    # Telas de autenticação
│   ├── ClientStack.tsx  # Telas do cliente
│   ├── TechStack.tsx    # Telas do técnico
│   ├── AdminStack.tsx   # Telas do admin
│   ├── ClientTabs.tsx   # Tab navigation do cliente
│   └── TechTabs.tsx     # Tab navigation do técnico
├── screens/             # Telas organizadas por domínio
│   ├── admin/           # Dashboard, finanças, moderação
│   ├── auth/            # Login, registro, recuperação de senha
│   ├── chat/            # Lista de conversas e chat
│   ├── cliente/         # Home, pedidos, pagamentos
│   ├── notificacoes/    # Central de notificações
│   ├── profile/         # Perfil do usuário
│   ├── support/         # Suporte e FAQ
│   └── tech/            # Serviços, agenda, orçamentos
├── services/            # Camada de API e serviços
│   ├── api.ts           # Cliente HTTP configurado
│   ├── addressService.ts
│   ├── pushNotifications.ts
│   └── uploadService.ts
└── theme/               # Cores e estilos globais
```

## Pré-requisitos

- **Node.js** >= 18.x
- **npm** ou **yarn**
- **Expo CLI** (`npx expo`)
- **Expo Go** no celular (para testes) ou emulador Android/iOS

## Instalação e Execução

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd technaveia

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com a URL da API

# 4. Inicie o servidor de desenvolvimento
npx expo start
```

### Executar em plataformas específicas

```bash
# Android (emulador ou dispositivo conectado)
npx expo start --android

# iOS (apenas macOS com Xcode)
npx expo start --ios

# Web (navegador)
npx expo start --web
```

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz com:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/v1
```

| Variável | Descrição |
|---|---|
| `EXPO_PUBLIC_API_URL` | URL base da API backend (ex: `https://technaveia-backend.onrender.com/v1`) |

## Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm start` | Inicia o servidor de desenvolvimento Expo |
| `npm run android` | Abre no Android |
| `npm run ios` | Abre no iOS |
| `npm run web` | Abre no navegador |
| `npm run lint` | Executa o ESLint |
| `npm run format` | Formata o código com Prettier |
| `npm test` | Executa os testes com Jest |

## Funcionalidades

### Autenticação
- Login com email/senha
- Registro com validação
- Recuperação de senha com código OTP
- Sessão persistente com AsyncStorage
- Logout automático em caso de token expirado (HTTP 401)

### Cliente
- Home com categorias de serviço
- Solicitação de serviço com fotos e descrição
- Visualização e aceitação de orçamentos
- Acompanhamento de pedidos em tempo real
- Pagamento integrado
- Avaliação de técnicos
- Chat com técnico

### Técnico
- Dashboard com estatísticas
- Gerenciamento de serviços e especialidades
- Envio de orçamentos detalhados
- Agenda de atendimentos
- Histórico financeiro e saques

### Admin
- Dashboard com métricas gerais
- Gerenciamento de usuários
- Moderação de técnicos
- Gestão financeira
- Gerenciamento de pedidos
- Comunicações

### Geral
- Push notifications
- Chat em tempo real
- Central de notificações
- Perfil editável com foto
- FAQ e suporte

## Melhorias Futuras

- [ ] **Pagamento real** — Integração com gateway de pagamento (Stripe, Mercado Pago)
- [ ] **Geolocalização** — Mapa com técnicos próximos e raio de atendimento
- [ ] **Chat em tempo real** — WebSocket/Socket.IO para mensagens instantâneas
- [ ] **Upload otimizado** — Compressão de imagens e upload para CDN (S3/Cloudinary)
- [ ] **Modo offline** — Cache de dados para uso sem internet
- [ ] **Testes E2E** — Implementar testes de ponta a ponta com Detox
- [ ] **Acessibilidade** — Melhoria de labels, contraste e suporte a leitores de tela
- [ ] **Internacionalização (i18n)** — Suporte a múltiplos idiomas
- [ ] **Dark mode** — Tema escuro
- [ ] **Animações** — Transições e micro-interações com Reanimated
- [ ] **CI/CD** — Pipeline de build e deploy automático (EAS Build)
- [ ] **Monitoramento** — Integração com Sentry para rastreamento de erros
- [ ] **Avaliação por fotos** — Permitir que o cliente envie fotos na avaliação

👥 Equipe de desenvolvimento

Desenvolvido por estudantes da UCB (Universidade Católica de Brasília):

Lia Costa (https://github.com/LiaCost)
Sarah Silva (https://github.com/sah524)
Taís Barbosa (https://github.com/TaisBds) 
Andressa Castro (https://github.com/AndressaCst)

## 📄 Licença

Projeto privado — Todos os direitos reservados.
