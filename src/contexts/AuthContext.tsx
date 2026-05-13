import React, { createContext, useState, useContext } from 'react';

// Definimos o que o nosso contexto vai compartilhar
interface AuthContextData {
  signed: boolean;
  userToken: string | null;
  userType: 'client' | 'tech' | 'admin' | null;
  signIn: (type: 'client' | 'tech' | 'admin') => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userType, setUserType] = useState<'client' | 'tech' | 'admin' | null>(null);

  // Função para simular o login
  function signIn(type: 'client' | 'tech' | 'admin') {
    setUserToken("token_gerado_pelo_firebase_ou_api");
    setUserType(type);
  }

  // Função para deslogar
  function signOut() {
    setUserToken(null);
    setUserType(null);
  }

  return (
    <AuthContext.Provider value={{ signed: !!userToken, userToken, userType, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para facilitar o uso
export function useAuth() {
  return useContext(AuthContext);
}