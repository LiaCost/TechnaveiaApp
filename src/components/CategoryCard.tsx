import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, theme } from '.././theme';

interface Props {
  title: string;
  selected: boolean;
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
}

export function CategoryCard({ title, selected, onPress, icon }: Props) {
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { borderColor: selected ? colors.primary : '#D0D9ED', 
          backgroundColor: selected ? colors.primary + '10' : 'transparent' }
      ]} 
      onPress={onPress}
    >
      <View style={styles.content}>
        <Ionicons name={icon} size={24} color={selected ? colors.primary : '#666'} />
        <Text style={[styles.text, { color: selected ? colors.primary : '#666' }]}>
          {title}
        </Text>
      </View>
      <Ionicons 
        name={selected ? "checkbox" : "square-outline"} 
        size={24} 
        color={selected ? colors.primary : '#CCC'} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  content: { flexDirection: 'row', alignItems: 'center' },
  text: { fontSize: 16, fontWeight: '600', marginLeft: 12 }
});