import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

export function HelpCenterScreen() {
  const categories = [
    { id: 1, name: 'Conta', icon: 'person-circle-outline' },
    { id: 2, name: 'Pedidos', icon: 'construct-outline' },
    { id: 3, name: 'Pagamentos', icon: 'card-outline' },
    { id: 4, name: 'Segurança', icon: 'shield-checkmark-outline' },
  ];

  return (
    <SafeAreaView style={stylesHelp.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.dark1} />
      <ScrollView style={stylesHelp.container}>
        <View style={stylesHelp.searchHeader}>
          <Text style={stylesHelp.title}>Como podemos ajudar?</Text>
          <View style={stylesHelp.searchBar}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput placeholder="Busque por artigos..." style={stylesHelp.searchInput} />
          </View>
        </View>

        <View style={stylesHelp.section}>
          <Text style={stylesHelp.sectionTitle}>Categorias</Text>
          <View style={stylesHelp.categoryGrid}>
            {categories.map(cat => (
              <TouchableOpacity key={cat.id} style={stylesHelp.categoryCard}>
                <Ionicons name={cat.icon as any} size={28} color={colors.primary} />
                <Text style={stylesHelp.categoryText}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={stylesHelp.section}>
          <Text style={stylesHelp.sectionTitle}>Artigos Populares</Text>
          {['Como solicitar reembolso?', 'O técnico não chegou, e agora?', 'Taxas da plataforma'].map((text, i) => (
            <TouchableOpacity key={i} style={stylesHelp.articleRow}>
              <Text style={stylesHelp.articleText}>{text}</Text>
              <Ionicons name="chevron-forward" size={16} color="#CCC" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const stylesHelp = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.dark1 }, // escuro atrás da status bar
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  searchHeader: { padding: 30, backgroundColor: colors.dark1, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  title: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 15, paddingHorizontal: 15, height: 50 },
  searchInput: { flex: 1, marginLeft: 10 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  categoryGrid: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 },
  categoryCard: { width: '47%', backgroundColor: '#FFF', padding: 20, borderRadius: 20, alignItems: 'center', elevation: 2 },
  categoryText: { marginTop: 10, fontWeight: '600', color: '#444' },
  articleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 18, borderRadius: 15, marginBottom: 10 },
  articleText: { color: '#555', fontSize: 14 },
});