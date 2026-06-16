import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, FlatList, Modal, Alert, StatusBar, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme';
import { orderService, Order, ApiError } from '../../services/api';

// ─── Tipos ────────────────────────────────────────────────

type RequestTab = 'Novas' | 'Em andamento' | 'Concluídas' | 'Canceladas';

const TAB_STATUS: Record<RequestTab, Order['status']> = {
  'Novas':         'solicitado',
  'Em andamento':  'andamento',
  'Concluídas':    'concluido',
  'Canceladas':    'cancelado',
};

const REJECT_REASONS = [
  'Estou indisponível neste horário',
  'Fora da minha área de atuação',
  'Não atendo esta categoria de serviço',
  'Distância muito grande',
  'Outro motivo',
];

// ─── Subcomponentes ───────────────────────────────────────

function RequestCard({ req, onPress }: { req: Order; onPress: () => void }) {
  function timeAgo(iso: string) {
    const diff = (Date.now() - new Date(iso).getTime()) / 60000;
    if (diff < 60) return `${Math.floor(diff)} min`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return `${Math.floor(diff / 1440)} dias`;
  }

  return (
    <TouchableOpacity style={rc.card} onPress={onPress}>
      <View style={rc.top}>
        <View style={rc.catBadge}>
          <Text style={rc.catText}>{req.categoria}</Text>
        </View>
        <Text style={rc.time}>{timeAgo(req.createdAt)}</Text>
      </View>

      <Text style={rc.service}>{req.subcategoria}</Text>
      <Text style={rc.desc} numberOfLines={2}>{req.descricao}</Text>

      <View style={rc.meta}>
        <View style={rc.metaItem}>
          <Ionicons
            name={req.modalidade === 'presencial' ? 'location-outline' : 'laptop-outline'}
            size={14} color="#888"
          />
          <Text style={rc.metaText} numberOfLines={1}>
            {req.modalidade === 'presencial' ? (req.endereco ?? 'Endereço a confirmar') : 'Remoto'}
          </Text>
        </View>
        {req.dataAgendada && (
          <View style={rc.metaItem}>
            <Ionicons name="calendar-outline" size={14} color="#888" />
            <Text style={rc.metaText}>
              {req.dataAgendada}{req.horaAgendada ? ` às ${req.horaAgendada}` : ''}
            </Text>
          </View>
        )}
      </View>

      <View style={rc.footer}>
        <Text style={rc.orderId}>Pedido {req.numero}</Text>
        <Text style={rc.price}>{req.valorEstimado ?? 'A combinar'}</Text>
      </View>
    </TouchableOpacity>
  );
}

const rc = StyleSheet.create({
  card: {
    backgroundColor: '#FFF', borderRadius: 18, padding: 16, marginBottom: 12,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  catBadge: { backgroundColor: colors.primary + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  catText: { fontSize: 11, color: colors.primary, fontWeight: '700' },
  time: { fontSize: 11, color: '#AAA', fontWeight: '500' },
  service: { fontSize: 16, fontWeight: '700', color: colors.dark1, marginBottom: 4 },
  desc: { fontSize: 13, color: '#666', lineHeight: 18, marginBottom: 12 },
  meta: { gap: 6, marginBottom: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, color: '#555', flex: 1 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 12, color: '#AAA', fontWeight: '500' },
  price: { fontSize: 15, fontWeight: '700', color: colors.dark1 },
  // legado (não usados mas mantidos para evitar erros de referência)
  clientRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  clientAvatar: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
  clientInitials: { fontSize: 12, fontWeight: '700', color: colors.primary },
  clientName: { fontSize: 13, fontWeight: '600', color: '#333' },
  clientRating: { fontSize: 11, color: '#888' },
  photoBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  photoText: { fontSize: 11, color: '#888' },
});

export function RequestsListScreen({ navigation, route }: any) {
  const [activeTab, setActiveTab] = useState<RequestTab>('Novas');
  const [selectedReq, setSelectedReq] = useState<Order | null>(null);
  const [showReject, setShowReject]   = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [orders, setOrders]           = useState<Order[]>([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const openOrderId = route?.params?.openOrderId;

  async function load(silent = false) {
    if (!silent) setLoading(true);
    try {
      // O back retorna pedidos atribuídos ao técnico autenticado
      const data = await orderService.list();
      setOrders(data);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Não foi possível carregar as solicitações.';
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  // Abre automaticamente o modal se veio com openOrderId
  useEffect(() => {
    if (openOrderId && orders.length > 0 && !selectedReq) {
      const found = orders.find(o => o.id === openOrderId);
      if (found) setSelectedReq(found);
    }
  }, [openOrderId, orders]);

  function onRefresh() { setRefreshing(true); load(true); }

  const filtered = orders.filter(o => o.status === TAB_STATUS[activeTab]);
  const novasCount = orders.filter(o => o.status === 'solicitado').length;

  async function handleAccept(req: Order) {
    Alert.alert(
      'Aceitar solicitação?',
      `Confirmar atendimento para o pedido ${req.numero}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceitar',
          onPress: async () => {
            setActionLoading(true);
            try {
              // PATCH /orders/:id/accept
              const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
              const token = await AsyncStorage.getItem('@technaveia:token');
              const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/v1';
              await fetch(`${BASE_URL}/orders/${req.id}/accept`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
              });
              setSelectedReq(null);
              load(true);
              Alert.alert('Aceito!', 'O cliente foi notificado.');
            } catch {
              Alert.alert('Erro', 'Não foi possível aceitar o pedido.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  }

  async function handleReject() {
    if (!rejectReason || !selectedReq) { Alert.alert('Selecione o motivo'); return; }
    setActionLoading(true);
    try {
      await orderService.cancel(selectedReq.id);
      setShowReject(false);
      setSelectedReq(null);
      setRejectReason('');
      load(true);
      Alert.alert('Recusado', 'Solicitação recusada. O cliente será notificado.');
    } catch {
      Alert.alert('Erro', 'Não foi possível recusar o pedido.');
    } finally {
      setActionLoading(false);
    }
  }

  function handleSendBudget(req: Order) {
    setSelectedReq(null);
    navigation.navigate('CreateBudget', { pedidoId: req.id });
  }

  async function handleChangeStatus(req: Order, novoStatus: 'andamento' | 'concluido') {
    const labels: Record<string, string> = { andamento: 'iniciar', concluido: 'concluir' };
    Alert.alert(
      `${novoStatus === 'andamento' ? 'Iniciar' : 'Concluir'} serviço?`,
      `Confirma ${labels[novoStatus]} o pedido ${req.numero}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setActionLoading(true);
            try {
              const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/v1';
              const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
              const token = await AsyncStorage.getItem('@technaveia:token');
              await fetch(`${BASE_URL}/orders/${req.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: novoStatus }),
              });
              setSelectedReq(null);
              load(true);
              Alert.alert('Atualizado!', `Pedido ${novoStatus === 'andamento' ? 'iniciado' : 'concluído'} com sucesso.`);
            } catch {
              Alert.alert('Erro', 'Não foi possível atualizar o status.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  }

  const TABS: RequestTab[] = ['Novas', 'Em andamento', 'Concluídas', 'Canceladas'];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Solicitações</Text>
        {novasCount > 0 && (
          <View style={s.newBadge}>
            <Text style={s.newBadgeText}>{novasCount} nova{novasCount > 1 ? 's' : ''}</Text>
          </View>
        )}
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsScroll}>
        <View style={s.tabs}>
          {TABS.map(tab => {
            const count = orders.filter(o => o.status === TAB_STATUS[tab]).length;
            return (
              <TouchableOpacity
                key={tab}
                style={[s.tab, activeTab === tab && s.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>{tab}</Text>
                {count > 0 && (
                  <View style={[s.tabCount, activeTab === tab && s.tabCountActive]}>
                    <Text style={[s.tabCountText, activeTab === tab && { color: colors.primary }]}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Lista */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="checkmark-done-circle-outline" size={56} color="#DDD" />
          <Text style={s.emptyTitle}>Nada por aqui</Text>
          <Text style={s.emptySub}>
            {activeTab === 'Novas'
              ? 'Novas solicitações aparecerão aqui quando chegarem'
              : `Nenhuma solicitação ${activeTab.toLowerCase()}`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={s.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          renderItem={({ item }) => (
            <RequestCard req={item} onPress={() => setSelectedReq(item)} />
          )}
        />
      )}

      {/* Modal: Detalhe da solicitação */}
      <Modal
        visible={!!selectedReq && !showReject}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedReq(null)}
      >
        <View style={m.overlay}>
          <View style={m.sheet}>
            <View style={m.handle} />

            {selectedReq && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Cabeçalho */}
                <View style={m.header}>
                  <View>
                    <Text style={m.service}>{selectedReq.categoria}</Text>
                    <Text style={m.category}>{selectedReq.subcategoria}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedReq(null)}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>

                {/* Descrição */}
                <View style={m.section}>
                  <Text style={m.sectionTitle}>Descrição do problema</Text>
                  <Text style={m.desc}>{selectedReq.descricao}</Text>
                </View>

                {/* Detalhes */}
                <View style={m.infoGrid}>
                  {selectedReq.dataAgendada && (
                    <View style={m.infoItem}>
                      <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                      <View>
                        <Text style={m.infoLabel}>Data e horário</Text>
                        <Text style={m.infoVal}>
                          {selectedReq.dataAgendada}
                          {selectedReq.horaAgendada ? ` às ${selectedReq.horaAgendada}` : ''}
                        </Text>
                      </View>
                    </View>
                  )}
                  <View style={m.infoItem}>
                    <Ionicons
                      name={selectedReq.modalidade === 'presencial' ? 'location-outline' : 'laptop-outline'}
                      size={18} color={colors.primary}
                    />
                    <View>
                      <Text style={m.infoLabel}>Local</Text>
                      <Text style={m.infoVal}>
                        {selectedReq.modalidade === 'presencial'
                          ? (selectedReq.endereco ?? 'A confirmar')
                          : 'Remoto'}
                      </Text>
                    </View>
                  </View>
                  <View style={m.infoItem}>
                    <Ionicons name="wallet-outline" size={18} color={colors.primary} />
                    <View>
                      <Text style={m.infoLabel}>Estimativa</Text>
                      <Text style={m.infoVal}>{selectedReq.valorEstimado ?? 'A combinar'}</Text>
                    </View>
                  </View>
                </View>

                {/* Ações */}
                {selectedReq.status === 'solicitado' && (
                  <View style={m.actions}>
                    <TouchableOpacity
                      style={m.rejectBtn}
                      onPress={() => setShowReject(true)}
                    >
                      <Text style={m.rejectText}>Recusar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={m.budgetBtn}
                      onPress={() => handleSendBudget(selectedReq)}
                    >
                      <Ionicons name="receipt-outline" size={18} color={colors.primary} />
                      <Text style={m.budgetText}>Orçar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[m.acceptBtn, actionLoading && { opacity: 0.6 }]}
                      onPress={() => handleAccept(selectedReq)}
                      disabled={actionLoading}
                    >
                      {actionLoading
                        ? <ActivityIndicator color="#FFF" size="small" />
                        : <>
                            <Ionicons name="checkmark" size={18} color="#FFF" />
                            <Text style={m.acceptText}>Aceitar</Text>
                          </>
                      }
                    </TouchableOpacity>
                  </View>
                )}

                {selectedReq.status === 'aceito' && (
                  <TouchableOpacity
                    style={[m.startBtn, actionLoading && { opacity: 0.6 }]}
                    onPress={() => handleChangeStatus(selectedReq, 'andamento')}
                    disabled={actionLoading}
                  >
                    {actionLoading
                      ? <ActivityIndicator color="#FFF" size="small" />
                      : <><Ionicons name="play-circle-outline" size={20} color="#FFF" /><Text style={m.startBtnText}>Iniciar serviço</Text></>
                    }
                  </TouchableOpacity>
                )}

                {selectedReq.status === 'andamento' && (
                  <View style={{ gap: 10 }}>
                    <TouchableOpacity
                      style={[m.startBtn, actionLoading && { opacity: 0.6 }]}
                      onPress={() => { setSelectedReq(null); navigation.navigate('ServiceExecution', { orderId: selectedReq.id }); }}
                    >
                      <Ionicons name="construct-outline" size={20} color="#FFF" />
                      <Text style={m.startBtnText}>Tela de execução</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[m.startBtn, { backgroundColor: '#2E7D32' }, actionLoading && { opacity: 0.6 }]}
                      onPress={() => handleChangeStatus(selectedReq, 'concluido')}
                      disabled={actionLoading}
                    >
                      {actionLoading
                        ? <ActivityIndicator color="#FFF" size="small" />
                        : <><Ionicons name="checkmark-done" size={20} color="#FFF" /><Text style={m.startBtnText}>Concluir serviço</Text></>
                      }
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal: Motivo da recusa */}
      <Modal
        visible={showReject}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReject(false)}
      >
        <View style={m.overlay}>
          <View style={[m.sheet, { maxHeight: '70%' }]}>
            <View style={m.handle} />
            <Text style={[m.service, { marginBottom: 4 }]}>Por que você está recusando?</Text>
            <Text style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
              O cliente não verá o motivo, mas isso nos ajuda a melhorar a plataforma.
            </Text>

            {REJECT_REASONS.map(reason => (
              <TouchableOpacity
                key={reason}
                style={rj.option}
                onPress={() => setRejectReason(reason)}
              >
                <Ionicons
                  name={rejectReason === reason ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={rejectReason === reason ? colors.primary : '#CCC'}
                />
                <Text style={[rj.optionText, rejectReason === reason && { color: colors.primary }]}>
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
              <TouchableOpacity style={rj.cancelBtn} onPress={() => setShowReject(false)}>
                <Text style={rj.cancelText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[rj.confirmBtn, actionLoading && { opacity: 0.6 }]}
                onPress={handleReject}
                disabled={actionLoading}
              >
                {actionLoading
                  ? <ActivityIndicator color="#C62828" />
                  : <Text style={rj.confirmText}>Confirmar recusa</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ─── Estilos ───────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12,
    backgroundColor: '#FFF',
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.dark1 },
  newBadge: { backgroundColor: '#FF6B00', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  newBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  tabsScroll: { backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE', flexGrow: 0 },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 0, alignItems: 'center' },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: '#999' },
  tabTextActive: { color: colors.primary },
  tabCount: { backgroundColor: '#F0F0F0', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  tabCountActive: { backgroundColor: colors.primary + '15' },
  tabCountText: { fontSize: 10, fontWeight: '700', color: '#888' },
  list: { padding: 16 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#BBB' },
  emptySub: { fontSize: 14, color: '#CCC', textAlign: 'center', lineHeight: 20 },
});

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 12, maxHeight: '92%' },
  handle: { width: 40, height: 4, backgroundColor: '#DDD', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  service: { fontSize: 20, fontWeight: '700', color: colors.dark1, marginTop: 6 },
  category: { fontSize: 13, color: colors.primary, fontWeight: '600', marginTop: 2 },
  clientCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FF', borderRadius: 14, padding: 14, marginBottom: 20 },
  clientAvatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
  clientInitials: { fontSize: 14, fontWeight: '700', color: colors.primary },
  clientName: { fontSize: 15, fontWeight: '700', color: '#222' },
  clientRating: { fontSize: 12, color: '#888' },
  chatBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: colors.primary + '40' },
  chatBtnText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#AAA', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  desc: { fontSize: 14, color: '#444', lineHeight: 22 },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  photoText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  infoGrid: { gap: 16, marginBottom: 24 },
  infoItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  infoLabel: { fontSize: 11, color: '#AAA', fontWeight: '600', textTransform: 'uppercase' },
  infoVal: { fontSize: 14, color: '#333', fontWeight: '600', marginTop: 2 },
  infoSub: { fontSize: 12, color: '#888', marginTop: 1 },
  actions: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  rejectBtn: { flex: 1, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#DDD' },
  rejectText: { fontSize: 14, fontWeight: '700', color: '#666' },
  budgetBtn: { flex: 1, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 6, backgroundColor: colors.primary + '12', borderWidth: 1.5, borderColor: colors.primary + '30' },
  budgetText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  acceptBtn: { flex: 1.5, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 6, backgroundColor: colors.primary },
  acceptText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  startBtn: { height: 52, borderRadius: 14, backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8, marginBottom: 8 },
  startBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});

const rj = StyleSheet.create({
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  optionActive: { },
  optionText: { fontSize: 15, color: '#444' },
  cancelBtn: { flex: 1, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
  cancelText: { fontSize: 14, fontWeight: '600', color: '#666' },
  confirmBtn: { flex: 2, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFEBEE' },
  confirmText: { fontSize: 14, fontWeight: '700', color: '#C62828' },
});