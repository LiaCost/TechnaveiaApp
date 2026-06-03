import React from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Image, 
  TouchableOpacity, SafeAreaView, FlatList, 
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
import { Button } from '../../components/Button';
import { s } from './ClientProfileScreen';

export function TechProfileScreen({ navigation }: any) {
  // Mock de dados para o Portfólio
  const portfolio = [
    { id: '1', image: 'https://via.placeholder.com/150' },
    { id: '2', image: 'https://via.placeholder.com/150' },
    { id: '3', image: 'https://via.placeholder.com/150' },
  ];

  function handleLogout() {
      Alert.alert(
        'Sair da conta',
        'Tem certeza que deseja sair?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sair', style: 'destructive', onPress: () => navigation.navigate('Login') },
        ]
      );
    }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Header com Foto e Nome */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: 'https://via.placeholder.com/100' }} 
                style={styles.avatar} 
              />
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={12} color="#FFF" />
              </View>
            </View>
            <Text style={styles.name}>Ricardo Silva</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>4.9 (128 avaliações)</Text>
            </View>
            <View style={styles.tagsContainer}>
              {['Redes', 'Hardware', 'Windows'].map(tag => (
                <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
              ))}
            </View>
          </View>
        </View>

        {/* Sobre e Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          <Text style={styles.bio}>
            Técnico certificado com mais de 10 anos de experiência em infraestrutura de TI 
            e automação residencial. Especialista em resolver problemas complexos de rede.
          </Text>
        </View>

        {/* Seção Portfólio (Antes/Depois) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Portfólio</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {portfolio.map(item => (
              <Image key={item.id} source={{ uri: item.image }} style={styles.portfolioImg} />
            ))}
          </ScrollView>
        </View>

        {/* Serviços e Preços */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Serviços</Text>
          <View style={styles.serviceItem}>
            <Text style={styles.serviceName}>Formatação de PC</Text>
            <Text style={styles.servicePrice}>R$ 150,00</Text>
          </View>
          <View style={styles.serviceItem}>
            <Text style={styles.serviceName}>Configuração de Roteador</Text>
            <Text style={styles.servicePrice}>R$ 80,00</Text>
          </View>
        </View>

        {/* Avaliações */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <Text style={styles.sectionTitle}>Avaliações</Text>
          <View style={styles.reviewCard}>
            <View style={styles.row}>
              <Text style={styles.reviewUser}>João Pedro</Text>
              <View style={styles.row}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text> 5.0</Text>
              </View>
            </View>
            <Text style={styles.reviewComment}>Excelente profissional, resolveu o problema da minha internet rapidamente!</Text>
          </View>
        </View>

            <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#FF4B4B" />
        <Text style={s.logoutText}>Sair da Conta</Text>
      </TouchableOpacity>
            
      </ScrollView>

      {/* Botão de Ação Fixo */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.chatBtn}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.requestBtn}
          onPress={() => navigation.navigate('RequestService')}
        >
          <Text style={styles.requestBtnText}>Solicitar Serviço</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { padding: 20, alignItems: 'center', backgroundColor: '#F8F9FF', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backBtn: { alignSelf: 'flex-start', padding: 10 },
  profileInfo: { alignItems: 'center' },
  avatarContainer: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  verifiedBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.primary, borderRadius: 10, padding: 4, borderWidth: 2, borderColor: '#FFF' },
  name: { fontSize: 22, fontWeight: 'bold', marginTop: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  ratingText: { marginLeft: 5, color: '#666' },
  tagsContainer: { flexDirection: 'row', marginTop: 15, gap: 8 },
  tag: { backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#EEE' },
  tagText: { fontSize: 12, color: colors.primary, fontWeight: 'bold' },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  bio: { color: '#666', lineHeight: 22 },
  portfolioImg: { width: 150, height: 100, borderRadius: 12, marginRight: 10 },
  serviceItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  serviceName: { fontSize: 16 },
  servicePrice: { fontWeight: 'bold', color: colors.primary },
  reviewCard: { backgroundColor: '#F8F9FF', padding: 15, borderRadius: 15, marginTop: 10 },
  reviewUser: { fontWeight: 'bold' },
  reviewComment: { color: '#666', marginTop: 5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footer: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#FFF', padding: 20, flexDirection: 'row', gap: 15, borderTopWidth: 1, borderTopColor: '#EEE' },
  chatBtn: { width: 56, height: 56, borderRadius: 15, borderWidth: 1, borderColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  requestBtn: { flex: 1, backgroundColor: colors.primary, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  requestBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, margin: 20, marginTop: 0, padding: 18,
    backgroundColor: '#FFF', borderRadius: 15,
    borderWidth: 1, borderColor: '#FFE0E0',
  },
  logoutText: { color: '#FF4B4B', fontWeight: 'bold', fontSize: 15 },
});