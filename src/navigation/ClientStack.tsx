import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme';

// Tabs raiz do cliente
import { ClientTabs } from './ClientTabs';

// Telas filhas (acessadas a partir das tabs)
import { RequestServiceScreen } from '../screens/cliente/RequestServiceScreen';
import { BudgetDetailsScreen } from '../screens/cliente/BudgetDetailsScreen';
import { PaymentScreen } from '../screens/cliente/PaymentScreen';
import { TechProfileScreen } from '../screens/profile/TechProfileScreen';
import { ReviewScreen } from '../screens/profile/ReviewScreen';
import { NotificationsScreen } from '../screens/notificacoes/NotificationsScreen';
import { ChatScreen } from '../screens/chat/ChatScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { HelpCenterScreen } from '../screens/support/HelpCenterScreen';
import { OpenDisputeScreen } from '../screens/support/OpenDisputeScreen';
import { ContactSupportScreen } from '../screens/support/ContactSupporScreen';

const Stack = createNativeStackNavigator();

export function ClientStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Tabs são a raiz — sempre o primeiro screen */}
      <Stack.Screen name="ClientTabs" component={ClientTabs} />

      {/* ── Fluxo principal ── */}
      <Stack.Screen name="RequestService" component={RequestServiceScreen} />
      <Stack.Screen name="BudgetDetails" component={BudgetDetailsScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />

      {/* ── Perfil e avaliação ── */}
      <Stack.Screen name="TechProfile" component={TechProfileScreen} />
      <Stack.Screen name="Review" component={ReviewScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />

      {/* ── Notificações e chat ── */}
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />

      {/* ── Suporte ── */}
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="OpenDispute" component={OpenDisputeScreen} />
      <Stack.Screen name="ContactSupport" component={ContactSupportScreen} />
    </Stack.Navigator>
  );
}