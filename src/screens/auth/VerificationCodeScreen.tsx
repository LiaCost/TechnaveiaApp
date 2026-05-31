import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, theme } from '../../theme';
import { OTPInput, OTPInputHandle } from '../../components/OTPInput';
import { authService } from '../../services/api';

export function VerificationCodeScreen({ navigation, route }: any) {
  const email: string = route?.params?.email ?? '';
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const otpRef = useRef<OTPInputHandle>(null);

  async function handleComplete(code: string) {
    setError('');
    setIsVerifying(true);
    try {
      const { token } = await authService.verifyCode(email, code);
      navigation.navigate('ResetPassword', { resetToken: token, email });
    } catch (e: any) {
      setError(e.message ?? 'Código inválido. Tente novamente.');
      otpRef.current?.clear();
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResend() {
    try {
      await authService.forgotPassword(email);
      Alert.alert('Código reenviado!', `Um novo código foi enviado para ${email}`);
    } catch {
      Alert.alert('Erro', 'Não foi possível reenviar o código. Tente novamente.');
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.content}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={28} color={colors.dark1} />
        </TouchableOpacity>

        <View style={s.iconWrap}>
          <Ionicons name="mail-unread-outline" size={40} color={colors.primary} />
        </View>

        <Text style={s.title}>Verifique seu e-mail</Text>
        <Text style={s.desc}>
          Enviamos um código de 6 dígitos para{'\n'}
          <Text style={s.email}>{email || 'seu e-mail'}</Text>
        </Text>

        <OTPInput
          ref={otpRef}
          onComplete={handleComplete}
          onResend={handleResend}
          resendCooldown={60}
          disabled={isVerifying}
        />

        {isVerifying && (
          <View style={s.loadingRow}>
            <ActivityIndicator color={colors.primary} size="small" />
            <Text style={s.loadingText}>Verificando...</Text>
          </View>
        )}

        {error !== '' && (
          <View style={s.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color="#F44336" />
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        <Text style={s.hint}>
          Não encontrou? Verifique a pasta de spam.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FF' },
  content: { flex: 1, padding: 24, paddingTop: 16 },
  backBtn: { marginBottom: 24, width: 40 },
  iconWrap: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 24, alignSelf: 'flex-start',
  },
  title: { fontSize: 26, fontWeight: '700', color: colors.dark1, marginBottom: 10 },
  desc: { fontSize: 15, color: '#666', lineHeight: 22, marginBottom: 32 },
  email: { fontWeight: '700', color: colors.dark1 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 8 },
  loadingText: { fontSize: 14, color: '#888' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFF0F0', borderRadius: 10, padding: 12, marginTop: 8,
  },
  errorText: { color: '#F44336', fontSize: 13, flex: 1 },
  hint: { fontSize: 13, color: '#AAA', textAlign: 'center', marginTop: 24 },
});