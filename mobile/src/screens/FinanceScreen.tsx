import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, ActivityIndicator,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTransactions, Transaction } from '../api/finance';

const TYPE_CONFIG = {
  REVENUE: { label: 'Revenu', color: '#10b981', bg: '#052e16', sign: '+', icon: 'arrow-down-circle' as const },
  EXPENSE: { label: 'Dépense', color: '#f43f5e', bg: '#1f0a0e', sign: '-', icon: 'arrow-up-circle' as const },
};

type Filter = 'ALL' | 'REVENUE' | 'EXPENSE';

function TransactionItem({ item }: { item: Transaction }) {
  const cfg = TYPE_CONFIG[item.type];
  const date = new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <View className="bg-gray-900 rounded-2xl p-4 mb-3 border border-gray-800 flex-row items-center">
      <View className="rounded-2xl p-3 mr-4" style={{ backgroundColor: cfg.bg }}>
        <Ionicons name={cfg.icon} size={20} color={cfg.color} />
      </View>

      <View className="flex-1">
        <Text className="text-white font-semibold text-sm" numberOfLines={1}>{item.category}</Text>
        {item.note && (
          <Text className="text-gray-500 text-xs mt-0.5" numberOfLines={1}>{item.note}</Text>
        )}
        <Text className="text-gray-600 text-xs mt-1">{date}</Text>
      </View>

      <View className="items-end ml-3">
        <Text className="font-bold text-base" style={{ color: cfg.color }}>
          {cfg.sign}{item.amount.toLocaleString('fr-FR')}
        </Text>
        <Text className="text-xs mt-0.5" style={{ color: cfg.color + '80' }}>FCFA</Text>
      </View>
    </View>
  );
}

export default function FinanceScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(false);
    try {
      const res = await getTransactions();
      setTransactions(res.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'ALL' ? transactions : transactions.filter((t) => t.type === filter);

  const totalRevenue = transactions.filter((t) => t.type === 'REVENUE').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'ALL', label: 'Tout' },
    { key: 'REVENUE', label: 'Revenus' },
    { key: 'EXPENSE', label: 'Dépenses' },
  ];

  return (
    <View className="flex-1 bg-gray-950">
      {/* Header */}
      <View className="px-6 pt-14 pb-4">
        <Text className="text-white text-2xl font-bold">Finances</Text>
        <Text className="text-gray-500 text-sm mt-1">{transactions.length} transaction{transactions.length > 1 ? 's' : ''}</Text>
      </View>

      {/* Résumé rapide */}
      {!loading && !error && (
        <View className="flex-row px-6 gap-3 mb-4">
          <View className="flex-1 bg-emerald-950 rounded-2xl p-4 border border-emerald-900/40">
            <Text className="text-emerald-400 text-xs mb-1">Total Revenus</Text>
            <Text className="text-emerald-300 font-bold text-base">+{totalRevenue.toLocaleString('fr-FR')}</Text>
            <Text className="text-emerald-600 text-xs">FCFA</Text>
          </View>
          <View className="flex-1 bg-rose-950 rounded-2xl p-4 border border-rose-900/40">
            <Text className="text-rose-400 text-xs mb-1">Total Dépenses</Text>
            <Text className="text-rose-300 font-bold text-base">-{totalExpense.toLocaleString('fr-FR')}</Text>
            <Text className="text-rose-600 text-xs">FCFA</Text>
          </View>
        </View>
      )}

      {/* Filtres */}
      <View className="flex-row px-6 gap-2 mb-4">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              className="px-4 py-2 rounded-xl"
              style={{ backgroundColor: active ? '#6366f1' : '#1f2937', borderWidth: 1, borderColor: active ? '#6366f1' : '#374151' }}
            >
              <Text className="text-sm font-medium" style={{ color: active ? '#fff' : '#9ca3af' }}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="text-gray-500 mt-3">Chargement des transactions...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="cloud-offline-outline" size={48} color="#4b5563" />
          <Text className="text-gray-400 mt-4 text-center">Impossible de charger les transactions.</Text>
          <TouchableOpacity onPress={() => load()} className="mt-4 bg-indigo-600 px-6 py-3 rounded-xl">
            <Text className="text-white font-semibold">Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : filtered.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="receipt-outline" size={48} color="#4b5563" />
          <Text className="text-gray-400 mt-4 text-center">Aucune transaction trouvée.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TransactionItem item={item} />}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#6366f1" />
          }
        />
      )}
    </View>
  );
}
