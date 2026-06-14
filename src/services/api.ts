/**
 * TechNaVeia — API Service Layer
 *
 * Estrutura pensada para desenvolvimento progressivo:
 * - Hoje: USE_MOCK = true  → retorna dados simulados localmente
 * - Produção: USE_MOCK = false + BASE_URL configurada → chama a API real
 *
 * Para trocar um endpoint específico para real antes dos outros,
 * basta remover o bloco `if (USE_MOCK)` daquele método.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Configuração ─────────────────────────────────────────

const BASE_URL = 'https://api.technaveia.com.br/v1'; // TODO: trocar pela URL real
const USE_MOCK = false; // Desligar quando a API estiver pronta
const REQUEST_TIMEOUT = 10_000; // 10 segundos

// ─── Tipos base ───────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public raw?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Tipos de domínio ─────────────────────────────────────

export interface User {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  foto?: string;
  cidade?: string;
  role: 'client' | 'tech' | 'admin';
  createdAt: string;
}

export interface Technician {
  id: string;
  userId: string;
  nome: string;
  email: string;
  foto?: string;
  especialidades: string[];
  avaliacao: number;
  totalAvaliacoes: number;
  distancia?: string;
  precoMedio?: string;
  verificado: boolean;
  bio?: string;
  modalidade: 'presencial' | 'remoto' | 'ambos';
  status: 'pendente' | 'aprovado' | 'suspenso';
}

export interface Order {
  id: string;
  numero: string;
  clienteId: string;
  tecnicoId?: string;
  tecnico?: Technician;
  categoria: string;
  subcategoria: string;
  descricao: string;
  modalidade: 'presencial' | 'remoto';
  endereco?: string;
  dataAgendada?: string;
  horaAgendada?: string;
  status: 'solicitado' | 'aceito' | 'andamento' | 'concluido' | 'cancelado' | 'disputa';
  valorEstimado?: string;
  valorFinal?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  pedidoId: string;
  tecnicoId: string;
  tecnico?: Technician;
  itens: BudgetItem[];
  total: number;
  desconto?: number;
  prazoExecucao: string;
  validade: string;
  observacoes?: string;
  status: 'pendente' | 'aceito' | 'recusado' | 'expirado';
  createdAt: string;
}

export interface BudgetItem {
  id: string;
  descricao: string;
  tipo: 'mao_de_obra' | 'peca' | 'deslocamento';
  valor: number;
  quantidade: number;
}

export interface Message {
  id: string;
  conversaId: string;
  remetenteId: string;
  tipo: 'text' | 'image' | 'budget' | 'system';
  conteudo: string;
  metadados?: Record<string, unknown>;
  lida: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantes: string[];
  outroUsuario: {
    id: string;
    nome: string;
    foto?: string;
    online: boolean;
  };
  ultimaMensagem?: Message;
  naoLidas: number;
  pedidoId?: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  pedidoId: string;
  clienteId: string;
  tecnicoId: string;
  cliente?: { nome: string; foto?: string };
  nota: number;
  pontualidade?: number;
  qualidade?: number;
  comunicacao?: number;
  custobeneficio?: number;
  comentario?: string;
  recomenda?: boolean;
  resposta?: string;
  createdAt: string;
}

export interface FinanceSummary {
  saldoDisponivel: number;
  saldoPendente: number;
  ganhosMes: number;
  ganhosMesAnterior: number;
  ganhosSemana: number[];
  transacoes: Transaction[];
}

export interface Transaction {
  id: string;
  tipo: 'credito' | 'saque' | 'taxa';
  servico?: string;
  cliente?: string;
  valorBruto: number;
  taxa: number;
  valorLiquido: number;
  status: 'pendente' | 'concluido' | 'falhou';
  date: string;
}

export interface Notification {
  id: string;
  tipo: 'request' | 'payment' | 'budget' | 'message' | 'system' | 'evaluation';
  titulo: string;
  descricao: string;
  lida: boolean;
  actionUrl?: string;
  createdAt: string;
}

// ─── Cliente HTTP base ─────────────────────────────────────

async function httpRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  endpoint: string,
  body?: unknown
): Promise<T> {
  const token = await AsyncStorage.getItem('@technaveia:token');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new ApiError(res.status, err.message ?? `Erro ${res.status}`, err);
    }

    return res.json() as Promise<T>;
  } catch (error) {
    clearTimeout(timeout);
    if ((error as Error).name === 'AbortError') {
      throw new ApiError(408, 'Tempo limite da requisição excedido');
    }
    throw error;
  }
}

// Atalhos tipados
const get  = <T>(url: string)               => httpRequest<T>('GET', url);
const post = <T>(url: string, body: unknown) => httpRequest<T>('POST', url, body);
const put  = <T>(url: string, body: unknown) => httpRequest<T>('PUT', url, body);
const del  = <T>(url: string)               => httpRequest<T>('DELETE', url);

// ─── Simulador de latência (apenas em mock) ───────────────

function delay(ms = 600): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

// ─── Mock data ────────────────────────────────────────────

const MOCK_TECHNICIANS: Technician[] = [
  { id: '1', userId: 't1', nome: 'Ricardo Silva', email: 'ricardo@email.com', especialidades: ['Redes', 'Hardware', 'Windows'], avaliacao: 4.9, totalAvaliacoes: 128, distancia: '2.5km', precoMedio: 'R$ 80–150', verificado: true, modalidade: 'ambos', status: 'aprovado', bio: 'Técnico certificado com mais de 10 anos de experiência em infraestrutura de TI.' },
  { id: '2', userId: 't2', nome: 'Ana Oliveira', email: 'ana@email.com', especialidades: ['Notebooks', 'Celulares'], avaliacao: 5.0, totalAvaliacoes: 74, distancia: '3.8km', precoMedio: 'R$ 100–200', verificado: true, modalidade: 'presencial', status: 'aprovado' },
  { id: '3', userId: 't3', nome: 'Marcos Paulo', email: 'marcos@email.com', especialidades: ['Redes', 'Automação'], avaliacao: 4.7, totalAvaliacoes: 52, distancia: '5.1km', precoMedio: 'R$ 70–130', verificado: false, modalidade: 'presencial', status: 'aprovado' },
];

const MOCK_ORDERS: Order[] = [
  { id: '1', numero: '#8829', clienteId: 'u1', tecnicoId: '1', categoria: 'Computadores', subcategoria: 'Hardware', descricao: 'Troca de fonte de alimentação.', modalidade: 'presencial', endereco: 'Av. Paulista, 1000', dataAgendada: 'Hoje', horaAgendada: '14:00', status: 'andamento', valorEstimado: 'R$ 150–200', valorFinal: 315, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', numero: '#8821', clienteId: 'u1', tecnicoId: '2', categoria: 'Redes', subcategoria: 'Roteador', descricao: 'Configuração de roteador novo.', modalidade: 'presencial', endereco: 'R. Augusta, 500', dataAgendada: 'Amanhã', horaAgendada: '10:00', status: 'aceito', valorEstimado: 'A definir', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', numero: '#8801', clienteId: 'u1', tecnicoId: '3', categoria: 'Computadores', subcategoria: 'Formatação', descricao: 'Formatação completa com backup.', modalidade: 'presencial', endereco: 'R. da Consolação, 200', dataAgendada: '10/05/2026', horaAgendada: '09:30', status: 'concluido', valorFinal: 150, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '4', numero: '#8790', clienteId: 'u1', categoria: 'Celulares', subcategoria: 'Tela', descricao: 'Troca de tela quebrada.', modalidade: 'presencial', status: 'cancelado', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const MOCK_CONVERSATIONS: Conversation[] = [
  { id: 'c1', participantes: ['u1', 't1'], outroUsuario: { id: 't1', nome: 'Ricardo Silva (Técnico)', online: true }, ultimaMensagem: { id: 'm1', conversaId: 'c1', remetenteId: 't1', tipo: 'text', conteudo: 'O orçamento já está pronto!', lida: false, createdAt: new Date().toISOString() }, naoLidas: 2, pedidoId: '1', updatedAt: new Date().toISOString() },
  { id: 'c2', participantes: ['u1', 't2'], outroUsuario: { id: 't2', nome: 'Ana Oliveira', online: false }, ultimaMensagem: { id: 'm2', conversaId: 'c2', remetenteId: 'u1', tipo: 'text', conteudo: 'Pode vir amanhã às 10h?', lida: true, createdAt: new Date().toISOString() }, naoLidas: 0, updatedAt: new Date().toISOString() },
];

const MOCK_MESSAGES: Message[] = [
  { id: 'm0', conversaId: 'c1', remetenteId: 'system', tipo: 'system', conteudo: 'Pedido #8829 criado', lida: true, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'm1', conversaId: 'c1', remetenteId: 't1', tipo: 'text', conteudo: 'Olá! Recebi sua solicitação. Posso ir amanhã às 14h, tudo bem?', lida: true, createdAt: new Date(Date.now() - 3000000).toISOString() },
  { id: 'm2', conversaId: 'c1', remetenteId: 'u1', tipo: 'text', conteudo: 'Perfeito, estarei aguardando!', lida: true, createdAt: new Date(Date.now() - 2400000).toISOString() },
  { id: 'm3', conversaId: 'c1', remetenteId: 't1', tipo: 'budget', conteudo: 'Orçamento enviado: R$ 315,00', metadados: { budgetId: 'b1', total: 315 }, lida: false, createdAt: new Date(Date.now() - 600000).toISOString() },
];

// ─── Serviços de autenticação ──────────────────────────────

export const authService = {
  async login(email: string, password: string) {
    if (USE_MOCK) {
      await delay();
      if (email === 'teste@email.com' && password === '123456') {
        return { token: 'mock_token_cliente', userType: 'client' as const, user: { id: 'u1', nome: 'Carlos Andrade', email, role: 'client' as const, createdAt: new Date().toISOString() } };
      }
      if (email === 'tecnico@email.com' && password === '123456') {
        return { token: 'mock_token_tecnico', userType: 'tech' as const, user: { id: 't1', nome: 'Ricardo Silva', email, role: 'tech' as const, createdAt: new Date().toISOString() } };
      }
      throw new ApiError(401, 'E-mail ou senha incorretos');
    }
    return post<{ token: string; userType: 'client' | 'tech' | 'admin'; user: User }>('/auth/login', { email, password });
  },

  async register(data: { nome: string; cpf: string; email: string; telefone: string; senha: string; endereco: object }) {
    if (USE_MOCK) {
      await delay(1200);
      return { token: 'mock_token_new', userType: 'client' as const, user: { id: Date.now().toString(), nome: data.nome, email: data.email, role: 'client' as const, createdAt: new Date().toISOString() } };
    }
    return post<{ token: string; userType: 'client' | 'tech' | 'admin'; user: User }>('/auth/register', data);
  },

  async forgotPassword(email: string) {
    if (USE_MOCK) { await delay(); return { success: true }; }
    return post<{ success: boolean }>('/auth/forgot-password', { email });
  },

  async verifyCode(email: string, code: string) {
    if (USE_MOCK) {
      await delay();
      if (code === '123456') return { token: 'reset_token_mock' };
      throw new ApiError(400, 'Código inválido ou expirado');
    }
    return post<{ token: string }>('/auth/verify-code', { email, code });
  },

  async resetPassword(token: string, newPassword: string) {
    if (USE_MOCK) { await delay(); return { success: true }; }
    return post<{ success: boolean }>('/auth/reset-password', { token, newPassword });
  },
};

// ─── Serviços de técnicos ──────────────────────────────────

export const technicianService = {
  async search(params?: { categoria?: string; distancia?: number; avaliacao?: number; modalidade?: string; query?: string }) {
    if (USE_MOCK) {
      await delay();
      return MOCK_TECHNICIANS;
    }
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return get<Technician[]>(`/technicians?${qs}`);
  },

  async getById(id: string) {
    if (USE_MOCK) {
      await delay(400);
      const tech = MOCK_TECHNICIANS.find(t => t.id === id);
      if (!tech) throw new ApiError(404, 'Técnico não encontrado');
      return tech;
    }
    return get<Technician>(`/technicians/${id}`);
  },

  async getReviews(techId: string) {
    if (USE_MOCK) {
      await delay();
      return [
        { id: 'r1', pedidoId: '3', clienteId: 'u1', tecnicoId: techId, cliente: { nome: 'Mariana Silva' }, nota: 5, comentario: 'Ricardo foi super atencioso. Resolveu em 40 minutos!', recomenda: true, createdAt: new Date().toISOString() },
        { id: 'r2', pedidoId: '2', clienteId: 'u2', tecnicoId: techId, cliente: { nome: 'Carlos Andrade' }, nota: 4, comentario: 'Serviço muito bom, preço justo. Só atrasou uns minutinhos.', recomenda: true, createdAt: new Date().toISOString() },
      ] as Review[];
    }
    return get<Review[]>(`/technicians/${techId}/reviews`);
  },
};

// ─── Serviços de pedidos ───────────────────────────────────

export const orderService = {
  async list(status?: string) {
    if (USE_MOCK) {
      await delay();
      return status ? MOCK_ORDERS.filter(o => o.status === status) : MOCK_ORDERS;
    }
    return get<Order[]>(`/orders${status ? `?status=${status}` : ''}`);
  },

  async getById(id: string) {
    if (USE_MOCK) {
      await delay(400);
      const order = MOCK_ORDERS.find(o => o.id === id);
      if (!order) throw new ApiError(404, 'Pedido não encontrado');
      return { ...order, tecnico: MOCK_TECHNICIANS.find(t => t.id === order.tecnicoId) };
    }
    return get<Order>(`/orders/${id}`);
  },

  async create(data: Partial<Order>) {
    if (USE_MOCK) {
      await delay(800);
      return { ...data, id: Date.now().toString(), numero: `#${Math.floor(Math.random() * 9000) + 1000}`, status: 'solicitado', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Order;
    }
    return post<Order>('/orders', data);
  },

  async cancel(id: string) {
    if (USE_MOCK) { await delay(); return { success: true }; }
    return del<{ success: boolean }>(`/orders/${id}`);
  },

  async review(id: string, data: Partial<Review>) {
    if (USE_MOCK) { await delay(600); return { success: true }; }
    return post<Review>(`/orders/${id}/review`, data);
  },
};

// ─── Serviços de chat ──────────────────────────────────────

export const chatService = {
  async listConversations() {
    if (USE_MOCK) { await delay(); return MOCK_CONVERSATIONS; }
    return get<Conversation[]>('/conversations');
  },

  async getMessages(conversaId: string) {
    if (USE_MOCK) {
      await delay(400);
      return MOCK_MESSAGES.filter(m => m.conversaId === conversaId);
    }
    return get<Message[]>(`/conversations/${conversaId}/messages`);
  },

  async sendMessage(conversaId: string, data: { tipo: Message['tipo']; conteudo: string; metadados?: Record<string, unknown> }) {
    if (USE_MOCK) {
      await delay(300);
      return { id: Date.now().toString(), conversaId, remetenteId: 'u1', lida: false, createdAt: new Date().toISOString(), ...data } as Message;
    }
    return post<Message>(`/conversations/${conversaId}/messages`, data);
  },
};

// ─── Serviços financeiros (técnico) ───────────────────────

export const financeService = {
  async getSummary() {
    if (USE_MOCK) {
      await delay();
      return {
        saldoDisponivel: 1450.20,
        saldoPendente: 420.00,
        ganhosMes: 4280.00,
        ganhosMesAnterior: 3900.00,
        ganhosSemana: [40, 70, 45, 90, 65, 30, 85],
        transacoes: [
          { id: 't1', tipo: 'credito', servico: 'Formatação PC', cliente: 'João Pedro', valorBruto: 150, taxa: 22.50, valorLiquido: 127.50, status: 'concluido', date: 'Hoje' },
          { id: 't2', tipo: 'credito', servico: 'Troca de Tela', cliente: 'Carla Mendes', valorBruto: 350, taxa: 52.50, valorLiquido: 297.50, status: 'pendente', date: 'Ontem' },
        ] as Transaction[],
      } as FinanceSummary;
    }
    return get<FinanceSummary>('/finance/summary');
  },

  async requestWithdraw(valor: number, contaBancariaId: string) {
    if (USE_MOCK) { await delay(1500); return { success: true, prazo: '1-3 dias úteis' }; }
    return post<{ success: boolean; prazo: string }>('/finance/withdraw', { valor, contaBancariaId });
  },
};

// ─── Serviços de notificações ──────────────────────────────

export const notificationService = {
  async list() {
    if (USE_MOCK) {
      await delay();
      return [
        { id: 'n1', tipo: 'request', titulo: 'Nova solicitação!', descricao: 'Formatação de PC em Santana disponível.', lida: false, createdAt: new Date(Date.now() - 120000).toISOString() },
        { id: 'n2', tipo: 'payment', titulo: 'Pagamento Confirmado', descricao: 'O valor do pedido #8829 já está no seu saldo.', lida: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: 'n3', tipo: 'budget', titulo: 'Orçamento Recebido', descricao: 'O técnico Ricardo enviou uma proposta.', lida: true, createdAt: new Date(Date.now() - 10800000).toISOString() },
        { id: 'n4', tipo: 'message', titulo: 'Nova Mensagem', descricao: 'Ana: "Pode vir amanhã às 10h?"', lida: true, createdAt: new Date(Date.now() - 18000000).toISOString() },
      ] as Notification[];
    }
    return get<Notification[]>('/notifications');
  },

  async markAllRead() {
    if (USE_MOCK) { await delay(300); return { success: true }; }
    return post<{ success: boolean }>('/notifications/read-all', {});
  },
};