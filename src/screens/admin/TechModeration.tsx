import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';

export function TechModeration() {
  const technicians = [
    { id: '1', name: 'João Silva', docStatus: 'Pendente', specialty: 'Notebooks' },
    { id: '2', name: 'Marcos Paulo', docStatus: 'Em análise', specialty: 'Redes' },
    { id: '3', name: 'Ana Oliveira', docStatus: 'Pendente', specialty: 'Smartphones' },
  ];

  const handleAction = (name: string, type: 'approve' | 'reject') => {
    const msg = type === 'approve' ? `Técnico ${name} aprovado!` : `Técnico ${name} reprovado.`;
    Alert.alert("Moderação", msg);
  }

  return (
    <ScrollView style={stylesTechMod.container}>
      <Text style={stylesTechMod.title}>Fila de Aprovação ({technicians.length})</Text>
      {technicians.map(tech => (
        <View key={tech.id} style={stylesTechMod.techCard}>
          <View style={stylesTechMod.techInfo}>
            <Text style={stylesTechMod.techName}>{tech.name}</Text>
            <Text style={stylesTechMod.techSub}>{tech.specialty} • Status: {tech.docStatus}</Text>
          </View>
          <View style={stylesTechMod.actionRow}>
            <TouchableOpacity 
              style={stylesTechMod.btnReject}
              onPress={() => handleAction(tech.name, 'reject')}
            >
              <Text style={stylesTechMod.btnText}>Reprovar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={stylesTechMod.btnApprove}
              onPress={() => handleAction(tech.name, 'approve')}
            >
              <Text style={stylesTechMod.btnText}>Aprovar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const stylesTechMod = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8F9FF' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  techCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, marginBottom: 15, elevation: 2 },
  techInfo: { marginBottom: 15 },
  techName: { fontWeight: 'bold', fontSize: 16 },
  techSub: { color: '#666', fontSize: 13, marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: 10 },
  btnApprove: { flex: 1, backgroundColor: '#4CAF50', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnReject: { flex: 1, backgroundColor: '#F44336', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 }
});