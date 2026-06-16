/**
 * Tipos centralizados de navegação.
 *
 * Para tipar uma tela, importe o tipo da stack correspondente e use:
 *   import { NativeStackScreenProps } from '@react-navigation/native-stack';
 *   import { ClientStackParamList } from '../navigation/types';
 *   type Props = NativeStackScreenProps<ClientStackParamList, 'NomeDaRota'>;
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// Re-exporta tipos das stacks
export type { AuthStackParamList } from './AuthStack';
export type { ClientStackParamList } from './ClientStack';
export type { TechStackParamList } from './TechStack';

// ─── Root Navigator ───────────────────────────────────────

export type RootStackParamList = {
  Auth: undefined;
  ClientApp: undefined;
  TechApp: undefined;
  AdminApp: undefined;
};

// ─── Helpers para tipagem rápida ──────────────────────────

export type RootScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
