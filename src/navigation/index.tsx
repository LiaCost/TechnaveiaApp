import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext'; // Importar o hook

import { AuthStack } from './AuthStack';
import { ClientTabs } from './ClientTabs';
import { TechTabs } from './TechTabs';
import { AdminStack } from './AdminStack';

const RootStack = createNativeStackNavigator();

export function AppNavigator() {
  const { userToken, userType } = useAuth(); // Pega os dados do contexto

  function renderProtectedStack() {
    if (userType === 'tech') return <RootStack.Screen name="TechApp" component={TechTabs} />;
    if (userType === 'admin') return <RootStack.Screen name="AdminApp" component={AdminStack} />;
    return <RootStack.Screen name="ClientApp" component={ClientTabs} />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {userToken === null ? (
          <RootStack.Screen name="Auth" component={AuthStack} />
        ) : (
          renderProtectedStack()
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}