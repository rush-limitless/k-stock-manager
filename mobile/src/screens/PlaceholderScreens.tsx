import React from 'react';
import { View, Text } from 'react-native';

export function ProductsScreen() {
  return (
    <View className="flex-1 bg-gray-950 justify-center items-center">
      <Text className="text-white text-xl font-bold">📦 Produits</Text>
      <Text className="text-gray-500 mt-2">Phase 3 — À venir</Text>
    </View>
  );
}

export function ScanScreen() {
  return (
    <View className="flex-1 bg-gray-950 justify-center items-center">
      <Text className="text-white text-xl font-bold">📷 Scanner</Text>
      <Text className="text-gray-500 mt-2">Phase 3 — À venir</Text>
    </View>
  );
}

export function FinanceScreen() {
  return (
    <View className="flex-1 bg-gray-950 justify-center items-center">
      <Text className="text-white text-xl font-bold">💰 Finances</Text>
      <Text className="text-gray-500 mt-2">Phase 3 — À venir</Text>
    </View>
  );
}
