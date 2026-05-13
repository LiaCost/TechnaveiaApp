import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function AdminDashboard({ navigation }: any) {
  const kpis = [
    { label: 'Usuários Ativos', value: '1.284', icon: 'people', color: '#2196F3' },
    { label: 'Receita Total', value: 'R$ 42.500', icon: 'cash', color: '#4CAF50' },
    { label: 'Disputas', value: '12', icon: 'warning', color: '#F44336' },
    { label: 'Aprovações', value: '8', icon: 'time', color: '#FF9800' },
  ];

  return (
    <ScrollView style={stylesAdminDash.container}>
      <View style={stylesAdminDash.header}>
        <Text style={stylesAdminDash.adminTitle}>Back-office TECHNAVEIA</Text>
        <Text style={stylesAdminDash.dateText}>Terça, 12 de Maio de 2026</Text>
      </View>

      <View style={stylesAdminDash.grid}>
        {kpis.map((kpi, i) => (
          <View key={i} style={stylesAdminDash.kpiCard}>
            <View style={[stylesAdminDash.iconCircle, { backgroundColor: kpi.color + '15' }]}>
              <Ionicons name={kpi.icon as any} size={20} color={kpi.color} />
            </View>
            <Text style={stylesAdminDash.kpiValue}>{kpi.value}</Text>
            <Text style={stylesAdminDash.kpiLabel}>{kpi.label}</Text>
          </View>
        ))}
      </View>

      <View style={stylesAdminDash.section}>
        <Text style={stylesAdminDash.sectionTitle}>Ações de Gestão</Text>
        
        <TouchableOpacity 
          style={[stylesAdminDash.actionBtn, { marginBottom: 12 }]} 
          onPress={() => navigation.navigate('Moderation')}
        >
          <Ionicons name="shield-checkmark-outline" size={20} color="#FFF" />
          <Text style={stylesAdminDash.actionText}>Moderador de Técnicos</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[stylesAdminDash.actionBtn, { backgroundColor: '#4CAF50' }]} 
          onPress={() => navigation.navigate('FinanceAdmin')}
        >
          <Ionicons name="stats-chart-outline" size={20} color="#FFF" />
          <Text style={stylesAdminDash.actionText}>Relatórios Financeiros</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[stylesAdminDash.actionBtn, { backgroundColor: '#666', marginTop: 12 }]} 
          onPress={() => Alert.alert("Push", "Funcionalidade de Notificação em breve!")}
        >
          <Ionicons name="notifications-outline" size={20} color="#FFF" />
          <Text style={stylesAdminDash.actionText}>Enviar Push Global</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const stylesAdminDash = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  header: { padding: 25, backgroundColor: '#1a1a1a' },
  adminTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  dateText: { color: '#AAA', fontSize: 12, marginTop: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10, justifyContent: 'space-between' },
  kpiCard: { width: '47%', backgroundColor: '#FFF', padding: 20, borderRadius: 15, marginBottom: 10, elevation: 2 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  kpiValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  kpiLabel: { fontSize: 12, color: '#999', marginTop: 2 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  actionBtn: { backgroundColor: '#2196F3', padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  actionText: { color: '#FFF', fontWeight: 'bold' }
});