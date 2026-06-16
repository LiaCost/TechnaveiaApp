import React, { useState, useCallback } from 'react';
import {
  ScrollView, View, Text, StyleSheet, Switch,
  TouchableOpacity, StatusBar, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme';
import { TechStats } from '../../components/TechStats';
import { orderService, notificationService, Order } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/v1';

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 60000;
  if (diff < 1) return 'Agora';
  if (diff < 60) return `${Math.floor(diff)} min`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h`;
  return `${Math.floor(diff / 1440)}d`;
}

export function TechHomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [isOnline, setIsOnline] = useState(true);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [loading, setLoading] = useState(true);

  // Dados reais
  const [orders, setOrders] = useState<Order[]>([]);
  const [avaliacao, setAvaliacao] = useState(0);
  const [taxaAceitacao, setTaxaAceitacao] = useState(100);
  const [ganhosSemana, setGanhosSemana] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [])
  );

  async function loadAll() {
    setLoading(true);
    try {
      // Carrega pedidos do técnico
      const allOrders = await orderService.list();
      setOrders(allOrders);

      // Busca perfil do técnico para avaliação e taxa
      const token = await AsyncStorage.getItem('@technaveia:token');
      const meRes = await fetch(`${BASE_URL}/technicians/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (meRes.ok) {
        const meJson = await meRes.json();
        const tecnico = meJson.data ?? meJson;
        setAvaliacao(tecnico.avaliacao ?? 0);
        setTaxaAceitacao(tecnico.taxaAceitacao ?? 100);
      }

      // Busca resumo financeiro
      const finRes = await fetch(`${BASE_URL}/finance/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (finRes.ok) {
        const finJson = await finRes.json();
        const fin = finJson.data ?? finJson;
        const semana = fin.ganhosSemana ?? [];
        setGanhosSemana(semana.reduce((a: number, b: number) => a + b, 0));
      }

      // Notificações
      notificationService.list()
        .then(data => setUnreadNotifs(data.filter(n => !n.lida).length))
        .catch(() => {});
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  }

  // Dados computados
  const novasSolicitacoes = orders.filter(o => o.status === 'solicitado');
  const pedidosHoje = orders.filter(o => {
    const today = new Date().toLocaleDateString('pt-BR');
    return o.createdAt && new Date(o.createdAt).toLocaleDateString('pt-BR') === today;
  }).length;
  const urgentes = novasSolicitacoes.filter(o => (o as any).isUrgente).length;

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={styles.profileRow}>
            <View style={styles.avatarMini}>
              {user?.foto ? (
                <Image source={{ uri: user.foto }} style={{ width: 50, height: 50, borderRadius: 25 }} />
              ) : (
                <Text style={styles.avatarInitials}>
                  {user?.nome?.split(' ').map(n => n[0]).slice(0, 2).join('') ?? 'T'}
                </Text>
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.welcome}>Olá, {user?.nome?.split(' ')[0] ?? 'Técnico'}</Text>
              <View style={styles.badgeRow}>
                <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
                <Text style={styles.badgeText}>Técnico Verificado</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => {
                const parent = navigation.getParent();
                (parent ?? navigation).navigate('Notifications');
              }}
            >
              <Ionicons name="notifications-outline" size={24} color="#333" />
              {unreadNotifs > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{unreadNotifs > 9 ? '9+' : unreadNotifs}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Switch de Disponibilidade */}
          <View style={[styles.statusCard, isOnline ? styles.onlineCard : styles.offlineCard]}>
            <Text style={[styles.statusText, { color: isOnline ? colors.primary : '#666' }]}>
              Você está {isOnline ? 'Online' : 'Offline'}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              trackColor={{ false: '#DDD', true: colors.primary + '50' }}
              thumbColor={isOnline ? colors.primary : '#999'}
            />
          </View>
        </View>

        {/* Dashboard de Stats */}
        <TechStats
          pedidosHoje={pedidosHoje}
          ganhosSemana={ganhosSemana}
          avaliacao={avaliacao}
          taxaAceitacao={taxaAceitacao}
          isLoading={loading}
        />

        {/* Novas Solicitações */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Novas Solicitações</Text>
            {urgentes > 0 && (
              <View style={styles.urgencyBadge}>
                <Text style={styles.urgencyText}>{urgentes} URGENTE{urgentes > 1 ? 'S' : ''}</Text>
              </View>
            )}
            {novasSolicitacoes.length > 0 && urgentes === 0 && (
              <View style={[styles.urgencyBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.urgencyText}>{novasSolicitacoes.length} NOVA{novasSolicitacoes.length > 1 ? 'S' : ''}</Text>
              </View>
            )}
          </View>

          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
          ) : novasSolicitacoes.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="checkmark-done-circle-outline" size={40} color="#DDD" />
              <Text style={styles.emptyText}>Nenhuma solicitação nova</Text>
              <Text style={styles.emptySub}>Novas solicitações aparecerão aqui</Text>
            </View>
          ) : (
            <>
              {novasSolicitacoes.slice(0, 2).map(order => (
                <TouchableOpacity
                  key={order.id}
                  style={styles.requestCard}
                  onPress={() => {
                    const parent = navigation.getParent();
                    (parent ?? navigation).navigate('RequestsList', { openOrderId: order.id });
                  }}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.serviceName} numberOfLines={1}>
                      {order.categoria} · {order.subcategoria}
                    </Text>
                    <Text style={styles.timeText}>{timeAgo(order.createdAt)}</Text>
                  </View>
                  <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                      <Ionicons
                        name={order.modalidade === 'presencial' ? 'location-outline' : 'laptop-outline'}
                        size={16} color="#666"
                      />
                      <Text style={styles.infoText} numberOfLines={1}>
                        {order.modalidade === 'presencial' ? (order.endereco ?? 'Endereço a confirmar') : 'Remoto'}
                      </Text>
                    </View>
                    {order.valorEstimado && (
                      <View style={styles.infoRow}>
                        <Ionicons name="wallet-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>{order.valorEstimado}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.descPreview} numberOfLines={2}>{order.descricao}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Ver todas */}
          <TouchableOpacity
            style={styles.viewAllBtn}
            onPress={() => {
              const parent = navigation.getParent();
              (parent ?? navigation).navigate('RequestsList');
            }}
          >
            <Text style={styles.viewAllText}>Ver todas as solicitações</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FF' },
  header: {
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatarMini: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarInitials: { fontSize: 16, fontWeight: '700', color: colors.primary },
  welcome: { fontSize: 18, fontWeight: 'bold' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeText: { fontSize: 12, color: colors.primary, fontWeight: 'bold' },
  notifBtn: { padding: 10, backgroundColor: '#F8F9FF', borderRadius: 12, position: 'relative' },
  notifBadge: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: '#FF3B30', borderRadius: 10,
    minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 4, borderWidth: 2, borderColor: '#FFF',
  },
  notifBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  statusCard: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 15, borderRadius: 15, borderWidth: 1,
  },
  onlineCard: { backgroundColor: colors.primary + '10', borderColor: colors.primary },
  offlineCard: { backgroundColor: '#F5F5F5', borderColor: '#DDD' },
  statusText: { fontWeight: 'bold' },
  section: { padding: 20 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  urgencyBadge: {
    backgroundColor: '#FF4B4B',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  urgencyText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  emptyCard: {
    alignItems: 'center', padding: 30, backgroundColor: '#FFF',
    borderRadius: 20, elevation: 1,
  },
  emptyText: { fontSize: 15, fontWeight: '600', color: '#BBB', marginTop: 10 },
  emptySub: { fontSize: 13, color: '#CCC', marginTop: 4 },
  requestCard: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 18, marginBottom: 12,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  serviceName: { fontSize: 16, fontWeight: 'bold', color: colors.dark1, flex: 1, marginRight: 8 },
  timeText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  cardBody: { gap: 6, marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { color: '#666', fontSize: 14, flex: 1 },
  descPreview: { fontSize: 13, color: '#888', lineHeight: 18 },
  viewAllBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 14,
  },
  viewAllText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
});
