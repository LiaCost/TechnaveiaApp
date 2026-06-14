import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SplashScreen }            from '../screens/auth/SplashScreen';
import { LoginScreen }             from '../screens/auth/LoginScreen';
import { RegisterScreen }          from '../screens/auth/RegisterScreen';
import { ForgotPasswordScreen }    from '../screens/auth/ForgotPasswordScreen';
import { VerificationCodeScreen }  from '../screens/auth/VerificationCodeScreen';
import { ResetPasswordScreen }     from '../screens/auth/ResetPasswordScreen';

// ─── Tipos de parâmetros por rota ─────────────────────────
// Isso elimina o ({ navigation }: any) em todas as telas de auth

export type AuthStackParamList = {
  Splash:             undefined;
  Login:              undefined;
  Register:           undefined;
  ForgotPassword:     undefined;
  VerificationCode:   { email: string };
  ResetPassword:      { resetToken: string; email: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash"           component={SplashScreen} />
      <Stack.Screen name="Login"            component={LoginScreen} />
      <Stack.Screen name="Register"         component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword"   component={ForgotPasswordScreen} />

      {/* ✅ Essas duas estavam faltando e causariam crash em runtime */}
      <Stack.Screen name="VerificationCode" component={VerificationCodeScreen} />
      <Stack.Screen name="ResetPassword"    component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}