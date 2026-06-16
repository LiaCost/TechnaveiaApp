import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, ActivityIndicator, RefreshControl, Alert, StatusBar, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme';
import { orderService, Order } from '../../services/api';

// ─── Tipos ────────────────────────────────────────────────

type OrderTab = 'Ativos' | 'Agendados' | 'Concluídos' | 'Cancelados';

const TAB_STATUSES: Record<OrderTab, Order['status'][]> = {
  'Ativos':     ['solicitado', 'aceito', 'andamento'],
  'Agendados':  ['aceito'],
  'Concluídos': ['concluido'],
  'Cancelados': ['cancelado'],
};

const STATUS_CFG: Record<Order['status'], { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  solicitado: { label: 'Aguardando',   color: '#E65100', bg: '#FFF3E0', icon: 'time-outline' },
  aceito:     { label: 'Aceito',       color: '#1976D2', bg: '#E3F2FD', icon: 'checkmark-circle-outline' },
  andamento:  { label: 'Em andamento', color: '#2E7D32', bg: '#E8F5E9', icon: 'play-circle-outline' },
  concluido:  { label: 'Concluído',    color: '#555',    bg: '#F5F5F5', icon: 'checkmark-done-circle-outline' },
  cancelado:  { label: 'Cancelado',    color: '#C62828', bg: '#FFEBEE', icon: 'close-circle-outline' },
  disputa:    { label: 'Em disputa',   color: '#7B1FA2', bg: '#F3E5F5', icon: 'warning-outline' },
};

// ─── Card de pedido ───────────────────────────────────────

function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const cfg = STATUS_CFG[order.status];
  return (
    <TouchableOpacity style={s.card} onPress={onPress}>
      <View style={s.cardTop}>
        <Text style={s.cardService} numberOfLines={1}>
          {order.categoria} · {order.subcategoria}
        </Text>
        <View style={[s.badge, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon} size={11} color={cfg.color} />
          <Text style={[s.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      <Text style={s.cardDesc} numberOfLines={2}>{order.descricao}</Text>

      <View style={s.cardMeta}>
        {order.tecnico && (
          <View style={s.metaRow}>
            <Ionicons name="person-outline" size={13} color="#999" />
            <Text style={s.metaText}>{order.tecnico.nome}</Text>
          </View>
        )}
        {order.dataAgendada && (
          <View style={s.metaRow}>
            <Ionicons name="calendar-outline" size={13} color="#999" />
            <Text style={s.metaText}>
              {order.dataAgendada}{order.horaAgendada ? ` às ${order.horaAgendada}` : ''}
            </Text>
          </View>
        )}
      </View>

      <View style={s.cardFooter}>
        <Text style={s.cardNumero}>{order.numero}</Text>
        <Text style={s.cardPrice}>
          {order.valorFinal
            ? `R$ ${order.valorFinal.toFixed(2).replace('.', ',')}`
            : order.valorEstimado ?? '–'}
        </Text>
        <View style={s.detailBtn}>
          <Text style={s.detailBtnText}>Ver detalhes</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Tela principal ────────────────────────────────────────

export function OrdersScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<OrderTab>('Ativos');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const TABS: OrderTab[] = ['Ativos', 'Agendados', 'Concluídos', 'Cancelados'];

  const loadOrders = useCallback(async () => {
    try {
      const data = await orderService.list();
      setOrders(data);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os pedidos.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadOrders(); }, []));

  const filtered = orders.filter(o => TAB_STATUSES[activeTab].includes(o.status));

  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Meus Pedidos</Text>
        {orders.filter(o => o.status === 'andamento').length > 0 && (
          <View style={s.activeBadge}>
            <Text style={s.activeBadgeText}>
              {orders.filter(o => o.status === 'andamento').length} em andamento
            </Text>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={s.tabBar}>
        {TABS.map(tab => {
          const count = orders.filter(o => TAB_STATUSES[tab].includes(o.status)).length;
          return (
            <TouchableOpacity
              key={tab}
              style={[s.tab, activeTab === tab && s.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>{tab}</Text>
              {count > 0 && (
                <View style={[s.tabCount, activeTab === tab && s.tabCountActive]}>
                  <Text style={[s.tabCountText, activeTab === tab && { color: colors.primary }]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Conteúdo */}
      {isLoading ? (
        <View style={s.loading}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="receipt-outline" size={52} color="#DDD" />
          <Text style={s.emptyTitle}>Nenhum pedido aqui</Text>
          <Text style={s.emptySub}>
            {activeTab === 'Ativos'
              ? 'Solicite um serviço para começar!'
              : `Nenhum pedido ${activeTab.toLowerCase()}`}
          </Text>
          {activeTab === 'Ativos' && (
            <TouchableOpacity
              style={s.emptyBtn}
              onPress={() => navigation.navigate('RequestService')}
            >
              <Text style={s.emptyBtnText}>Solicitar serviço</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => { setIsRefreshing(true); loadOrders(); }}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

// ─── Estilos ───────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FF' },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 8 : 20,
    paddingBottom: 12,
    backgroundColor: '#FFF',
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.dark1, flex: 1 },
  activeBadge: {
    backgroundColor: '#E8F5E9', paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 20,
  },
  activeBadgeText: { fontSize: 11, color: '#2E7D32', fontWeight: '700' },

  tabBar: {
    flexDirection: 'row', backgroundColor: '#FFF',
    borderBottomWidth: 1, borderBottomColor: '#EEE',
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 13,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: 12, fontWeight: '600', color: '#999' },
  tabTextActive: { color: colors.primary },
  tabCount: {
    backgroundColor: '#F0F0F0', width: 18, height: 18,
    borderRadius: 9, justifyContent: 'center', alignItems: 'center',
  },
  tabCountActive: { backgroundColor: colors.primary + '15' },
  tabCountText: { fontSize: 10, fontWeight: '700', color: '#888' },

  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#BBB' },
  emptySub: { fontSize: 14, color: '#CCC', textAlign: 'center' },
  emptyBtn: {
    marginTop: 12, backgroundColor: colors.primary,
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20,
  },
  emptyBtnText: { color: '#FFF', fontWeight: '700' },

  // Card
  card: {
    backgroundColor: '#FFF', borderRadius: 18, padding: 16, marginBottom: 12,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
  },
  cardTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 8,
  },
  cardService: {
    fontSize: 15, fontWeight: '700', color: colors.dark1, flex: 1, marginRight: 8,
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  badgeText: { fontSize: 10, fontWeight: '700' },
  cardDesc: { fontSize: 13, color: '#666', lineHeight: 18, marginBottom: 12 },
  cardMeta: {
    gap: 4, marginBottom: 12, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, color: '#555' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardNumero: { fontSize: 12, color: '#AAA', fontWeight: '500' },
  cardPrice: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.dark1 },
  detailBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  detailBtnText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
});