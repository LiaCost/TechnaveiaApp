import React, { useState, useCallback } from 'react';
import {
  ScrollView, View, Text, StyleSheet, Pressable,
  TouchableOpacity, StatusBar, ActivityIndicator, Image, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme';
import { HomeHeader } from '../../components/HomeHeader';
import { technicianService, notificationService, Technician } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const CATEGORIES = [
  { id: 'pc',          title: 'PCs',         icon: 'desktop-outline' },
  { id: 'celular',     title: 'Celulares',    icon: 'phone-portrait-outline' },
  { id: 'redes',       title: 'Redes',        icon: 'wifi-outline' },
  { id: 'automacao',   title: 'Automação',    icon: 'home-outline' },
  { id: 'cftv',        title: 'Segurança',    icon: 'videocam-outline' },
  { id: 'remoto',      title: 'Remoto',       icon: 'laptop-outline' },
  { id: 'tv',          title: 'TVs',          icon: 'tv-outline' },
  { id: 'outros',      title: 'Outros',       icon: 'grid-outline' },
];

export function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [techs, setTechs]       = useState<Technician[]>([]);
  const [loadingTechs, setLoadingTechs] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(() => {
    setLoadingTechs(true);
    technicianService
      .search()
      .then(data => setTechs(data.slice(0, 6)))
      .catch(() => setTechs([]))
      .finally(() => setLoadingTechs(false));

    notificationService.list()
      .then(data => setUnreadCount(data.filter(n => !n.lida).length))
      .catch(() => {});
  }, []);

  useFocusEffect(loadData);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      technicianService.search().then(data => setTechs(data.slice(0, 6))).catch(() => {}),
      notificationService.list().then(data => setUnreadCount(data.filter(n => !n.lida).length)).catch(() => {}),
    ]).finally(() => setRefreshing(false));
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        <HomeHeader
          name={user?.nome?.split(' ')[0] ?? 'Olá'}
          location={user?.cidade ?? 'Sua localização'}
          foto={user?.foto}
          onNotificationPress={() => {
            const parent = navigation.getParent();
            (parent ?? navigation).navigate('Notifications');
          }}
          notificationCount={unreadCount}
        />

        {/* Barra de Busca */}
        <View style={[styles.searchSection, { backgroundColor: colors.light }]}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => navigation.navigate('Buscar')}
            activeOpacity={0.8}
          >
            <Ionicons name="search" size={20} color="#999" />
            <Text style={styles.searchPlaceholder}>O que você precisa consertar?</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => navigation.navigate('Buscar')}
          >
            <Ionicons name="options-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Categorias Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorias</Text>
          <View style={styles.grid}>
            {CATEGORIES.map(cat => (
              <Pressable
                key={cat.id}
                style={styles.catItem}
                onPress={() => navigation.navigate('Buscar', { categoria: cat.id })}
                android_ripple={null}
              >
                {({ pressed }) => (
                  <>
                    <View style={[
                      styles.catIcon,
                      pressed && styles.catIconPressed,
                    ]}>
                      <Ionicons name={cat.icon as any} size={28} color={colors.primary} />
                    </View>
                    <Text style={styles.catLabel}>{cat.title}</Text>
                  </>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Botão Solicitação Rápida */}
        <TouchableOpacity
          style={styles.quickRequest}
          onPress={() => navigation.navigate('RequestService')}
        >
          <View>
            <Text style={styles.quickTitle}>Solicitar serviço agora</Text>
            <Text style={styles.quickSub}>Técnicos disponíveis em 30 min</Text>
          </View>
          <Ionicons name="flash" size={32} color="#FFF" />
        </TouchableOpacity>

        {/* Técnicos em Destaque */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Técnicos em destaque</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Buscar')}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {loadingTechs ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 10 }} />
          ) : techs.length === 0 ? (
            <Text style={styles.emptyTechs}>Nenhum técnico disponível no momento.</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 20, paddingRight: 20, paddingBottom: 10 }}
            >
              {techs.map(tech => (
                <TouchableOpacity
                  key={tech.id}
                  style={styles.techCard}
                  onPress={() => navigation.navigate('TechProfile', { techId: tech.id })}
                >
                  <View style={styles.techPhoto}>
                    {tech.foto ? (
                      <Image source={{ uri: tech.foto }} style={{ width: '100%', height: 100, borderRadius: 12 }} />
                    ) : (
                      <Text style={styles.techInitials}>
                        {tech.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </Text>
                    )}
                    {tech.verificado && (
                      <View style={styles.verifiedBadge}>
                        <Ionicons name="checkmark" size={10} color="#FFF" />
                      </View>
                    )}
                  </View>
                  <Text style={styles.techName} numberOfLines={1}>{tech.nome}</Text>
                  <Text style={styles.techSpec} numberOfLines={1}>
                    {tech.especialidades.slice(0, 2).join(', ')}
                  </Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={13} color="#FFD700" />
                    <Text style={styles.ratingText}>
                      {tech.avaliacao} ({tech.totalAvaliacoes})
                    </Text>
                  </View>
                  {tech.precoMedio && (
                    <Text style={styles.techPrice}>{tech.precoMedio}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.light },
  scrollContent: { paddingBottom: 32 },
  searchSection: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 25 },
  searchBar: {
    flex: 1, height: 50, backgroundColor: '#FFF', borderRadius: 12,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15,
  },
  searchPlaceholder: { flex: 1, marginLeft: 10, fontSize: 15, color: '#AAA' },
  filterBtn: {
    width: 50, height: 50, backgroundColor: colors.primary,
    borderRadius: 12, justifyContent: 'center', alignItems: 'center',
  },
  section: { marginBottom: 25, overflow: 'visible' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', paddingHorizontal: 20, color: colors.dark1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, marginTop: 15 },
  catItem: { width: '25%', alignItems: 'center', marginBottom: 20 },
  catIcon: {
    width: 60, height: 60, backgroundColor: '#FFF', borderRadius: 15,
    justifyContent: 'center', alignItems: 'center', elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4,
  },
  catIconPressed: {
    backgroundColor: '#EBEBEB',
    elevation: 0,
  },
  catLabel: { fontSize: 12, marginTop: 8, textAlign: 'center', fontWeight: '500', color: '#444' },
  quickRequest: {
    marginHorizontal: 20, backgroundColor: colors.dark1, padding: 20,
    borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 25,
  },
  quickTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  quickSub: { color: '#AAA', fontSize: 13 },
  emptyTechs: { color: '#AAA', textAlign: 'center', paddingVertical: 20, paddingHorizontal: 20 },
  techCard: {
    width: 180, backgroundColor: '#FFF', borderRadius: 20, padding: 15,
    marginRight: 15, marginBottom: 10, elevation: 3,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8,
  },
  techPhoto: {
    width: '100%', height: 100, backgroundColor: colors.primary + '15',
    borderRadius: 12, marginBottom: 10,
    justifyContent: 'center', alignItems: 'center', position: 'relative',
  },
  techInitials: { fontSize: 28, fontWeight: '700', color: colors.primary },
  verifiedBadge: {
    position: 'absolute', bottom: 6, right: 6,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#FFF',
  },
  techName: { fontWeight: 'bold', fontSize: 15, color: '#222' },
  techSpec: { color: '#666', fontSize: 12, marginVertical: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 12, color: '#555' },
  techPrice: { fontSize: 12, color: colors.primary, fontWeight: '600', marginTop: 6 },
});
