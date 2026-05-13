import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, theme } from '../theme';

export function HomeHeader({ name, location }: { name: string, location: string }) {
  return (
    <View style={styles.container}>
      <View style={styles.userRow}>
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>Olá, {name} 👋</Text>
          <TouchableOpacity style={styles.locationRow}>
            <Ionicons name="location" size={16} color={colors.primary} />
            <Text style={styles.locationText} numberOfLines={1}>{location}</Text>
            <Ionicons name="chevron-down" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="chatbubbles-outline" size={24} color={colors.dark1} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={24} color={colors.dark1} />
            <View style={styles.badge}><Text style={styles.badgeText}>2</Text></View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 20, marginBottom: 20 },
  userRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userInfo: { flex: 1 },
  greeting: { fontSize: 18, fontWeight: 'bold', color: colors.dark1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locationText: { fontSize: 14, color: '#666', marginHorizontal: 4, maxWidth: '80%' },
  actions: { flexDirection: 'row', gap: 12 },
  iconBtn: { position: 'relative', padding: 8, backgroundColor: '#FFF', borderRadius: 12 },
  badge: { position: 'absolute', top: 4, right: 4, backgroundColor: colors.danger, borderRadius: 8, width: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' }
});