import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView,
  ActivityIndicator, RefreshControl, Platform, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/v1';

interface PendingTech {
  id: string;
  usuario: { nome: string; email: string; telefone?: string; createdAt: string };
  especialidades: { categoria: string }[];
  modalidade: string;
  raioAtendimento: number;
  createdAt: string;
}

export function TechModeration({ navigation }: any) {
  const [technicians, setTechnicians] = useState<PendingTech[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  async function load(silent = false) {
    if (!silent) setLoading(true);
    try {
      const token = await AsyncStorage.getItem('@technaveia:token');
      const res = await fetch(`${BASE_URL}/admin/technicians/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setTechnicians(json.data ?? []);
      }
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  async function handleApprove(tech: PendingTech) {
    Alert.alert('Aprovar técnico?', `Aprovar ${tech.usuario.nome}? Ele poderá receber solicitações.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Aprovar',
        onPress: async () => {
          setActionId(tech.id);
          try {
            const token = await AsyncStorage.getItem('@technaveia:token');
            await fetch(`${BASE_URL}/admin/technicians/${tech.id}/approve`, {
              method: 'PATCH',
              headers: { Authorization: `Bearer ${token}` },
            });
            setTechnicians(prev => prev.filter(t => t.id !== tech.id));
            Alert.alert('Aprovado!', `${tech.usuario.nome} agora está ativo na plataforma.`);
          } catch {
            Alert.alert('Erro', 'Não foi possível aprovar.');
          } finally { setActionId(null); }
        },
      },
    ]);
  }

  async function handleReject(tech: PendingTech) {
    Alert.alert('Reprovar técnico?', `Reprovar ${tech.usuario.nome}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Reprovar', style: 'destructive',
        onPress: async () => {
          setActionId(tech.id);
          try {
            const token = await AsyncStorage.getItem('@technaveia:token');
            await fetch(`${BASE_URL}/admin/technicians/${tech.id}/reject`, {
              method: 'PATCH',
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ motivo: 'Documentação insuficiente' }),
            });
            setTechnicians(prev => prev.filter(t => t.id !== tech.id));
            Alert.alert('Reprovado', `${tech.usuario.nome} foi notificado.`);
          } catch {
            Alert.alert('Erro', 'Não foi possível reprovar.');
          } finally { setActionId(null); }
        },
      },
    ]);
  }

  return (
    <ScrollView
      style={st.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} />}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={st.headerTitle}>Moderação de Técnicos</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={st.content}>
        <Text style={st.title}>Fila de Aprovação ({technicians.length})</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 30 }} />
        ) : technicians.length === 0 ? (
          <View style={st.empty}>
            <Ionicons name="checkmark-done-circle-outline" size={48} color="#DDD" />
            <Text style={st.emptyText}>Nenhum técnico pendente</Text>
            <Text style={st.emptySub}>Todos os cadastros foram analisados</Text>
          </View>
        ) : (
          technicians.map(tech => (
            <View key={tech.id} style={st.techCard}>
              <View style={st.techHeader}>
                <View style={st.avatar}>
                  <Text style={st.avatarText}>
                    {tech.usuario.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={st.techName}>{tech.usuario.nome}</Text>
                  <Text style={st.techEmail}>{tech.usuario.email}</Text>
                </View>
              </View>

              {/* Info */}
              <View style={st.infoGrid}>
                <View style={st.infoItem}>
                  <Ionicons name="construct-outline" size={14} color="#888" />
                  <Text style={st.infoText}>
                    {tech.especialidades.map(e => e.categoria).join(', ') || 'Não informado'}
                  </Text>
                </View>
                <View style={st.infoItem}>
                  <Ionicons name="navigate-outline" size={14} color="#888" />
                  <Text style={st.infoText}>{tech.modalidade} · {tech.raioAtendimento}km</Text>
                </View>
                <View style={st.infoItem}>
                  <Ionicons name="calendar-outline" size={14} color="#888" />
                  <Text style={st.infoText}>
                    Cadastro: {new Date(tech.createdAt).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
              </View>

              {/* Ações */}
              <View style={st.actionRow}>
                <TouchableOpacity
                  style={st.btnReject}
                  onPress={() => handleReject(tech)}
                  disabled={actionId === tech.id}
                >
                  {actionId === tech.id
                    ? <ActivityIndicator color="#C62828" size="small" />
                    : <Text style={st.btnRejectText}>Reprovar</Text>
                  }
                </TouchableOpacity>
                <TouchableOpacity
                  style={st.btnApprove}
                  onPress={() => handleApprove(tech)}
                  disabled={actionId === tech.id}
                >
                  {actionId === tech.id
                    ? <ActivityIndicator color="#FFF" size="small" />
                    : <><Ionicons name="checkmark" size={16} color="#FFF" /><Text style={st.btnApproveText}>Aprovar</Text></>
                  }
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, backgroundColor: '#1a1a1a',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  content: { padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  empty: { alignItems: 'center', padding: 40, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#BBB' },
  emptySub: { fontSize: 13, color: '#CCC' },
  techCard: {
    backgroundColor: '#FFF', padding: 18, borderRadius: 18, marginBottom: 14,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
  },
  techHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: {
    width: 46, height: 46, borderRadius: 14, backgroundColor: '#E8EEFF',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '700', color: '#3F51B5' },
  techName: { fontWeight: 'bold', fontSize: 16, color: '#222' },
  techEmail: { color: '#888', fontSize: 12, marginTop: 2 },
  infoGrid: { gap: 6, marginBottom: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 13, color: '#666' },
  actionRow: { flexDirection: 'row', gap: 10 },
  btnReject: {
    flex: 1, padding: 12, borderRadius: 12, alignItems: 'center',
    backgroundColor: '#FFEBEE', borderWidth: 1, borderColor: '#FFCDD2',
  },
  btnRejectText: { color: '#C62828', fontWeight: '700', fontSize: 14 },
  btnApprove: {
    flex: 1.5, padding: 12, borderRadius: 12, alignItems: 'center',
    backgroundColor: '#4CAF50', flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  btnApproveText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
