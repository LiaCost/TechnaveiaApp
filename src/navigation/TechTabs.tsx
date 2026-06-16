import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '.././theme';

// Import das telas do Técnico
import { TechHomeScreen } from '../screens/tech/TechHomeScreen';
import { ChatListScreen } from '../screens/chat/ChatListScreen';
import { FinanceScreen } from '../screens/tech/FinanceScreen';
import { TechAccountScreen } from '../screens/profile/TechAccountScreen';
import { AgendaScreen } from '../screens/tech/AgendaScreen';

const Tab = createBottomTabNavigator();

export function TechTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom || 10,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: '#EEE',
          backgroundColor: '#FFF',
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName: any;

          if (route.name === 'Painel') {
            iconName = focused ? 'speedometer' : 'speedometer-outline';
          } else if (route.name === 'Agenda') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'ChatList') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Ganhos') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Conta') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Painel"
        component={TechHomeScreen}
        options={{ tabBarLabel: 'Painel' }}
      />
      <Tab.Screen
        name="Agenda"
        component={AgendaScreen}
        options={{ tabBarLabel: 'Agenda' }}
      />
      <Tab.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{ tabBarLabel: 'Chat' }}
      />
      <Tab.Screen
        name="Ganhos"
        component={FinanceScreen}
        options={{ tabBarLabel: 'Ganhos' }}
      />
      <Tab.Screen
        name="Conta"
        component={TechAccountScreen}
        options={{ tabBarLabel: 'Conta' }}
      />
    </Tab.Navigator>
  );
}