import React from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import { AppNavigator } from './src/navigation';
import { StatusBar } from 'react-native';

export default function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="default" />
      <AppNavigator />
    </AuthProvider>
  );
}