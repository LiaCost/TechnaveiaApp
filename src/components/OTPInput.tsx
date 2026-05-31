import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import {
  View, TextInput, StyleSheet, TouchableOpacity, Text,
} from 'react-native';
import { colors } from '../theme';

// ─── Tipos ────────────────────────────────────────────────

interface OTPInputProps {
  length?: number;
  onComplete: (code: string) => void;
  onResend: () => void;
  resendCooldown?: number; // segundos
  disabled?: boolean;
}

export interface OTPInputHandle {
  clear: () => void;
  focus: () => void;
}

// ─── Componente ───────────────────────────────────────────

export const OTPInput = forwardRef<OTPInputHandle, OTPInputProps>(({
  length = 6,
  onComplete,
  onResend,
  resendCooldown = 60,
  disabled = false,
}, ref) => {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const [countdown, setCountdown] = useState(resendCooldown);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown regressivo para reenvio
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Expõe métodos para o pai via ref
  useImperativeHandle(ref, () => ({
    clear: () => {
      setValues(Array(length).fill(''));
      inputRefs.current[0]?.focus();
    },
    focus: () => {
      inputRefs.current[0]?.focus();
    },
  }));

  function handleChange(text: string, index: number) {
    // Aceita apenas dígito
    const digit = text.replace(/\D/g, '').slice(-1);
    const newValues = [...values];
    newValues[index] = digit;
    setValues(newValues);

    // Avança automaticamente para o próximo campo
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Dispara onComplete quando todos estiverem preenchidos
    const full = newValues.join('');
    if (full.length === length && !newValues.includes('')) {
      onComplete(full);
    }
  }

  function handleKeyPress(key: string, index: number) {
    if (key === 'Backspace' && !values[index] && index > 0) {
      // Volta para o campo anterior quando apaga em campo vazio
      const newValues = [...values];
      newValues[index - 1] = '';
      setValues(newValues);
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(text: string, index: number) {
    // Aceita colar o código completo em qualquer caixa
    const digits = text.replace(/\D/g, '').slice(0, length);
    if (digits.length > 1) {
      const newValues = Array(length).fill('');
      digits.split('').forEach((d, i) => { newValues[i] = d; });
      setValues(newValues);
      inputRefs.current[Math.min(digits.length, length - 1)]?.focus();
      if (digits.length === length) onComplete(digits);
    }
  }

  function handleResend() {
    if (!canResend) return;
    setValues(Array(length).fill(''));
    setCountdown(resendCooldown);
    setCanResend(false);
    inputRefs.current[0]?.focus();
    onResend();
  }

  const filled = values.filter(v => v !== '').length;

  return (
    <View>
      {/* Caixas do OTP */}
      <View style={s.row}>
        {values.map((val, i) => (
          <TextInput
            key={i}
            ref={el => { inputRefs.current[i] = el; }}
            style={[
              s.box,
              val !== '' && s.boxFilled,
              disabled && s.boxDisabled,
            ]}
            value={val}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
            onChangeText={text => {
              if (text.length > 1) {
                handlePaste(text, i);
              } else {
                handleChange(text, i);
              }
            }}
            keyboardType="number-pad"
            maxLength={6} // permite colar o código inteiro
            textAlign="center"
            selectionColor={colors.primary}
            caretHidden
            editable={!disabled}
            autoFocus={i === 0}
          />
        ))}
      </View>

      {/* Progresso (opcional, sutil) */}
      <View style={s.progressRow}>
        {Array(length).fill(null).map((_, i) => (
          <View
            key={i}
            style={[s.dot, i < filled && s.dotFilled]}
          />
        ))}
      </View>

      {/* Botão de reenvio com countdown */}
      <View style={s.resendRow}>
        {canResend ? (
          <TouchableOpacity onPress={handleResend}>
            <Text style={s.resendActive}>Reenviar código</Text>
          </TouchableOpacity>
        ) : (
          <Text style={s.resendCooldown}>
            Reenviar código em{' '}
            <Text style={{ fontWeight: '700', color: colors.dark1 }}>
              {countdown}s
            </Text>
          </Text>
        )}
      </View>
    </View>
  );
});

OTPInput.displayName = 'OTPInput';

// ─── Estilos ───────────────────────────────────────────────

const BOX_SIZE = 48;

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE + 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D0D9ED',
    backgroundColor: '#F8F9FF',
    fontSize: 22,
    fontWeight: '700',
    color: colors.dark1,
  },
  boxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  boxDisabled: {
    opacity: 0.5,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DDD',
  },
  dotFilled: {
    backgroundColor: colors.primary,
  },
  resendRow: {
    alignItems: 'center',
  },
  resendActive: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  resendCooldown: {
    color: '#999',
    fontSize: 14,
  },
});