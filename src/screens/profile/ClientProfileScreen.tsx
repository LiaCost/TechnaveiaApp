import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, StatusBar, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';

export function ClientProfileScreen({ navigation }: any) {
  const { user, signOut } = useAuth();

  const menuItems = [
    { icon: 'location-outline', label: 'Meus Endereços', sub: 'Casa, Trabalho' },
    { icon: 'card-outline', label: 'Pagamentos', sub: 'Cartão final 4432' },
    { icon: 'receipt-outline', label: 'Histórico de Pedidos', sub: 'Ver serviços anteriores' },
    { icon: 'star-outline', label: 'Minhas Avaliações', sub: 'Feedbacks enviados' },
    { icon: 'gift-outline', label: 'Indique e Ganhe', sub: 'Ganhe descontos indicando amigos', highlight: true },
    { icon: 'settings-outline', label: 'Configurações', sub: 'Segurança, tema, privacidade' },
    { icon: 'help-circle-outline', label: 'Suporte', sub: 'Ajuda e FAQ' },
  ];

    const navMap: Record<string, string> = {
    'Editar Dados Pessoais':  'NT',
    'Meus Endereços':          'NT',
    'Pagamentos':      'Payment',
    'Histórico de Pedidos':             'NA',
    'Minhas Avaliações':                 'MyReviews',
    'Indique e Ganhe':          'NT',
    'Configurações':          'Settings',
    'Suporte':                'HelpCenter',
  };

  function handleLogout() {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: signOut },
      ]
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.container}>
        <View style={s.header}>
          <View style={s.avatarContainer}>
            <View style={s.avatarLarge}>
              {user?.foto ? (
                <Image source={{ uri: user.foto }} style={{ width: 100, height: 100, borderRadius: 50 }} />
              ) : (
                <Text style={s.avatarInitials}>
                  {user?.nome?.split(' ').map(n => n[0]).slice(0, 2).join('') ?? 'U'}
                </Text>
              )}
            </View>
            <TouchableOpacity style={s.editBadge} onPress={() => navigation.navigate('EditProfile')}>
              <Ionicons name="camera" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={s.userName}>{user?.nome ?? 'Usuário'}</Text>
          <Text style={s.userEmail}>{user?.email ?? ''}</Text>
          <TouchableOpacity style={s.editProfileBtn} onPress={() => navigation.navigate('EditProfile')}>
            <Text style={s.editProfileText}>Editar Dados Pessoais</Text>
          </TouchableOpacity>
        </View>

        <View style={s.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={s.menuItem}onPress={() => {
                const route = navMap[item.label];
                if (route) navigation.navigate(route);
              }}>
              <View style={[s.menuIcon, item.highlight && { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name={item.icon as any} size={22} color={item.highlight ? colors.primary : '#444'} />
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={[s.menuLabel, item.highlight && { color: colors.primary }]}>{item.label}</Text>
                <Text style={s.menuSub}>{item.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CCC" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF4B4B" />
          <Text style={s.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1, backgroundColor: '#F8F9FF' },
  header: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 16 : 30,
    paddingBottom: 30,
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10,
  },
  avatarContainer: { position: 'relative' },
  avatarLarge: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarInitials: { fontSize: 32, fontWeight: '700', color: colors.primary },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.primary,
    width: 32, height: 32, borderRadius: 16, justifyContent: 'center',
    alignItems: 'center', borderWidth: 3, borderColor: '#FFF',
  },
  userName: { fontSize: 20, fontWeight: 'bold', marginTop: 15, color: '#333' },
  userEmail: { fontSize: 14, color: '#999', marginTop: 4 },
  editProfileBtn: {
    marginTop: 15, paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: colors.primary,
  },
  editProfileText: { color: colors.primary, fontWeight: 'bold', fontSize: 13 },
  menuSection: { padding: 20, marginTop: 10 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    padding: 15, borderRadius: 15, marginBottom: 10, elevation: 2,
  },
  menuIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#F0F2F5', justifyContent: 'center', alignItems: 'center',
  },
  menuLabel: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  menuSub: { fontSize: 12, color: '#999', marginTop: 2 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, margin: 20, marginTop: 0, padding: 18,
    backgroundColor: '#FFF', borderRadius: 15,
    borderWidth: 1, borderColor: '#FFE0E0',
  },
  logoutText: { color: '#FF4B4B', fontWeight: 'bold', fontSize: 15 },
});