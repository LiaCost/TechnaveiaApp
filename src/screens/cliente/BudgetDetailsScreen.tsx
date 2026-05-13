import React from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, 
  ScrollView, TouchableOpacity, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

export function BudgetDetailsScreen({ navigation }: any) {
  
  const handleAccept = () => {
    Alert.alert(
      "Confirmar Orçamento",
      "Ao aceitar, você concorda com os valores e prazos. O pagamento será processado agora.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Aceitar e Pagar", onPress: () => navigation.navigate('Payment') }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Orçamento #8829</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Info do Técnico */}
        <View style={styles.techInfo}>
          <View style={styles.avatar} />
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={styles.techName}>Ricardo Silva</Text>
            <Text style={styles.techStatus}>Técnico Verificado</Text>
          </View>
          <TouchableOpacity style={styles.chatBtn}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Descrição do Diagnóstico */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diagnóstico do Técnico</Text>
          <Text style={styles.description}>
            Identifiquei que a fonte de alimentação está com os capacitores estufados, 
            o que impede o computador de ligar. Recomendo a substituição por uma fonte de 500W.
          </Text>
        </View>

        {/* Tabela de Itens */}
        <View style={styles.budgetTable}>
          <Text style={styles.sectionTitle}>Detalhamento</Text>
          
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Fonte 500W Real (Peça)</Text>
            <Text style={styles.itemValue}>R$ 220,00</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Mão de Obra / Instalação</Text>
            <Text style={styles.itemValue}>R$ 80,00</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Taxa de Serviço Technaveia</Text>
            <Text style={styles.itemValue}>R$ 15,00</Text>
          </View>

          <View style={[styles.itemRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>R$ 315,00</Text>
          </View>
        </View>

        {/* Prazo e Validade */}
        <View style={styles.infoBox}>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text style={styles.infoText}>Prazo: 1 dia útil</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.infoText}>Validade: 48 horas</Text>
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
          style={styles.acceptBtn}
          onPress={handleAccept}
        >
          <Text style={styles.acceptText}>Aceitar Orçamento</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scroll: { padding: 20 },
  techInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FF', padding: 15, borderRadius: 15, marginBottom: 25 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#DDD' },
  techName: { fontWeight: 'bold', fontSize: 16 },
  techStatus: { fontSize: 12, color: colors.primary },
  chatBtn: { padding: 10, backgroundColor: '#FFF', borderRadius: 12, elevation: 1 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  description: { color: '#666', lineHeight: 20 },
  budgetTable: { backgroundColor: '#FBFBFB', borderRadius: 15, padding: 15, borderStyle: 'dashed', borderWidth: 1, borderColor: '#DDD' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  itemLabel: { color: '#666' },
  itemValue: { fontWeight: '500' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 15, marginTop: 5 },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  infoBox: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { color: '#666', fontSize: 14 },
  footer: { padding: 20, flexDirection: 'row', gap: 15, borderTopWidth: 1, borderTopColor: '#EEE' },
  declineBtn: { flex: 1, padding: 18, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: colors.danger },
  declineText: { color: colors.danger, fontWeight: 'bold' },
  acceptBtn: { flex: 2, padding: 18, borderRadius: 15, alignItems: 'center', backgroundColor: colors.primary },
  acceptText: { color: '#FFF', fontWeight: 'bold' }
});