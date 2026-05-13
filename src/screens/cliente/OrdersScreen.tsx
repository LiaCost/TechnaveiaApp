import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, 
  TouchableOpacity, SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

// Tipagem para os status
type OrderStatus = 'Aberto' | 'Em Andamento' | 'Agendado' | 'Concluído' | 'Cancelado';

interface Order {
  id: string;
  service: string;
  techName: string;
  date: string;
  status: OrderStatus;
  price: string;
}

export function OrdersScreen() {
  const [activeTab, setActiveTab] = useState<'Ativos' | 'Concluídos'>('Ativos');

  const orders: Order[] = [
    { id: '1', service: 'Manutenção de PC', techName: 'Ricardo Silva', date: 'Hoje, 14:00', status: 'Em Andamento', price: 'R$ 150,00' },
    { id: '2', service: 'Configuração de Redes', techName: 'Ana Oliveira', date: 'Amanhã, 10:00', status: 'Agendado', price: 'A definir' },
    { id: '3', service: 'Limpeza de Console', techName: 'Marcos Paulo', date: '10/05/2024', status: 'Concluído', price: 'R$ 120,00' },
  ];

  // Função para definir a cor da etiqueta de status
  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case 'Em Andamento': return { bg: '#E3F2FD', text: '#1976D2' }; // Azul
      case 'Agendado': return { bg: '#FFF3E0', text: '#F57C00' };    // Laranja
      case 'Concluído': return { bg: '#E8F5E9', text: '#388E3C' };   // Verde
      case 'Cancelado': return { bg: '#FFEBEE', text: '#D32F2F' };   // Vermelho
      default: return { bg: '#F5F5F5', text: '#616161' };           // Cinza
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Pedidos</Text>
      </View>

      {/* Seletor de Abas (Tabs) */}
      <View style={styles.tabBar}>
        {['Ativos', 'Concluídos'].map((tab) => (
          <TouchableOpacity 
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList 
        data={orders.filter(o => activeTab === 'Ativos' ? o.status !== 'Concluído' : o.status === 'Concluído')}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => {
          const statusStyle = getStatusStyle(item.status);
          return (
            <TouchableOpacity style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.serviceTitle}>{item.service}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text>
                </View>
              </View>

              <View style={styles.orderBody}>
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={16} color="#999" />
                  <Text style={styles.infoText}>Técnico: {item.techName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={16} color="#999" />
                  <Text style={styles.infoText}>{item.date}</Text>
                </View>
              </View>

              <View style={styles.orderFooter}>
                <Text style={styles.priceText}>{item.price}</Text>
                <TouchableOpacity style={styles.detailsBtn}>
                  <Text style={styles.detailsBtnText}>Ver Detalhes</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  header: { padding: 20, backgroundColor: '#FFF' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
  tabBar: { flexDirection: 'row', backgroundColor: '#FFF', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  tabItem: { paddingVertical: 15, marginRight: 30, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: 16, color: '#999', fontWeight: '600' },
  tabTextActive: { color: colors.primary },
  
  orderCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  serviceTitle: { fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 10 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  
  orderBody: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 12, marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  infoText: { marginLeft: 8, color: '#666', fontSize: 14 },
  
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceText: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  detailsBtn: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8, backgroundColor: colors.primary + '10' },
  detailsBtnText: { color: colors.primary, fontWeight: 'bold', fontSize: 14 }
});