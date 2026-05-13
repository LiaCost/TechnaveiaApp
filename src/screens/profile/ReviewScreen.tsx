import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, 
  TouchableOpacity, TextInput, ScrollView, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
import { Button } from '../../components/Button';

export function ReviewScreen({ navigation }: any) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  
  // Critérios específicos
  const [criteria, setCriteria] = useState({
    pontualidade: 0,
    qualidade: 0,
    comunicacao: 0
  });

  const handleRating = (value: number) => setRating(value);

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert("Quase lá!", "Por favor, selecione pelo menos uma estrela para o técnico.");
      return;
    }
    // Lógica para salvar no banco
    Alert.alert("Obrigado!", "Sua avaliação ajuda a manter a excelência na TECHNAVEIA.");
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* Header de Avaliação */}
        <View style={styles.header}>
          <View style={styles.techAvatar} />
          <Text style={styles.title}>Como foi o serviço do Ricardo Silva?</Text>
          <Text style={styles.subtitle}>Sua avaliação é anônima e ajuda outros clientes.</Text>
        </View>

        {/* Estrelas Gigantes (Geral) */}
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => handleRating(star)}>
              <Ionicons 
                name={star <= rating ? "star" : "star-outline"} 
                size={45} 
                color={star <= rating ? "#FFD700" : "#CCC"} 
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Critérios Detalhados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avalie por categorias:</Text>
          
          <View style={styles.criteriaRow}>
            <Text style={styles.criteriaLabel}>Pontualidade</Text>
            <View style={styles.miniStars}>
              {[1, 2, 3, 4, 5].map(s => (
                <TouchableOpacity key={s} onPress={() => setCriteria({...criteria, pontualidade: s})}>
                  <Ionicons name="star" size={20} color={s <= criteria.pontualidade ? colors.primary : "#EEE"} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.criteriaRow}>
            <Text style={styles.criteriaLabel}>Qualidade</Text>
            <View style={styles.miniStars}>
              {[1, 2, 3, 4, 5].map(s => (
                <TouchableOpacity key={s} onPress={() => setCriteria({...criteria, qualidade: s})}>
                  <Ionicons name="star" size={20} color={s <= criteria.qualidade ? colors.primary : "#EEE"} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Campo de Comentário */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conte mais (opcional)</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Escreva aqui o que você achou do atendimento..."
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.recommendBox}>
           <Text style={styles.recommendText}>Você recomendaria este técnico?</Text>
           <View style={{ flexDirection: 'row', gap: 15 }}>
              <TouchableOpacity style={styles.optionBtn}><Text>Sim</Text></TouchableOpacity>
              <TouchableOpacity style={styles.optionBtn}><Text>Não</Text></TouchableOpacity>
           </View>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <Button title="Enviar Avaliação" onPress={handleSubmit} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  scroll: { padding: 25 },
  header: { alignItems: 'center', marginBottom: 30 },
  techAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EEE', marginBottom: 15 },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: colors.dark1 },
  subtitle: { fontSize: 14, color: '#666', marginTop: 8, textAlign: 'center' },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 40 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: colors.dark2 },
  criteriaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  criteriaLabel: { color: '#444', fontSize: 15 },
  miniStars: { flexDirection: 'row', gap: 4 },
  commentInput: { backgroundColor: '#F8F9FF', borderRadius: 15, padding: 15, height: 120, borderWidth: 1, borderColor: '#E8EEFF' },
  recommendBox: { alignItems: 'center', marginTop: 10 },
  recommendText: { fontWeight: '600', marginBottom: 15 },
  optionBtn: { paddingHorizontal: 30, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#DDD', backgroundColor: '#F5F5F5' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#EEE' }
});