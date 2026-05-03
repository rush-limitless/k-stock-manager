import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { login } from '../api/auth';
import { useAuth } from '../store/AuthContext';
import { AuthStackParamList } from '../navigation/AppNavigator';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'> };

export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Erreur', 'Remplissez tous les champs');
    setLoading(true);
    try {
      const { data } = await login(email, password);
      await signIn(data.access_token);
    } catch {
      Alert.alert('Erreur', 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-950 justify-center px-6">
      <Text className="text-white text-3xl font-bold mb-2">K-Stock</Text>
      <Text className="text-gray-400 mb-10">Connectez-vous à votre espace</Text>

      <TextInput
        className="bg-gray-800 text-white rounded-xl px-4 py-3 mb-4"
        placeholder="Email"
        placeholderTextColor="#6b7280"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        className="bg-gray-800 text-white rounded-xl px-4 py-3 mb-6"
        placeholder="Mot de passe"
        placeholderTextColor="#6b7280"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        className="bg-indigo-600 rounded-xl py-4 items-center"
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-base">Se connecter</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity className="mt-6 items-center" onPress={() => navigation.navigate('Register')}>
        <Text className="text-gray-400">Pas de compte ? <Text className="text-indigo-400">S'inscrire</Text></Text>
      </TouchableOpacity>
    </View>
  );
}
