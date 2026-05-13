import React from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, ScrollView, 
  TouchableOpacity, FlatList 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

export function FinanceScreen({ navigation }: any) {
  
  // Mock de transações
  const transactions = [
    { id: '1', service: 'Formatação PC', date: 'Hoje', gross: 'R$ 150,00', net: 'R$ 127,50', status: 'Concluído' },
    { id: '2', service: 'Troca de Tela', date: 'Ontem', gross: 'R$ 350,00', net: 'R$ 297,50', status: 'Pendente' },
    { id: '3', service: 'Reparo de Rede', date: '10 Mai', gross: 'R$ 200,00', net: 'R$ 170,00', status: 'Concluído' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Cartão de Saldo Principal */}
        <View style={styles.balanceCard}>
          <View>
            <Text style={styles.balanceLabel}>Saldo disponível</Text>
            <Text style={styles.balanceValue}>R$ 1.450,20</Text>
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
            <Text style={styles.summaryValue}>R$ 420,00</Text>
          </View>
          <View style={[styles.summaryItem, { borderLeftWidth: 1, borderColor: '#EEE' }]}>
            <Text style={styles.summaryLabel}>Ganhos no Mês</Text>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>R$ 4.280,00</Text>
          </View>
        </View>

        {/* Gráfico de Ganhos Semanal (Simulação Visual) */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Desempenho (Últimos 7 dias)</Text>
          <View style={styles.chartBarContainer}>
            {[40, 70, 45, 90, 65, 30, 85].map((height, i) => (
              <View key={i} style={styles.chartBarWrapper}>
                <View style={[styles.chartBar, { height: height }]} />
                <Text style={styles.chartDay}>{['S', 'T', 'Q', 'Q', 'S', 'S', 'D'][i]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Lista de Extrato */}
        <View style={styles.extractSection}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Últimas Transações</Text>
            <TouchableOpacity><Text style={{color: colors.primary}}>Ver tudo</Text></TouchableOpacity>
          </View>

          {transactions.map(item => (
            <View key={item.id} style={styles.transactionItem}>
              <View style={styles.transIcon}>
                <Ionicons 
                  name={item.status === 'Concluído' ? "checkmark-circle" : "time"} 
                  size={24} 
                  color={item.status === 'Concluído' ? "#4CAF50" : "#FF9500"} 
                />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.transService}>{item.service}</Text>
                <Text style={styles.transDate}>{item.date} • Bruto: {item.gross}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.transNet}>+{item.net}</Text>
                <Text style={[styles.transStatus, { color: item.status === 'Concluído' ? "#4CAF50" : "#FF9500" }]}>
                  {item.status}
                </Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  balanceCard: { backgroundColor: colors.dark1, margin: 20, padding: 25, borderRadius: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 5 },
  balanceLabel: { color: '#AAA', fontSize: 14 },
  balanceValue: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginTop: 5 },
  withdrawBtn: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  withdrawText: { color: '#FFF', fontWeight: 'bold' },
  summaryRow: { flexDirection: 'row', backgroundColor: '#FFF', marginHorizontal: 20, padding: 20, borderRadius: 20, elevation: 2 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { color: '#999', fontSize: 12, marginBottom: 5 },
  summaryValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  chartSection: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 20 },
  chartBarContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120, backgroundColor: '#FFF', padding: 15, borderRadius: 20 },
  chartBarWrapper: { alignItems: 'center' },
  chartBar: { width: 12, backgroundColor: colors.primary, borderRadius: 6 },
  chartDay: { fontSize: 10, color: '#999', marginTop: 8 },
  extractSection: { padding: 20, backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  transactionItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  transIcon: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#F8F9FF', justifyContent: 'center', alignItems: 'center' },
  transService: { fontWeight: 'bold', fontSize: 14 },
  transDate: { fontSize: 12, color: '#999', marginTop: 2 },
  transNet: { fontWeight: 'bold', fontSize: 14, color: '#333' },
  transStatus: { fontSize: 10, fontWeight: 'bold', marginTop: 2 }
});