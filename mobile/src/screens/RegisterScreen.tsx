import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { register } from '../api/auth';
import { AuthStackParamList } from '../navigation/AppNavigator';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'> };

export default function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) return Alert.alert('Erreur', 'Remplissez tous les champs');
    setLoading(true);
    try {
      await register(name, email, password);
      Alert.alert('Succès', 'Compte créé ! Connectez-vous.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch {
      Alert.alert('Erreur', 'Cet email est déjà utilisé');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-950 justify-center px-6">
      <Text className="text-white text-3xl font-bold mb-2">Créer un compte</Text>
      <Text className="text-gray-400 mb-10">Rejoignez K-Stock Manager</Text>

      <TextInput
        className="bg-gray-800 text-white rounded-xl px-4 py-3 mb-4"
        placeholder="Nom complet"
        placeholderTextColor="#6b7280"
        value={name}
        onChangeText={setName}
      />
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
        placeholder="Mot de passe (min. 6 caractères)"
        placeholderTextColor="#6b7280"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        className="bg-indigo-600 rounded-xl py-4 items-center"
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-base">Créer mon compte</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity className="mt-6 items-center" onPress={() => navigation.navigate('Login')}>
        <Text className="text-gray-400">Déjà un compte ? <Text className="text-indigo-400">Se connecter</Text></Text>
      </TouchableOpacity>
    </View>
  );
}
