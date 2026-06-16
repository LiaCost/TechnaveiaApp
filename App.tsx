import React, { useEffect } from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import { AppNavigator } from './src/navigation';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { StatusBar } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Mantém a splash nativa visível até o app estar pronto
SplashScreen.preventAutoHideAsync();

export default function App() {
  useEffect(() => {
    // Esconde a splash após o primeiro render (navegação carregada)
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <StatusBar barStyle="default" />
        <AppNavigator />
      </AuthProvider>
    </ErrorBoundary>
  );
}