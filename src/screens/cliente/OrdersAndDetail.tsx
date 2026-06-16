import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert,
  Platform, StatusBar, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
import { orderService, Order } from '../../services/api';

// ─── Configurações de status ──────────────────────────────

const STATUS_CFG: Record<Order['status'], { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  solicitado: { label: 'Aguardando técnico', color: '#E65100', bg: '#FFF3E0', icon: 'time-outline' },
  aceito:     { label: 'Técnico confirmado', color: '#1976D2', bg: '#E3F2FD', icon: 'checkmark-circle-outline' },
  andamento:  { label: 'Em andamento',       color: '#2E7D32', bg: '#E8F5E9', icon: 'play-circle-outline' },
  concluido:  { label: 'Concluído',          color: '#555',    bg: '#F5F5F5', icon: 'checkmark-done-circle-outline' },
  cancelado:  { label: 'Cancelado',          color: '#C62828', bg: '#FFEBEE', icon: 'close-circle-outline' },
  disputa:    { label: 'Em disputa',         color: '#7B1FA2', bg: '#F3E5F5', icon: 'warning-outline' },
};

const TIMELINE_STEPS: { key: Order['status']; label: string }[] = [
  { key: 'solicitado', label: 'Solicitado' },
  { key: 'aceito',     label: 'Aceito pelo técnico' },
  { key: 'andamento',  label: 'Em andamento' },
  { key: 'concluido',  label: 'Concluído' },
];

function getTimelineIndex(status: Order['status']): number {
  return TIMELINE_STEPS.findIndex(s => s.key === status);
}

// ─── Tela principal ────────────────────────────────────────

export function OrderDetailScreen({ navigation, route }: any) {
  const orderId: string = route?.params?.orderId ?? '1';
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    orderService.getById(orderId)
      .then(setOrder)
      .catch(() => Alert.alert('Erro', 'Pedido não encontrado.'))
      .finally(() => setIsLoading(false));
  }, [orderId]);

  async function openChat() {
    if (!order) return;
    try {
      const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/v1';
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      const token = await AsyncStorage.getItem('@technaveia:token');
      const res = await fetch(`${BASE_URL}/conversations/by-order/${order.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const conversaId = json.data?.conversaId ?? json.conversaId;
      if (!conversaId) { Alert.alert('Chat não disponível', 'A conversa ainda não foi criada.'); return; }
      navigation.navigate('Chat', {
        conversaId,
        outroNome: order.tecnico?.nome ?? 'Técnico',
        pedidoNumero: order.numero,
        pedidoId: order.id,
      });
    } catch {
      Alert.alert('Erro', 'Não foi possível abrir o chat.');
    }
  }

  async function handleCancel() {
    Alert.alert(
      'Cancelar pedido?',
      'Esta ação não pode ser desfeita. Confirmar cancelamento?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Cancelar pedido', style: 'destructive',
          onPress: async () => {
            setIsCancelling(true);
            try {
              await orderService.cancel(orderId);
              navigation.goBack();
            } catch {
              Alert.alert('Erro', 'Não foi possível cancelar o pedido.');
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  }

  // ── Loading ──
  if (isLoading) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.loading}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) return null;

  const cfg = STATUS_CFG[order.status];
  const timelineIdx = getTimelineIndex(order.status);
  const showTimeline = order.status !== 'cancelado' && order.status !== 'disputa';

  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.dark1} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{order.numero}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Status atual ── */}
        <View style={[s.statusCard, { backgroundColor: cfg.bg }]}>
          <View style={[s.statusIcon, { backgroundColor: cfg.color + '20' }]}>
            <Ionicons name={cfg.icon} size={24} color={cfg.color} />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[s.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
            <Text style={s.statusService}>{order.categoria} · {order.subcategoria}</Text>
          </View>
        </View>

        {/* ── Timeline ── */}
        {showTimeline && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Progresso do pedido</Text>
            <View style={s.timelineCard}>
              {TIMELINE_STEPS.map((step, i) => {
                const done   = i <= timelineIdx;
                const active = i === timelineIdx;
                const isLast = i === TIMELINE_STEPS.length - 1;
                return (
                  <View key={step.key} style={s.timelineRow}>
                    {/* Linha vertical + dot */}
                    <View style={s.timelineLeft}>
                      <View style={[
                        s.timelineDot,
                        done  && s.timelineDotDone,
                        active && s.timelineDotActive,
                      ]}>
                        {done && (
                          <Ionicons name="checkmark" size={12} color="#FFF" />
                        )}
                      </View>
                      {!isLast && (
                        <View style={[
                          s.timelineLine,
                          done && i < timelineIdx && s.timelineLineDone,
                        ]} />
                      )}
                    </View>

                    {/* Label */}
                    <Text style={[
                      s.timelineLabel,
                      active && s.timelineLabelActive,
                      !done  && s.timelineLabelFuture,
                    ]}>
                      {step.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Técnico ── */}
        {order.tecnico && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Técnico responsável</Text>
            <View style={s.techCard}>
              <View style={s.techAvatarWrap}>
                {order.tecnico.foto ? (
                  <Image source={{ uri: order.tecnico.foto }} style={s.techAvatarImg} />
                ) : (
                  <View style={s.techAvatar}>
                    <Text style={s.techInitials}>
                      {order.tecnico.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </Text>
                  </View>
                )}
                {order.tecnico.verificado && (
                  <View style={s.verifiedDot}>
                    <Ionicons name="checkmark" size={10} color="#FFF" />
                  </View>
                )}
              </View>

              <View style={{ flex: 1, marginLeft: 14 }}>
                <View style={s.techNameRow}>
                  <Text style={s.techName}>{order.tecnico.nome}</Text>
                  {order.tecnico.verificado && (
                    <View style={s.verifiedBadge}>
                      <Text style={s.verifiedText}>Verificado</Text>
                    </View>
                  )}
                </View>
                <View style={s.ratingRow}>
                  <Ionicons name="star" size={13} color="#FFC107" />
                  <Text style={s.ratingText}>
                    {order.tecnico.avaliacao} ({order.tecnico.totalAvaliacoes} aval.)
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={s.chatBtn}
                onPress={openChat}
              >
                <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Detalhes do serviço ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Detalhes do serviço</Text>
          <View style={s.infoCard}>
            <View style={s.infoRow}>
              <Ionicons name="document-text-outline" size={16} color="#999" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={s.infoLabel}>Descrição</Text>
                <Text style={s.infoVal}>{order.descricao}</Text>
              </View>
            </View>

            <View style={s.infoRow}>
              <Ionicons
                name={order.modalidade === 'presencial' ? 'location-outline' : 'laptop-outline'}
                size={16} color="#999"
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={s.infoLabel}>Modalidade</Text>
                <Text style={s.infoVal}>
                  {order.modalidade === 'presencial' ? 'Presencial' : 'Remoto'}
                </Text>
              </View>
            </View>

            {order.endereco && (
              <View style={s.infoRow}>
                <Ionicons name="home-outline" size={16} color="#999" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.infoLabel}>Endereço</Text>
                  <Text style={s.infoVal}>{order.endereco}</Text>
                </View>
              </View>
            )}

            {order.dataAgendada && (
              <View style={[s.infoRow, { borderBottomWidth: 0 }]}>
                <Ionicons name="calendar-outline" size={16} color="#999" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.infoLabel}>Data e horário</Text>
                  <Text style={s.infoVal}>
                    {order.dataAgendada}
                    {order.horaAgendada ? ` às ${order.horaAgendada}` : ''}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* ── Valor ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Valor</Text>
          <View style={s.valueCard}>
            <Text style={s.valueLabel}>
              {order.valorFinal ? 'Valor cobrado' : 'Estimativa de preço'}
            </Text>
            <Text style={s.valueAmount}>
              {order.valorFinal
                ? `R$ ${order.valorFinal.toFixed(2).replace('.', ',')}`
                : order.valorEstimado ?? 'A definir após diagnóstico'}
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* ── Ações do rodapé (variam por status) ── */}
      <View style={s.footer}>
        {order.status === 'concluido' && (
          <>
            <TouchableOpacity
              style={s.btnPrimary}
              onPress={() => navigation.navigate('Review', {
                orderId: order.id,
                techNome: order.tecnico?.nome,
                techFoto: order.tecnico?.foto,
              })}
            >
              <Ionicons name="star-outline" size={18} color="#FFF" />
              <Text style={s.btnPrimaryText}>Avaliar serviço</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.btnSecondary}
              onPress={() => navigation.navigate('OpenDispute', { orderId: order.id })}
            >
              <Text style={s.btnSecondaryText}>Abrir disputa</Text>
            </TouchableOpacity>
          </>
        )}

        {(order.status === 'solicitado' || order.status === 'aceito') && (
          <TouchableOpacity
            style={s.btnDanger}
            onPress={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling
              ? <ActivityIndicator color="#C62828" size="small" />
              : <Text style={s.btnDangerText}>Cancelar pedido</Text>
            }
          </TouchableOpacity>
        )}

        {order.status === 'andamento' && (
          <TouchableOpacity
            style={s.btnPrimary}
            onPress={openChat}
          >
            <Ionicons name="chatbubble-outline" size={18} color="#FFF" />
            <Text style={s.btnPrimaryText}>Falar com o técnico</Text>
          </TouchableOpacity>
        )}
      </View>

    </SafeAreaView>
  );
}

// ─── Estilos ───────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FF', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, backgroundColor: '#FFF',
    borderBottomWidth: 1, borderBottomColor: '#EEE',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.dark1 },

  scroll: { padding: 16, paddingBottom: 16 },

  // Status
  statusCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 18, padding: 16, marginBottom: 20,
  },
  statusIcon: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  statusLabel: { fontSize: 16, fontWeight: '700' },
  statusService: { fontSize: 13, color: '#666', marginTop: 2 },

  // Seção
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: '#AAA',
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10,
  },

  // Timeline
  timelineCard: {
    backgroundColor: '#FFF', borderRadius: 18, padding: 20,
  },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start' },
  timelineLeft: { alignItems: 'center', marginRight: 14, width: 22 },
  timelineDot: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#EEE', borderWidth: 2, borderColor: '#DDD',
    justifyContent: 'center', alignItems: 'center',
  },
  timelineDotDone:   { backgroundColor: colors.primary, borderColor: colors.primary },
  timelineDotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  timelineLine: { width: 2, height: 32, backgroundColor: '#EEE', marginTop: 2 },
  timelineLineDone: { backgroundColor: colors.primary },
  timelineLabel: {
    fontSize: 14, color: '#666', paddingTop: 2, paddingBottom: 34, lineHeight: 20,
  },
  timelineLabelActive: { color: colors.primary, fontWeight: '700' },
  timelineLabelFuture: { color: '#CCC' },

  // Técnico
  techCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', borderRadius: 18, padding: 16,
  },
  techAvatar: {
    width: 50, height: 50, borderRadius: 14,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center', alignItems: 'center',
  },
  techAvatarWrap: {
    position: 'relative',
  },
  techAvatarImg: {
    width: 50, height: 50, borderRadius: 14,
  },
  techInitials: { fontSize: 16, fontWeight: '700', color: colors.primary },
  verifiedDot: {
    position: 'absolute', bottom: -2, right: -2,
    width: 17, height: 17, borderRadius: 9,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#FFF',
  },
  techNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  techName: { fontSize: 15, fontWeight: '700', color: '#222' },
  verifiedBadge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
  },
  verifiedText: { fontSize: 10, color: colors.primary, fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ratingText: { fontSize: 12, color: '#888' },
  chatBtn: {
    width: 42, height: 42, borderRadius: 12,
    borderWidth: 1.5, borderColor: colors.primary + '40',
    justifyContent: 'center', alignItems: 'center',
  },

  // Info card
  infoCard: { backgroundColor: '#FFF', borderRadius: 18, padding: 16 },
  infoRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  infoLabel: {
    fontSize: 11, color: '#AAA', fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.4,
  },
  infoVal: { fontSize: 14, color: '#333', fontWeight: '500', marginTop: 3, lineHeight: 20 },

  // Valor
  valueCard: {
    backgroundColor: colors.dark1, borderRadius: 18, padding: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    flexWrap: 'wrap', gap: 8,
  },
  valueLabel: { fontSize: 13, color: '#AAA' },
  valueAmount: { fontSize: 18, fontWeight: '700', color: '#FFF', flexShrink: 1 },

  // Footer
  footer: {
    padding: 16, paddingBottom: Platform.OS === 'android' ? 34 : 16, backgroundColor: '#FFF',
    borderTopWidth: 1, borderTopColor: '#EEE', gap: 10,
  },
  btnPrimary: {
    backgroundColor: colors.primary, borderRadius: 14, height: 52,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  btnPrimaryText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  btnSecondary: {
    borderWidth: 1.5, borderColor: '#DDD', borderRadius: 14, height: 46,
    justifyContent: 'center', alignItems: 'center',
  },
  btnSecondaryText: { color: '#666', fontWeight: '600', fontSize: 14 },
  btnDanger: {
    backgroundColor: '#FFEBEE', borderRadius: 14, height: 46,
    justifyContent: 'center', alignItems: 'center',
  },
  btnDangerText: { color: '#C62828', fontWeight: '700', fontSize: 14 },
});