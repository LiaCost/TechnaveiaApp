import React from 'react';
import { 
  ScrollView, View, Text, StyleSheet, TextInput, 
  FlatList, TouchableOpacity, SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, theme } from '../../theme';
import { HomeHeader } from '../../components/HomeHeader';

const CATEGORIES = [
  { id: '1', title: 'PCs', icon: 'desktop-outline' },
  { id: '2', title: 'Celulares', icon: 'smartphone-outline' },
  { id: '3', title: 'Redes', icon: 'wifi-outline' },
  { id: '4', title: 'Automação', icon: 'home-outline' },
  { id: '5', title: 'Segurança', icon: 'videocam-outline' },
  { id: '6', title: 'Remoto', icon: 'laptop-outline' },
  { id: '7', title: 'TVs', icon: 'tv-outline' },
  { id: '8', title: 'Outros', icon: 'grid-outline' },
];

export function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HomeHeader name="Carlos" location="Av. Paulista, 1000 - SP" />

        {/* Barra de Busca */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput 
              placeholder="O que você precisa consertar?" 
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Categorias Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorias</Text>
          <View style={styles.grid}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity key={cat.id} style={styles.catItem}>
                <View style={styles.catIcon}>
                  <Ionicons name={cat.icon as any} size={28} color={colors.primary} />
                </View>
                <Text style={styles.catLabel}>{cat.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Botão Solicitação Rápida */}
        <TouchableOpacity style={styles.quickRequest}>
          <View>
            <Text style={styles.quickTitle}>Solicitar Serviço Agora</Text>
            <Text style={styles.quickSub}>Técnicos disponíveis em 30 min</Text>
          </View>
          <Ionicons name="flash" size={32} color="#FFF" />
        </TouchableOpacity>

        {/* Técnicos em Destaque (Horizontal) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Técnicos em Destaque</Text>
            <TouchableOpacity><Text style={{color: colors.primary}}>Ver todos</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{paddingLeft: 20}}>
             {/* Exemplo de Card */}
             {[1,2,3].map(i => (
               <View key={i} style={styles.techCard}>
                  <View style={styles.techPhoto} />
                  <Text style={styles.techName}>Ricardo Silva</Text>
                  <Text style={styles.techSpec}>Especialista em Redes</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>4.9 (120 avaliações)</Text>
                  </View>
               </View>
             ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.light },
  searchSection: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 25 },
  searchBar: { flex: 1, height: 50, backgroundColor: '#FFF', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  filterBtn: { width: 50, height: 50, backgroundColor: colors.primary, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  section: { marginBottom: 25 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', paddingHorizontal: 20, marginBottom: 15, color: colors.dark1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10 },
  catItem: { width: '25%', alignItems: 'center', marginBottom: 20 },
  catIcon: { width: 60, height: 60, backgroundColor: '#FFF', borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowOpacity: 0.1 },
  catLabel: { fontSize: 12, marginTop: 8, textAlign: 'center', fontWeight: '500' },
  quickRequest: { marginHorizontal: 20, backgroundColor: colors.dark1, padding: 20, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  quickTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  quickSub: { color: '#AAA', fontSize: 13 },
  techCard: { width: 200, backgroundColor: '#FFF', borderRadius: 20, padding: 15, marginRight: 15, elevation: 3 },
  techPhoto: { width: '100%', height: 100, backgroundColor: '#EEE', borderRadius: 15, marginBottom: 10 },
  techName: { fontWeight: 'bold', fontSize: 16 },
  techSpec: { color: '#666', fontSize: 12, marginVertical: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 12, color: colors.dark3 }
});