import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, 
  TouchableOpacity, FlatList, Modal, ScrollView,
  StatusBar // <-- 1. Importado o StatusBar nativo
} from 'react-native';
// 2. Trocamos o SafeAreaView do react-native pelo correto
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
import Slider from '@react-native-community/slider';

export function SearchScreen() {
  const [searchText, setSearchText] = useState('');
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [distance, setDistance] = useState(10);

  // Mock de dados para os técnicos
  const technicians = [
    { id: '1', name: 'Marcos Paulo', spec: 'Hardware & Redes', rating: 4.8, dist: '2.5km', verified: true },
    { id: '2', name: 'Ana Oliveira', spec: 'Desenvolvedora / TI', rating: 5.0, dist: '4.1km', verified: true },
  ];

  return (
    // 3. Adicionado o controle de 'edges' para o topo e laterais
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* 4. Força os ícones do sistema (hora, bateria) a ficarem visíveis no fundo claro */}
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Header de Busca */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput 
            placeholder="Buscar serviço ou técnico..." 
            style={styles.input}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterBtn} 
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons name="options-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Lista de Resultados */}
      <FlatList 
        data={technicians}
        keyExtractor={item => item.id}
        // Adicionado um paddingBottom na lista para garantir que o último card não cole embaixo
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.techCard}>
            <View style={styles.techImage} />
            <View style={{ flex: 1, marginLeft: 15 }}>
              <View style={styles.row}>
                <Text style={styles.techName}>{item.name}</Text>
                {item.verified && <Ionicons name="checkmark-circle" size={16} color={colors.primary} />}
              </View>
              <Text style={styles.techSpec}>{item.spec}</Text>
              <View style={styles.row}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{item.rating} • {item.dist}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
        )}
      />

      {/* PAINEL DE FILTROS (MODAL) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterVisible}
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros Avançados</Text>
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
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity key={star} style={styles.starBtn}>
                    <Ionicons name="star" size={24} color="#FFD700" />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterLabel}>Modalidade</Text>
              <View style={styles.row}>
                <TouchableOpacity style={styles.chip}><Text>Presencial</Text></TouchableOpacity>
                <TouchableOpacity style={styles.chip}><Text>Remoto</Text></TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.applyBtn} onPress={() => setFilterVisible(false)}>
                <Text style={styles.applyBtnText}>Aplicar Filtros</Text>
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
  // Ajustado o padding do header para combinar perfeitamente com o safe area do topo
  header: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20, gap: 10, alignItems: 'center' },
  searchBar: { flex: 1, height: 50, backgroundColor: '#FFF', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, elevation: 2 },
  input: { flex: 1, marginLeft: 10, fontSize: 16 },
  filterBtn: { width: 50, height: 50, backgroundColor: colors.primary, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  techCard: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 16, marginBottom: 15, alignItems: 'center', elevation: 2 },
  techImage: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#EEE' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  techName: { fontSize: 16, fontWeight: 'bold' },
  techSpec: { color: '#666', fontSize: 13, marginVertical: 4 },
  ratingText: { fontSize: 13, color: '#444' },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  filterLabel: { fontSize: 16, fontWeight: '600', marginTop: 20, marginBottom: 10 },
  starBtn: { marginRight: 10 },
  chip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#DDD', marginRight: 10 },
  applyBtn: { backgroundColor: colors.primary, padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 30 },
  applyBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});