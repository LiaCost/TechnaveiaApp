import React from 'react';
import { View, Text, StyleSheet, useColorScheme, SafeAreaView, TouchableOpacity } from 'react-native';
// ✅ Correto - sobe dois níveis (vai para src/theme)
import { theme, colors } from '../../theme';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Ionicons } from '@expo/vector-icons';

export function ForgotPasswordScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const currentTheme = colorScheme === 'dark' ? theme.dark : theme.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={currentTheme.text} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: currentTheme.text }]}>Recuperar Senha</Text>
        <Text style={[styles.description, { color: currentTheme.textSecondary }]}>
          Digite seu e-mail cadastrado. Enviaremos um link para você criar uma nova senha.
        </Text>

        <Input placeholder="Seu e-mail de cadastro" />
        
        <Button title="Enviar Link" onPress={() => navigation.navigate('VerificationCode')} />
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