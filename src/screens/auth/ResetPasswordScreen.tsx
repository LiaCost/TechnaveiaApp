import React, { useState } from 'react';
import {
  View, Text, StyleSheet, useColorScheme,
  SafeAreaView, TouchableOpacity, Alert,
} from 'react-native';
import { theme, colors } from '../../theme';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/api';

function passwordStrength(pwd: string): { label: string; color: string; level: number } {
  if (pwd.length < 6) return { level: 0, label: '', color: '#EEE' };
  const score = [pwd.length >= 8, /[A-Z]/.test(pwd), /[0-9]/.test(pwd), /[^A-Za-z0-9]/.test(pwd)].filter(Boolean).length;
  if (score <= 1) return { level: 1, label: 'Fraca', color: '#F44336' };
  if (score === 2) return { level: 2, label: 'Média', color: '#FF9800' };
  return { level: 3, label: 'Forte', color: '#4CAF50' };
}

export function ResetPasswordScreen({ navigation, route }: any) {
  const colorScheme = useColorScheme();
  const currentTheme = colorScheme === 'dark' ? theme.dark : theme.light;

  const resetToken: string = route?.params?.resetToken ?? '';

  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const strength = passwordStrength(senha);

  async function handleReset() {
    if (senha.length < 6) {
      Alert.alert('Senha muito curta', 'Use ao menos 6 caracteres.');
      return;
    }
    if (senha !== confirmaSenha) {
      Alert.alert('Senhas não coincidem', 'As senhas digitadas são diferentes.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(resetToken, senha);
      Alert.alert('Senha alterada!', 'Sua senha foi redefinida com sucesso.', [
        { text: 'Fazer login', onPress: () => navigation.popToTop() },
      ]);
    } catch (error: any) {
      Alert.alert('Erro', error.message ?? 'Não foi possível redefinir a senha.');
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
          <Ionicons name="key-outline" size={36} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: currentTheme.text }]}>Nova Senha</Text>
        <Text style={[styles.description, { color: currentTheme.textSecondary }]}>
          Crie uma nova senha forte para acessar sua conta TECHNAVEIA.
        </Text>

        <Input
          placeholder="Nova senha"
          icon="lock-closed-outline"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        {/* Indicador de força */}
        {senha.length > 0 && (
          <View style={styles.strengthRow}>
            {[1, 2, 3].map(l => (
              <View
                key={l}
                style={[styles.strengthBar, { backgroundColor: strength.level >= l ? strength.color : '#E0E0E0' }]}
              />
            ))}
            <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
          </View>
        )}

        <Input
          placeholder="Confirmar nova senha"
          icon="lock-closed-outline"
          secureTextEntry
          value={confirmaSenha}
          onChangeText={setConfirmaSenha}
        />

        {confirmaSenha.length > 0 && senha !== confirmaSenha && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color="#F44336" />
            <Text style={styles.errorText}>As senhas não coincidem</Text>
          </View>
        )}

        <Button
          title={isLoading ? 'Salvando...' : 'Salvar nova senha'}
          onPress={handleReset}
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
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -8, marginBottom: 16 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 12, fontWeight: '600', width: 40 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFF0F0', padding: 10, borderRadius: 8, marginBottom: 16,
  },
  errorText: { color: '#F44336', fontSize: 13 },
});