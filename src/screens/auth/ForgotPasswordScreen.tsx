import React, { useState } from 'react';
import {
  View, Text, StyleSheet, useColorScheme,
  SafeAreaView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { theme, colors } from '../../theme';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/api';

export function ForgotPasswordScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const currentTheme = colorScheme === 'dark' ? theme.dark : theme.light;

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSend() {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('E-mail inválido', 'Digite um e-mail válido para continuar.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      // Navega para verificação passando o e-mail
      navigation.navigate('VerificationCode', { email });
    } catch (error: any) {
      Alert.alert('Erro', error.message ?? 'Não foi possível enviar o código. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={currentTheme.text} />
        </TouchableOpacity>

        <View style={styles.iconWrap}>
          <Ionicons name="lock-open-outline" size={36} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: currentTheme.text }]}>Recuperar Senha</Text>
        <Text style={[styles.description, { color: currentTheme.textSecondary }]}>
          Digite seu e-mail cadastrado. Enviaremos um código de 6 dígitos para você criar uma nova senha.
        </Text>

        <Input
          placeholder="Seu e-mail de cadastro"
          icon="mail-outline"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Button
          title={isLoading ? 'Enviando...' : 'Enviar Código'}
          onPress={handleSend}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24 },
  backButton: { marginBottom: 20 },
  iconWrap: {
    width: 68, height: 68, borderRadius: 18,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 12 },
  description: { fontSize: 16, marginBottom: 32, lineHeight: 24 },
});