import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, TouchableOpacity, Alert, StatusBar,
  ActivityIndicator, FlatList, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/v1';

interface Servico {
  id: string;
  nome: string;
  categoria: string;
  subcategoria?: string;
  descricao: string;
  modalidade: string;
  tipoPreco: string;
  valor?: number;
  tempoEstimado?: number;
  garantiaDias: number;
  ativo: boolean;
}

const CATEGORIAS = [
  'Computadores', 'Celulares', 'Redes', 'Automação',
  'Segurança', 'Remoto', 'Impressoras', 'TV', 'Outros',
];

export function AddServiceScreen({ navigation }: any) {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [modalidade, setModalidade] = useState<'presencial' | 'remoto' | 'ambos'>('presencial');
  const [tipoPreco, setTipoPreco] = useState<'fixo' | 'hora' | 'consulta'>('fixo');
  const [valor, setValor] = useState('');
  const [tempoEstimado, setTempoEstimado] = useState('');
  const [garantiaDias, setGarantiaDias] = useState('30');

  async function loadServicos(silent = false) {
    if (!silent) setLoading(true);
    try {
      const token = await AsyncStorage.getItem('@technaveia:token');
      // Busca o tecnicoId primeiro
      const meRes = await fetch(`${BASE_URL}/technicians/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!meRes.ok) { setServicos([]); return; }
      const meJson = await meRes.json();
      const tecnicoId = (meJson.data ?? meJson).id;

      // Busca perfil completo com serviços
      const res = await fetch(`${BASE_URL}/technicians/${tecnicoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.data ?? json;
        setServicos(data.servicos ?? []);
      }
    } catch {} finally { setLoading(false); setRefreshing(false); }
  }

  const [showEspecialidades, setShowEspecialidades] = useState(false);
  const [especialidades, setEspecialidades] = useState<string[]>([]);
  const [savingEsp, setSavingEsp] = useState(false);

  const TODAS_ESPECIALIDADES = [
    'pc', 'celular', 'redes', 'automacao', 'cftv', 'remoto', 'impressora', 'tv', 'ti', 'outros',
  ];
  const ESP_LABELS: Record<string, string> = {
    pc: 'Computadores', celular: 'Celulares', redes: 'Redes', automacao: 'Automação',
    cftv: 'Segurança (CFTV)', remoto: 'Suporte Remoto', impressora: 'Impressoras',
    tv: 'Smart TV', ti: 'TI Corporativo', outros: 'Outros',
  };

  async function loadEspecialidades() {
    try {
      const token = await AsyncStorage.getItem('@technaveia:token');
      const res = await fetch(`${BASE_URL}/technicians/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const json = await res.json();
        const data = json.data ?? json;
        setEspecialidades((data.especialidades ?? []).map((e: any) => typeof e === 'string' ? e : e.categoria));
      }
    } catch {}
  }

  async function saveEspecialidades() {
    setSavingEsp(true);
    try {
      const token = await AsyncStorage.getItem('@technaveia:token');
      await fetch(`${BASE_URL}/technicians/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ especialidades }),
      });
      Alert.alert('Salvo!', 'Suas especialidades foram atualizadas.');
      setShowEspecialidades(false);
    } catch { Alert.alert('Erro', 'Não foi possível salvar.'); }
    finally { setSavingEsp(false); }
  }

  useFocusEffect(useCallback(() => { loadServicos(); loadEspecialidades(); }, []));

  function resetForm() {
    setNome(''); setDescricao(''); setCategoria('');
    setModalidade('presencial'); setTipoPreco('fixo');
    setValor(''); setTempoEstimado(''); setGarantiaDias('30');
    setEditingId(null);
  }

  const [editingId, setEditingId] = useState<string | null>(null);

  function handleEdit(item: Servico) {
    setEditingId(item.id);
    setNome(item.nome);
    setDescricao(item.descricao);
    setCategoria(item.categoria);
    setModalidade(item.modalidade as any);
    setTipoPreco((item.tipoPreco as any) ?? 'fixo');
    setValor(item.valor ? String(item.valor).replace('.', ',') : '');
    setTempoEstimado(item.tempoEstimado ? String(item.tempoEstimado) : '');
    setGarantiaDias(String(item.garantiaDias ?? 30));
    setView('form');
  }

  function handleDelete(item: Servico) {
    Alert.alert('Remover serviço?', `Excluir "${item.nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('@technaveia:token');
            await fetch(`${BASE_URL}/technicians/me/services/${item.id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
            setServicos(prev => prev.filter(s => s.id !== item.id));
          } catch { Alert.alert('Erro', 'Não foi possível excluir.'); }
        },
      },
    ]);
  }

  async function handleSave() {
    if (!nome.trim()) { Alert.alert('Nome obrigatório'); return; }
    if (!categoria) { Alert.alert('Selecione uma categoria'); return; }
    if (!descricao.trim()) { Alert.alert('Descrição obrigatória'); return; }

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('@technaveia:token');
      // Busca tecnicoId
      const meRes = await fetch(`${BASE_URL}/technicians/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!meRes.ok) throw new Error('Perfil não encontrado');
      const meJson = await meRes.json();
      const tecnicoId = (meJson.data ?? meJson).id;

      const body = {
        tecnicoId,
        nome: nome.trim(),
        categoria,
        descricao: descricao.trim(),
        modalidade,
        tipoPreco,
        valor: valor ? parseFloat(valor.replace(',', '.')) : null,
        tempoEstimado: tempoEstimado ? parseInt(tempoEstimado) : null,
        garantiaDias: parseInt(garantiaDias) || 0,
      };

      const url = editingId
        ? `${BASE_URL}/technicians/me/services/${editingId}`
        : `${BASE_URL}/technicians/me/services`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? 'Erro ao salvar');
      }

      Alert.alert(editingId ? 'Serviço atualizado!' : 'Serviço publicado!', 'As alterações já estão no seu perfil.', [
        { text: 'OK', onPress: () => { resetForm(); setView('list'); loadServicos(true); } },
      ]);
    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Não foi possível salvar.');
    } finally { setSaving(false); }
  }

  // ── LISTA ──
  if (view === 'list') {
    return (
      <SafeAreaView style={st.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
        <View style={st.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={st.headerTitle}>Meus Serviços</Text>
          <TouchableOpacity onPress={() => setView('form')}>
            <Ionicons name="add-circle" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={st.center}><ActivityIndicator size="large" color={colors.primary} /></View>
        ) : servicos.length === 0 && !showEspecialidades ? (
          <View style={st.center}>
            <Ionicons name="construct-outline" size={48} color="#DDD" />
            <Text style={st.emptyText}>Nenhum serviço cadastrado</Text>
            <Text style={st.emptySub}>Adicione serviços para aparecer no seu perfil</Text>
            <TouchableOpacity style={st.emptyBtn} onPress={() => setView('form')}>
              <Ionicons name="add" size={18} color="#FFF" />
              <Text style={st.emptyBtnText}>Adicionar serviço</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={servicos}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 16 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadServicos(true); }} />}
            ListHeaderComponent={
              <View style={st.espSection}>
                <TouchableOpacity style={st.espHeader} onPress={() => setShowEspecialidades(!showEspecialidades)}>
                  <View>
                    <Text style={st.espTitle}>Minhas Especialidades</Text>
                    <Text style={st.espSub}>{especialidades.length} categorias selecionadas</Text>
                  </View>
                  <Ionicons name={showEspecialidades ? 'chevron-up' : 'chevron-down'} size={20} color={colors.primary} />
                </TouchableOpacity>
                {showEspecialidades && (
                  <View style={st.espBody}>
                    <View style={st.chipRow}>
                      {TODAS_ESPECIALIDADES.map(esp => {
                        const selected = especialidades.includes(esp);
                        return (
                          <TouchableOpacity
                            key={esp}
                            style={[st.chip, selected && st.chipActive]}
                            onPress={() => setEspecialidades(prev =>
                              selected ? prev.filter(e => e !== esp) : [...prev, esp]
                            )}
                          >
                            <Text style={[st.chipText, selected && st.chipTextActive]}>{ESP_LABELS[esp] ?? esp}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    <TouchableOpacity style={[st.saveEspBtn, savingEsp && { opacity: 0.6 }]} onPress={saveEspecialidades} disabled={savingEsp}>
                      {savingEsp ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={st.saveEspBtnText}>Salvar especialidades</Text>}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            }
            renderItem={({ item }) => (
              <View style={st.serviceCard}>
                <View style={st.serviceTop}>
                  <Text style={st.serviceName}>{item.nome}</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity onPress={() => handleEdit(item)}>
                      <Ionicons name="create-outline" size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item)}>
                      <Ionicons name="trash-outline" size={20} color="#C62828" />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={st.serviceCategoria}>{item.categoria}</Text>
                <Text style={st.serviceDesc} numberOfLines={2}>{item.descricao}</Text>
                <View style={st.serviceMeta}>
                  <Text style={st.servicePrice}>
                    {item.valor ? `R$ ${item.valor.toFixed(2).replace('.', ',')}` : 'A combinar'}
                  </Text>
                  <Text style={st.serviceModalidade}>{item.modalidade}</Text>
                </View>
              </View>
            )}
            ListFooterComponent={
              <TouchableOpacity style={st.addMoreBtn} onPress={() => setView('form')}>
                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                <Text style={st.addMoreText}>Adicionar novo serviço</Text>
              </TouchableOpacity>
            }
          />
        )}
      </SafeAreaView>
    );
  }

  // ── FORMULÁRIO ──
  return (
    <SafeAreaView style={st.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <View style={st.header}>
        <TouchableOpacity onPress={() => { resetForm(); setView('list'); }}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={st.headerTitle}>{editingId ? 'Editar Serviço' : 'Novo Serviço'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={st.scroll}>
        <Text style={st.label}>Nome do serviço *</Text>
        <TextInput style={st.input} placeholder="Ex: Formatação de Notebook + Backup" value={nome} onChangeText={setNome} placeholderTextColor="#AAA" />

        <Text style={st.label}>Categoria *</Text>
        <View style={st.chipRow}>
          {CATEGORIAS.map(cat => (
            <TouchableOpacity key={cat} style={[st.chip, categoria === cat && st.chipActive]} onPress={() => setCategoria(cat)}>
              <Text style={[st.chipText, categoria === cat && st.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={st.label}>Descrição *</Text>
        <TextInput style={[st.input, { height: 100, textAlignVertical: 'top' }]} placeholder="O que está incluso no serviço..." value={descricao} onChangeText={setDescricao} multiline placeholderTextColor="#AAA" />

        <Text style={st.label}>Modalidade</Text>
        <View style={st.chipRow}>
          {(['presencial', 'remoto', 'ambos'] as const).map(m => (
            <TouchableOpacity key={m} style={[st.chip, modalidade === m && st.chipActive]} onPress={() => setModalidade(m)}>
              <Text style={[st.chipText, modalidade === m && st.chipTextActive]}>{m.charAt(0).toUpperCase() + m.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={st.label}>Modelo de cobrança</Text>
        <View style={st.chipRow}>
          {[{ key: 'fixo', label: 'Preço Fixo' }, { key: 'hora', label: 'Por Hora' }, { key: 'consulta', label: 'Sob consulta' }].map(p => (
            <TouchableOpacity key={p.key} style={[st.chip, tipoPreco === p.key && st.chipActive]} onPress={() => setTipoPreco(p.key as any)}>
              <Text style={[st.chipText, tipoPreco === p.key && st.chipTextActive]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: 14 }}>
          <View style={{ flex: 1 }}>
            <Text style={st.label}>Valor (R$)</Text>
            <TextInput style={st.input} placeholder="0,00" value={valor} onChangeText={setValor} keyboardType="numeric" placeholderTextColor="#AAA" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={st.label}>Tempo est. (min)</Text>
            <TextInput style={st.input} placeholder="60" value={tempoEstimado} onChangeText={setTempoEstimado} keyboardType="numeric" placeholderTextColor="#AAA" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={st.label}>Garantia (dias)</Text>
            <TextInput style={st.input} placeholder="30" value={garantiaDias} onChangeText={setGarantiaDias} keyboardType="numeric" placeholderTextColor="#AAA" />
          </View>
        </View>
      </ScrollView>

      <View style={st.footer}>
        <TouchableOpacity style={[st.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#FFF" /> : <Text style={st.saveBtnText}>{editingId ? 'Salvar alterações' : 'Publicar Serviço'}</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#BBB', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#CCC', marginTop: 4 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, marginTop: 20 },
  emptyBtnText: { color: '#FFF', fontWeight: '700' },
  scroll: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#FFF', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E0E4F0', fontSize: 15, color: '#222' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5, borderColor: '#DDD', backgroundColor: '#FFF' },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, fontWeight: '600', color: '#666' },
  chipTextActive: { color: '#FFF' },
  footer: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
  saveBtn: { backgroundColor: colors.dark1, padding: 18, borderRadius: 14, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  // Lista
  serviceCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 1 },
  serviceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  serviceName: { fontSize: 16, fontWeight: '700', color: '#222', flex: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  serviceCategoria: { fontSize: 12, color: colors.primary, fontWeight: '600', marginBottom: 4 },
  serviceDesc: { fontSize: 13, color: '#666', lineHeight: 18, marginBottom: 10 },
  serviceMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  servicePrice: { fontSize: 15, fontWeight: '700', color: colors.dark1 },
  serviceModalidade: { fontSize: 12, color: '#888', textTransform: 'capitalize' },
  addMoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16 },
  addMoreText: { color: colors.primary, fontWeight: '600' },
  espSection: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 14, elevation: 1 },
  espHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  espTitle: { fontSize: 15, fontWeight: '700', color: '#222' },
  espSub: { fontSize: 12, color: '#888', marginTop: 2 },
  espBody: { marginTop: 14 },
  saveEspBtn: { backgroundColor: colors.primary, borderRadius: 12, height: 42, justifyContent: 'center', alignItems: 'center', marginTop: 14 },
  saveEspBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
