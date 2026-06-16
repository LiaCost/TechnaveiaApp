import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, FlatList, Modal, ScrollView,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
import { technicianService, Technician } from '../../services/api';
import Slider from '@react-native-community/slider';

export function SearchScreen({ navigation, route }: any) {
  const initialCategoria = route?.params?.categoria ?? '';

  const [searchText, setSearchText] = useState('');
  const [techs, setTechs] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterVisible, setFilterVisible] = useState(false);

  // Filtros
  const [distance, setDistance] = useState(50);
  const [minRating, setMinRating] = useState(0);
  const [modalidade, setModalidade] = useState<string>('');
  const [categoria, setCategoria] = useState(initialCategoria);

  useEffect(() => {
    loadTechs();
  }, []);

  async function loadTechs() {
    setLoading(true);
    try {
      const params: any = {};
      if (categoria) params.categoria = categoria;
      if (modalidade) params.modalidade = modalidade;
      if (minRating > 0) params.avaliacao = minRating;
      if (searchText.trim()) params.query = searchText.trim();
      const data = await technicianService.search(params);
      setTechs(data);
    } catch {
      setTechs([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    loadTechs();
  }

  function applyFilters() {
    setFilterVisible(false);
    loadTechs();
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FF" />

      {/* Header de Busca */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 8 }}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            placeholder="Buscar técnico ou serviço..."
            placeholderTextColor="#AAA"
            style={styles.input}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchText(''); loadTechs(); }}>
              <Ionicons name="close-circle" size={18} color="#CCC" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons name="options-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Resultados */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={techs}
          keyExtractor={item => item.id}
          contentContainerStyle={techs.length === 0 ? { flex: 1 } : { padding: 20, paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="search-outline" size={48} color="#DDD" />
              <Text style={styles.emptyText}>Nenhum técnico encontrado</Text>
              <Text style={styles.emptySub}>Tente buscar com outros termos ou remova filtros</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.techCard}
              onPress={() => {
                const parent = navigation.getParent();
                (parent ?? navigation).navigate('TechProfile', { techId: item.id });
              }}
            >
              <View style={styles.techAvatar}>
                <Text style={styles.techInitials}>
                  {item.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </Text>
                {item.verificado && (
                  <View style={styles.verifiedDot}>
                    <Ionicons name="checkmark" size={8} color="#FFF" />
                  </View>
                )}
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.techName} numberOfLines={1}>{item.nome}</Text>
                  {item.verificado && (
                    <View style={styles.verifiedTag}>
                      <Text style={styles.verifiedTagText}>Verificado</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.techSpec} numberOfLines={1}>
                  {item.especialidades.slice(0, 3).join(' · ')}
                </Text>
                <View style={styles.metaRow}>
                  <Ionicons name="star" size={13} color="#FFC107" />
                  <Text style={styles.metaText}>{item.avaliacao.toFixed(1)} ({item.totalAvaliacoes})</Text>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.metaText}>{item.modalidade}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Modal de Filtros */}
      <Modal
        animationType="slide"
        transparent
        visible={isFilterVisible}
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.filterLabel}>Distância Máxima: {distance}km</Text>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={1}
                maximumValue={50}
                step={1}
                value={distance}
                onValueChange={setDistance}
                minimumTrackTintColor={colors.primary}
              />

              <Text style={styles.filterLabel}>Avaliação Mínima</Text>
              <View style={styles.row}>
                {[0, 3, 4, 5].map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.chip, minRating === r && styles.chipActive]}
                    onPress={() => setMinRating(r)}
                  >
                    <Text style={[styles.chipText, minRating === r && { color: '#FFF' }]}>
                      {r === 0 ? 'Todos' : `${r}+ ★`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterLabel}>Modalidade</Text>
              <View style={styles.row}>
                {[{ key: '', label: 'Todos' }, { key: 'presencial', label: 'Presencial' }, { key: 'remoto', label: 'Remoto' }].map(m => (
                  <TouchableOpacity
                    key={m.key}
                    style={[styles.chip, modalidade === m.key && styles.chipActive]}
                    onPress={() => setModalidade(m.key)}
                  >
                    <Text style={[styles.chipText, modalidade === m.key && { color: '#FFF' }]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
                <Text style={styles.applyBtnText}>Aplicar Filtros</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => { setMinRating(0); setModalidade(''); setCategoria(''); setDistance(50); }}
              >
                <Text style={styles.clearBtnText}>Limpar filtros</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  header: {
    flexDirection: 'row', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16,
    gap: 8, alignItems: 'center', backgroundColor: '#FFF',
    borderBottomWidth: 1, borderBottomColor: '#EEE',
  },
  searchBar: {
    flex: 1, height: 46, backgroundColor: '#F0F2F5', borderRadius: 12,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,
  },
  input: { flex: 1, marginLeft: 8, fontSize: 15, color: '#222' },
  filterBtn: {
    width: 46, height: 46, backgroundColor: colors.primary,
    borderRadius: 12, justifyContent: 'center', alignItems: 'center',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#BBB', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#CCC', marginTop: 4, textAlign: 'center' },

  // Card do técnico
  techCard: {
    flexDirection: 'row', backgroundColor: '#FFF', padding: 16, borderRadius: 18,
    marginBottom: 12, alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
  },
  techAvatar: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center', alignItems: 'center', position: 'relative',
  },
  techInitials: { fontSize: 18, fontWeight: '700', color: colors.primary },
  verifiedDot: {
    position: 'absolute', bottom: -2, right: -2,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#FFF',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  techName: { fontSize: 15, fontWeight: '700', color: '#222' },
  verifiedTag: { backgroundColor: colors.primary + '15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  verifiedTagText: { fontSize: 9, color: colors.primary, fontWeight: '700' },
  techSpec: { color: '#666', fontSize: 12, marginVertical: 3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#888' },
  metaDot: { color: '#CCC' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25,
    padding: 24, maxHeight: '75%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  filterLabel: { fontSize: 14, fontWeight: '700', color: '#555', marginTop: 20, marginBottom: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#DDD', backgroundColor: '#FFF',
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: '#555' },
  applyBtn: {
    backgroundColor: colors.primary, padding: 16, borderRadius: 14,
    alignItems: 'center', marginTop: 28,
  },
  applyBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  clearBtn: { alignItems: 'center', marginTop: 14, padding: 10 },
  clearBtnText: { color: '#999', fontWeight: '600' },
});
