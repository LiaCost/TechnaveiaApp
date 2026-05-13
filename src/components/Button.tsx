import React from 'react';
import { TouchableOpacity, Text, StyleSheet, useColorScheme } from 'react-native';
import { theme, colors } from '.././theme';

interface Props {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary';
}

export function Button({ title, onPress, type = 'primary' }: Props) {
  const colorScheme = useColorScheme();
  const currentTheme = colorScheme === 'dark' ? theme.dark : theme.light;

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { backgroundColor: type === 'primary' ? colors.primary : 'transparent',
          borderWidth: type === 'secondary' ? 1 : 0,
          borderColor: colors.primary }
      ]} 
      onPress={onPress}
    >
      <Text style={[
        styles.text, 
        { color: type === 'primary' ? colors.dark1 : colors.primary }
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  }
});