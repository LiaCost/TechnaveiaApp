import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Tabs raiz do técnico
import { TechTabs } from './TechTabs';

// Telas filhas
import { RequestsListScreen } from '../screens/tech/RequestsListScreen';
import { ServiceExecutionScreen } from '../screens/tech/ServiceExecutionScreen';
import { ServiceSummaryScreen } from '../screens/tech/ServiceSummaryScreen';
import { AgendaScreen } from '../screens/tech/AgendaScreen';
import { CreateBudgetScreen } from '../screens/tech/CreateBudgetScreen';
import { AddServiceScreen } from '../screens/tech/AddServiceScreen';
import { WithdrawScreen } from '../screens/tech/WithdrawScreen';
import { TechReviewsScreen } from '../screens/tech/TechReviewsScreen';
import { TechPublicProfileEdit } from '../screens/profile/TechPublicProfileEdit';
import { NotificationsScreen } from '../screens/notificacoes/NotificationsScreen';
import { ChatScreen } from '../screens/chat/ChatScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { HelpCenterScreen } from '../screens/support/HelpCenterScreen';
import { OpenDisputeScreen } from '../screens/support/OpenDisputeScreen';

const Stack = createNativeStackNavigator();

export function TechStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Tabs são a raiz */}
      <Stack.Screen name="TechTabs" component={TechTabs} />

      {/* ── Solicitações ── */}
      <Stack.Screen name="RequestsList" component={RequestsListScreen} />
      <Stack.Screen name="ServiceExecution" component={ServiceExecutionScreen} />
      <Stack.Screen name="ServiceSummary" component={ServiceSummaryScreen} />

      {/* ── Agenda ── */}
      <Stack.Screen name="Agenda" component={AgendaScreen} />

      {/* ── Orçamento e serviços ── */}
      <Stack.Screen name="CreateBudget" component={CreateBudgetScreen} />
      <Stack.Screen name="AddService" component={AddServiceScreen} />

      {/* ── Financeiro ── */}
      <Stack.Screen name="Withdraw" component={WithdrawScreen} />

      {/* ── Perfil ── */}
      <Stack.Screen name="Reviews" component={TechReviewsScreen} />
      <Stack.Screen name="EditPublicProfile" component={TechPublicProfileEdit} />
      <Stack.Screen name="Settings" component={SettingsScreen} />

      {/* ── Notificações e chat ── */}
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />

      {/* ── Suporte ── */}
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="OpenDispute" component={OpenDisputeScreen} />
    </Stack.Navigator>
  );
}