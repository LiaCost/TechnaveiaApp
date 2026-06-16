import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';

export function OrderSuccessScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 60,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={s.safe}>
      <View style={[s.container, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <Animated.View style={[s.iconWrap, { transform: [{ scale: scaleAnim }] }]}>
          <Ionicons name="checkmark-circle" size={80} color={colors.primary} />
        </Animated.View>

        <Text style={s.title}>Pedido realizado!</Text>
        <Text style={s.sub}>
          Seu pagamento foi confirmado e o serviço está agendado. Você receberá uma notificação assim que o técnico confirmar.
        </Text>

        <View style={s.infoCard}>
          <View style={s.infoRow}>
            <Ionicons name="notifications-outline" size={20} color={colors.primary} />
            <Text style={s.infoText}>Acompanhe o status em Pedidos</Text>
          </View>
          <View style={s.infoRow}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
            <Text style={s.infoText}>Converse com o técnico pelo chat</Text>
          </View>
          <View style={s.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
            <Text style={s.infoText}>Seu pagamento fica guardado até a conclusão</Text>
          </View>
        </View>

        <TouchableOpacity
          style={s.btnPrimary}
          onPress={() => navigation.navigate('OrderScreen')}
        >
          <Ionicons name="receipt-outline" size={20} color="#FFF" />
          <Text style={s.btnPrimaryText}>Ver meus pedidos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.btnSecondary}
          onPress={() => navigation.navigate('ClientTabs')}
        >
          <Text style={s.btnSecondaryText}>Voltar para o início</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF' },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  sub: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#F8F9FF',
    borderRadius: 16,
    padding: 20,
    gap: 14,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#E8EEFF',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoText: { fontSize: 14, color: '#444', flex: 1 },
  btnPrimary: {
    width: '100%',
    backgroundColor: colors.dark1,
    borderRadius: 14,
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  btnPrimaryText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  btnSecondary: {
    width: '100%',
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSecondaryText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
});
