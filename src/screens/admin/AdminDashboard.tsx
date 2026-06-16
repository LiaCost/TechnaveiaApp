import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/v1';

export function AdminDashboard({ navigation }: any) {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({ totalUsuarios: 0, totalPedidos: 0, disputas: 0, aprovacoes: 0, receitaTotal: 0 });

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [])
  );

  async function loadDashboard() {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('@technaveia:token');
      const res = await fetch(`${BASE_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setKpis(json.data ?? json);
      }
    } catch {}
    finally { setLoading(false); }
  }

  function handleLogout() {
    Alert.alert('Sair', 'Deseja sair da conta admin?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  }

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });

  const kpiCards = [
    { label: 'Usuários Ativos', value: loading ? '–' : String(kpis.totalUsuarios), icon: 'people', color: '#2196F3' },
    { label: 'Receita Total', value: loading ? '–' : `R$ ${(kpis.receitaTotal ?? 0).toLocaleString('pt-BR')}`, icon: 'cash', color: '#4CAF50' },
    { label: 'Disputas', value: loading ? '–' : String(kpis.disputas), icon: 'warning', color: '#F44336' },
    { label: 'Aprovações Pend.', value: loading ? '–' : String(kpis.aprovacoes), icon: 'time', color: '#FF9800' },
  ];

  const actions = [
    { label: 'Moderação de Técnicos', icon: 'shield-checkmark-outline', color: '#2196F3', route: 'Moderation' },
    { label: 'Gestão de Usuários', icon: 'people-outline', color: '#9C27B0', route: 'UserManagement' },
    { label: 'Gestão de Pedidos', icon: 'receipt-outline', color: '#FF9800', route: 'OrdersAdmin' },
    { label: 'Relatórios Financeiros', icon: 'stats-chart-outline', color: '#4CAF50', route: 'FinanceAdmin' },
    { label: 'Comunicações', icon: 'notifications-outline', color: '#00BCD4', route: 'Communications' },
  ];

  return (
    <ScrollView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.adminTitle}>Back-office TECHNAVEIA</Text>
          <Text style={s.dateText}>{hoje}</Text>
        </View>
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      {/* KPIs */}
      <View style={s.grid}>
        {kpiCards.map((kpi, i) => (
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
  container: { flex: 1, backgroundColor: '#1a1a1a', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 25, backgroundColor: '#1a1a1a' },
  adminTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  dateText: { color: '#AAA', fontSize: 12, marginTop: 5, textTransform: 'capitalize' },
  logoutBtn: { padding: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10, justifyContent: 'space-between', backgroundColor: '#1a1a1a' },
  kpiCard: { width: '47%', backgroundColor: '#FFF', padding: 20, borderRadius: 15, marginBottom: 10, elevation: 2 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  kpiValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  kpiLabel: { fontSize: 12, color: '#999', marginTop: 2 },
  section: { padding: 20, backgroundColor: '#1a1a1a', flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 14, color: '#e9e6e6ff' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 14, marginBottom: 10 },
  actionText: { flex: 1, color: '#FFF', fontWeight: 'bold', fontSize: 15 },
});
