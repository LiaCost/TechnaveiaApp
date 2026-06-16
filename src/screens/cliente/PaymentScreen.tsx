import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, ScrollView, TextInput,
  ActivityIndicator, Alert, Platform, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
import { Button } from '../../components/Button';
import { ApiError } from '../../services/api';

// ─── Serviço de pagamento (endpoint dedicado) ─────────────
async function processPayment(payload: {
  budgetId?: string;
  valor: number;
  metodo: 'cartao' | 'pix';
  dadosCartao?: {
    numero: string;
    nome: string;
    validade: string;
    cvv: string;
    parcelas: number;
  };
}): Promise<{ success: boolean; pedidoId?: string }> {
  const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
  const token = await AsyncStorage.getItem('@technaveia:token');
  const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/v1';

  const res = await fetch(`${BASE_URL}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(res.status, err.message ?? `Erro ${res.status}`);
  }
  return res.json();
}

// ─── Formatações ──────────────────────────────────────────
const fmtCard  = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})/g, '$1 ').trim();
const fmtExpiry = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};
const fmtCVV   = (v: string) => v.replace(/\D/g, '').slice(0, 4);
const fmtBRL   = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function PaymentScreen({ navigation, route }: any) {
  const { budgetId, valor = 0 } = route.params ?? {};

  const [method, setMethod]       = useState<'pix' | 'card'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName]   = useState('');
  const [expiry, setExpiry]       = useState('');
  const [cvv, setCvv]             = useState('');
  const [parcelas, setParcelas]   = useState(1);
  const [loading, setLoading]     = useState(false);

  function validate(): boolean {
    if (method === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) {
        Alert.alert('Cartão inválido', 'Digite os 16 dígitos do cartão.');
        return false;
      }
      if (!cardName.trim()) {
        Alert.alert('Nome obrigatório', 'Digite o nome impresso no cartão.');
        return false;
      }
      if (expiry.length < 5) {
        Alert.alert('Validade inválida', 'Digite a data de validade no formato MM/AA.');
        return false;
      }
      if (cvv.length < 3) {
        Alert.alert('CVV inválido', 'Digite o CVV do cartão.');
        return false;
      }
    }
    return true;
  }

  async function handleConfirm() {
    if (!validate()) return;
    setLoading(true);
    try {
      await processPayment({
        budgetId,
        valor,
        metodo: method === 'card' ? 'cartao' : 'pix',
        dadosCartao: method === 'card'
          ? {
              numero: cardNumber.replace(/\s/g, ''),
              nome: cardName,
              validade: expiry,
              cvv,
              parcelas,
            }
          : undefined,
      });
      navigation.navigate('OrderSuccess');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Falha ao processar pagamento. Tente novamente.';
      Alert.alert('Erro no pagamento', msg);
    } finally {
      setLoading(false);
    }
  }

  const parcelasOptions = [1, 2, 3, 6, 12];

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
          <Text style={styles.valueText}>{fmtBRL(valor)}</Text>
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
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Número do cartão</Text>
              <TextInput
                style={styles.input}
                placeholder="0000 0000 0000 0000"
                placeholderTextColor="#AAA"
                keyboardType="numeric"
                value={cardNumber}
                onChangeText={v => setCardNumber(fmtCard(v))}
                maxLength={19}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nome no cartão</Text>
              <TextInput
                style={styles.input}
                placeholder="Como aparece no cartão"
                placeholderTextColor="#AAA"
                value={cardName}
                onChangeText={setCardName}
                autoCapitalize="characters"
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 15 }}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Validade</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/AA"
                  placeholderTextColor="#AAA"
                  keyboardType="numeric"
                  value={expiry}
                  onChangeText={v => setExpiry(fmtExpiry(v))}
                  maxLength={5}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="000"
                  placeholderTextColor="#AAA"
                  keyboardType="numeric"
                  secureTextEntry
                  value={cvv}
                  onChangeText={v => setCvv(fmtCVV(v))}
                  maxLength={4}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Parcelamento</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {parcelasOptions.map(p => {
                    const valorParcela = valor / p;
                    return (
                      <TouchableOpacity
                        key={p}
                        style={[styles.parcelaChip, parcelas === p && styles.parcelaChipActive]}
                        onPress={() => setParcelas(p)}
                      >
                        <Text style={[styles.parcelaText, parcelas === p && styles.parcelaTextActive]}>
                          {p}x {fmtBRL(valorParcela)}
                        </Text>
                        {p === 1 && (
                          <Text style={[styles.parcelaSub, parcelas === p && { color: '#FFF' }]}>
                            Sem juros
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          </View>
        ) : (
          /* Área do PIX */
          <View style={styles.pixBox}>
            <View style={styles.pixIcon}>
              <Ionicons name="flash-outline" size={40} color={colors.primary} />
            </View>
            <Text style={styles.pixTitle}>Aprovação imediata</Text>
            <Text style={styles.pixSub}>
              O QR Code será gerado após a confirmação para você copiar e colar no seu banco.
            </Text>
          </View>
        )}

        <View style={styles.securityNote}>
          <Ionicons name="lock-closed" size={16} color="#4CAF50" />
          <Text style={styles.securityText}>Pagamento processado em ambiente seguro e criptografado.</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmBtn, loading && { opacity: 0.6 }]}
          onPress={handleConfirm}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#FFF" />
            : <Text style={styles.confirmText}>
                {method === 'card' ? 'Confirmar Pagamento' : 'Gerar QR Code PIX'}
              </Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scroll: { padding: 20 },
  valueCard: {
    backgroundColor: colors.dark1, padding: 25, borderRadius: 20,
    alignItems: 'center', marginBottom: 30,
  },
  valueLabel: { color: '#AAA', fontSize: 14 },
  valueText: { color: '#FFF', fontSize: 32, fontWeight: 'bold', marginTop: 5 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 20 },
  methodsRow: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  methodBtn: {
    flex: 1, height: 90, borderRadius: 15, borderWidth: 1,
    borderColor: '#EEE', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#FBFBFB',
  },
  methodActive: { borderColor: colors.primary, backgroundColor: colors.primary + '05' },
  methodText: { marginTop: 8, fontSize: 14, color: '#666', fontWeight: '500' },
  methodTextActive: { color: colors.primary, fontWeight: 'bold' },
  cardForm: { gap: 4 },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#555', marginBottom: 6 },
  input: {
    backgroundColor: '#F8F9FF', padding: 16, borderRadius: 12,
    borderWidth: 1, borderColor: '#E8EEFF', fontSize: 15, color: '#111',
  },
  parcelaChip: {
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12,
    backgroundColor: '#F8F9FF', borderWidth: 1, borderColor: '#E0E4F0',
    alignItems: 'center',
  },
  parcelaChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  parcelaText: { fontSize: 13, fontWeight: '700', color: '#333' },
  parcelaTextActive: { color: '#FFF' },
  parcelaSub: { fontSize: 10, color: '#4CAF50', marginTop: 2 },
  pixBox: {
    alignItems: 'center', padding: 30, backgroundColor: '#F8F9FF',
    borderRadius: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: colors.primary,
  },
  pixIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center', alignItems: 'center', marginBottom: 15,
  },
  pixTitle: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  pixSub: { textAlign: 'center', color: '#666', marginTop: 10, lineHeight: 20 },
  securityNote: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, marginTop: 30,
  },
  securityText: { fontSize: 12, color: '#4CAF50' },
  footer: { padding: 20, paddingBottom: Platform.OS === 'android' ? 34 : 20, borderTopWidth: 1, borderTopColor: '#EEE' },
  confirmBtn: {
    backgroundColor: colors.dark1, borderRadius: 14, height: 54,
    justifyContent: 'center', alignItems: 'center',
  },
  confirmText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
