import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

interface HomeHeaderProps {
  name: string;
  location: string;
  foto?: string;
  onNotificationPress?: () => void;
  notificationCount?: number;
}

export function HomeHeader({ name, location, foto, onNotificationPress, notificationCount = 0 }: HomeHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.userRow}>
        <View style={styles.avatarSmall}>
          {foto ? (
            <Image source={{ uri: foto }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarInitials}>{name.charAt(0).toUpperCase()}</Text>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>Olá, {name} 👋</Text>
          <TouchableOpacity style={styles.locationRow}>
            <Ionicons name="location" size={16} color={colors.primary} />
            <Text style={styles.locationText} numberOfLines={1}>{location}</Text>
            <Ionicons name="chevron-down" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconBtn} onPress={onNotificationPress}>
            <Ionicons name="notifications-outline" size={24} color={colors.dark1} />
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notificationCount > 9 ? '9+' : notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    paddingHorizontal: 20, 
    paddingTop: 20, 
    marginBottom: 20 
  },
  userRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  avatarSmall: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12, overflow: 'hidden',
  },
  avatarImage: { width: 46, height: 46, borderRadius: 23 },
  avatarInitials: { fontSize: 18, fontWeight: '700', color: colors.primary },
  userInfo: { 
    flex: 1 
  },
  greeting: { 
    fontSize: 20, // Aumentei um pouco para bater com o layout da imagem
    fontWeight: 'bold', 
    color: colors.dark1 
  },
  locationRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 4 
  },
  locationText: { 
    fontSize: 14, 
    color: '#666', 
    marginHorizontal: 4, 
    maxWidth: '85%' 
  },
  actions: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  iconBtn: { 
    position: 'relative', 
    padding: 10, // Aumentei o padding para o botão ficar mais clicável (área de toque)
    backgroundColor: '#FFF', 
    borderRadius: 12,
    // Adicionado uma sombra leve para combinar com os botões da imagem
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  badge: { 
    position: 'absolute', 
    top: 5, 
    right: 5, 
    backgroundColor: colors.danger || '#FF3B30', 
    borderRadius: 10, 
    width: 18, 
    height: 18, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF' // Borda branca no badge faz ele saltar aos olhos
  },
  badgeText: { 
    color: '#FFF', 
    fontSize: 10, 
    fontWeight: 'bold' 
  }
});