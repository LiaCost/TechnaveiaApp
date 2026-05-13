import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme';

import { AdminDashboard } from '../screens/admin/AdminDashboard';
import { TechModeration } from '../screens/admin/TechModeration';
import { AdminFinance } from '../screens/admin/AdminFinance';

const Stack = createNativeStackNavigator();

export function AdminStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.dark1 },
        headerTintColor: '#FFF',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="AdminHome" 
        component={AdminDashboard} 
        options={{ title: 'Painel Geral' }} 
      />
      <Stack.Screen 
        name="Moderation" 
        component={TechModeration} 
        options={{ title: 'Fila de Aprovação' }} 
      />
      <Stack.Screen 
        name="FinanceAdmin" 
        component={AdminFinance} 
        options={{ title: 'Controle Financeiro' }} 
      />
    </Stack.Navigator>
  );
}