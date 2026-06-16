import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
import { orderService, Budget, ApiError } from '../../services/api';

// ─── Serviço de orçamento (endpoint dedicado por pedido) ──
async function fetchBudget(budgetId: string): Promise<Budget> {
  // O back expõe GET /budgets/:id
  const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
  const token = await AsyncStorage.getItem('@technaveia:token');
  const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/v1';
  const res = await fetch(`${BASE_URL}/budgets/${budgetId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(res.status, err.message ?? `Erro ${res.status}`);
  }
  return res.json();
}

const TIPO_LABEL: Record<string, string> = {
  mao_de_obra: 'Mão de obra',
  peca: 'Peça / Material',
  deslocamento: 'Deslocamento',
};

export function BudgetDetailsScreen({ navigation, route }: any) {
  const { budgetId } = route.params ?? {};

  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!budgetId) {
      setError('Orçamento não encontrado.');
      setLoading(false);
      return;
    }
    fetchBudget(budgetId)
      .then(data => setBudget(data))
      .catch(err => {
        const msg = err instanceof ApiError ? err.message : 'Não foi possível carregar o orçamento.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [budgetId]);

  const handleAccept = () => {
    if (!budget) return;
    Alert.alert(
      'Confirmar Orçamento',
      'Ao aceitar, você concorda com os valores e prazos. O pagamento será processado agora.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceitar e Pagar',
          onPress: () => navigation.navigate('Payment', {
            budgetId: budget.id,
            valor: budget.total,
          }),
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Orçamento</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !budget) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Orçamento</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 }}>
          <Ionicons name="alert-circle-outline" size={48} color="#CCC" />
          <Text style={{ color: '#999', marginTop: 12, textAlign: 'center' }}>
            {error ?? 'Orçamento não encontrado.'}
          </Text>
          <TouchableOpacity
            style={{ marginTop: 20, padding: 12 }}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const tech = budget.tecnico;
  const taxa = budget.itens.reduce((acc, i) => acc, 0); // taxa já embutida no total pelo back
  const validadeLabel = budget.validade
    ? new Date(budget.validade).toLocaleDateString('pt-BR')
    : '–';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Orçamento #{budget.id.slice(-4).toUpperCase()}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Info do Técnico */}
        {tech && (
          <View style={styles.techInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials}>
                {tech.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.techName}>{tech.nome}</Text>
              <Text style={styles.techStatus}>
                {tech.verificado ? 'Técnico Verificado ✓' : 'Técnico'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() => navigation.navigate('TechProfile', { techId: tech.id })}
            >
              <Ionicons name="person-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Observações / Diagnóstico */}
        {budget.observacoes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Diagnóstico do Técnico</Text>
            <Text style={styles.description}>{budget.observacoes}</Text>
          </View>
        ) : null}

        {/* Tabela de Itens */}
        <View style={styles.budgetTable}>
          <Text style={styles.sectionTitle}>Detalhamento</Text>

          {budget.itens.map(item => (
            <View key={item.id} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemLabel}>{item.descricao}</Text>
                <Text style={styles.itemType}>{TIPO_LABEL[item.tipo] ?? item.tipo}</Text>
              </View>
              <Text style={styles.itemValue}>
                R$ {(item.valor * item.quantidade).toFixed(2).replace('.', ',')}
              </Text>
            </View>
          ))}

          <View style={[styles.itemRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              R$ {budget.total.toFixed(2).replace('.', ',')}
            </Text>
          </View>
        </View>

        {/* Prazo e Validade */}
        <View style={styles.infoBox}>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text style={styles.infoText}>Prazo: {budget.prazoExecucao}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.infoText}>Válido até: {validadeLabel}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Botões de Ação */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.declineBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.declineText}>Recusar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.acceptBtn, budget.status !== 'pendente' && { opacity: 0.5 }]}
          onPress={handleAccept}
          disabled={budget.status !== 'pendente'}
        >
          <Text style={styles.acceptText}>
            {budget.status === 'pendente' ? 'Aceitar Orçamento' : 'Orçamento ' + budget.status}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, borderBottomColor: '#EEE',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scroll: { padding: 20 },
  techInfo: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FF',
    padding: 15, borderRadius: 15, marginBottom: 25,
  },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarInitials: { fontSize: 16, fontWeight: '700', color: colors.primary },
  techName: { fontWeight: 'bold', fontSize: 16 },
  techStatus: { fontSize: 12, color: colors.primary },
  chatBtn: { padding: 10, backgroundColor: '#FFF', borderRadius: 12, elevation: 1 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  description: { color: '#666', lineHeight: 20 },
  budgetTable: {
    backgroundColor: '#FBFBFB', borderRadius: 15, padding: 15,
    borderStyle: 'dashed', borderWidth: 1, borderColor: '#DDD',
  },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  itemLabel: { color: '#444', fontWeight: '500', flex: 1 },
  itemType: { fontSize: 11, color: '#AAA', marginTop: 2 },
  itemValue: { fontWeight: '600', marginLeft: 8 },
  totalRow: {
    borderTopWidth: 1, borderTopColor: '#EEE',
    paddingTop: 15, marginTop: 5, marginBottom: 0,
  },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  infoBox: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { color: '#666', fontSize: 14 },
  footer: {
    padding: 20, flexDirection: 'row', gap: 15,
    borderTopWidth: 1, borderTopColor: '#EEE',
  },
  declineBtn: {
    flex: 1, padding: 18, borderRadius: 15, alignItems: 'center',
    borderWidth: 1, borderColor: colors.danger,
  },
  declineText: { color: colors.danger, fontWeight: 'bold' },
  acceptBtn: {
    flex: 2, padding: 18, borderRadius: 15, alignItems: 'center',
    backgroundColor: colors.primary,
  },
  acceptText: { color: '#FFF', fontWeight: 'bold' },
});
