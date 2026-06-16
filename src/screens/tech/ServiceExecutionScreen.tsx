import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, 
  TouchableOpacity, TextInput, Alert, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme';
import { orderService, Order, ApiError } from '../../services/api';

type ExecStatus = 'waiting' | 'driving' | 'at_location' | 'working';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/v1';

async function patchOrderStatus(orderId: string, status: string) {
  const token = await AsyncStorage.getItem('@technaveia:token');
  const res = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(res.status, err.message ?? 'Erro ao atualizar status');
  }
}

export function ServiceExecutionScreen({ navigation, route }: any) {
  const orderId: string | undefined = route?.params?.orderId;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [executionStatus, setExecutionStatus] = useState<ExecStatus>('waiting');
  const [actionLoading, setActionLoading] = useState(false);

  const [checklist, setChecklist] = useState([
    { id: 1, task: 'Diagnóstico inicial', completed: false },
    { id: 2, task: 'Execução do serviço', completed: false },
    { id: 3, task: 'Testes e validação', completed: false },
  ]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!orderId) {
      Alert.alert('Erro', 'Pedido não identificado.');
      setLoading(false);
      return;
    }
    orderService.getById(orderId)
      .then(data => {
        setOrder(data);
        // Se já está em andamento, pula direto para working
        if (data.status === 'andamento') setExecutionStatus('working');
      })
      .catch(() => Alert.alert('Erro', 'Pedido não encontrado.'))
      .finally(() => setLoading(false));
  }, [orderId]);

  const toggleTask = (id: number) => {
    setChecklist(checklist.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleNextStep = async () => {
    if (executionStatus === 'waiting') {
      setExecutionStatus('driving');
    } else if (executionStatus === 'driving') {
      setExecutionStatus('at_location');
    } else if (executionStatus === 'at_location') {
      // Muda status no backend para "andamento"
      if (!orderId) { Alert.alert('Erro', 'Pedido não identificado.'); return; }
      setActionLoading(true);
      try {
        await patchOrderStatus(orderId, 'andamento');
        setExecutionStatus('working');
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : 'Erro ao iniciar serviço.';
        // Se já está em andamento, permite continuar
        if (msg.includes('não permitida') || msg.includes('Ação')) {
          setExecutionStatus('working');
        } else {
          Alert.alert('Erro', msg);
        }
      } finally {
        setActionLoading(false);
      }
    } else if (executionStatus === 'working') {
      Alert.alert('Finalizar?', 'Deseja concluir o serviço e enviar o relatório?', [
        { text: 'Ainda não' },
        { text: 'Sim, Finalizar', onPress: () => navigation.navigate('ServiceSummary', { orderId }) },
      ]);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const bannerColor = executionStatus === 'working' ? '#4CAF50' : colors.primary;
  const clientName = order?.cliente?.nome ?? 'Cliente';
  const address = order?.endereco ?? (order?.modalidade === 'remoto' ? 'Atendimento Remoto' : 'Endereço não informado');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bannerColor }]}>
      <StatusBar barStyle="light-content" backgroundColor={bannerColor} />
      <View style={styles.container}>
        <ScrollView>
          {/* Banner de Status Dinâmico */}
          <View style={[styles.statusBanner, { backgroundColor: bannerColor }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 8 }}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Ionicons name="construct" size={24} color="#FFF" />
            <Text style={styles.statusText}>
              {executionStatus === 'waiting' && 'Pronto para iniciar?'}
              {executionStatus === 'driving' && 'Em deslocamento para o cliente...'}
              {executionStatus === 'at_location' && 'Você chegou ao local!'}
              {executionStatus === 'working' && 'Serviço em andamento...'}
            </Text>
          </View>

          <View style={styles.content}>
            {/* Info do Pedido */}
            <View style={styles.clientSection}>
              <Text style={styles.orderNumber}>{order?.numero ?? ''}</Text>
              <Text style={styles.orderService}>{order?.categoria} · {order?.subcategoria}</Text>
              <View style={styles.row}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {clientName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={styles.clientName}>{clientName}</Text>
                  <Text style={styles.address}>{address}</Text>
                </View>
                <TouchableOpacity
                  style={styles.actionCircle}
                  onPress={async () => {
                    if (!orderId) return;
                    try {
                      const token = await AsyncStorage.getItem('@technaveia:token');
                      const res = await fetch(`${BASE_URL}/conversations/by-order/${orderId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      const json = await res.json();
                      const conversaId = json.data?.conversaId ?? json.conversaId;
                      if (!conversaId) { Alert.alert('Chat não disponível'); return; }
                      navigation.navigate('Chat', {
                        conversaId,
                        outroNome: clientName,
                        pedidoId: orderId,
                      });
                    } catch {
                      Alert.alert('Erro', 'Não foi possível abrir o chat.');
                    }
                  }}
                >
                  <Ionicons name="chatbubble" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Checklist */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Checklist de Atividades</Text>
              {checklist.map(item => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.checkItem} 
                  onPress={() => toggleTask(item.id)}
                >
                  <Ionicons 
                    name={item.completed ? 'checkbox' : 'square-outline'} 
                    size={24} 
                    color={item.completed ? colors.primary : '#CCC'} 
                  />
                  <Text style={[styles.checkText, item.completed && styles.checkTextDone]}>
                    {item.task}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Notas Internas */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notas Técnicas (Privado)</Text>
              <TextInput 
                style={styles.notesInput} 
                placeholder="Anotações sobre o serviço, números de série, etc."
                placeholderTextColor="#AAA"
                multiline
                value={notes}
                onChangeText={setNotes}
              />
            </View>
          </View>
        </ScrollView>

        {/* Botão de Ação Principal */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.mainBtn, actionLoading && { opacity: 0.6 }]}
            onPress={handleNextStep}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.mainBtnText}>
                  {executionStatus === 'waiting' && 'Iniciar Deslocamento'}
                  {executionStatus === 'driving' && 'Cheguei ao Local'}
                  {executionStatus === 'at_location' && 'Começar Serviço agora'}
                  {executionStatus === 'working' && 'Concluir Trabalho'}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  statusBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 20,
  },
  statusText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, flex: 1 },
  content: { flex: 1, backgroundColor: '#F8F9FF' },
  clientSection: { backgroundColor: '#FFF', padding: 20, marginBottom: 10 },
  orderNumber: { fontSize: 12, color: colors.primary, fontWeight: '700', marginBottom: 4 },
  orderService: { fontSize: 18, fontWeight: '700', color: colors.dark1, marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: colors.primary },
  clientName: { fontWeight: 'bold', fontSize: 16 },
  address: { color: '#666', fontSize: 13, marginTop: 2 },
  actionCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary + '12', justifyContent: 'center', alignItems: 'center',
    marginLeft: 10,
  },
  section: { backgroundColor: '#FFF', padding: 20, marginTop: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  checkItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 12 },
  checkText: { fontSize: 15, color: '#444' },
  checkTextDone: { textDecorationLine: 'line-through', color: '#AAA' },
  notesInput: {
    backgroundColor: '#F8F9FF', padding: 15, borderRadius: 12,
    height: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: '#E0E4F0',
    fontSize: 14, color: '#222',
  },
  footer: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20,
    backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE',
  },
  mainBtn: {
    backgroundColor: colors.dark1, padding: 18, borderRadius: 15,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
  },
  mainBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
