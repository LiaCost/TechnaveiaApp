import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AdminDashboard }          from '../screens/admin/AdminDashboard';
import { TechModeration }          from '../screens/admin/TechModeration';
import { AdminFinance }            from '../screens/admin/AdminFinance';
import { UserManagementScreen }    from '../screens/admin/UserManagementScreen';
import { OrdersManagementScreen }  from '../screens/admin/OrdersManagementScreen';
import { CommunicationsScreen }    from '../screens/admin/CommunicationsScreen';

const Stack = createNativeStackNavigator();

export function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminHome"       component={AdminDashboard} />
      <Stack.Screen name="Moderation"      component={TechModeration} />
      <Stack.Screen name="FinanceAdmin"    component={AdminFinance} />
      <Stack.Screen name="UserManagement"  component={UserManagementScreen} />
      <Stack.Screen name="OrdersAdmin"     component={OrdersManagementScreen} />
      <Stack.Screen name="Communications"  component={CommunicationsScreen} />
    </Stack.Navigator>
  );
}