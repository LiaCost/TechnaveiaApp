import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, ActivityIndicator, RefreshControl,
  Platform, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/v1';

interface MyReview {
  id: string;
  nota: number;
  comentario?: string;
  recomenda?: boolean;
  createdAt: string;
  pedido?: { categoria: string; subcategoria: string };
  tecnico?: { usuario?: { nome: string } };
}

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 3600000;
  if (diff < 24) return 'Hoje';
  if (diff < 48) return 'Ontem';
  if (diff < 168) return `${Math.floor(diff / 24)} dias atrás`;
  return new Date(iso).toLocaleDateString('pt-BR');
}

export function MyReviewsScreen({ navigation }: any) {
  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load(silent = false) {
    if (!silent) setLoading(true);
    try {
      const token = await AsyncStorage.getItem('@technaveia:token');
      const res = await fetch(`${BASE_URL}/users/me/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setReviews(json.data ?? json ?? []);
      } else {
        setReviews([]);
      }
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Minhas Avaliações</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={item => item.id}
          contentContainerStyle={reviews.length === 0 ? { flex: 1 } : { padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={s.center}>
              <Ionicons name="star-outline" size={48} color="#DDD" />
              <Text style={s.emptyText}>Você ainda não avaliou nenhum serviço</Text>
              <Text style={s.emptySub}>Após concluir um serviço, avalie o técnico aqui</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <View>
                  <Text style={s.techName}>{item.tecnico?.usuario?.nome ?? 'Técnico'}</Text>
                  <Text style={s.service}>
                    {item.pedido?.categoria ?? ''}{item.pedido?.subcategoria ? ` · ${item.pedido.subcategoria}` : ''}
                  </Text>
                </View>
                <Text style={s.date}>{timeAgo(item.createdAt)}</Text>
              </View>

              <View style={s.starsRow}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Ionicons
                    key={star}
                    name={star <= item.nota ? 'star' : 'star-outline'}
                    size={18}
                    color={star <= item.nota ? '#FFC107' : '#DDD'}
                  />
                ))}
              </View>

              {item.comentario && (
                <Text style={s.comment}>{item.comentario}</Text>
              )}

              {item.recomenda !== undefined && (
                <View style={s.recommendRow}>
                  <Ionicons
                    name={item.recomenda ? 'thumbs-up' : 'thumbs-down'}
                    size={14}
                    color={item.recomenda ? '#4CAF50' : '#F44336'}
                  />
                  <Text style={[s.recommendText, { color: item.recomenda ? '#4CAF50' : '#F44336' }]}>
                    {item.recomenda ? 'Recomendou' : 'Não recomendou'}
                  </Text>
                </View>
              )}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FF', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE',
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyText: { color: '#AAA', marginTop: 12, fontSize: 16, fontWeight: '600' },
  emptySub: { color: '#CCC', marginTop: 6, textAlign: 'center' },
  card: {
    backgroundColor: '#FFF', borderRadius: 18, padding: 18, marginBottom: 12,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  techName: { fontSize: 16, fontWeight: '700', color: '#222' },
  service: { fontSize: 12, color: colors.primary, fontWeight: '600', marginTop: 2 },
  date: { fontSize: 12, color: '#AAA' },
  starsRow: { flexDirection: 'row', gap: 2, marginBottom: 8 },
  comment: { fontSize: 14, color: '#444', lineHeight: 20 },
  recommendRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F5F5F5',
  },
  recommendText: { fontSize: 12, fontWeight: '600' },
});
