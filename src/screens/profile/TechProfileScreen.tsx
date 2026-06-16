import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, SafeAreaView, ActivityIndicator,
  Platform, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme';
import { technicianService, Review } from '../../services/api';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/v1';

interface TechFull {
  id: string;
  nome: string;
  foto?: string;
  email?: string;
  especialidades: string[];
  avaliacao: number;
  totalAvaliacoes: number;
  verificado: boolean;
  bio?: string;
  modalidade: string;
  raioAtendimento?: number;
}

export function TechProfileScreen({ navigation, route }: any) {
  const techId: string | undefined = route?.params?.techId;
  const [tech, setTech] = useState<TechFull | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!techId) { setLoading(false); return; }
    loadTech();
  }, [techId]);

  async function loadTech() {
    setLoading(true);
    try {
      // Busca perfil completo do técnico
      const token = await AsyncStorage.getItem('@technaveia:token');
      const res = await fetch(`${BASE_URL}/technicians/${techId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        const raw = json.data ?? json;
        setTech({
          id: raw.id,
          nome: raw.usuario?.nome ?? raw.nome ?? '',
          foto: raw.usuario?.foto ?? raw.foto ?? undefined,
          email: raw.usuario?.email ?? undefined,
          especialidades: (raw.especialidades ?? []).map((e: any) => typeof e === 'string' ? e : e.categoria),
          avaliacao: raw.avaliacao ?? 0,
          totalAvaliacoes: raw.totalAvaliacoes ?? 0,
          verificado: raw.verificado ?? false,
          bio: raw.bio ?? undefined,
          modalidade: raw.modalidade ?? 'presencial',
          raioAtendimento: raw.raioAtendimento,
        });
      }

      // Busca avaliações
      const revRes = await fetch(`${BASE_URL}/technicians/${techId}/reviews`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (revRes.ok) {
        const revJson = await revRes.json();
        setReviews((revJson.data ?? []).slice(0, 5));
      }
    } catch {} finally { setLoading(false); }
  }

  if (loading) {
    return (
      <SafeAreaView style={st.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!tech) {
    return (
      <SafeAreaView style={st.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 }}>
          <Ionicons name="person-outline" size={48} color="#DDD" />
          <Text style={{ color: '#AAA', marginTop: 12 }}>Técnico não encontrado</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={st.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={st.header}>
          <TouchableOpacity style={st.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={st.profileInfo}>
            <View style={st.avatarContainer}>
              {tech.foto ? (
                <Image source={{ uri: tech.foto }} style={st.avatar} />
              ) : (
                <View style={[st.avatar, { backgroundColor: colors.primary + '20', justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={{ fontSize: 32, fontWeight: '700', color: colors.primary }}>
                    {tech.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </Text>
                </View>
              )}
              {tech.verificado && (
                <View style={st.verifiedBadge}>
                  <Ionicons name="checkmark" size={12} color="#FFF" />
                </View>
              )}
            </View>
            <Text style={st.name}>{tech.nome}</Text>
            <View style={st.ratingRow}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={st.ratingText}>{tech.avaliacao.toFixed(1)} ({tech.totalAvaliacoes} avaliações)</Text>
            </View>
            <View style={st.tagsContainer}>
              {tech.especialidades.slice(0, 4).map(tag => (
                <View key={tag} style={st.tag}><Text style={st.tagText}>{tag}</Text></View>
              ))}
            </View>
          </View>
        </View>

        {/* Info cards */}
        <View style={st.infoRow}>
          <View style={st.infoCard}>
            <Ionicons name={tech.modalidade === 'remoto' ? 'laptop-outline' : 'person-outline'} size={20} color={colors.primary} />
            <Text style={st.infoLabel}>{tech.modalidade === 'ambos' ? 'Presencial e Remoto' : tech.modalidade === 'remoto' ? 'Remoto' : 'Presencial'}</Text>
          </View>
          {tech.raioAtendimento && tech.raioAtendimento > 0 && (
            <View style={st.infoCard}>
              <Ionicons name="navigate-outline" size={20} color={colors.primary} />
              <Text style={st.infoLabel}>Até {tech.raioAtendimento}km</Text>
            </View>
          )}
        </View>

        {/* Bio */}
        {tech.bio && (
          <View style={st.section}>
            <Text style={st.sectionTitle}>Sobre</Text>
            <Text style={st.bio}>{tech.bio}</Text>
          </View>
        )}

        {/* Avaliações */}
        <View style={st.section}>
          <Text style={st.sectionTitle}>Avaliações ({tech.totalAvaliacoes})</Text>
          {reviews.length === 0 ? (
            <Text style={{ color: '#AAA', paddingVertical: 10 }}>Nenhuma avaliação ainda.</Text>
          ) : (
            reviews.map(rev => (
              <View key={rev.id} style={st.reviewCard}>
                <View style={st.reviewHeader}>
                  <Text style={st.reviewUser}>{rev.cliente?.nome ?? 'Cliente'}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <Ionicons name="star" size={13} color="#FFD700" />
                    <Text style={{ fontSize: 13, fontWeight: '600' }}>{rev.nota}</Text>
                  </View>
                </View>
                {rev.comentario && <Text style={st.reviewComment}>{rev.comentario}</Text>}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Footer com ações */}
      <View style={st.footer}>
        <TouchableOpacity
          style={st.requestBtn}
          onPress={() => navigation.navigate('RequestService')}
        >
          <Text style={st.requestBtnText}>Solicitar Serviço</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { padding: 20, alignItems: 'center', backgroundColor: '#F8F9FF', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backBtn: { alignSelf: 'flex-start', padding: 10 },
  profileInfo: { alignItems: 'center' },
  avatarContainer: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  verifiedBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.primary, borderRadius: 12, padding: 4, borderWidth: 2, borderColor: '#FFF' },
  name: { fontSize: 22, fontWeight: 'bold', marginTop: 12, color: '#222' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 5 },
  ratingText: { color: '#666', fontSize: 14 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 14, gap: 8 },
  tag: { backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: colors.primary + '40' },
  tagText: { fontSize: 12, color: colors.primary, fontWeight: '700' },
  infoRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 20 },
  infoCard: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F8F9FF', padding: 14, borderRadius: 14 },
  infoLabel: { fontSize: 13, color: '#555', fontWeight: '600' },
  section: { padding: 20 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 12, color: '#222' },
  bio: { color: '#666', lineHeight: 22, fontSize: 14 },
  reviewCard: { backgroundColor: '#F8F9FF', padding: 14, borderRadius: 14, marginBottom: 10 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  reviewUser: { fontWeight: '700', fontSize: 14, color: '#333' },
  reviewComment: { color: '#666', fontSize: 13, lineHeight: 20 },
  footer: { backgroundColor: '#FFF', padding: 20, paddingBottom: Platform.OS === 'android' ? 34 : 20, flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: '#EEE' },
  chatBtn: { width: 54, height: 54, borderRadius: 14, borderWidth: 1.5, borderColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  requestBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: 14, height: 54, justifyContent: 'center', alignItems: 'center' },
  requestBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
