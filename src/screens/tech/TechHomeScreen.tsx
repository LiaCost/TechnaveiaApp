import React, { useState, useEffect } from 'react';
import {
  ScrollView, View, Text, StyleSheet, Switch,
  TouchableOpacity, StatusBar, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
import { TechStats } from '../../components/TechStats';
import { financeService, FinanceSummary } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export function TechHomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    async function loadSummary() {
      try {
        const data = await financeService.getSummary();
        setSummary(data);
      } catch (e) {
        console.warn('Erro ao carregar resumo financeiro:', e);
      } finally {
        setIsLoadingStats(false);
      }
    }
    loadSummary();
  }, []);

  const ganhosSemana = summary?.ganhosSemana.reduce((a, b) => a + b, 0) ?? 0;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header do Técnico */}
        <View style={styles.header}>
          <View style={styles.profileRow}>
            <View style={styles.avatarMini}>
              <Text style={styles.avatarInitials}>
                {user?.nome?.split(' ').map(n => n[0]).slice(0, 2).join('') ?? 'T'}
              </Text>
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
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color="#333" />
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

        {/* Dashboard de Ganhos */}
        <TechStats
          pedidosHoje={summary ? 5 : 0}
          ganhosSemana={ganhosSemana}
          avaliacao={4.9}
          taxaAceitacao={98}
          isLoading={isLoadingStats}
        />

        {/* Seção: Novas Solicitações */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Novas Solicitações</Text>
            <View style={styles.urgencyBadge}>
              <Text style={styles.urgencyText}>2 URGENTES</Text>
            </View>
          </View>

          {/* Card de Solicitação */}
          <TouchableOpacity
            style={styles.requestCard}
            onPress={() => navigation.navigate('RequestsList')}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.serviceName}>Formatação + Backup</Text>
              <Text style={styles.timeText}>Há 5 min</Text>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.infoText}>Santana (2.5km de você)</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="wallet-outline" size={16} color="#666" />
                <Text style={styles.infoText}>Est. R$ 150,00 – 200,00</Text>
              </View>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.declineBtn}>
                <Text style={styles.declineText}>Recusar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptBtn}>
                <Text style={styles.acceptText}>Aceitar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* Ver todas as solicitações */}
          <TouchableOpacity
            style={styles.viewAllBtn}
            onPress={() => navigation.navigate('RequestsList')}
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
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
  notifBtn: { padding: 10, backgroundColor: '#F8F9FF', borderRadius: 12 },
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
  requestCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  serviceName: { fontSize: 16, fontWeight: 'bold' },
  timeText: { fontSize: 12, color: colors.primary },
  cardBody: { gap: 8, marginBottom: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { color: '#666', fontSize: 14 },
  cardActions: { flexDirection: 'row', gap: 10 },
  declineBtn: {
    flex: 1, padding: 12, alignItems: 'center',
    borderRadius: 10, borderWidth: 1, borderColor: '#DDD',
  },
  declineText: { color: '#666', fontWeight: 'bold' },
  acceptBtn: {
    flex: 1, padding: 12, alignItems: 'center',
    backgroundColor: colors.primary, borderRadius: 10,
  },
  acceptText: { color: '#FFF', fontWeight: 'bold' },
  viewAllBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 14,
  },
  viewAllText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
});