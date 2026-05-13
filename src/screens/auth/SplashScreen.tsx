// src/screens/SplashScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { theme, colors } from '../../theme';

export function SplashScreen({ navigation }: any) {
  React.useEffect(() => {
    setTimeout(() => {
      navigation.replace('Login');
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      {/* Forçamos o ícone da bateria/hora a ficar escuro já que o fundo é claro */}
      <StatusBar barStyle="dark-content" /> 
      
      <Text style={styles.logo}>
        TECH<Text style={styles.naveia}>NAVEIA</Text>
      </Text>
      <View style={styles.line} />
      <Text style={styles.subtitle}>Tecnologia no sangue.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light, // Fundo claro #E8EEFF
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.dark1, // Texto escuro #0C0C0F
    letterSpacing: -1,
  },
  naveia: {
    color: colors.primary, // Ciano #00C2FF
  },
  line: {
    width: 40,
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginVertical: 10,
  },
  subtitle: {
    color: colors.dark3,
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 2,
  }
});