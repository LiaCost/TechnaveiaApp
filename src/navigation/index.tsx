import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme';

import { AuthStack } from './AuthStack';
import { AdminStack } from './AdminStack';
import { ClientStack } from './ClientStack';
import { TechStack } from './TechStack';

const RootStack = createNativeStackNavigator();

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.light }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export function AppNavigator() {
  const { userToken, userType, isLoading } = useAuth();

  // Enquanto verifica sessão salva, exibe tela de carregamento
  if (isLoading) return <LoadingScreen />;

  function renderProtectedStack() {
    if (userType === 'tech') return <RootStack.Screen name="TechApp" component={TechStack} />;
    if (userType === 'admin') return <RootStack.Screen name="AdminApp" component={AdminStack} />;
    return <RootStack.Screen name="ClientApp" component={ClientStack} />;
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