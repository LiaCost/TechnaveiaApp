import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function AdminDashboard({ navigation }: any) {
  const kpis = [
    { label: 'Usuários Ativos', value: '1.284', icon: 'people',       color: '#2196F3' },
    { label: 'Receita Total',   value: 'R$ 42.500', icon: 'cash',     color: '#4CAF50' },
    { label: 'Disputas',        value: '12',  icon: 'warning',         color: '#F44336' },
    { label: 'Aprovações',      value: '8',   icon: 'time',            color: '#FF9800' },
  ];

  // Data dinâmica
  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });
  const hojeFormatado = hoje.charAt(0).toUpperCase() + hoje.slice(1);

  const actions = [
    { label: 'Moderador de Técnicos', icon: 'shield-checkmark-outline', color: '#2196F3', route: 'Moderation' },
    { label: 'Gestão de Usuários',    icon: 'people-outline',            color: '#9C27B0', route: 'UserManagement' },
    { label: 'Gestão de Pedidos',     icon: 'receipt-outline',           color: '#FF9800', route: 'OrdersAdmin' },
    { label: 'Relatórios Financeiros',icon: 'stats-chart-outline',       color: '#4CAF50', route: 'FinanceAdmin' },
    { label: 'Comunicações',          icon: 'notifications-outline',     color: '#00BCD4', route: 'Communications' },
  ];

  return (
    <ScrollView style={s.container}>
      <View style={s.header}>
        <Text style={s.adminTitle}>Back-office TECHNAVEIA</Text>
        <Text style={s.dateText}>{hojeFormatado}</Text>
      </View>

      {/* KPIs */}
      <View style={s.grid}>
        {kpis.map((kpi, i) => (
          <View key={i} style={s.kpiCard}>
            <View style={[s.iconCircle, { backgroundColor: kpi.color + '18' }]}>
              <Ionicons name={kpi.icon as any} size={20} color={kpi.color} />
            </View>
            <Text style={s.kpiValue}>{kpi.value}</Text>
            <Text style={s.kpiLabel}>{kpi.label}</Text>
          </View>
        ))}
      </View>

      {/* Ações */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Ações de Gestão</Text>
        {actions.map((action, i) => (
          <TouchableOpacity
            key={i}
            style={[s.actionBtn, { backgroundColor: action.color }]}
            onPress={() => navigation.navigate(action.route)}
          >
            <Ionicons name={action.icon as any} size={20} color="#FFF" />
            <Text style={s.actionText}>{action.label}</Text>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  header: { padding: 25, backgroundColor: '#1a1a1a' },
  adminTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  dateText: { color: '#AAA', fontSize: 12, marginTop: 5, textTransform: 'capitalize' },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    padding: 10, justifyContent: 'space-between',
  },
  kpiCard: {
    width: '47%', backgroundColor: '#FFF',
    padding: 20, borderRadius: 15, marginBottom: 10, elevation: 2,
  },
  iconCircle: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  kpiValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  kpiLabel: { fontSize: 12, color: '#999', marginTop: 2 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 14, color: '#333' },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, borderRadius: 14, marginBottom: 10,
  },
  actionText: { flex: 1, color: '#FFF', fontWeight: 'bold', fontSize: 15 },
});