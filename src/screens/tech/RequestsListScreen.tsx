import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, FlatList, Modal, Alert, TextInput, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

// ─── Tipos ────────────────────────────────────────────────

type RequestTab = 'Novas' | 'Em andamento' | 'Concluídas' | 'Canceladas';
type RequestStatus = 'nova' | 'andamento' | 'concluida' | 'cancelada';

interface ServiceRequest {
  id: string;
  clientName: string;
  clientRating: number;
  service: string;
  category: string;
  description: string;
  modalidade: 'presencial' | 'remoto';
  address: string;
  distance: string;
  date: string;
  time: string;
  isUrgent: boolean;
  estimatedPrice: string;
  status: RequestStatus;
  photos: number;
  receivedAgo: string;
}

// ─── Mock ─────────────────────────────────────────────────

const MOCK_REQUESTS: ServiceRequest[] = [
  {
    id: '1', clientName: 'João Pedro', clientRating: 4.8,
    service: 'Formatação de PC', category: 'Computadores',
    description: 'Notebook muito lento, suspeito de vírus. Preciso de formatação completa com backup dos arquivos antes.',
    modalidade: 'presencial', address: 'Av. Paulista, 1000 – Bela Vista', distance: '2.3km',
    date: 'Hoje', time: '14:00', isUrgent: false,
    estimatedPrice: 'R$ 150–200', status: 'nova', photos: 2, receivedAgo: '5 min',
  },
  {
    id: '2', clientName: 'Carla Mendes', clientRating: 5.0,
    service: 'Suporte Remoto', category: 'Suporte Remoto',
    description: 'Erro ao abrir o Word e Excel. Acontece desde a última atualização do Windows.',
    modalidade: 'remoto', address: 'Remoto (AnyDesk)', distance: '–',
    date: 'Hoje', time: '16:00', isUrgent: true,
    estimatedPrice: 'R$ 80–120', status: 'nova', photos: 0, receivedAgo: '12 min',
  },
  {
    id: '3', clientName: 'Roberto Alves', clientRating: 4.5,
    service: 'Configuração de Roteador', category: 'Redes',
    description: 'Internet caindo toda hora. Router novo, preciso de configuração e troca de canal.',
    modalidade: 'presencial', address: 'R. Augusta, 500 – Consolação', distance: '4.1km',
    date: 'Amanhã', time: '10:00', isUrgent: false,
    estimatedPrice: 'R$ 100–150', status: 'nova', photos: 1, receivedAgo: '1h',
  },
  {
    id: '4', clientName: 'Ana Lima', clientRating: 4.9,
    service: 'Troca de Tela Notebook', category: 'Computadores',
    description: 'Tela trincada após queda. Modelo Dell Inspiron 15.',
    modalidade: 'presencial', address: 'R. da Consolação, 200', distance: '3.5km',
    date: 'Hoje', time: '09:30', isUrgent: false,
    estimatedPrice: 'R$ 250–400', status: 'andamento', photos: 3, receivedAgo: '3h',
  },
  {
    id: '5', clientName: 'Marcos Souza', clientRating: 4.7,
    service: 'Instalação de Câmeras CFTV', category: 'Segurança',
    description: 'Instalação de 4 câmeras externas + DVR em residência.',
    modalidade: 'presencial', address: 'Al. Santos, 800', distance: '5.0km',
    date: '10 Mai', time: '09:00', isUrgent: false,
    estimatedPrice: 'R$ 400–600', status: 'concluida', photos: 0, receivedAgo: '2 dias',
  },
];

const TAB_MAP: Record<RequestTab, RequestStatus> = {
  'Novas': 'nova',
  'Em andamento': 'andamento',
  'Concluídas': 'concluida',
  'Canceladas': 'cancelada',
};

const REJECT_REASONS = [
  'Estou indisponível neste horário',
  'Fora da minha área de atuação',
  'Não atendo esta categoria de serviço',
  'Distância muito grande',
  'Outro motivo',
];

// ─── Subcomponentes ───────────────────────────────────────

function UrgentBadge() {
  return (
    <View style={ub.badge}>
      <Ionicons name="flash" size={11} color="#FFF" />
      <Text style={ub.text}>URGENTE</Text>
    </View>
  );
}

const ub = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#FF6B00', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  text: { color: '#FFF', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
});

function RequestCard({ req, onPress }: { req: ServiceRequest; onPress: () => void }) {
  return (
    <TouchableOpacity style={rc.card} onPress={onPress}>
      {/* Topo */}
      <View style={rc.top}>
        <View style={rc.catBadge}>
          <Text style={rc.catText}>{req.category}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {req.isUrgent && <UrgentBadge />}
          <Text style={rc.time}>{req.receivedAgo}</Text>
        </View>
      </View>

      {/* Serviço */}
      <Text style={rc.service}>{req.service}</Text>
      <Text style={rc.desc} numberOfLines={2}>{req.description}</Text>

      {/* Meta */}
      <View style={rc.meta}>
        <View style={rc.metaItem}>
          <Ionicons name={req.modalidade === 'presencial' ? 'location-outline' : 'laptop-outline'} size={14} color="#888" />
          <Text style={rc.metaText} numberOfLines={1}>
            {req.modalidade === 'presencial' ? `${req.address} · ${req.distance}` : 'Remoto'}
          </Text>
        </View>
        <View style={rc.metaItem}>
          <Ionicons name="calendar-outline" size={14} color="#888" />
          <Text style={rc.metaText}>{req.date} às {req.time}</Text>
        </View>
      </View>

      {/* Rodapé */}
      <View style={rc.footer}>
        <View style={rc.clientRow}>
          <View style={rc.clientAvatar}>
            <Text style={rc.clientInitials}>{req.clientName.split(' ').map(n => n[0]).join('')}</Text>
          </View>
          <View>
            <Text style={rc.clientName}>{req.clientName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Ionicons name="star" size={11} color="#FFC107" />
              <Text style={rc.clientRating}>{req.clientRating}</Text>
            </View>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={rc.price}>{req.estimatedPrice}</Text>
          {req.photos > 0 && (
            <View style={rc.photoBadge}>
              <Ionicons name="images-outline" size={11} color="#888" />
              <Text style={rc.photoText}>{req.photos} fotos</Text>
            </View>
          )}
        </View>
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
  clientRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  clientAvatar: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center',
  },
  clientInitials: { fontSize: 12, fontWeight: '700', color: colors.primary },
  clientName: { fontSize: 13, fontWeight: '600', color: '#333' },
  clientRating: { fontSize: 11, color: '#888' },
  price: { fontSize: 15, fontWeight: '700', color: colors.dark1 },
  photoBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  photoText: { fontSize: 11, color: '#888' },
});

// ─── Tela principal ────────────────────────────────────────

export function RequestsListScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<RequestTab>('Novas');
  const [selectedReq, setSelectedReq] = useState<ServiceRequest | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [requests, setRequests] = useState(MOCK_REQUESTS);

  const filtered = requests.filter(r => r.status === TAB_MAP[activeTab]);
  const newCount = requests.filter(r => r.status === 'nova').length;

  function handleAccept(req: ServiceRequest) {
    Alert.alert(
      'Aceitar solicitação?',
      `Confirmar atendimento para ${req.clientName} em ${req.date} às ${req.time}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceitar', onPress: () => {
            setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'andamento' } : r));
            setSelectedReq(null);
            Alert.alert('Aceito!', 'O cliente foi notificado. Você pode acompanhar em "Em andamento".');
          },
        },
      ]
    );
  }

  function handleReject() {
    if (!rejectReason) { Alert.alert('Selecione o motivo'); return; }
    setRequests(prev => prev.map(r => r.id === selectedReq?.id ? { ...r, status: 'cancelada' } : r));
    setShowReject(false);
    setSelectedReq(null);
    setRejectReason('');
    Alert.alert('Recusado', 'Solicitação recusada. O cliente será notificado.');
  }

  function handleSendBudget(req: ServiceRequest) {
    setSelectedReq(null);
    navigation.navigate('CreateBudget', { requestId: req.id });
  }

  const TABS: RequestTab[] = ['Novas', 'Em andamento', 'Concluídas', 'Canceladas'];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* ── Header ── */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Solicitações</Text>
        {newCount > 0 && (
          <View style={s.newBadge}>
            <Text style={s.newBadgeText}>{newCount} nova{newCount > 1 ? 's' : ''}</Text>
          </View>
        )}
      </View>

      {/* ── Tabs ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsScroll}>
        <View style={s.tabs}>
          {TABS.map(tab => {
            const count = requests.filter(r => r.status === TAB_MAP[tab]).length;
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

      {/* ── Lista ── */}
      {filtered.length === 0 ? (
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
          renderItem={({ item }) => (
            <RequestCard req={item} onPress={() => setSelectedReq(item)} />
          )}
        />
      )}

      {/* ══ Modal: Detalhe da solicitação ══ */}
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
                    {selectedReq.isUrgent && <UrgentBadge />}
                    <Text style={m.service}>{selectedReq.service}</Text>
                    <Text style={m.category}>{selectedReq.category}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedReq(null)}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>

                {/* Cliente */}
                <View style={m.clientCard}>
                  <View style={m.clientAvatar}>
                    <Text style={m.clientInitials}>
                      {selectedReq.clientName.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={m.clientName}>{selectedReq.clientName}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="star" size={13} color="#FFC107" />
                      <Text style={m.clientRating}>{selectedReq.clientRating} de avaliação</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={m.chatBtn}>
                    <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
                    <Text style={m.chatBtnText}>Perguntar</Text>
                  </TouchableOpacity>
                </View>

                {/* Descrição */}
                <View style={m.section}>
                  <Text style={m.sectionTitle}>Descrição do problema</Text>
                  <Text style={m.desc}>{selectedReq.description}</Text>
                  {selectedReq.photos > 0 && (
                    <View style={m.photoRow}>
                      <Ionicons name="images-outline" size={16} color={colors.primary} />
                      <Text style={m.photoText}>{selectedReq.photos} foto(s) anexadas pelo cliente</Text>
                    </View>
                  )}
                </View>

                {/* Detalhes */}
                <View style={m.infoGrid}>
                  <View style={m.infoItem}>
                    <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                    <View>
                      <Text style={m.infoLabel}>Data e horário</Text>
                      <Text style={m.infoVal}>{selectedReq.date} às {selectedReq.time}</Text>
                    </View>
                  </View>
                  <View style={m.infoItem}>
                    <Ionicons name={selectedReq.modalidade === 'presencial' ? 'location-outline' : 'laptop-outline'} size={18} color={colors.primary} />
                    <View>
                      <Text style={m.infoLabel}>Local</Text>
                      <Text style={m.infoVal}>{selectedReq.address}</Text>
                      {selectedReq.distance !== '–' && (
                        <Text style={m.infoSub}>{selectedReq.distance} de você</Text>
                      )}
                    </View>
                  </View>
                  <View style={m.infoItem}>
                    <Ionicons name="wallet-outline" size={18} color={colors.primary} />
                    <View>
                      <Text style={m.infoLabel}>Estimativa</Text>
                      <Text style={m.infoVal}>{selectedReq.estimatedPrice}</Text>
                    </View>
                  </View>
                </View>

                {/* Ações */}
                {selectedReq.status === 'nova' && (
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
                      style={m.acceptBtn}
                      onPress={() => handleAccept(selectedReq)}
                    >
                      <Ionicons name="checkmark" size={18} color="#FFF" />
                      <Text style={m.acceptText}>Aceitar</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {selectedReq.status === 'andamento' && (
                  <TouchableOpacity
                    style={m.startBtn}
                    onPress={() => { setSelectedReq(null); navigation.navigate('ServiceExecution'); }}
                  >
                    <Ionicons name="play-circle-outline" size={20} color="#FFF" />
                    <Text style={m.startBtnText}>Ir para Execução</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ══ Modal: Motivo da recusa ══ */}
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
                style={[rj.option, rejectReason === reason && rj.optionActive]}
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
              <TouchableOpacity style={rj.confirmBtn} onPress={handleReject}>
                <Text style={rj.confirmText}>Confirmar recusa</Text>
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
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12,
    backgroundColor: '#FFF',
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.dark1 },
  newBadge: { backgroundColor: '#FF6B00', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  newBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  tabsScroll: { backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 0 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: 'transparent' },
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