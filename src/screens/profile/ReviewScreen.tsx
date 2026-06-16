import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator,
  Platform, StatusBar, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
import { orderService, ApiError } from '../../services/api';

export function ReviewScreen({ navigation, route }: any) {
  const { orderId, techNome, techFoto } = route.params ?? {};

  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState('');
  const [recomenda, setRecomenda] = useState<boolean | null>(null);
  const [sending, setSending] = useState(false);

  const [criteria, setCriteria] = useState({
    pontualidade: 0,
    qualidade: 0,
    comunicacao: 0,
  });

  async function handleSubmit() {
    if (rating === 0) {
      Alert.alert('Quase lá!', 'Por favor, selecione pelo menos uma estrela.');
      return;
    }
    if (!orderId) {
      Alert.alert('Erro', 'Pedido não identificado.');
      return;
    }

    setSending(true);
    try {
      await orderService.review(orderId, {
        nota: rating,
        pontualidade: criteria.pontualidade || undefined,
        qualidade:    criteria.qualidade    || undefined,
        comunicacao:  criteria.comunicacao  || undefined,
        comentario:   comment.trim()        || undefined,
        recomenda:    recomenda ?? undefined,
      });
      Alert.alert(
        'Obrigado!',
        'Sua avaliação foi enviada e ajuda a manter a excelência na TECHNAVEIA.',
        [{ text: 'OK', onPress: () => navigation.navigate('ClientTabs') }]
      );
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Não foi possível enviar sua avaliação.';
      Alert.alert('Erro', msg);
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Avaliar Serviço</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header de Avaliação */}
        <View style={styles.topSection}>
          {techFoto ? (
            <Image source={{ uri: techFoto }} style={styles.techAvatarImg} />
          ) : (
            <View style={styles.techAvatar}>
              <Text style={styles.avatarInitials}>
                {techNome ? techNome.split(' ').map((n: string) => n[0]).slice(0, 2).join('') : '?'}
              </Text>
            </View>
          )}
          <Text style={styles.title}>
            Como foi o serviço{techNome ? ` de ${techNome}` : ''}?
          </Text>
          <Text style={styles.subtitle}>Sua avaliação é anônima e ajuda outros clientes.</Text>
        </View>

        {/* Estrelas Gerais */}
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map(star => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={46}
                color={star <= rating ? '#FFC107' : '#DDD'}
              />
            </TouchableOpacity>
          ))}
        </View>
        {rating > 0 && (
          <Text style={styles.ratingLabel}>
            {['', 'Péssimo', 'Ruim', 'Regular', 'Bom', 'Excelente'][rating]}
          </Text>
        )}

        {/* Critérios Detalhados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avalie por categoria</Text>

          {([
            ['pontualidade', 'Pontualidade'],
            ['qualidade',    'Qualidade do serviço'],
            ['comunicacao',  'Comunicação'],
          ] as const).map(([key, label]) => (
            <View key={key} style={styles.criteriaRow}>
              <Text style={styles.criteriaLabel}>{label}</Text>
              <View style={styles.miniStars}>
                {[1, 2, 3, 4, 5].map(s => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setCriteria(prev => ({ ...prev, [key]: s }))}
                  >
                    <Ionicons
                      name={s <= criteria[key] ? 'star' : 'star-outline'}
                      size={22}
                      color={s <= criteria[key] ? colors.primary : '#DDD'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Comentário */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comentário <Text style={styles.optional}>(opcional)</Text></Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Conte mais sobre o atendimento..."
            placeholderTextColor="#AAA"
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />
        </View>

        {/* Recomendação */}
        <View style={styles.recommendBox}>
          <Text style={styles.recommendText}>Você recomendaria este técnico?</Text>
          <View style={{ flexDirection: 'row', gap: 15 }}>
            <TouchableOpacity
              style={[styles.optionBtn, recomenda === true && styles.optionBtnActive]}
              onPress={() => setRecomenda(recomenda === true ? null : true)}
            >
              <Ionicons
                name="thumbs-up-outline"
                size={18}
                color={recomenda === true ? '#FFF' : '#555'}
              />
              <Text style={[styles.optionText, recomenda === true && { color: '#FFF' }]}>Sim</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionBtn, recomenda === false && styles.optionBtnNo]}
              onPress={() => setRecomenda(recomenda === false ? null : false)}
            >
              <Ionicons
                name="thumbs-down-outline"
                size={18}
                color={recomenda === false ? '#FFF' : '#555'}
              />
              <Text style={[styles.optionText, recomenda === false && { color: '#FFF' }]}>Não</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, (sending || rating === 0) && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={sending || rating === 0}
        >
          {sending
            ? <ActivityIndicator color="#FFF" />
            : <Text style={styles.submitBtnText}>Enviar Avaliação</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 20,
    borderBottomWidth: 1, borderBottomColor: '#EEE',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scroll: { padding: 25, paddingBottom: 40 },
  topSection: { alignItems: 'center', marginBottom: 24 },
  techAvatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center', alignItems: 'center', marginBottom: 15,
  },
  techAvatarImg: {
    width: 80, height: 80, borderRadius: 40, marginBottom: 15,
  },
  avatarInitials: { fontSize: 24, fontWeight: '700', color: colors.primary },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: colors.dark1 },
  subtitle: { fontSize: 14, color: '#666', marginTop: 8, textAlign: 'center' },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  ratingLabel: { textAlign: 'center', fontSize: 15, fontWeight: '700', color: '#FFC107', marginBottom: 28 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 14, color: '#333' },
  optional: { fontWeight: '400', color: '#AAA', fontSize: 13 },
  criteriaRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  criteriaLabel: { color: '#444', fontSize: 15 },
  miniStars: { flexDirection: 'row', gap: 4 },
  commentInput: {
    backgroundColor: '#F8F9FF', borderRadius: 14, padding: 14,
    height: 110, borderWidth: 1, borderColor: '#E8EEFF', color: '#111',
  },
  recommendBox: { alignItems: 'center', marginTop: 4 },
  recommendText: { fontWeight: '600', marginBottom: 14, fontSize: 15, color: '#333' },
  optionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 28, paddingVertical: 11,
    borderRadius: 20, borderWidth: 1, borderColor: '#DDD', backgroundColor: '#F5F5F5',
  },
  optionBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionBtnNo: { backgroundColor: '#F44336', borderColor: '#F44336' },
  optionText: { fontSize: 14, fontWeight: '600', color: '#555' },
  footer: { padding: 20, paddingBottom: Platform.OS === 'android' ? 34 : 20, borderTopWidth: 1, borderTopColor: '#EEE' },
  submitBtn: {
    backgroundColor: colors.dark1, borderRadius: 14, height: 54,
    justifyContent: 'center', alignItems: 'center',
  },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
