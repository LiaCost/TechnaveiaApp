import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Tabs raiz do técnico
import { TechTabs } from './TechTabs';

// Telas filhas
import { RequestsListScreen }   from '../screens/tech/RequestsListScreen';
import { ServiceExecutionScreen } from '../screens/tech/ServiceExecutionScreen';
import { ServiceSummaryScreen } from '../screens/tech/ServiceSummaryScreen';
import { AgendaScreen }         from '../screens/tech/AgendaScreen';
import { CreateBudgetScreen }   from '../screens/tech/CreateBudgetScreen';
import { AddServiceScreen }     from '../screens/tech/AddServiceScreen';
import { WithdrawScreen }       from '../screens/tech/WithdrawScreen';
import { TechReviewsScreen }    from '../screens/tech/TechReviewsScreen';
import { TechPublicProfileEdit } from '../screens/profile/TechPublicProfileEdit';
import { TechAccountScreen }    from '../screens/profile/TechAccountScreen';
import { EditProfileScreen }    from '../screens/profile/EditProfileScreen';
import { NotificationsScreen }  from '../screens/notificacoes/NotificationsScreen';
import { ChatScreen }           from '../screens/chat/ChatScreen';
import { SettingsScreen }       from '../screens/profile/SettingsScreen';
import { HelpCenterScreen }     from '../screens/support/HelpCenterScreen';
import { OpenDisputeScreen }    from '../screens/support/OpenDisputeScreen';

// ─── Tipos de parâmetros por rota ─────────────────────────

export type TechStackParamList = {
  TechTabs:          undefined;
  RequestsList:      { openOrderId?: string };
  ServiceExecution:  { orderId: string };
  ServiceSummary:    { orderId: string };
  Agenda:            undefined;
  CreateBudget:      { orderId: string };
  AddService:        undefined;
  Withdraw:          undefined;
  TechAccount:       undefined;
  EditProfile:       undefined;
  Reviews:           undefined;
  EditPublicProfile: undefined;
  Settings:          undefined;
  Notifications:     undefined;
  Chat: {
    conversaId: string;
    outroNome: string;
    pedidoNumero?: string;
    pedidoId?: string;
  };
  HelpCenter:        undefined;
  OpenDispute:       { orderId: string };
};

const Stack = createNativeStackNavigator<TechStackParamList>();

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
      <Stack.Screen name="RequestsList"    component={RequestsListScreen} />
      <Stack.Screen name="ServiceExecution" component={ServiceExecutionScreen} />
      <Stack.Screen name="ServiceSummary"  component={ServiceSummaryScreen} />

      {/* ── Agenda ── */}
      <Stack.Screen name="Agenda"          component={AgendaScreen} />

      {/* ── Orçamento e serviços ── */}
      <Stack.Screen name="CreateBudget"    component={CreateBudgetScreen} />
      <Stack.Screen name="AddService"      component={AddServiceScreen} />

      {/* ── Financeiro ── */}
      <Stack.Screen name="Withdraw"        component={WithdrawScreen} />

      {/* ── Perfil e conta ── */}
      <Stack.Screen name="TechAccount"     component={TechAccountScreen} />
      <Stack.Screen name="EditProfile"     component={EditProfileScreen} />
      <Stack.Screen name="Reviews"         component={TechReviewsScreen} />
      <Stack.Screen name="EditPublicProfile" component={TechPublicProfileEdit} />
      <Stack.Screen name="Settings"        component={SettingsScreen} />

      {/* ── Notificações e chat ── */}
      <Stack.Screen name="Notifications"   component={NotificationsScreen} />
      <Stack.Screen name="Chat"            component={ChatScreen} />

      {/* ── Suporte ── */}
      <Stack.Screen name="HelpCenter"      component={HelpCenterScreen} />
      <Stack.Screen name="OpenDispute"     component={OpenDisputeScreen} />
    </Stack.Navigator>
  );
}