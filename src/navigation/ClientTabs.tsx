import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

import { HomeScreen } from '../screens/cliente/HomeScreen';
import { SearchScreen } from '../screens/cliente/SearchScreen';
import { OrdersScreen } from '../screens/cliente/OrdersScreen';
import { ChatListScreen } from '../screens/chat/ChatListScreen';
import { ClientProfileScreen } from '../screens/profile/ClientProfileScreen';

const Tab = createBottomTabNavigator();

export function ClientTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { height: 70, paddingBottom: 10, paddingTop: 10 },
        tabBarIcon: ({ focused, color }) => {
          let iconName: any;
          if (route.name === 'Início') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Buscar') iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'Pedidos') iconName = focused ? 'receipt' : 'receipt-outline';
          else if (route.name === 'Mensagens') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          else if (route.name === 'Perfil') iconName = focused ? 'person' : 'person-outline';

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Buscar" component={SearchScreen} />
      <Tab.Screen name="Pedidos" component={OrdersScreen} />
      <Tab.Screen name="Mensagens" component={ChatListScreen} />
      <Tab.Screen name="Perfil" component={ClientProfileScreen} />
    </Tab.Navigator>
  );
}