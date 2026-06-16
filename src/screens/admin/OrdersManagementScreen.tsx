import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, TextInput, Alert, Modal, ScrollView,
  ActivityIndicator, RefreshControl, Platform, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/v1';

type OrderStatus = 'solicitado' | 'aceito' | 'andamento' | 'concluido' | 'cancelado' | 'disputa';

interface AdminOrder {
  id: string;
  numero: string;
  clienteId: string;
  tecnicoId?: string;
  categoria: string;
  subcategoria: string;
  descricao: string;
  modalidade: string;
  endereco?: string;
  status: OrderStatus;
  valorFinal?: number;
  valorEstimado?: string;
  createdAt: string;
  cliente?: { nome: string };
  tecnico?: { usuario?: { nome: string } };
}

const STATUS_CFG: Record<OrderStatus, { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  solicitado: { label: 'Aguardando', color: '#E65100', bg: '#FFF3E0', icon: 'time-outline' },
  aceito:     { label: 'Aceito',     color: '#1565C0', bg: '#E3F2FD', icon: 'checkmark-circle-outline' },
  andamento:  { label: 'Andamento',  color: '#2E7D32', bg: '#E8F5E9', icon: 'play-circle-outline' },
  concluido:  { label: 'Concluído',  color: '#555',    bg: '#F5F5F5', icon: 'checkmark-done-circle-outline' },
  cancelado:  { label: 'Cancelado',  color: '#B71C1C', bg: '#FFEBEE', icon: 'close-circle-outline' },
  disputa:    { label: 'Disputa',    color: '#6A1B9A', bg: '#F3E5F5', icon: 'warning-outline' },
};

export function OrdersManagementScreen({ navigation }: any) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'todos'>('todos');
  const [selected, setSelected] = useState<AdminOrder | null>(null);

  async function load(silent = false) {
    if (!silent) setLoading(true);
    try {
      const token = await AsyncStorage.getItem('@technaveia:token');
      const res = await fetch(`${BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setOrders(json.data ?? []);
      }
    } catch {} finally { setLoading(false); setRefreshing(false); }
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  const filtered = orders.filter(o => {
    const matchQuery = !query ||
      o.numero.toLowerCase().includes(query.toLowerCase()) ||
      o.cliente?.nome?.toLowerCase().includes(query.toLowerCase()) ||
      o.tecnico?.usuario?.nome?.toLowerCase().includes(query.toLowerCase());
    const matchStatus = filterStatus === 'todos' || o.status === filterStatus;
    return matchQuery && matchStatus;
  });

  const disputaCount = orders.filter(o => o.status === 'disputa').length;

  async function handleCancelOrder(order: AdminOrder) {
    Alert.alert('Cancelar pedido?', `Cancelar ${order.numero} administrativamente?`, [
      { text: 'Voltar', style: 'cancel' },
      {
        text: 'Cancelar pedido', style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('@technaveia:token');
            await fetch(`${BASE_URL}/orders/${order.id}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ status: 'cancelado' }),
            });
            setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'cancelado' } : o));
            setSelected(null);
            Alert.alert('Cancelado', 'Pedido cancelado com sucesso.');
          } catch { Alert.alert('Erro', 'Não foi possível cancelar.'); }
        },
      },
    ]);
  }

  function timeAgo(iso: string): string {
    const diff = (Date.now() - new Date(iso).getTime()) / 3600000;
    if (diff < 1) return 'Agora';
    if (diff < 24) return `${Math.floor(diff)}h`;
    if (diff < 48) return 'Ontem';
    return new Date(iso).toLocaleDateString('pt-BR');
  }

  const STATUS_FILTERS: { key: OrderStatus | 'todos'; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'andamento', label: 'Andamento' },
    { key: 'disputa', label: `Disputas${disputaCount > 0 ? ` (${disputaCount})` : ''}` },
    { key: 'solicitado', label: 'Aguardando' },
    { key: 'concluido', label: 'Concluídos' },
    { key: 'cancelado', label: 'Cancelados' },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F2F5" />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Gestão de Pedidos</Text>
        <Text style={s.headerCount}>{orders.length}</Text>
      </View>

      <View style={s.searchWrap}>
        <Ionicons name="search" size={18} color="#999" />
        <TextInput style={s.searchInput} placeholder="Buscar nº, cliente ou técnico..." value={query} onChangeText={setQuery} placeholderTextColor="#BBB" />
        {query.length > 0 && <TouchableOpacity onPress={() => setQuery('')}><Ionicons name="close-circle" size={18} color="#CCC" /></TouchableOpacity>}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll}>
        <View style={s.filters}>
          {STATUS_FILTERS.map(opt => (
            <TouchableOpacity key={opt.key} style={[s.filterChip, filterStatus === opt.key && s.filterChipActive]} onPress={() => setFilterStatus(opt.key)}>
              <Text style={[s.filterText, filterStatus === opt.key && s.filterTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color="#2196F3" /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={filtered.length === 0 ? { flex: 1 } : { padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} />}
          ListEmptyComponent={<View style={s.center}><Ionicons name="document-outline" size={44} color="#DDD" /><Text style={s.emptyText}>Nenhum pedido encontrado</Text></View>}
          renderItem={({ item }) => {
            const cfg = STATUS_CFG[item.status];
            return (
              <TouchableOpacity style={s.orderCard} onPress={() => setSelected(item)}>
                <View style={s.orderTop}>
                  <Text style={s.orderNumero}>{item.numero}</Text>
                  <View style={[s.badge, { backgroundColor: cfg.bg }]}>
                    <Ionicons name={cfg.icon} size={10} color={cfg.color} />
                    <Text style={[s.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
                <Text style={s.orderService}>{item.categoria} · {item.subcategoria}</Text>
                <View style={s.orderMeta}>
                  <View style={s.metaItem}>
                    <Ionicons name="person-outline" size={12} color="#AAA" />
                    <Text style={s.metaText}>{item.cliente?.nome ?? '–'}</Text>
                  </View>
                  <View style={s.metaItem}>
                    <Ionicons name="construct-outline" size={12} color="#AAA" />
                    <Text style={s.metaText}>{item.tecnico?.usuario?.nome ?? 'Sem técnico'}</Text>
                  </View>
                </View>
                <View style={s.orderFooter}>
                  <Text style={s.orderData}>{timeAgo(item.createdAt)}</Text>
                  <Text style={s.orderValor}>
                    {item.valorFinal ? `R$ ${item.valorFinal.toFixed(2).replace('.', ',')}` : item.valorEstimado ?? '–'}
                  </Text>
                </View>
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
              const cfg = STATUS_CFG[selected.status];
              return (
                <ScrollView>
                  <View style={m.header}>
                    <View>
                      <Text style={m.numero}>{selected.numero}</Text>
                      <Text style={m.servico}>{selected.categoria} · {selected.subcategoria}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelected(null)}>
                      <Ionicons name="close" size={22} color="#666" />
                    </TouchableOpacity>
                  </View>
                  <View style={[m.statusPill, { backgroundColor: cfg.bg }]}>
                    <Ionicons name={cfg.icon} size={14} color={cfg.color} />
                    <Text style={[m.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                  {[
                    { label: 'Cliente', val: selected.cliente?.nome ?? '–' },
                    { label: 'Técnico', val: selected.tecnico?.usuario?.nome ?? 'Sem técnico' },
                    { label: 'Descrição', val: selected.descricao },
                    { label: 'Modalidade', val: selected.modalidade },
                    { label: 'Endereço', val: selected.endereco ?? '–' },
                    { label: 'Criado em', val: new Date(selected.createdAt).toLocaleString('pt-BR') },
                    { label: 'Valor', val: selected.valorFinal ? `R$ ${selected.valorFinal.toFixed(2).replace('.', ',')}` : 'A definir' },
                  ].map(row => (
                    <View key={row.label} style={m.infoRow}>
                      <Text style={m.infoLabel}>{row.label}</Text>
                      <Text style={m.infoVal}>{row.val}</Text>
                    </View>
                  ))}
                  {selected.status !== 'cancelado' && selected.status !== 'concluido' && (
                    <TouchableOpacity style={m.cancelBtn} onPress={() => handleCancelOrder(selected)}>
                      <Ionicons name="close-circle-outline" size={18} color="#B71C1C" />
                      <Text style={m.cancelBtnText}>Cancelar pedido</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
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
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFF', margin: 16, marginBottom: 8, borderRadius: 14, paddingHorizontal: 14, height: 44 },
  searchInput: { flex: 1, fontSize: 14, color: '#222' },
  filterScroll: { marginBottom: 8 },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  filterChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE', height: 36, justifyContent: 'center' },
  filterChipActive: { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#666' },
  filterTextActive: { color: '#FFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyText: { fontSize: 15, color: '#BBB', marginTop: 10 },
  orderCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 14, marginBottom: 10, elevation: 1 },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  orderNumero: { fontSize: 12, fontWeight: '700', color: '#888' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  orderService: { fontSize: 15, fontWeight: '700', color: '#222', marginBottom: 8 },
  orderMeta: { gap: 4, marginBottom: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: '#666' },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderData: { fontSize: 12, color: '#AAA' },
  orderValor: { fontSize: 14, fontWeight: '700', color: '#222' },
});

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 12, maxHeight: '85%' },
  handle: { width: 40, height: 4, backgroundColor: '#DDD', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  numero: { fontSize: 12, fontWeight: '700', color: '#AAA' },
  servico: { fontSize: 18, fontWeight: '700', color: '#222', marginTop: 2 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginBottom: 16 },
  statusText: { fontSize: 12, fontWeight: '700' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  infoLabel: { fontSize: 13, color: '#AAA' },
  infoVal: { fontSize: 13, color: '#333', fontWeight: '500', flex: 1, textAlign: 'right' },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, backgroundColor: '#FFEBEE', marginTop: 20 },
  cancelBtnText: { color: '#B71C1C', fontWeight: '700', fontSize: 14 },
});
