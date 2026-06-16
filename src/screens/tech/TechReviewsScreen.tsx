import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme';
import { Review } from '../../services/api';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/v1';

async function fetchMyReviews(): Promise<{ reviews: Review[]; avaliacao: number; total: number }> {
  const token = await AsyncStorage.getItem('@technaveia:token');

  // Busca perfil do técnico para obter o tecnicoId
  const meRes = await fetch(`${BASE_URL}/technicians/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!meRes.ok) {
    // Fallback: tenta buscar todos os técnicos e identificar o meu
    return { reviews: [], avaliacao: 0, total: 0 };
  }

  const meJson = await meRes.json();
  const tecnico = meJson.data ?? meJson;
  const tecnicoId = tecnico.id;

  if (!tecnicoId) return { reviews: [], avaliacao: 0, total: 0 };

  // Busca reviews
  const revRes = await fetch(`${BASE_URL}/technicians/${tecnicoId}/reviews`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!revRes.ok) return { reviews: [], avaliacao: tecnico.avaliacao ?? 0, total: tecnico.totalAvaliacoes ?? 0 };

  const revJson = await revRes.json();
  const reviews = revJson.data ?? revJson ?? [];

  return {
    reviews,
    avaliacao: tecnico.avaliacao ?? 0,
    total: tecnico.totalAvaliacoes ?? reviews.length,
  };
}

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 3600000;
  if (diff < 24) return 'Hoje';
  if (diff < 48) return 'Ontem';
  if (diff < 168) return `${Math.floor(diff / 24)} dias`;
  if (diff < 720) return `${Math.floor(diff / 168)} sem`;
  return `${Math.floor(diff / 720)} meses`;
}

export function TechReviewsScreen({ navigation }: any) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avaliacao, setAvaliacao] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load(silent = false) {
    if (!silent) setLoading(true);
    try {
      const data = await fetchMyReviews();
      setReviews(data.reviews);
      setAvaliacao(data.avaliacao);
      setTotal(data.total);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minhas Avaliações</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={colors.primary} />
        }
      >
        {/* Score */}
        <View style={styles.scoreSection}>
          <Text style={styles.bigScore}>{avaliacao.toFixed(1)}</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(s => (
              <Ionicons
                key={s}
                name={s <= Math.round(avaliacao) ? 'star' : 'star-outline'}
                size={24}
                color="#FFC107"
              />
            ))}
          </View>
          <Text style={styles.totalReviews}>
            {total > 0 ? `Baseado em ${total} avaliação${total > 1 ? 'ões' : ''}` : 'Nenhuma avaliação ainda'}
          </Text>
        </View>

        {/* Lista */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>O que dizem sobre você</Text>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
          ) : reviews.length === 0 ? (
            <View style={{ alignItems: 'center', padding: 30 }}>
              <Ionicons name="star-outline" size={48} color="#DDD" />
              <Text style={{ color: '#AAA', marginTop: 12, textAlign: 'center' }}>
                Nenhuma avaliação recebida ainda.{'\n'}Conclua serviços para receber feedback dos clientes.
              </Text>
            </View>
          ) : (
            reviews.map(item => (
              <View key={item.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View>
                    <Text style={styles.userName}>{item.cliente?.nome ?? 'Cliente'}</Text>
                  </View>
                  <Text style={styles.reviewDate}>{timeAgo(item.createdAt)}</Text>
                </View>

                <View style={styles.starsMiniRow}>
                  {Array.from({ length: item.nota }).map((_, i) => (
                    <Ionicons key={i} name="star" size={14} color="#FFC107" />
                  ))}
                </View>

                {item.comentario && (
                  <Text style={styles.commentText}>{item.comentario}</Text>
                )}

                {item.recomenda !== undefined && (
                  <View style={styles.recommendTag}>
                    <Ionicons
                      name={item.recomenda ? 'thumbs-up' : 'thumbs-down'}
                      size={12}
                      color={item.recomenda ? '#4CAF50' : '#F44336'}
                    />
                    <Text style={[styles.recommendText, { color: item.recomenda ? '#4CAF50' : '#F44336' }]}>
                      {item.recomenda ? 'Recomendou' : 'Não recomendou'}
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, borderBottomColor: '#EEE',
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  scoreSection: {
    backgroundColor: '#FFF', padding: 30, alignItems: 'center',
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 2,
  },
  bigScore: { fontSize: 48, fontWeight: 'bold', color: '#1A1A1A' },
  starsRow: { flexDirection: 'row', gap: 5, marginVertical: 10 },
  totalReviews: { color: '#999', fontSize: 14 },
  listSection: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  reviewCard: {
    backgroundColor: '#FFF', padding: 20, borderRadius: 20,
    marginBottom: 15, elevation: 1,
  },
  reviewHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  userName: { fontWeight: 'bold', fontSize: 16 },
  reviewDate: { fontSize: 12, color: '#AAA' },
  starsMiniRow: { flexDirection: 'row', marginVertical: 8 },
  commentText: { color: '#444', lineHeight: 20, fontSize: 14 },
  recommendTag: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F5F5F5',
  },
  recommendText: { fontSize: 12, fontWeight: '600' },
});
