/**
 * Serviço de Push Notifications — Stub para Expo Go.
 *
 * Push notifications NÃO funcionam no Expo Go.
 * Para ativar, instale expo-notifications com um development build:
 *   npx expo install expo-notifications expo-device expo-constants
 *   npx expo prebuild
 *   npx expo run:android (ou run:ios)
 *
 * Depois descomente o código abaixo e remova o stub.
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/v1';
const PUSH_TOKEN_KEY = '@technaveia:pushToken';

/**
 * Setup de push notifications.
 * No Expo Go, não faz nada (log apenas).
 * Em production/dev build, ative expo-notifications.
 */
export async function setupPushNotifications(): Promise<void> {
  // Expo Go não suporta push notifications
  // Este stub previne crashes e permite que o app funcione normalmente.
  if (__DEV__) {
    console.log('[Push] Stub ativo — push notifications requerem development build.');
  }
}

/**
 * Envia o push token para o backend associar ao usuário logado.
 * Chamado apenas quando push é de fato registrado.
 */
export async function sendTokenToBackend(pushToken: string): Promise<void> {
  const authToken = await AsyncStorage.getItem('@technaveia:token');
  if (!authToken) return;

  try {
    await fetch(`${BASE_URL}/users/push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        token: pushToken,
        platform: Platform.OS,
      }),
    });
  } catch (error) {
    console.warn('Erro ao enviar push token para o backend:', error);
  }
}
