import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TextInput, 
  TouchableOpacity, SafeAreaView, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
import { Button } from '../../components/Button';

interface BudgetItem {
  id: number;
  description: string;
  type: 'Mão de obra' | 'Peça' | 'Deslocamento';
  value: string;
}

export function CreateBudgetScreen({ navigation }: any) {
  const [items, setItems] = useState<BudgetItem[]>([
    { id: Date.now(), description: '', type: 'Mão de obra', value: '' }
  ]);
  const [total, setTotal] = useState(0);

  // Calcula o total sempre que os itens mudarem
  useEffect(() => {
    const sum = items.reduce((acc, item) => {
      const val = parseFloat(item.value.replace(',', '.')) || 0;
      return acc + val;
    }, 0);
    setTotal(sum);
  }, [items]);

  const addItem = () => {
    setItems([...items, { id: Date.now(), description: '', type: 'Mão de obra', value: '' }]);
  };

  const updateItem = (id: number, field: keyof BudgetItem, val: string) => {
    const newItems = items.map(item => 
      item.id === id ? { ...item, [field]: val } : item
    );
    setItems(newItems);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
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
              value={item.description}
              onChangeText={(t) => updateItem(item.id, 'description', t)}
            />

            <View style={styles.row}>
              <View style={styles.typeSelector}>
                <Ionicons name="construct-outline" size={16} color="#666" />
                <Text style={styles.typeText}>{item.type}</Text>
              </View>
              
              <View style={styles.valueInputContainer}>
                <Text style={styles.currencySymbol}>R$</Text>
                <TextInput
                  style={styles.valueInput}
                  placeholder="0,00"
                  keyboardType="numeric"
                  value={item.value}
                  onChangeText={(t) => updateItem(item.id, 'value', t)}
                />
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addBtn} onPress={addItem}>
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
          <Text style={styles.addBtnText}>Adicionar mais um item</Text>
        </TouchableOpacity>

        <View style={styles.summaryCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total do Orçamento</Text>
            <Text style={styles.totalValue}>R$ {total.toFixed(2).replace('.', ',')}</Text>
          </View>
          <Text style={styles.taxNote}>*Incluso taxas da plataforma</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Prazo de Entrega (dias úteis)</Text>
          <TextInput style={styles.input} placeholder="Ex: 2" keyboardType="numeric" />
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Enviar para o Cliente" 
          onPress={() => Alert.alert("Sucesso", "Orçamento enviado para aprovação!")} 
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scroll: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  itemCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 2 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  itemNumber: { color: colors.primary, fontWeight: 'bold', fontSize: 12 },
  input: { backgroundColor: '#F8F9FF', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E8EEFF', marginBottom: 10 },
  row: { flexDirection: 'row', gap: 10 },
  typeSelector: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F2F5', padding: 12, borderRadius: 10, gap: 8 },
  typeText: { fontSize: 14, color: '#444' },
  valueInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FF', borderRadius: 10, borderWidth: 1, borderColor: '#E8EEFF', paddingHorizontal: 10 },
  currencySymbol: { color: '#666', fontWeight: 'bold', marginRight: 5 },
  valueInput: { flex: 1, paddingVertical: 12, fontWeight: 'bold' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, gap: 10 },
  addBtnText: { color: colors.primary, fontWeight: 'bold' },
  summaryCard: { backgroundColor: colors.dark1, padding: 20, borderRadius: 15, marginTop: 20 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: '#AAA', fontSize: 14 },
  totalValue: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  taxNote: { color: '#666', fontSize: 10, marginTop: 10, textAlign: 'right' },
  inputGroup: { marginTop: 25 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#444' },
  footer: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' }
});