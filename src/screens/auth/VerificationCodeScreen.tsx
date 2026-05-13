import React from 'react';
import { View, Text, StyleSheet, useColorScheme, SafeAreaView, TouchableOpacity } from 'react-native';
import { theme, colors } from '../../theme';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Ionicons } from '@expo/vector-icons';

export function VerificationCodeScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const currentTheme = colorScheme === 'dark' ? theme.dark : theme.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={currentTheme.text} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: currentTheme.text }]}>Verifique seu e-mail</Text>
        <Text style={[styles.description, { color: currentTheme.textSecondary }]}>
          Enviamos um código de 6 dígitos para o seu e-mail. Digite-o abaixo para continuar.
        </Text>

        {/* Idealmente aqui usaríamos um componente de "caixinhas" separadas, mas para iniciar o input padrão com teclado numérico resolve muito bem */}
        <Input placeholder="000000" />
        
        <Button 
          title="Verificar Código" 
          onPress={() => navigation.navigate('ResetPassword')} 
        />

        <TouchableOpacity style={styles.resendButton}>
          <Text style={[styles.resendText, { color: colors.primary }]}>Não recebeu? Reenviar código</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24 },
  backButton: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 12 },
  description: { fontSize: 16, marginBottom: 32, lineHeight: 24 },
  resendButton: { marginTop: 24, alignItems: 'center' },
  resendText: { fontSize: 16, fontWeight: '600' }
});