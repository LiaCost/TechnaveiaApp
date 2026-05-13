import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from '../../theme';

export function AdminFinance() {
  return (
    <View style={stylesAdminFin.container}>
      <View style={stylesAdminFin.summaryBox}>
        <Text style={stylesAdminFin.summaryLabel}>Receita de Taxas (15%)</Text>
        <Text style={stylesAdminFin.summaryValue}>R$ 6.375,00</Text>
      </View>

      <TouchableOpacity 
        style={stylesAdminFin.reportLink}
        onPress={() => Alert.alert("Download", "Relatório CSV gerado com sucesso!")}
      >
        <Ionicons name="download-outline" size={20} color="#007AFF" />
        <Text style={stylesAdminFin.reportText}>Exportar Relatório Mensal (CSV)</Text>
      </TouchableOpacity>

      <View style={stylesAdminFin.configSection}>
        <Text style={stylesAdminFin.configTitle}>Configurações de Taxa</Text>
        <View style={stylesAdminFin.rowBetween}>
          <Text style={{ color: '#333' }}>Comissão TECHNAVEIA (%)</Text>
          <Text style={stylesAdminFin.taxValue}>15%</Text>
        </View>
        <Text style={stylesAdminFin.helperText}>* Esta taxa é aplicada sobre o valor da mão de obra.</Text>
      </View>
    </View>
  );
}

const stylesAdminFin = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFF' },
  summaryBox: { backgroundColor: '#1a1a1a', padding: 25, borderRadius: 20, alignItems: 'center' },
  summaryLabel: { color: '#AAA', fontSize: 13 },
  summaryValue: { color: '#FFF', fontSize: 32, fontWeight: 'bold', marginTop: 10 },
  reportLink: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 25, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  reportText: { color: '#007AFF', fontWeight: 'bold' },
  configSection: { marginTop: 30 },
  configTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 20 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#F8F9FF', borderRadius: 12 },
  taxValue: { fontWeight: 'bold', color: '#007AFF', fontSize: 18 },
  helperText: { fontSize: 11, color: '#999', marginTop: 10, fontStyle: 'italic' }
});