import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, ActivityIndicator,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../store/AuthContext';
import { getDashboardData, DashboardData } from '../api/finance';

type KpiCard = {
  label: string;
  key: keyof DashboardData;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  prefix?: string;
  suffix?: string;
  alert?: boolean;
};

const KPI_CARDS: KpiCard[] = [
  { label: "Chiffre d'Affaires", key: 'ca', icon: 'trending-up', color: '#6366f1', prefix: '' },
  { label: 'Revenu Net', key: 'netRevenue', icon: 'wallet', color: '#10b981', prefix: '' },
  { label: 'Dépenses Totales', key: 'totalExpenses', icon: 'receipt', color: '#f43f5e', prefix: '' },
  { label: 'Alertes Stock', key: 'lowStockCount', icon: 'warning', color: '#f59e0b', alert: true },
];

const fmt = (val: number, prefix = '', suffix = '') =>
  `${prefix}${val.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}${suffix}`;

export default function DashboardScreen() {
  const { signOut } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(false);
    try {
      const res = await getDashboardData();
      setData(res.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <View className="flex-1 bg-gray-950">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 pt-14 pb-4">
        <View>
          <Text className="text-gray-400 text-sm">Bienvenue sur</Text>
          <Text className="text-white text-2xl font-bold">K-Stock Manager</Text>
        </View>
        <TouchableOpacity onPress={signOut} className="bg-gray-800 p-2 rounded-xl">
          <Ionicons name="log-out-outline" size={22} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="text-gray-500 mt-3">Chargement des données...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="cloud-offline-outline" size={48} color="#4b5563" />
          <Text className="text-gray-400 mt-4 text-center">Impossible de charger les données.</Text>
          <TouchableOpacity onPress={() => load()} className="mt-4 bg-indigo-600 px-6 py-3 rounded-xl">
            <Text className="text-white font-semibold">Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-6"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#6366f1" />}
          showsVerticalScrollIndicator={false}
        >
          {/* Section KPIs */}
          <Text className="text-gray-400 text-xs uppercase tracking-widest mb-4">Vue d'ensemble</Text>
          <View className="flex-row flex-wrap gap-3 mb-6">
            {KPI_CARDS.map((card) => {
              const value = data ? data[card.key] : 0;
              const isAlert = card.alert && value > 0;
              return (
                <View
                  key={card.key}
                  className="rounded-2xl p-4 flex-1"
                  style={{ minWidth: '45%', backgroundColor: isAlert ? '#451a03' : '#111827', borderWidth: 1, borderColor: isAlert ? '#f59e0b40' : '#1f2937' }}
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="rounded-xl p-2" style={{ backgroundColor: card.color + '20' }}>
                      <Ionicons name={card.icon} size={18} color={card.color} />
                    </View>
                    {isAlert && (
                      <View className="bg-amber-500 rounded-full w-2 h-2 mt-1" />
                    )}
                  </View>
                  <Text className="text-white text-xl font-bold">
                    {card.alert
                      ? `${value} produit${value > 1 ? 's' : ''}`
                      : `${fmt(value as number)} FCFA`}
                  </Text>
                  <Text className="text-gray-500 text-xs mt-1">{card.label}</Text>
                </View>
              );
            })}
          </View>

          {/* Section Marges */}
          <Text className="text-gray-400 text-xs uppercase tracking-widest mb-4">Détail financier</Text>
          <View className="bg-gray-900 rounded-2xl p-5 mb-6 border border-gray-800">
            {[
              { label: 'Marge Brute', value: data?.grossMargin ?? 0, color: '#10b981' },
              { label: 'Coût des ventes (COGS)', value: data?.cogs ?? 0, color: '#f43f5e' },
            ].map((row) => (
              <View key={row.label} className="flex-row justify-between items-center py-3 border-b border-gray-800 last:border-0">
                <Text className="text-gray-400 text-sm">{row.label}</Text>
                <Text className="font-semibold text-sm" style={{ color: row.color }}>
                  {fmt(row.value)} FCFA
                </Text>
              </View>
            ))}
          </View>

          <View className="h-8" />
        </ScrollView>
      )}
    </View>
  );
}
