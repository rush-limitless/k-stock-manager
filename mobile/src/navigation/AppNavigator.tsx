import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../store/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AddProductScreen from '../screens/AddProductScreen';
import TabNavigator from './TabNavigator';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  AddProduct: { barcode?: string } | undefined;
  Login: undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#030712', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#6366f1" size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen
            name="AddProduct"
            component={AddProductScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
