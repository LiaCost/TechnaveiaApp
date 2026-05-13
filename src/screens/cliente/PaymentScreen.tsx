import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, 
  TouchableOpacity, ScrollView, TextInput 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
import { Button } from '../../components/Button';

export function PaymentScreen({ navigation }: any) {
  const [method, setMethod] = useState<'pix' | 'card'>('card');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pagamento</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Resumo do Valor */}
        <View style={styles.valueCard}>
          <Text style={styles.valueLabel}>Total a pagar</Text>
          <Text style={styles.valueText}>R$ 315,00</Text>
        </View>

        <Text style={styles.sectionTitle}>Escolha como pagar</Text>

        {/* Opções de Método */}
        <View style={styles.methodsRow}>
          <TouchableOpacity 
            style={[styles.methodBtn, method === 'card' && styles.methodActive]}
            onPress={() => setMethod('card')}
          >
            <Ionicons name="card-outline" size={24} color={method === 'card' ? colors.primary : '#666'} />
            <Text style={[styles.methodText, method === 'card' && styles.methodTextActive]}>Cartão</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.methodBtn, method === 'pix' && styles.methodActive]}
            onPress={() => setMethod('pix')}
          >
            <Ionicons name="qr-code-outline" size={24} color={method === 'pix' ? colors.primary : '#666'} />
            <Text style={[styles.methodText, method === 'pix' && styles.methodTextActive]}>PIX</Text>
          </TouchableOpacity>
        </View>

        {/* Formulário de Cartão */}
        {method === 'card' ? (
          <View style={styles.cardForm}>
            <TextInput style={styles.input} placeholder="Número do Cartão" keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Nome impresso no cartão" />
            <View style={{ flexDirection: 'row', gap: 15 }}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="MM/AA" keyboardType="numeric" />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="CVV" keyboardType="numeric" secureTextEntry />
            </View>
            
            <View style={styles.installmentsBox}>
              <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Parcelamento</Text>
              <TouchableOpacity style={styles.installmentSelector}>
                <Text>1x de R$ 315,00 (Sem juros)</Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Área do PIX */
          <View style={styles.pixBox}>
            <View style={styles.pixIcon}>
              <Ionicons name="flash-outline" size={40} color={colors.primary} />
            </View>
            <Text style={styles.pixTitle}>Aprovação imediata</Text>
            <Text style={styles.pixSub}>O QR Code será gerado na próxima tela para você copiar e colar no seu banco.</Text>
          </View>
        )}

        <View style={styles.securityNote}>
          <Ionicons name="lock-closed" size={16} color="#4CAF50" />
          <Text style={styles.securityText}>Pagamento processado em ambiente seguro e criptografado.</Text>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title={method === 'card' ? "Confirmar Pagamento" : "Gerar QR Code PIX"} 
          onPress={() => navigation.navigate('OrderSuccess')} 
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scroll: { padding: 20 },
  valueCard: { backgroundColor: colors.dark1, padding: 25, borderRadius: 20, alignItems: 'center', marginBottom: 30 },
  valueLabel: { color: '#AAA', fontSize: 14 },
  valueText: { color: '#FFF', fontSize: 32, fontWeight: 'bold', marginTop: 5 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 20 },
  methodsRow: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  methodBtn: { flex: 1, height: 90, borderRadius: 15, borderWidth: 1, borderColor: '#EEE', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FBFBFB' },
  methodActive: { borderColor: colors.primary, backgroundColor: colors.primary + '05' },
  methodText: { marginTop: 8, fontSize: 14, color: '#666', fontWeight: '500' },
  methodTextActive: { color: colors.primary, fontWeight: 'bold' },
  cardForm: { gap: 15 },
  input: { backgroundColor: '#F8F9FF', padding: 18, borderRadius: 12, borderWidth: 1, borderColor: '#E8EEFF' },
  installmentsBox: { marginTop: 10 },
  installmentSelector: { flexDirection: 'row', justifyContent: 'space-between', padding: 18, backgroundColor: '#F8F9FF', borderRadius: 12, borderWidth: 1, borderColor: '#E8EEFF' },
  pixBox: { alignItems: 'center', padding: 30, backgroundColor: '#F8F9FF', borderRadius: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: colors.primary },
  pixIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  pixTitle: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  pixSub: { textAlign: 'center', color: '#666', marginTop: 10, lineHeight: 20 },
  securityNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 40 },
  securityText: { fontSize: 12, color: '#4CAF50' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#EEE' }
});