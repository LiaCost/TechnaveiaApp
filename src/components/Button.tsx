import React from 'react';
import { TouchableOpacity, Text, StyleSheet, useColorScheme, ActivityIndicator } from 'react-native';
import { theme, colors } from '.././theme';

interface Props {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
}

export function Button({ title, onPress, type = 'primary', disabled = false, loading = false }: Props) {
  const colorScheme = useColorScheme();
  const currentTheme = colorScheme === 'dark' ? theme.dark : theme.light;
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { backgroundColor: type === 'primary' ? colors.primary : 'transparent',
          borderWidth: type === 'secondary' ? 1 : 0,
          borderColor: colors.primary,
          opacity: isDisabled ? 0.6 : 1 }
      ]} 
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={type === 'primary' ? colors.dark1 : colors.primary} />
      ) : (
        <Text style={[
          styles.text, 
          { color: type === 'primary' ? colors.dark1 : colors.primary }
        ]}>
          {title}
        </Text>
      )}
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