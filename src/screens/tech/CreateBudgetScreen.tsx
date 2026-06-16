import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
import { ApiError } from '../../services/api';

interface BudgetItem {
  id: number;
  description: string;
  type: 'mao_de_obra' | 'peca' | 'deslocamento';
  value: string;
  quantidade: string;
}

const TIPOS: { key: BudgetItem['type']; label: string }[] = [
  { key: 'mao_de_obra', label: 'Mão de obra' },
  { key: 'peca',        label: 'Peça' },
  { key: 'deslocamento',label: 'Deslocamento' },
];

async function submitBudget(payload: {
  pedidoId: string;
  itens: { descricao: string; tipo: string; valor: number; quantidade: number }[];
  prazoExecucao: string;
  observacoes?: string;
}): Promise<void> {
  const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
  const token = await AsyncStorage.getItem('@technaveia:token');
  const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/v1';
  const res = await fetch(`${BASE_URL}/budgets`, {
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
}

export function CreateBudgetScreen({ navigation, route }: any) {
  const { pedidoId } = route.params ?? {};

  const [items, setItems] = useState<BudgetItem[]>([
    { id: Date.now(), description: '', type: 'mao_de_obra', value: '', quantidade: '1' },
  ]);
  const [prazo, setPrazo]           = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [total, setTotal]           = useState(0);
  const [sending, setSending]       = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const sum = items.reduce((acc, item) => {
      const val = parseFloat(item.value.replace(',', '.')) || 0;
      const qty = parseFloat(item.quantidade) || 1;
      return acc + val * qty;
    }, 0);
    setTotal(sum);
  }, [items]);

  function addItem() {
    setItems(prev => [
      ...prev,
      { id: Date.now(), description: '', type: 'mao_de_obra', value: '', quantidade: '1' },
    ]);
  }

  function updateItem(id: number, field: keyof BudgetItem, val: string) {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
  }

  function removeItem(id: number) {
    if (items.length > 1) setItems(prev => prev.filter(i => i.id !== id));
  }

  function cycleType(id: number) {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const idx = TIPOS.findIndex(t => t.key === item.type);
      return { ...item, type: TIPOS[(idx + 1) % TIPOS.length].key };
    }));
  }

  function validate(): boolean {
    for (const item of items) {
      if (!item.description.trim()) {
        Alert.alert('Item incompleto', 'Preencha a descrição de todos os itens.');
        return false;
      }
      if (!item.value || parseFloat(item.value.replace(',', '.')) <= 0) {
        Alert.alert('Valor inválido', `O item "${item.description}" precisa ter um valor maior que zero.`);
        return false;
      }
    }
    if (!prazo.trim()) {
      Alert.alert('Prazo obrigatório', 'Informe o prazo de execução.');
      return false;
    }
    return true;
  }

  async function handleSend() {
    if (!validate()) return;
    if (!pedidoId) {
      Alert.alert('Erro', 'Pedido não identificado. Volte e tente novamente.');
      return;
    }
    setSending(true);
    try {
      await submitBudget({
        pedidoId,
        itens: items.map(i => ({
          descricao: i.description,
          tipo: i.type,
          valor: parseFloat(i.value.replace(',', '.')) || 0,
          quantidade: parseFloat(i.quantidade) || 1,
        })),
        prazoExecucao: prazo,
        observacoes: observacoes.trim() || undefined,
      });
      Alert.alert('Orçamento enviado!', 'O cliente será notificado para avaliar sua proposta.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Não foi possível enviar o orçamento.';
      Alert.alert('Erro', msg);
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Orçamento</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Itens do Serviço</Text>

        {items.map((item, index) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemNumber}>Item #{index + 1}</Text>
              <TouchableOpacity onPress={() => removeItem(item.id)}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Descrição (ex: SSD 240GB Kingston)"
              placeholderTextColor="#AAA"
              value={item.description}
              onChangeText={t => updateItem(item.id, 'description', t)}
            />

            <View style={styles.row}>
              {/* Toque para alternar tipo */}
              <TouchableOpacity style={styles.typeSelector} onPress={() => cycleType(item.id)}>
                <Ionicons name="construct-outline" size={16} color="#666" />
                <Text style={styles.typeText}>
                  {TIPOS.find(t => t.key === item.type)?.label ?? 'Tipo'}
                </Text>
                <Ionicons name="chevron-forward" size={14} color="#AAA" />
              </TouchableOpacity>

              <View style={styles.valueRow}>
                <View style={[styles.valueInputContainer, { flex: 1 }]}>
                  <Text style={styles.currencySymbol}>R$</Text>
                  <TextInput
                    style={styles.valueInput}
                    placeholder="0,00"
                    placeholderTextColor="#AAA"
                    keyboardType="numeric"
                    value={item.value}
                    onChangeText={t => updateItem(item.id, 'value', t)}
                  />
                </View>
                <View style={[styles.valueInputContainer, { width: 60 }]}>
                  <TextInput
                    style={[styles.valueInput, { textAlign: 'center' }]}
                    placeholder="Qtd"
                    placeholderTextColor="#AAA"
                    keyboardType="numeric"
                    value={item.quantidade}
                    onChangeText={t => updateItem(item.id, 'quantidade', t)}
                  />
                </View>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addBtn} onPress={addItem}>
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
          <Text style={styles.addBtnText}>Adicionar mais um item</Text>
        </TouchableOpacity>

        {/* Total */}
        <View style={styles.summaryCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total do Orçamento</Text>
            <Text style={styles.totalValue}>
              R$ {total.toFixed(2).replace('.', ',')}
            </Text>
          </View>
          <Text style={styles.taxNote}>*Incluso taxas da plataforma (15% da mão de obra)</Text>
        </View>

        {/* Prazo */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Prazo de execução <Text style={{ color: '#F44336' }}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 2 dias úteis"
            placeholderTextColor="#AAA"
            value={prazo}
            onChangeText={setPrazo}
          />
        </View>

        {/* Observações */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Observações / Diagnóstico <Text style={{ color: '#AAA', fontWeight: '400' }}>(opcional)</Text></Text>
          <TextInput
            style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
            placeholder="Descreva o diagnóstico ou detalhes relevantes para o cliente..."
            placeholderTextColor="#AAA"
            multiline
            value={observacoes}
            onChangeText={setObservacoes}
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.sendBtn, sending && { opacity: 0.6 }]}
          onPress={handleSend}
          disabled={sending}
        >
          {sending
            ? <ActivityIndicator color="#FFF" />
            : <Text style={styles.sendBtnText}>Enviar para o Cliente</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 20, backgroundColor: '#FFF',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scroll: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  itemCard: {
    backgroundColor: '#FFF', borderRadius: 15, padding: 15,
    marginBottom: 15, elevation: 2,
  },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  itemNumber: { color: colors.primary, fontWeight: 'bold', fontSize: 12 },
  input: {
    backgroundColor: '#F8F9FF', padding: 12, borderRadius: 10,
    borderWidth: 1, borderColor: '#E8EEFF', marginBottom: 10, color: '#111',
  },
  row: { flexDirection: 'row', gap: 10 },
  typeSelector: {
    flex: 1.5, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F0F2F5', padding: 12, borderRadius: 10, gap: 6,
  },
  typeText: { fontSize: 13, color: '#444', flex: 1 },
  valueRow: { flex: 1, flexDirection: 'row', gap: 8 },
  valueInputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FF',
    borderRadius: 10, borderWidth: 1, borderColor: '#E8EEFF', paddingHorizontal: 8,
  },
  currencySymbol: { color: '#666', fontWeight: 'bold', marginRight: 4 },
  valueInput: { flex: 1, paddingVertical: 12, fontWeight: 'bold', color: '#111' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', padding: 15, gap: 10,
  },
  addBtnText: { color: colors.primary, fontWeight: 'bold' },
  summaryCard: { backgroundColor: colors.dark1, padding: 20, borderRadius: 15, marginTop: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: '#AAA', fontSize: 14 },
  totalValue: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  taxNote: { color: '#888', fontSize: 10, marginTop: 10, textAlign: 'right' },
  inputGroup: { marginTop: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#444' },
  footer: { padding: 20, paddingBottom: 0, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
  sendBtn: {
    backgroundColor: colors.dark1, borderRadius: 14, height: 54,
    justifyContent: 'center', alignItems: 'center',
  },
  sendBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});