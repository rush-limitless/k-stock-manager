import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  token: string | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('access_token').then((t) => {
      setToken(t);
      setIsLoading(false);
    });
  }, []);

  const signIn = async (t: string) => {
    await AsyncStorage.setItem('access_token', t);
    setToken(t);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('access_token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
