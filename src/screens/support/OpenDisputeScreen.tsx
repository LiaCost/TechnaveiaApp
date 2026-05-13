import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

export function OpenDisputeScreen() {
  const [reason, setReason] = useState('');

  return (
    <ScrollView style={stylesDispute.container}>
      <View style={stylesDispute.alertBox}>
        <Ionicons name="information-circle" size={20} color="#856404" />
        <Text style={stylesDispute.alertText}>Nossa equipe analisará seu caso em até 5 dias úteis.</Text>
      </View>

      <View style={stylesDispute.inputGroup}>
        <Text style={stylesDispute.label}>Pedido relacionado</Text>
        <TouchableOpacity style={stylesDispute.selectBox}>
          <Text>#8829 - Troca de Placa Mãe</Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={stylesDispute.inputGroup}>
        <Text style={stylesDispute.label}>O que aconteceu?</Text>
        <TextInput 
          style={stylesDispute.textArea}
          placeholder="Descreva detalhadamente o problema..."
          multiline
        />
      </View>

      <View style={stylesDispute.inputGroup}>
        <Text style={stylesDispute.label}>Evidências (Fotos/Prints)</Text>
        <TouchableOpacity style={stylesDispute.uploadBtn}>
          <Ionicons name="cloud-upload-outline" size={24} color={colors.primary} />
          <Text style={stylesDispute.uploadText}>Anexar arquivos</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={stylesDispute.submitBtn}>
        <Text style={stylesDispute.submitBtnText}>Abrir Disputa Oficial</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const stylesDispute = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 20 },
  alertBox: { flexDirection: 'row', backgroundColor: '#FFF3CD', padding: 15, borderRadius: 12, gap: 10, marginBottom: 25 },
  alertText: { flex: 1, fontSize: 13, color: '#856404' },
  inputGroup: { marginBottom: 25 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  selectBox: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#F8F9FF', borderRadius: 12, borderWidth: 1, borderColor: '#E8EEFF' },
  textArea: { backgroundColor: '#F8F9FF', borderRadius: 12, padding: 15, height: 150, textAlignVertical: 'top', borderWidth: 1, borderColor: '#E8EEFF' },
  uploadBtn: { height: 100, borderStyle: 'dashed', borderWidth: 2, borderColor: colors.primary + '50', borderRadius: 15, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary + '05' },
  uploadText: { color: colors.primary, fontWeight: '600', marginTop: 8 },
  submitBtn: { backgroundColor: '#FF4B4B', padding: 18, borderRadius: 15, alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});