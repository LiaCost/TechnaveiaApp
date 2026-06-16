import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY   = '@technaveia:session';
const TOKEN_KEY     = '@technaveia:token'; // chave usada pelo cliente HTTP em api.

interface User {
  id: string;
  nome: string;
  email: string;
  foto?: string;
  cidade?: string;
}

interface AuthContextData {
  signed: boolean;
  isLoading: boolean;
  userToken: string | null;
  userType: 'client' | 'tech' | 'admin' | null;
  user: User | null;
  signIn: (token: string, type: 'client' | 'tech' | 'admin', userData: User) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userType, setUserType] = useState<'client' | 'tech' | 'admin' | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Recupera sessão salva ao abrir o app
  useEffect(() => {
    async function loadSession() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const session = JSON.parse(raw);
          setUserToken(session.token);
          setUserType(session.type);
          setUser(session.user);
          // Re-registra push notifications ao reabrir o app
          import('../services/pushNotifications')
            .then(m => m.setupPushNotifications())
            .catch(() => {});
        }
      } catch (e) {
        console.warn('Erro ao recuperar sessão:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, []);

 async function signIn(token: string, type: 'client' | 'tech' | 'admin', userData: User) {
  const session = { token, type, user: userData };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  await AsyncStorage.setItem(TOKEN_KEY, token);
  setUserToken(token);
  setUserType(type);
  setUser(userData);

  // Registra push notifications após login (não bloqueia)
  import('../services/pushNotifications')
    .then(m => m.setupPushNotifications())
    .catch(() => {});
}

async function signOut() {
  await AsyncStorage.removeItem(STORAGE_KEY);
  await AsyncStorage.removeItem(TOKEN_KEY);
  setUserToken(null);
  setUserType(null);
  setUser(null);
}

  // Detecta logout forçado (token removido pelo interceptor HTTP 401)
  useEffect(() => {
    if (!userToken) return;
    const interval = setInterval(async () => {
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
      if (!storedToken && userToken) {
        setUserToken(null);
        setUserType(null);
        setUser(null);
      }
    }, 5000); // Verifica a cada 5 segundos
    return () => clearInterval(interval);
  }, [userToken]);


  return (
    <AuthContext.Provider value={{
      signed: !!userToken,
      isLoading,
      userToken,
      userType,
      user,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}