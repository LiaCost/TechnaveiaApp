import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '.././theme';

export function TechStats() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardValue}>05</Text>
        <Text style={styles.cardLabel}>Pedidos Hoje</Text>
      </View>
      <View style={[styles.card, { backgroundColor: colors.primary }]}>
        <Text style={[styles.cardValue, { color: '#FFF' }]}>R$ 1.250</Text>
        <Text style={[styles.cardLabel, { color: '#EEE' }]}>Ganhos Semana</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardValue}>4.9</Text>
        <Text style={styles.cardLabel}>Avaliação</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardValue}>98%</Text>
        <Text style={styles.cardLabel}>Aceitação</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 20 },
  card: { width: '48%', backgroundColor: '#FFF', padding: 15, borderRadius: 15, elevation: 2 },
  cardValue: { fontSize: 20, fontWeight: 'bold', color: colors.dark1 },
  cardLabel: { fontSize: 12, color: '#666', marginTop: 5 }
});