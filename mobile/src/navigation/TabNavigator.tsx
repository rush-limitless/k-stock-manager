import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/DashboardScreen';
import ProductsScreen from '../screens/ProductsScreen';
import ScanScreen from '../screens/ScanScreen';
import FinanceScreen from '../screens/FinanceScreen';

const Tab = createBottomTabNavigator();

type IoniconsName = keyof typeof Ionicons.glyphMap;

const tabIcon = (name: IoniconsName, activeName: IoniconsName) =>
  ({ color, focused }: { color: string; focused: boolean }) => (
    <Ionicons name={focused ? activeName : name} size={22} color={color} />
  );

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor: '#1e293b',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#475569',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Accueil', tabBarIcon: tabIcon('home-outline', 'home') }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{ title: 'Produits', tabBarIcon: tabIcon('cube-outline', 'cube') }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{ title: 'Scanner', tabBarIcon: tabIcon('scan-outline', 'scan') }}
      />
      <Tab.Screen
        name="Finance"
        component={FinanceScreen}
        options={{ title: 'Finances', tabBarIcon: tabIcon('bar-chart-outline', 'bar-chart') }}
      />
    </Tab.Navigator>
  );
}
