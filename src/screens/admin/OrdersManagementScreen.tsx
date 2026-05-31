import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, TextInput, Alert, Modal, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ─── Tipos ────────────────────────────────────────────────

type OrderStatus = 'solicitado' | 'aceito' | 'andamento' | 'concluido' | 'cancelado' | 'disputa';

interface AdminOrder {
  id: string;
  numero: string;
  cliente: string;
  tecnico: string;
  servico: string;
  categoria: string;
  modalidade: 'presencial' | 'remoto';
  status: OrderStatus;
  valor: number;
  data: string;
  cidade: string;
  isDisputa: boolean;
}

// ─── Mock ─────────────────────────────────────────────────

const MOCK_ORDERS: AdminOrder[] = [
  { id: '1', numero: '#8829', cliente: 'Carlos Andrade', tecnico: 'Ricardo Silva', servico: 'Troca de Fonte', categoria: 'Computadores', modalidade: 'presencial', status: 'andamento', valor: 315, data: 'Hoje 14:00', cidade: 'São Paulo', isDisputa: false },
  { id: '2', numero: '#8828', cliente: 'Beatriz Santos', tecnico: 'Ana Oliveira', servico: 'Configuração de Roteador', categoria: 'Redes', modalidade: 'presencial', status: 'disputa', valor: 120, data: 'Ontem', cidade: 'São Paulo', isDisputa: true },
  { id: '3', numero: '#8820', cliente: 'Fernanda Lima', tecnico: 'Marcos Paulo', servico: 'Suporte Remoto', categoria: 'Suporte', modalidade: 'remoto', status: 'concluido', valor: 90, data: '10 Mai', cidade: 'São Paulo', isDisputa: false },
  { id: '4', numero: '#8815', cliente: 'Rodrigo Pereira', tecnico: '–', servico: 'Limpeza de Notebook', categoria: 'Computadores', modalidade: 'presencial', status: 'cancelado', valor: 0, data: '08 Mai', cidade: 'Rio de Janeiro', isDisputa: false },
  { id: '5', numero: '#8810', cliente: 'Paulo Nascimento', tecnico: 'Ricardo Silva', servico: 'Instalação de Câmeras', categoria: 'Segurança', modalidade: 'presencial', status: 'concluido', valor: 850, data: '05 Mai', cidade: 'Curitiba', isDisputa: false },
  { id: '6', numero: '#8805', cliente: 'Ana Costa', tecnico: 'Ana Oliveira', servico: 'Formatação PC', categoria: 'Computadores', modalidade: 'presencial', status: 'solicitado', valor: 0, data: 'Hoje 11:30', cidade: 'São Paulo', isDisputa: false },
];

const STATUS_CFG: Record<OrderStatus, { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  solicitado: { label: 'Aguardando', color: '#E65100', bg: '#FFF3E0', icon: 'time-outline' },
  aceito:     { label: 'Aceito',     color: '#1565C0', bg: '#E3F2FD', icon: 'checkmark-circle-outline' },
  andamento:  { label: 'Andamento',  color: '#2E7D32', bg: '#E8F5E9', icon: 'play-circle-outline' },
  concluido:  { label: 'Concluído',  color: '#555',    bg: '#F5F5F5', icon: 'checkmark-done-circle-outline' },
  cancelado:  { label: 'Cancelado',  color: '#B71C1C', bg: '#FFEBEE', icon: 'close-circle-outline' },
  disputa:    { label: 'Disputa',    color: '#6A1B9A', bg: '#F3E5F5', icon: 'warning-outline' },
};

// ─── Tela principal ────────────────────────────────────────

export function OrdersManagementScreen({ navigation }: any) {
  const [orders, setOrders] = useState<AdminOrder[]>(MOCK_ORDERS);
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'todos'>('todos');
  const [selected, setSelected] = useState<AdminOrder | null>(null);

  const filtered = orders.filter(o => {
    const matchQuery = !query ||
      o.numero.includes(query) ||
      o.cliente.toLowerCase().includes(query.toLowerCase()) ||
      o.tecnico.toLowerCase().includes(query.toLowerCase());
    const matchStatus = filterStatus === 'todos' || o.status === filterStatus;
    return matchQuery && matchStatus;
  });

  const disputaCount = orders.filter(o => o.isDisputa).length;

  const STATUS_FILTERS: { key: OrderStatus | 'todos'; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'andamento', label: 'Andamento' },
    { key: 'disputa', label: `Disputas${disputaCount > 0 ? ` (${disputaCount})` : ''}` },
    { key: 'solicitado', label: 'Aguardando' },
    { key: 'concluido', label: 'Concluídos' },
    { key: 'cancelado', label: 'Cancelados' },
  ];

  function handleResolveDispute(order: AdminOrder, favor: 'cliente' | 'tecnico') {
    const nome = favor === 'cliente' ? order.cliente : order.tecnico;
    Alert.alert(
      'Resolver disputa',
      `Confirmar resolução em favor de ${nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            setOrders(prev => prev.map(o =>
              o.id === order.id ? { ...o, status: 'concluido', isDisputa: false } : o
            ));
            setSelected(null);
            Alert.alert('Resolvido!', `Disputa encerrada em favor de ${nome}.`);
          },
        },
      ]
    );
  }

  function handleCancelOrder(order: AdminOrder) {
    Alert.alert('Cancelar pedido?', `Cancelar ${order.numero} administrativamente?`, [
      { text: 'Voltar', style: 'cancel' },
      {
        text: 'Cancelar pedido', style: 'destructive',
        onPress: () => {
          setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'cancelado' } : o));
          setSelected(null);
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Gestão de Pedidos</Text>
        {disputaCount > 0 && (
          <View style={s.disputaBadge}>
            <Text style={s.disputaBadgeText}>{disputaCount} disputa{disputaCount > 1 ? 's' : ''}</Text>
          </View>
        )}
      </View>

      {/* KPIs rápidos */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.kpiScroll}>
        {[
          { label: 'Total hoje', value: orders.filter(o => o.data.includes('Hoje')).length.toString(), color: '#1565C0' },
          { label: 'Em andamento', value: orders.filter(o => o.status === 'andamento').length.toString(), color: '#2E7D32' },
          { label: 'Disputas abertas', value: disputaCount.toString(), color: '#6A1B9A' },
          { label: 'Cancelados', value: orders.filter(o => o.status === 'cancelado').length.toString(), color: '#B71C1C' },
        ].map(kpi => (
          <View key={kpi.label} style={[s.kpiCard, { borderLeftColor: kpi.color }]}>
            <Text style={[s.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
            <Text style={s.kpiLabel}>{kpi.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Busca */}
      <View style={s.searchWrap}>
        <Ionicons name="search" size={18} color="#999" />
        <TextInput
          style={s.searchInput}
          placeholder="Buscar por nº, cliente ou técnico..."
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll}>
        <View style={s.filters}>
          {STATUS_FILTERS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[s.filterChip, filterStatus === opt.key && s.filterChipActive,
                opt.key === 'disputa' && disputaCount > 0 && s.filterChipDisputa]}
              onPress={() => setFilterStatus(opt.key)}
            >
              <Text style={[s.filterText, filterStatus === opt.key && s.filterTextActive,
                opt.key === 'disputa' && disputaCount > 0 && { color: '#6A1B9A' }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Lista */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="document-outline" size={44} color="#DDD" />
            <Text style={s.emptyText}>Nenhum pedido encontrado</Text>
          </View>
        }
        renderItem={({ item }) => {
          const cfg = STATUS_CFG[item.status];
          return (
            <TouchableOpacity style={[s.orderCard, item.isDisputa && s.orderCardDisputa]} onPress={() => setSelected(item)}>
              <View style={s.orderTop}>
                <Text style={s.orderNumero}>{item.numero}</Text>
                <View style={[s.badge, { backgroundColor: cfg.bg }]}>
                  <Ionicons name={cfg.icon} size={10} color={cfg.color} />
                  <Text style={[s.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
              </View>
              <Text style={s.orderService}>{item.servico}</Text>
              <View style={s.orderMeta}>
                <View style={s.metaItem}>
                  <Ionicons name="person-outline" size={12} color="#AAA" />
                  <Text style={s.metaText}>{item.cliente}</Text>
                </View>
                <View style={s.metaItem}>
                  <Ionicons name="construct-outline" size={12} color="#AAA" />
                  <Text style={s.metaText}>{item.tecnico}</Text>
                </View>
              </View>
              <View style={s.orderFooter}>
                <Text style={s.orderData}>{item.data} · {item.cidade}</Text>
                <Text style={s.orderValor}>
                  {item.valor > 0 ? `R$ ${item.valor.toFixed(2).replace('.', ',')}` : '–'}
                </Text>
              </View>
              {item.isDisputa && (
                <View style={s.disputaTag}>
                  <Ionicons name="warning" size={11} color="#6A1B9A" />
                  <Text style={s.disputaTagText}>Requer intervenção</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

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
                      <Text style={m.servico}>{selected.servico}</Text>
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
                    { label: 'Cliente', val: selected.cliente },
                    { label: 'Técnico', val: selected.tecnico },
                    { label: 'Categoria', val: selected.categoria },
                    { label: 'Modalidade', val: selected.modalidade === 'presencial' ? 'Presencial' : 'Remoto' },
                    { label: 'Data', val: selected.data },
                    { label: 'Cidade', val: selected.cidade },
                    { label: 'Valor', val: selected.valor > 0 ? `R$ ${selected.valor.toFixed(2).replace('.', ',')}` : 'A definir' },
                  ].map(row => (
                    <View key={row.label} style={m.infoRow}>
                      <Text style={m.infoLabel}>{row.label}</Text>
                      <Text style={m.infoVal}>{row.val}</Text>
                    </View>
                  ))}

                  <Text style={m.actionsTitle}>Intervenções administrativas</Text>

                  {selected.isDisputa && (
                    <>
                      <TouchableOpacity
                        style={[m.actionBtn, { backgroundColor: '#E3F2FD' }]}
                        onPress={() => handleResolveDispute(selected, 'cliente')}
                      >
                        <Ionicons name="person-outline" size={18} color="#1565C0" />
                        <Text style={[m.actionText, { color: '#1565C0' }]}>Resolver em favor do cliente</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[m.actionBtn, { backgroundColor: '#E8F5E9' }]}
                        onPress={() => handleResolveDispute(selected, 'tecnico')}
                      >
                        <Ionicons name="construct-outline" size={18} color="#2E7D32" />
                        <Text style={[m.actionText, { color: '#2E7D32' }]}>Resolver em favor do técnico</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {selected.status !== 'cancelado' && selected.status !== 'concluido' && (
                    <TouchableOpacity
                      style={[m.actionBtn, { backgroundColor: '#FFEBEE' }]}
                      onPress={() => handleCancelOrder(selected)}
                    >
                      <Ionicons name="close-circle-outline" size={18} color="#B71C1C" />
                      <Text style={[m.actionText, { color: '#B71C1C' }]}>Cancelar pedido administrativamente</Text>
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

// ─── Estilos ───────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F2F5' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#1a1a1a', padding: 20, paddingTop: 16,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#FFF' },
  disputaBadge: { backgroundColor: '#6A1B9A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  disputaBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  kpiScroll: { paddingHorizontal: 12, paddingVertical: 12, maxHeight: 90 },
  kpiCard: {
    backgroundColor: '#FFF', borderRadius: 12, padding: 12,
    marginHorizontal: 4, borderLeftWidth: 4, minWidth: 110,
  },
  kpiValue: { fontSize: 22, fontWeight: '700' },
  kpiLabel: { fontSize: 11, color: '#888', marginTop: 2 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFF', marginHorizontal: 16, marginBottom: 8,
    borderRadius: 14, paddingHorizontal: 14, height: 44,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#222' },
  filterScroll: { maxHeight: 50 },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  filterChip: {
    paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20,
    backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE',
  },
  filterChipActive: { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' },
  filterChipDisputa: { borderColor: '#CE93D8', backgroundColor: '#F3E5F5' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#666' },
  filterTextActive: { color: '#FFF' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyText: { fontSize: 15, color: '#BBB' },
  orderCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 14, marginBottom: 10,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6,
  },
  orderCardDisputa: { borderWidth: 1.5, borderColor: '#CE93D8' },
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
  disputaTag: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#F3E5F5', padding: 6, borderRadius: 8, marginTop: 10,
  },
  disputaTagText: { fontSize: 11, color: '#6A1B9A', fontWeight: '700' },
});

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingTop: 12, maxHeight: '88%',
  },
  handle: { width: 40, height: 4, backgroundColor: '#DDD', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  numero: { fontSize: 12, fontWeight: '700', color: '#AAA' },
  servico: { fontSize: 18, fontWeight: '700', color: '#222', marginTop: 2 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, marginBottom: 16,
  },
  statusText: { fontSize: 12, fontWeight: '700' },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  infoLabel: { fontSize: 13, color: '#AAA' },
  infoVal: { fontSize: 13, color: '#333', fontWeight: '600' },
  actionsTitle: { fontSize: 12, fontWeight: '700', color: '#AAA', textTransform: 'uppercase', marginTop: 20, marginBottom: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, marginBottom: 8 },
  actionText: { fontSize: 14, fontWeight: '700' },
});