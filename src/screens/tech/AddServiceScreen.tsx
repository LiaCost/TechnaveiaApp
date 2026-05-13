import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, ScrollView, 
  TextInput, TouchableOpacity, Switch, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

export function AddServiceScreen({ navigation }: any) {
  const [modalidade, setModalidade] = useState<'presencial' | 'remoto' | 'ambos'>('presencial');
  const [tipoPreco, setTipoPreco] = useState<'fixo' | 'hora' | 'consulta'>('fixo');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Fixo */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Serviço</Text>
        <TouchableOpacity>
          <Text style={styles.draftText}>Rascunho</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* Informações Básicas */}
        <View style={styles.section}>
          <Text style={styles.label}>Nome do Serviço</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ex: Formatação de Notebook + Backup" 
          />

          <Text style={styles.label}>Descrição Detalhada</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder="O que está incluso? (ex: Limpeza física, instalação de drivers...)"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Modalidade de Atendimento */}
        <View style={styles.section}>
          <Text style={styles.label}>Onde você atende?</Text>
          <View style={styles.chipContainer}>
            {['presencial', 'remoto', 'ambos'].map((m) => (
              <TouchableOpacity 
                key={m}
                style={[styles.chip, modalidade === m && styles.chipActive]}
                onPress={() => setModalidade(m as any)}
              >
                <Text style={[styles.chipText, modalidade === m && styles.chipTextActive]}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Configuração de Preço */}
        <View style={styles.section}>
          <Text style={styles.label}>Modelo de Cobrança</Text>
          <View style={styles.priceTypeContainer}>
            <TouchableOpacity 
              style={[styles.priceBox, tipoPreco === 'fixo' && styles.priceBoxActive]}
              onPress={() => setTipoPreco('fixo')}
            >
              <Ionicons name="pricetag-outline" size={20} color={tipoPreco === 'fixo' ? colors.primary : '#666'} />
              <Text style={styles.priceBoxText}>Preço Fixo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.priceBox, tipoPreco === 'hora' && styles.priceBoxActive]}
              onPress={() => setTipoPreco('hora')}
            >
              <Ionicons name="time-outline" size={20} color={tipoPreco === 'hora' ? colors.primary : '#666'} />
              <Text style={styles.priceBoxText}>Por Hora</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.valueRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Valor (R$)</Text>
              <TextInput style={styles.input} placeholder="0,00" keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Tempo Est. (min)</Text>
              <TextInput style={styles.input} placeholder="60" keyboardType="numeric" />
            </View>
          </View>
        </View>

        {/* Portfólio / Fotos */}
        <View style={styles.section}>
          <Text style={styles.label}>Fotos de Referência (Opcional)</Text>
          <TouchableOpacity style={styles.uploadBox}>
            <Ionicons name="cloud-upload-outline" size={30} color={colors.primary} />
            <Text style={styles.uploadText}>Upload de imagens</Text>
          </TouchableOpacity>
        </View>

        {/* Garantia */}
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.label}>Oferece Garantia?</Text>
            <Text style={styles.subLabel}>Dá mais confiança ao cliente</Text>
          </View>
          <Switch value={true} trackColor={{ true: colors.primary }} />
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.saveBtn}
          onPress={() => Alert.alert("Sucesso", "Serviço publicado no seu perfil!")}
        >
          <Text style={styles.saveBtnText}>Publicar Serviço</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  draftText: { color: colors.primary, fontWeight: '600' },
  scroll: { padding: 20 },
  section: { marginBottom: 25 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  subLabel: { fontSize: 12, color: '#999', marginTop: -8, marginBottom: 10 },
  input: { backgroundColor: '#F8F9FF', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#E8EEFF' },
  textArea: { height: 100, textAlignVertical: 'top' },
  chipContainer: { flexDirection: 'row', gap: 10 },
  chip: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: '#DDD' },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: '#666', fontWeight: '600' },
  chipTextActive: { color: '#FFF' },
  priceTypeContainer: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  priceBox: { flex: 1, padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#DDD', alignItems: 'center', gap: 8 },
  priceBoxActive: { borderColor: colors.primary, backgroundColor: colors.primary + '05' },
  priceBoxText: { fontSize: 12, fontWeight: 'bold', color: '#444' },
  valueRow: { flexDirection: 'row', gap: 15 },
  uploadBox: { height: 120, borderRadius: 15, borderStyle: 'dashed', borderWidth: 2, borderColor: colors.primary + '40', justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary + '05' },
  uploadText: { color: colors.primary, fontWeight: '600', marginTop: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20, borderTopWidth: 1, borderColor: '#EEE' },
  footer: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EEE' },
  saveBtn: { backgroundColor: colors.dark1, padding: 18, borderRadius: 15, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});