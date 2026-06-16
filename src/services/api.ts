/**
 * TechNaVeia — API Service Layer
 *
 * Camada de serviços tipada que consome a API REST do backend.
 * Inclui normalização de respostas e tratamento de erros.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Configuração ─────────────────────────────────────────

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/v1';
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
  cliente?: { nome: string; foto?: string };
  avaliacao?: { id: string; nota: number } | null;
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
  encerrado?: boolean;
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

      // Token expirado → força logout
      if (res.status === 401) {
        await AsyncStorage.removeItem('@technaveia:session');
        await AsyncStorage.removeItem('@technaveia:token');
        // O AuthContext escuta mudanças no estado — próximo render deslogará
      }

      throw new ApiError(res.status, err.message ?? `Erro ${res.status}`, err);
    }

    const json = await res.json();

    // Unwrap envelope { success, data, ... }
    if (json !== null && typeof json === 'object' && 'success' in json) {
      if ('data' in json) {
        return json.data as T;
      }
      const { success, ...rest } = json;
      return rest as T;
    }

    return json as T;
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

// ─── Normalização de userType (backend retorna pt-BR) ─────

type RawUserType = 'client' | 'tech' | 'admin' | 'cliente' | 'tecnico' | 'administrador';

function normalizeUserType(raw: RawUserType): 'client' | 'tech' | 'admin' {
  if (raw === 'cliente')        return 'client';
  if (raw === 'tecnico')        return 'tech';
  if (raw === 'administrador')  return 'admin';
  return raw as 'client' | 'tech' | 'admin';
}

interface RawAuthResponse {
  token: string;
  refreshToken?: string;
  userType: RawUserType;
  user: User & { role?: string };
}

function normalizeAuthResponse(raw: RawAuthResponse) {
  return {
    token: raw.token,
    userType: normalizeUserType(raw.userType),
    user: raw.user,
  };
}

// ─── Normalização de pedido ───────────────────────────────

function normalizeOrder(raw: any): Order {
  const tecnico = raw.tecnico ? {
    id: raw.tecnico.id,
    userId: raw.tecnico.usuarioId ?? raw.tecnico.id,
    nome: raw.tecnico.usuario?.nome ?? raw.tecnico.nome ?? '',
    email: raw.tecnico.usuario?.email ?? raw.tecnico.email ?? '',
    foto: raw.tecnico.usuario?.foto ?? raw.tecnico.foto ?? undefined,
    especialidades: (raw.tecnico.especialidades ?? []).map((e: any) =>
      typeof e === 'string' ? e : e.categoria
    ),
    avaliacao: raw.tecnico.avaliacao ?? 0,
    totalAvaliacoes: raw.tecnico.totalAvaliacoes ?? 0,
    verificado: raw.tecnico.verificado ?? false,
    modalidade: raw.tecnico.modalidade ?? 'presencial',
    status: raw.tecnico.status ?? 'aprovado',
  } as Technician : undefined;

  return {
    id: raw.id,
    numero: raw.numero,
    clienteId: raw.clienteId,
    tecnicoId: raw.tecnicoId ?? undefined,
    tecnico,
    cliente: raw.cliente ?? undefined,
    avaliacao: raw.avaliacao ?? undefined,
    categoria: raw.categoria,
    subcategoria: raw.subcategoria,
    descricao: raw.descricao,
    modalidade: raw.modalidade,
    endereco: raw.endereco ?? undefined,
    dataAgendada: raw.dataAgendada
      ? new Date(raw.dataAgendada).toLocaleDateString('pt-BR')
      : undefined,
    horaAgendada: raw.dataAgendada
      ? new Date(raw.dataAgendada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : undefined,
    status: raw.status,
    valorEstimado: raw.valorEstimado ?? undefined,
    valorFinal: raw.valorFinal ?? undefined,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

// ─── Serviços de autenticação ──────────────────────────────

export const authService = {
  async login(email: string, password: string) {
    const raw = await post<RawAuthResponse>('/auth/login', { email, senha: password });
    return normalizeAuthResponse(raw);
  },

  async register(data: {
    nome: string;
    cpf: string;
    email: string;
    telefone: string;
    senha: string;
    endereco: object;
    tipo?: 'client' | 'tech';
    especialidades?: string[];
    raioAtendimento?: number;
    modalidade?: string;
    whatsapp?: string;
    banco?: string;
    tipoConta?: string;
    chavePix?: string;
    agencia?: string;
    conta?: string;
  }) {
    const raw = await post<RawAuthResponse>('/auth/register', data);
    return normalizeAuthResponse(raw);
  },

  async forgotPassword(email: string) {
    return post<{ success: boolean }>('/auth/forgot-password', { email });
  },

  async verifyCode(email: string, code: string) {
    return post<{ token: string }>('/auth/verify-code', { email, code });
  },

  async resetPassword(token: string, newPassword: string) {
    return post<{ success: boolean }>('/auth/reset-password', { token, newPassword });
  },
};

// ─── Serviços de técnicos ──────────────────────────────────

export const technicianService = {
  async search(params?: { categoria?: string; distancia?: number; avaliacao?: number; modalidade?: string; query?: string; page?: number; perPage?: number }) {
    const { page = 1, perPage = 20, ...filters } = params ?? {};
    const qs = new URLSearchParams({
      ...filters as Record<string, string>,
      page: String(page),
      perPage: String(perPage),
    }).toString();
    const raw = await get<any[]>(`/technicians?${qs}`);
    return raw.map(t => ({
      id: t.id,
      userId: t.usuarioId,
      nome: t.usuario?.nome ?? t.nome ?? '',
      email: t.usuario?.email ?? t.email ?? '',
      foto: t.usuario?.foto ?? t.foto ?? undefined,
      especialidades: [
        ...(t.especialidades ?? []).map((e: any) => typeof e === 'string' ? e : e.categoria),
        ...(t.servicos ?? []).map((s: any) => s.nome),
      ].filter((v, i, a) => a.indexOf(v) === i),
      avaliacao: t.avaliacao ?? 0,
      totalAvaliacoes: t.totalAvaliacoes ?? 0,
      distancia: t.distancia ?? undefined,
      precoMedio: t.precoMedio ?? undefined,
      verificado: t.verificado ?? false,
      bio: t.bio ?? undefined,
      modalidade: t.modalidade ?? 'presencial',
      status: t.status ?? 'aprovado',
    } as Technician));
  },

  async getById(id: string) {
    return get<Technician>(`/technicians/${id}`);
  },

  async getMe() {
    return get<any>('/technicians/me');
  },

  async getReviews(techId: string) {
    return get<Review[]>(`/technicians/${techId}/reviews`);
  },
};

// ─── Serviços de pedidos ───────────────────────────────────

export const orderService = {
  async list(params?: { status?: string; page?: number; perPage?: number }) {
    const { status, page = 1, perPage = 20 } = params ?? {};
    const qs = new URLSearchParams({
      ...(status ? { status } : {}),
      page: String(page),
      perPage: String(perPage),
    }).toString();
    const raw = await get<any[]>(`/orders?${qs}`);
    return raw.map(normalizeOrder);
  },

  async getById(id: string) {
    const raw = await get<any>(`/orders/${id}`);
    return normalizeOrder(raw);
  },

  async create(data: Partial<Order>) {
    return post<Order>('/orders', data);
  },

  async cancel(id: string) {
    return del<{ success: boolean }>(`/orders/${id}`);
  },

  async review(id: string, data: Partial<Review>) {
    return post<Review>(`/orders/${id}/review`, data);
  },
};

// ─── Serviços de chat ──────────────────────────────────────

export const chatService = {
  async listConversations() {
    const raw = await get<any[]>('/conversations');
    const sessionRaw = await AsyncStorage.getItem('@technaveia:session');
    const myId = sessionRaw ? JSON.parse(sessionRaw).user?.id : null;

    return raw.map((c: any): Conversation => {
      const participantes = c.participantes ?? [];
      const outro = participantes.find((p: any) => p.usuario?.id !== myId)?.usuario
        ?? participantes[0]?.usuario
        ?? { id: '', nome: 'Usuário', foto: null };

      const ultimaMensagem = c.mensagens?.[0] ?? null;

      return {
        id: c.id,
        participantes: participantes.map((p: any) => p.usuarioId ?? p.usuario?.id),
        outroUsuario: {
          id: outro.id,
          nome: outro.nome,
          foto: outro.foto ?? undefined,
          online: false,
        },
        ultimaMensagem: ultimaMensagem ? {
          id: ultimaMensagem.id,
          conversaId: c.id,
          remetenteId: ultimaMensagem.remetenteId,
          tipo: ultimaMensagem.tipo,
          conteudo: ultimaMensagem.conteudo,
          lida: ultimaMensagem.lida,
          createdAt: ultimaMensagem.createdAt,
        } : undefined,
        naoLidas: 0,
        pedidoId: c.pedidoId ?? undefined,
        encerrado: c.pedido?.status === 'concluido' || c.pedido?.status === 'cancelado',
        updatedAt: c.updatedAt,
      };
    });
  },

  async getMessages(conversaId: string) {
    return get<Message[]>(`/conversations/${conversaId}/messages`);
  },

  async sendMessage(conversaId: string, data: { tipo: Message['tipo']; conteudo: string; metadados?: Record<string, unknown> }) {
    return post<Message>(`/conversations/${conversaId}/messages`, data);
  },
};

// ─── Serviços financeiros (técnico) ───────────────────────

export const financeService = {
  async getSummary() {
    return get<FinanceSummary>('/finance/summary');
  },

  async requestWithdraw(valor: number, contaBancariaId: string) {
    return post<{ success: boolean; prazo: string }>('/finance/withdraw', { valor, contaBancariaId });
  },
};

// ─── Serviços de notificações ──────────────────────────────

export const notificationService = {
  async list() {
    return get<Notification[]>('/notifications');
  },

  async markAllRead() {
    return post<{ success: boolean }>('/notifications/read-all', {});
  },
};
