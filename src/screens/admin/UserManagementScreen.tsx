import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ─── Tipos ────────────────────────────────────────────────

type UserStatus = 'ativo' | 'bloqueado' | 'suspenso';
type UserRole   = 'cliente' | 'tecnico';

interface AppUser {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  cidade: string;
  role: UserRole;
  status: UserStatus;
  totalPedidos: number;
  createdAt: string;
  lastLogin: string;
}

// ─── Mock ─────────────────────────────────────────────────

const MOCK_USERS: AppUser[] = [
  { id: 'u1', nome: 'Carlos Andrade', email: 'carlos@email.com', cpf: '123.456.789-00', telefone: '(11) 99999-1234', cidade: 'São Paulo – SP', role: 'cliente', status: 'ativo', totalPedidos: 8, createdAt: '12 Jan 2026', lastLogin: 'Hoje' },
  { id: 'u2', nome: 'Beatriz Santos', email: 'bia.santos@email.com', cpf: '987.654.321-00', telefone: '(11) 98888-5678', cidade: 'São Paulo – SP', role: 'cliente', status: 'ativo', totalPedidos: 3, createdAt: '05 Fev 2026', lastLogin: 'Ontem' },
  { id: 'u3', nome: 'Rodrigo Pereira', email: 'rodrigo.p@email.com', cpf: '111.222.333-44', telefone: '(21) 97777-9012', cidade: 'Rio de Janeiro – RJ', role: 'cliente', status: 'bloqueado', totalPedidos: 1, createdAt: '20 Mar 2026', lastLogin: '10 Mai 2026' },
  { id: 'u4', nome: 'Fernanda Lima', email: 'fern.lima@email.com', cpf: '555.666.777-88', telefone: '(31) 96666-3456', cidade: 'Belo Horizonte – MG', role: 'cliente', status: 'ativo', totalPedidos: 15, createdAt: '01 Dez 2025', lastLogin: 'Hoje' },
  { id: 'u5', nome: 'Paulo Nascimento', email: 'paulo.n@email.com', cpf: '999.888.777-66', telefone: '(41) 95555-7890', cidade: 'Curitiba – PR', role: 'cliente', status: 'suspenso', totalPedidos: 0, createdAt: '15 Abr 2026', lastLogin: 'Nunca' },
];

const STATUS_CFG: Record<UserStatus, { label: string; color: string; bg: string }> = {
  ativo:     { label: 'Ativo',     color: '#2E7D32', bg: '#E8F5E9' },
  bloqueado: { label: 'Bloqueado', color: '#C62828', bg: '#FFEBEE' },
  suspenso:  { label: 'Suspenso',  color: '#E65100', bg: '#FFF3E0' },
};

// ─── Subcomponentes ───────────────────────────────────────

function UserCard({ user, onPress }: { user: AppUser; onPress: () => void }) {
  const cfg = STATUS_CFG[user.status];
  return (
    <TouchableOpacity style={uc.card} onPress={onPress}>
      <View style={uc.avatar}>
        <Text style={uc.initials}>
          {user.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
        </Text>
      </View>
      <View style={{ flex: 1, marginLeft: 14 }}>
        <View style={uc.nameRow}>
          <Text style={uc.name} numberOfLines={1}>{user.nome}</Text>
          <View style={[uc.badge, { backgroundColor: cfg.bg }]}>
            <Text style={[uc.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>
        <Text style={uc.email} numberOfLines={1}>{user.email}</Text>
        <View style={uc.metaRow}>
          <Ionicons name="location-outline" size={12} color="#AAA" />
          <Text style={uc.meta}>{user.cidade}</Text>
          <Ionicons name="receipt-outline" size={12} color="#AAA" style={{ marginLeft: 10 }} />
          <Text style={uc.meta}>{user.totalPedidos} pedidos</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#DDD" />
    </TouchableOpacity>
  );
}

const uc = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', borderRadius: 16, padding: 14, marginBottom: 10,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6,
  },
  avatar: {
    width: 46, height: 46, borderRadius: 13,
    backgroundColor: '#E8EEFF', justifyContent: 'center', alignItems: 'center',
  },
  initials: { fontSize: 15, fontWeight: '700', color: '#3F51B5' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  name: { fontSize: 14, fontWeight: '700', color: '#222', flex: 1 },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  email: { fontSize: 12, color: '#888', marginBottom: 5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { fontSize: 11, color: '#AAA' },
});

// ─── Tela principal ────────────────────────────────────────

export function UserManagementScreen({ navigation }: any) {
  const [users, setUsers] = useState<AppUser[]>(MOCK_USERS);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<AppUser | null>(null);
  const [filterStatus, setFilterStatus] = useState<UserStatus | 'todos'>('todos');

  const filtered = users.filter(u => {
    const matchQuery = !query || u.nome.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()) || u.cpf.includes(query);
    const matchStatus = filterStatus === 'todos' || u.status === filterStatus;
    return matchQuery && matchStatus;
  });

  function handleToggleStatus(user: AppUser) {
    const next: UserStatus = user.status === 'ativo' ? 'bloqueado' : 'ativo';
    const label = next === 'bloqueado' ? 'Bloquear' : 'Desbloquear';
    Alert.alert(
      `${label} usuário?`,
      `${label} a conta de ${user.nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: label,
          style: next === 'bloqueado' ? 'destructive' : 'default',
          onPress: () => {
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: next } : u));
            setSelected(s => s ? { ...s, status: next } : null);
          },
        },
      ]
    );
  }

  const FILTER_OPTIONS: { key: UserStatus | 'todos'; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'ativo', label: 'Ativos' },
    { key: 'bloqueado', label: 'Bloqueados' },
    { key: 'suspenso', label: 'Suspensos' },
  ];

  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Gestão de Usuários</Text>
        <Text style={s.headerCount}>{users.length} usuários</Text>
      </View>

      {/* Busca */}
      <View style={s.searchWrap}>
        <Ionicons name="search" size={18} color="#999" />
        <TextInput
          style={s.searchInput}
          placeholder="Buscar por nome, e-mail ou CPF..."
          value={query}
          onChangeText={setQuery}
          placeholderTextColor="#BBB"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color="#CCC" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros */}
      <View style={s.filters}>
        {FILTER_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.key}
            style={[s.filterChip, filterStatus === opt.key && s.filterChipActive]}
            onPress={() => setFilterStatus(opt.key)}
          >
            <Text style={[s.filterText, filterStatus === opt.key && s.filterTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="people-outline" size={44} color="#DDD" />
            <Text style={s.emptyText}>Nenhum usuário encontrado</Text>
          </View>
        }
        renderItem={({ item }) => (
          <UserCard user={item} onPress={() => setSelected(item)} />
        )}
      />

      {/* Modal de detalhe */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={m.overlay}>
          <View style={m.sheet}>
            <View style={m.handle} />
            {selected && (() => {
              const cfg = STATUS_CFG[selected.status];
              return (
                <>
                  <View style={m.userHeader}>
                    <View style={m.bigAvatar}>
                      <Text style={m.bigInitials}>
                        {selected.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 16 }}>
                      <Text style={m.userName}>{selected.nome}</Text>
                      <View style={[m.statusBadge, { backgroundColor: cfg.bg }]}>
                        <Text style={[m.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => setSelected(null)}>
                      <Ionicons name="close" size={22} color="#666" />
                    </TouchableOpacity>
                  </View>

                  {/* Info */}
                  {[
                    { icon: 'mail-outline', label: 'E-mail', val: selected.email },
                    { icon: 'card-outline', label: 'CPF', val: selected.cpf },
                    { icon: 'call-outline', label: 'Telefone', val: selected.telefone },
                    { icon: 'location-outline', label: 'Cidade', val: selected.cidade },
                    { icon: 'calendar-outline', label: 'Cadastro', val: selected.createdAt },
                    { icon: 'time-outline', label: 'Último acesso', val: selected.lastLogin },
                    { icon: 'receipt-outline', label: 'Total de pedidos', val: `${selected.totalPedidos} pedidos` },
                  ].map(row => (
                    <View key={row.label} style={m.infoRow}>
                      <Ionicons name={row.icon as any} size={16} color="#999" style={{ width: 22 }} />
                      <Text style={m.infoLabel}>{row.label}</Text>
                      <Text style={m.infoVal}>{row.val}</Text>
                    </View>
                  ))}

                  {/* Ações */}
                  <View style={m.actions}>
                    <TouchableOpacity
                      style={[m.actionBtn, { backgroundColor: selected.status === 'ativo' ? '#FFEBEE' : '#E8F5E9' }]}
                      onPress={() => handleToggleStatus(selected)}
                    >
                      <Ionicons
                        name={selected.status === 'ativo' ? 'ban-outline' : 'checkmark-circle-outline'}
                        size={18}
                        color={selected.status === 'ativo' ? '#C62828' : '#2E7D32'}
                      />
                      <Text style={{ color: selected.status === 'ativo' ? '#C62828' : '#2E7D32', fontWeight: '700' }}>
                        {selected.status === 'ativo' ? 'Bloquear conta' : 'Desbloquear conta'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[m.actionBtn, { backgroundColor: '#E3F2FD' }]}
                      onPress={() => Alert.alert('Pedidos', `Ver pedidos de ${selected.nome}`)}
                    >
                      <Ionicons name="receipt-outline" size={18} color="#1976D2" />
                      <Text style={{ color: '#1976D2', fontWeight: '700' }}>Ver histórico de pedidos</Text>
                    </TouchableOpacity>
                  </View>
                </>
              );
            })()}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ─── Estilos ───────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F2F5' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#1a1a1a', padding: 20, paddingTop: 16,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#FFF' },
  headerCount: { fontSize: 12, color: '#AAA' },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFF', margin: 16, marginBottom: 8,
    borderRadius: 14, paddingHorizontal: 14, height: 46,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#222' },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 4 },
  filterChip: {
    paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20,
    backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE',
  },
  filterChipActive: { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#666' },
  filterTextActive: { color: '#FFF' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyText: { fontSize: 15, color: '#BBB' },
});

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingTop: 12,
  },
  handle: { width: 40, height: 4, backgroundColor: '#DDD', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  userHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  bigAvatar: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: '#E8EEFF', justifyContent: 'center', alignItems: 'center',
  },
  bigInitials: { fontSize: 18, fontWeight: '700', color: '#3F51B5' },
  userName: { fontSize: 17, fontWeight: '700', color: '#222', marginBottom: 6 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  infoLabel: { fontSize: 13, color: '#AAA', width: 110 },
  infoVal: { fontSize: 13, color: '#333', fontWeight: '500', flex: 1 },
  actions: { gap: 10, marginTop: 20 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderRadius: 14,
  },
});