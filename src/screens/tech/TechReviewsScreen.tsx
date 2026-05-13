import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

export function TechReviewsScreen() {
  const reviews = [
    { id: '1', user: 'Mariana Silva', stars: 5, date: 'Há 2 dias', comment: 'Ricardo foi super atencioso. Explicou todo o problema do meu cooler e resolveu em 40 minutos. Recomendo!', service: 'Limpeza Preventiva' },
    { id: '2', user: 'Carlos Andrade', stars: 4, date: 'Há 1 semana', comment: 'Serviço muito bom, preço justo. Só atrasou 10 minutinhos pra chegar.', service: 'Troca de Teclado' },
    { id: '3', user: 'Roberto F.', stars: 5, date: 'Há 2 semanas', comment: 'Profissional de alto nível. Salvou meus arquivos que eu achei que tinha perdido.', service: 'Recuperação de Dados' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header de Score */}
        <View style={styles.scoreSection}>
          <Text style={styles.bigScore}>4.9</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(s => (
              <Ionicons key={s} name="star" size={24} color="#FFC107" />
            ))}
          </View>
          <Text style={styles.totalReviews}>Baseado em 128 avaliações</Text>
          
          {/* Barra de Progresso por Estrela */}
          <View style={styles.progressContainer}>
            <View style={styles.progressRow}>
              <Text style={styles.starLabel}>5 ★</Text>
              <View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: '85%' }]} /></View>
            </View>
            <View style={styles.progressRow}>
              <Text style={styles.starLabel}>4 ★</Text>
              <View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: '10%' }]} /></View>
            </View>
          </View>
        </View>

        {/* Lista de Comentários */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>O que dizem sobre você</Text>
          
          {reviews.map(item => (
            <View key={item.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View>
                  <Text style={styles.userName}>{item.user}</Text>
                  <Text style={styles.serviceTag}>{item.service}</Text>
                </View>
                <Text style={styles.reviewDate}>{item.date}</Text>
              </View>
              
              <View style={styles.starsMiniRow}>
                {Array.from({ length: item.stars }).map((_, i) => (
                  <Ionicons key={i} name="star" size={14} color="#FFC107" />
                ))}
              </View>

              <Text style={styles.commentText}>{item.comment}</Text>
              
              {/* Opção de Resposta do Técnico */}
              <TouchableOpacity style={styles.replyBtn}>
                <Text style={styles.replyText}>Responder cliente</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  scoreSection: { backgroundColor: '#FFF', padding: 30, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 2 },
  bigScore: { fontSize: 48, fontWeight: 'bold', color: colors.dark1 },
  starsRow: { flexDirection: 'row', gap: 5, marginVertical: 10 },
  totalReviews: { color: '#999', fontSize: 14, marginBottom: 20 },
  progressContainer: { width: '100%', gap: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  starLabel: { fontSize: 12, color: '#666', width: 25 },
  progressBarBg: { flex: 1, height: 6, backgroundColor: '#F0F2F5', borderRadius: 3 },
  progressBarFill: { height: 6, backgroundColor: '#FFC107', borderRadius: 3 },
  listSection: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  reviewCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 15, elevation: 1 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  userName: { fontWeight: 'bold', fontSize: 16 },
  serviceTag: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  reviewDate: { fontSize: 12, color: '#AAA' },
  starsMiniRow: { flexDirection: 'row', marginVertical: 8 },
  commentText: { color: '#444', lineHeight: 20, fontSize: 14 },
  replyBtn: { marginTop: 15, alignSelf: 'flex-start' },
  replyText: { color: colors.primary, fontWeight: 'bold', fontSize: 13 }
});