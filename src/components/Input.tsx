import React from 'react';
import { 
  TextInput, 
  StyleSheet, 
  useColorScheme, 
  TextInputProps // Importamos o tipo das props padrão
} from 'react-native';
import { theme } from '.././theme';

// Estendemos nossa interface com TextInputProps
interface Props extends TextInputProps {
  placeholder: string;
}

// Usamos o operador rest (...) para pegar todas as outras propriedades
export function Input({ placeholder, ...rest }: Props) {
  const colorScheme = useColorScheme();
  const currentTheme = colorScheme === 'dark' ? theme.dark : theme.light;

  return (
    <TextInput 
      placeholder={placeholder}
      placeholderTextColor={currentTheme.textSecondary}
      // Repassamos todas as propriedades (value, onChangeText, keyboardType, etc)
      {...rest} 
      style={[
        styles.input, 
        { 
          backgroundColor: currentTheme.surface, 
          color: currentTheme.text,
          borderColor: currentTheme.border
        }
      ]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  }
});