import React from 'react';
import { View, Text, StyleSheet, useColorScheme, SafeAreaView, TouchableOpacity } from 'react-native';
import { theme, colors } from '../../theme';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Ionicons } from '@expo/vector-icons';

export function ResetPasswordScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const currentTheme = colorScheme === 'dark' ? theme.dark : theme.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={currentTheme.text} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: currentTheme.text }]}>Nova Senha</Text>
        <Text style={[styles.description, { color: currentTheme.textSecondary }]}>
          Crie uma nova senha forte para acessar sua conta TECHNAVEIA.
        </Text>

        <Input placeholder="Nova Senha" secureTextEntry />
        <Input placeholder="Confirmar Nova Senha" secureTextEntry />
        
        <Button 
          title="Salvar e Entrar" 
          onPress={() => {
            alert('Senha alterada com sucesso!');
            // O ideal após alterar a senha é mandar para o Login ou direto para a Home
            navigation.popToTop(); // Remove todas as telas e volta para o Login
          }} 
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24 },
  backButton: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 12 },
  description: { fontSize: 16, marginBottom: 32, lineHeight: 24 }
});