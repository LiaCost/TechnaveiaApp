import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

export function ClientProfileScreen() {
  const menuItems = [
    { icon: 'location-outline', label: 'Meus Endereços', sub: 'Casa, Trabalho' },
    { icon: 'card-outline', label: 'Pagamentos', sub: 'Cartão final 4432' },
    { icon: 'receipt-outline', label: 'Histórico de Pedidos', sub: 'Ver serviços anteriores' },
    { icon: 'star-outline', label: 'Minhas Avaliações', sub: 'Feedbacks enviados' },
    { icon: 'gift-outline', label: 'Indique e Ganhe', sub: 'Ganhe descontos indicando amigos', highlight: true },
    { icon: 'help-circle-outline', label: 'Suporte', sub: 'Ajuda e FAQ' },
  ];

  return (
    <ScrollView style={stylesClient.container}>
      {/* Header do Perfil */}
      <View style={stylesClient.header}>
        <View style={stylesClient.avatarContainer}>
          <View style={stylesClient.avatarLarge} />
          <TouchableOpacity style={stylesClient.editBadge}>
            <Ionicons name="camera" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
        <Text style={stylesClient.userName}>Beatriz Santos</Text>
        <Text style={stylesClient.userEmail}>beatriz.s@email.com</Text>
        <TouchableOpacity style={stylesClient.editProfileBtn}>
          <Text style={stylesClient.editProfileText}>Editar Dados Pessoais</Text>
        </TouchableOpacity>
      </View>

      {/* Menu de Opções */}
      <View style={stylesClient.menuSection}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={stylesClient.menuItem}>
            <View style={[stylesClient.menuIcon, item.highlight && { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name={item.icon as any} size={22} color={item.highlight ? colors.primary : '#444'} />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={[stylesClient.menuLabel, item.highlight && { color: colors.primary }]}>{item.label}</Text>
              <Text style={stylesClient.menuSub}>{item.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CCC" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={stylesClient.logoutBtn}>
        <Text style={stylesClient.logoutText}>Sair da Conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const stylesClient = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FF' 
  },
  header: { 
    alignItems: 'center', 
    padding: 30, 
    backgroundColor: '#FFF', 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  avatarContainer: { 
    position: 'relative' 
  },
  avatarLarge: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: '#EEE' 
  },
  editBadge: { 
    position: 'absolute', 
    bottom: 0, 
    right: 0, 
    backgroundColor: colors.primary, 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 3, 
    borderColor: '#FFF' 
  },
  userName: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginTop: 15, 
    color: '#333' 
  },
  userEmail: { 
    fontSize: 14, 
    color: '#999', 
    marginTop: 4 
  },
  editProfileBtn: { 
    marginTop: 15, 
    paddingHorizontal: 20, 
    paddingVertical: 8, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: colors.primary 
  },
  editProfileText: { 
    color: colors.primary, 
    fontWeight: 'bold', 
    fontSize: 13 
  },
  menuSection: { 
    padding: 20, 
    marginTop: 10 
  },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    padding: 15, 
    borderRadius: 15, 
    marginBottom: 10, 
    elevation: 2 
  },
  menuIcon: { 
    width: 40, 
    height: 40, 
    borderRadius: 10, 
    backgroundColor: '#F0F2F5', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  menuLabel: { 
    fontSize: 15, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  menuSub: { 
    fontSize: 12, 
    color: '#999', 
    marginTop: 2 
  },
  logoutBtn: { 
    margin: 30, 
    padding: 18, 
    alignItems: 'center' 
  },
  logoutText: { 
    color: '#FF4B4B', 
    fontWeight: 'bold' 
  }
});