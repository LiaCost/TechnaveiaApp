import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, TextInput, Alert, Modal, ScrollView, ActivityIndicator,
  RefreshControl, Platform, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/v1';

interface AppUser {
  id: string;
  nome: string;
  email: string;
  cpf?: string;
  telefone?: string;
  role?: string;
  bloqueado: boolean;
  ativo: boolean;
  createdAt: string;
  _count?: { pedidosCliente: number };
}

export function UserManagementScreen({ navigation }: any) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<AppUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  async function load(silent = false) {
    if (!silent) setLoading(true);
    try {
      const token = await AsyncStorage.getItem('@technaveia:token');
      const qs = query ? `?query=${encodeURIComponent(query)}` : '';
      const res = await fetch(`${BASE_URL}/admin/users${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setUsers(json.data ?? []);
      }
    } catch {} finally { setLoading(false); setRefreshing(false); }
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  async function handleToggleBlock(user: AppUser) {
    const action = user.bloqueado ? 'Desbloquear' : 'Bloquear';
    Alert.alert(`${action} usuário?`, `${action} a conta de ${user.nome}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: action, style: user.bloqueado ? 'default' : 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            const token = await AsyncStorage.getItem('@technaveia:token');
            const res = await fetch(`${BASE_URL}/admin/users/${user.id}/block`, {
              method: 'PATCH',
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const json = await res.json();
              const newBlocked = json.data?.bloqueado ?? !user.bloqueado;
              setUsers(prev => prev.map(u => u.id === user.id ? { ...u, bloqueado: newBlocked } : u));
              setSelected(s => s?.id === user.id ? { ...s, bloqueado: newBlocked } : s);
            }
          } catch { Alert.alert('Erro', 'Não foi possível alterar o status.'); }
          finally { setActionLoading(false); }
        },
      },
    ]);
  }

  function getStatus(u: AppUser) {
    if (u.bloqueado) return { label: 'Bloqueado', color: '#C62828', bg: '#FFEBEE' };
    return { label: 'Ativo', color: '#2E7D32', bg: '#E8F5E9' };
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F2F5" />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Gestão de Usuários</Text>
        <Text style={s.headerCount}>{users.length}</Text>
      </View>

      <View style={s.searchWrap}>
        <Ionicons name="search" size={18} color="#999" />
        <TextInput
          style={s.searchInput}
          placeholder="Buscar por nome, e-mail ou CPF..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => load()}
          returnKeyType="search"
          placeholderTextColor="#BBB"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); load(); }}>
            <Ionicons name="close-circle" size={18} color="#CCC" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color="#2196F3" /></View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item.id}
          contentContainerStyle={users.length === 0 ? { flex: 1 } : { padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} />}
          ListEmptyComponent={
            <View style={s.center}>
              <Ionicons name="people-outline" size={44} color="#DDD" />
              <Text style={s.emptyText}>Nenhum usuário encontrado</Text>
            </View>
          }
          renderItem={({ item }) => {
            const status = getStatus(item);
            return (
              <TouchableOpacity style={s.card} onPress={() => setSelected(item)}>
                <View style={s.avatar}>
                  <Text style={s.initials}>{item.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={s.nameRow}>
                    <Text style={s.name} numberOfLines={1}>{item.nome}</Text>
                    <View style={[s.badge, { backgroundColor: status.bg }]}>
                      <Text style={[s.badgeText, { color: status.color }]}>{status.label}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <Text style={s.email} numberOfLines={1}>{item.email}</Text>
                    <View style={[s.roleBadge, item.role === 'tecnico' && s.roleTech, item.role === 'admin' && s.roleAdmin]}>
                      <Text style={s.roleText}>
                        {item.role === 'tecnico' ? 'Técnico' : item.role === 'admin' ? 'Admin' : 'Cliente'}
                      </Text>
                    </View>
                  </View>
                  <Text style={s.meta}>{item._count?.pedidosCliente ?? 0} pedidos · {new Date(item.createdAt).toLocaleDateString('pt-BR')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#DDD" />
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Modal detalhe */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={m.overlay}>
          <View style={m.sheet}>
            <View style={m.handle} />
            {selected && (() => {
              const status = getStatus(selected);
              return (
                <>
                  <View style={m.userHeader}>
                    <View style={m.bigAvatar}>
                      <Text style={m.bigInitials}>{selected.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 14 }}>
                      <Text style={m.userName}>{selected.nome}</Text>
                      <View style={[s.badge, { backgroundColor: status.bg, alignSelf: 'flex-start' }]}>
                        <Text style={[s.badgeText, { color: status.color }]}>{status.label}</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => setSelected(null)}>
                      <Ionicons name="close" size={22} color="#666" />
                    </TouchableOpacity>
                  </View>
                  {[
                    { icon: 'mail-outline', label: 'E-mail', val: selected.email },
                    { icon: 'person-outline', label: 'Tipo', val: selected.role === 'tecnico' ? 'Técnico' : selected.role === 'admin' ? 'Administrador' : 'Cliente' },
                    { icon: 'card-outline', label: 'CPF', val: selected.cpf ?? '–' },
                    { icon: 'call-outline', label: 'Telefone', val: selected.telefone ?? '–' },
                    { icon: 'calendar-outline', label: 'Cadastro', val: new Date(selected.createdAt).toLocaleDateString('pt-BR') },
                    { icon: 'receipt-outline', label: 'Pedidos', val: `${selected._count?.pedidosCliente ?? 0} pedidos` },
                  ].map(row => (
                    <View key={row.label} style={m.infoRow}>
                      <Ionicons name={row.icon as any} size={16} color="#999" style={{ width: 22 }} />
                      <Text style={m.infoLabel}>{row.label}</Text>
                      <Text style={m.infoVal}>{row.val}</Text>
                    </View>
                  ))}
                  <TouchableOpacity
                    style={[m.actionBtn, { backgroundColor: selected.bloqueado ? '#E8F5E9' : '#FFEBEE' }]}
                    onPress={() => handleToggleBlock(selected)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <ActivityIndicator size="small" /> : (
                      <>
                        <Ionicons
                          name={selected.bloqueado ? 'checkmark-circle-outline' : 'ban-outline'}
                          size={18}
                          color={selected.bloqueado ? '#2E7D32' : '#C62828'}
                        />
                        <Text style={{ color: selected.bloqueado ? '#2E7D32' : '#C62828', fontWeight: '700' }}>
                          {selected.bloqueado ? 'Desbloquear conta' : 'Bloquear conta'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              );
            })()}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F2F5', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1a1a1a', padding: 20 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#FFF' },
  headerCount: { fontSize: 12, color: '#AAA' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFF', margin: 16, marginBottom: 8, borderRadius: 14, paddingHorizontal: 14, height: 46 },
  searchInput: { flex: 1, fontSize: 14, color: '#222' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyText: { fontSize: 15, color: '#BBB', marginTop: 10 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 14, marginBottom: 10, elevation: 1 },
  avatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#E8EEFF', justifyContent: 'center', alignItems: 'center' },
  initials: { fontSize: 14, fontWeight: '700', color: '#3F51B5' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 14, fontWeight: '700', color: '#222', flex: 1 },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  email: { fontSize: 12, color: '#888' },
  roleBadge: { backgroundColor: '#E3F2FD', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  roleTech: { backgroundColor: '#FFF3E0' },
  roleAdmin: { backgroundColor: '#F3E5F5' },
  roleText: { fontSize: 9, fontWeight: '700', color: '#555' },
  meta: { fontSize: 11, color: '#AAA', marginTop: 3 },
});

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 12 },
  handle: { width: 40, height: 4, backgroundColor: '#DDD', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  userHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  bigAvatar: { width: 52, height: 52, borderRadius: 14, backgroundColor: '#E8EEFF', justifyContent: 'center', alignItems: 'center' },
  bigInitials: { fontSize: 18, fontWeight: '700', color: '#3F51B5' },
  userName: { fontSize: 16, fontWeight: '700', color: '#222', marginBottom: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  infoLabel: { fontSize: 13, color: '#AAA', width: 80 },
  infoVal: { fontSize: 13, color: '#333', fontWeight: '500', flex: 1 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, marginTop: 20 },
});
