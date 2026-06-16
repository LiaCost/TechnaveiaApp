import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme';
import { financeService, FinanceSummary, Transaction, ApiError } from '../../services/api';

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function FinanceScreen({ navigation }: any) {
  const [summary, setSummary]     = useState<FinanceSummary | null>(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  async function load(silent = false) {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await financeService.getSummary();
      setSummary(data);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Não foi possível carregar os dados financeiros.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  function onRefresh() {
    setRefreshing(true);
    load(true);
  }

  const maxBar = summary ? Math.max(...summary.ganhosSemana, 1) : 1;
  const dias   = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !summary) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 }}>
          <Ionicons name="alert-circle-outline" size={48} color="#CCC" />
          <Text style={styles.errorText}>{error ?? 'Erro ao carregar dados.'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => load()}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const variacao = summary.ganhosMesAnterior > 0
    ? ((summary.ganhosMes - summary.ganhosMesAnterior) / summary.ganhosMesAnterior * 100).toFixed(1)
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FF" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Cartão de Saldo Principal */}
        <View style={styles.balanceCard}>
          <View>
            <Text style={styles.balanceLabel}>Saldo disponível</Text>
            <Text style={styles.balanceValue}>{fmtBRL(summary.saldoDisponivel)}</Text>
          </View>
          <TouchableOpacity
            style={styles.withdrawBtn}
            onPress={() => navigation.navigate('Withdraw')}
          >
            <Text style={styles.withdrawText}>Sacar</Text>
          </TouchableOpacity>
        </View>

        {/* Resumo Secundário */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Pendente</Text>
            <Text style={styles.summaryValue}>{fmtBRL(summary.saldoPendente)}</Text>
          </View>
          <View style={[styles.summaryItem, { borderLeftWidth: 1, borderColor: '#EEE' }]}>
            <Text style={styles.summaryLabel}>Ganhos no Mês</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>
                {fmtBRL(summary.ganhosMes)}
              </Text>
              {variacao !== null && (
                <Text style={[
                  styles.variacaoText,
                  { color: Number(variacao) >= 0 ? '#4CAF50' : '#F44336' },
                ]}>
                  {Number(variacao) >= 0 ? '▲' : '▼'} {Math.abs(Number(variacao))}%
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Gráfico de Ganhos Semanal */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Desempenho (Últimos 7 dias)</Text>
          <View style={styles.chartBarContainer}>
            {summary.ganhosSemana.map((val, i) => {
              const height = maxBar > 0 ? Math.max((val / maxBar) * 90, 4) : 4;
              return (
                <View key={i} style={styles.chartBarWrapper}>
                  <View style={[styles.chartBar, { height }]} />
                  <Text style={styles.chartDay}>{dias[i]}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Lista de Extrato */}
        <View style={styles.extractSection}>
          <Text style={styles.sectionTitle}>Últimas Transações</Text>

          {summary.transacoes.length === 0 ? (
            <Text style={{ color: '#AAA', textAlign: 'center', paddingVertical: 20 }}>
              Nenhuma transação ainda.
            </Text>
          ) : (
            summary.transacoes.map(item => (
              <TransactionRow key={item.id} item={item} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TransactionRow({ item }: { item: Transaction }) {
  const isCredit = item.tipo === 'credito';
  const statusColor = item.status === 'concluido' ? '#4CAF50'
    : item.status === 'pendente'  ? '#FF9500' : '#F44336';

  const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const statusLabel: Record<string, string> = {
    concluido: 'Concluído', pendente: 'Pendente', falhou: 'Falhou',
  };

  return (
    <View style={styles.transactionItem}>
      <View style={styles.transIcon}>
        <Ionicons
          name={isCredit
            ? (item.status === 'concluido' ? 'checkmark-circle' : 'time')
            : 'arrow-up-circle'}
          size={24}
          color={statusColor}
        />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.transService}>{item.servico ?? 'Saque'}</Text>
        <Text style={styles.transDate}>
          {item.date}
          {item.cliente ? ` • ${item.cliente}` : ''}
          {isCredit ? ` • Taxa: ${fmtBRL(item.taxa)}` : ''}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.transNet, { color: isCredit ? '#333' : '#F44336' }]}>
          {isCredit ? '+' : '-'}{fmtBRL(item.valorLiquido)}
        </Text>
        <Text style={[styles.transStatus, { color: statusColor }]}>
          {statusLabel[item.status] ?? item.status}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FF' },
  errorText: { color: '#999', marginTop: 10, textAlign: 'center' },
  retryBtn: {
    marginTop: 16, paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: colors.primary, borderRadius: 10,
  },
  retryText: { color: '#FFF', fontWeight: '700' },
  balanceCard: {
    backgroundColor: colors.dark1, margin: 20, padding: 25, borderRadius: 25,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 5,
  },
  balanceLabel: { color: '#AAA', fontSize: 14 },
  balanceValue: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginTop: 5 },
  withdrawBtn: {
    backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12,
  },
  withdrawText: { color: '#FFF', fontWeight: 'bold' },
  summaryRow: {
    flexDirection: 'row', backgroundColor: '#FFF',
    marginHorizontal: 20, padding: 20, borderRadius: 20, elevation: 2,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { color: '#999', fontSize: 12, marginBottom: 5 },
  summaryValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  variacaoText: { fontSize: 11, fontWeight: '700' },
  chartSection: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 20 },
  chartBarContainer: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-end', height: 120,
    backgroundColor: '#FFF', padding: 15, borderRadius: 20,
  },
  chartBarWrapper: { alignItems: 'center' },
  chartBar: { width: 12, backgroundColor: colors.primary, borderRadius: 6 },
  chartDay: { fontSize: 10, color: '#999', marginTop: 8 },
  extractSection: { padding: 20, backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  transactionItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  transIcon: {
    width: 45, height: 45, borderRadius: 12,
    backgroundColor: '#F8F9FF', justifyContent: 'center', alignItems: 'center',
  },
  transService: { fontWeight: 'bold', fontSize: 14 },
  transDate: { fontSize: 12, color: '#999', marginTop: 2 },
  transNet: { fontWeight: 'bold', fontSize: 14 },
  transStatus: { fontSize: 10, fontWeight: 'bold', marginTop: 2 },
});
