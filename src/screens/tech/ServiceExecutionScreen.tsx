import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, ScrollView, 
  TouchableOpacity, Image, TextInput, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

export function ServiceExecutionScreen({ navigation }: any) {
  // Estados da execução: 'waiting' | 'driving' | 'at_location' | 'working' | 'finished'
  const [executionStatus, setExecutionStatus] = useState<'waiting' | 'driving' | 'at_location' | 'working'>('waiting');
  
  // Checklist de atividades
  const [checklist, setChecklist] = useState([
    { id: 1, task: 'Limpeza interna dos componentes', completed: false },
    { id: 2, task: 'Substituição da pasta térmica', completed: false },
    { id: 3, task: 'Teste de estresse e temperatura', completed: false },
  ]);

  const toggleTask = (id: number) => {
    setChecklist(checklist.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleNextStep = () => {
    if (executionStatus === 'waiting') setExecutionStatus('driving');
    else if (executionStatus === 'driving') setExecutionStatus('at_location');
    else if (executionStatus === 'at_location') setExecutionStatus('working');
    else if (executionStatus === 'working') {
      Alert.alert("Finalizar?", "Deseja concluir o serviço e enviar o relatório?", [
        { text: "Ainda não" },
        { text: "Sim, Finalizar", onPress: () => navigation.navigate('ServiceSummary') }
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Banner de Status Dinâmico */}
        <View style={[styles.statusBanner, { backgroundColor: executionStatus === 'working' ? '#4CAF50' : colors.primary }]}>
          <Ionicons name="construct" size={24} color="#FFF" />
          <Text style={styles.statusText}>
            {executionStatus === 'waiting' && "Pronto para iniciar?"}
            {executionStatus === 'driving' && "Em deslocamento para o cliente..."}
            {executionStatus === 'at_location' && "Você chegou ao local!"}
            {executionStatus === 'working' && "Serviço em andamento..."}
          </Text>
        </View>

        {/* Info do Cliente */}
        <View style={styles.clientSection}>
          <View style={styles.row}>
            <View style={styles.avatar} />
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.clientName}>João Pedro</Text>
              <Text style={styles.address}>Av. Paulista, 1000 - Ap 42</Text>
            </View>
            <TouchableOpacity style={styles.actionCircle}>
              <Ionicons name="call" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCircle}>
              <Ionicons name="map" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Checklist (Só aparece quando está 'working') */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Checklist de Atividades</Text>
          {checklist.map(item => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.checkItem} 
              onPress={() => toggleTask(item.id)}
            >
              <Ionicons 
                name={item.completed ? "checkbox" : "square-outline"} 
                size={24} 
                color={item.completed ? colors.primary : "#CCC"} 
              />
              <Text style={[styles.checkText, item.completed && styles.checkTextDone]}>
                {item.task}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fotos da Execução */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Evidências (Fotos)</Text>
            <TouchableOpacity><Text style={{color: colors.primary}}>Adicionar</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
            <View style={styles.photoPlaceholder}><Ionicons name="camera" size={30} color="#CCC" /></View>
            <View style={styles.photoPlaceholder}><Ionicons name="camera" size={30} color="#CCC" /></View>
          </ScrollView>
        </View>

        {/* Notas Internas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notas Técnicas (Privado)</Text>
          <TextInput 
            style={styles.notesInput} 
            placeholder="Anotações sobre o hardware, números de série, etc."
            multiline
          />
        </View>
      </ScrollView>

      {/* Botão de Ação Principal (Fixo no Rodapé) */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.mainBtn} onPress={handleNextStep}>
          <Text style={styles.mainBtnText}>
            {executionStatus === 'waiting' && "Iniciar Deslocamento"}
            {executionStatus === 'driving' && "Cheguei ao Local"}
            {executionStatus === 'at_location' && "Começar Serviço agora"}
            {executionStatus === 'working' && "Concluir Trabalho"}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  statusBanner: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 12 },
  statusText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  clientSection: { backgroundColor: '#FFF', padding: 20, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#EEE' },
  clientName: { fontWeight: 'bold', fontSize: 16 },
  address: { color: '#666', fontSize: 13, marginTop: 2 },
  actionCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F2F5', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  section: { backgroundColor: '#FFF', padding: 20, marginTop: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  checkItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 12 },
  checkText: { fontSize: 15, color: '#444' },
  checkTextDone: { textDecorationLine: 'line-through', color: '#AAA' },
  photoPlaceholder: { width: 100, height: 100, borderRadius: 12, backgroundColor: '#F0F2F5', justifyContent: 'center', alignItems: 'center', marginRight: 10, borderStyle: 'dashed', borderWidth: 1, borderColor: '#CCC' },
  notesInput: { backgroundColor: '#F8F9FF', padding: 15, borderRadius: 12, height: 100, textAlignVertical: 'top' },
  footer: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
  mainBtn: { backgroundColor: colors.dark1, padding: 18, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  mainBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});