import React from 'react';
import { 
  TextInput, 
  StyleSheet, 
  useColorScheme, 
  TextInputProps,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '.././theme';

interface Props extends TextInputProps {
  placeholder: string;
  icon?: keyof typeof Ionicons.glyphMap; // 👈 prop nova
}

export function Input({ placeholder, icon, ...rest }: Props) {
  const colorScheme = useColorScheme();
  const currentTheme = colorScheme === 'dark' ? theme.dark : theme.light;

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: currentTheme.surface, 
        borderColor: currentTheme.border
      }
    ]}>
      {icon && (
        <Ionicons 
          name={icon} 
          size={20} 
          color={currentTheme.textSecondary} 
          style={styles.icon} 
        />
      )}
      <TextInput 
        placeholder={placeholder}
        placeholderTextColor={currentTheme.textSecondary}
        {...rest} 
        style={[
          styles.input, 
          { color: currentTheme.text }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',   // ícone e input lado a lado
    alignItems: 'center',   // alinha verticalmente ao centro
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,               // ocupa o espaço restante após o ícone
    fontSize: 16,
    height: '100%',
  }
});