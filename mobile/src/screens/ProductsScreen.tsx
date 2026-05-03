import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, ActivityIndicator,
  TouchableOpacity, RefreshControl, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getProducts, Product } from '../api/inventory';
import StockMovementModal from '../components/StockMovementModal';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function ProductItem({ item, onPress }: { item: Product; onPress: () => void }) {
  const isLow = item.stockQty <= item.minStock;
  const stockColor = isLow ? '#f43f5e' : '#10b981';
  const stockBg = isLow ? '#1f0a0e' : '#052e16';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className="bg-gray-900 rounded-2xl p-4 mb-3 border border-gray-800"
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-3">
          <Text className="text-white font-semibold text-base" numberOfLines={1}>{item.name}</Text>
          <Text className="text-gray-500 text-xs mt-0.5">SKU : {item.sku}</Text>
        </View>
        <View className="rounded-xl px-3 py-1.5 items-center" style={{ backgroundColor: stockBg }}>
          <Text className="font-bold text-sm" style={{ color: stockColor }}>{item.stockQty}</Text>
          <Text className="text-xs" style={{ color: stockColor + 'aa' }}>unités</Text>
        </View>
      </View>

      <View className="flex-row mt-3 gap-3">
        <View className="flex-1 bg-gray-800 rounded-xl px-3 py-2">
          <Text className="text-gray-500 text-xs">Achat</Text>
          <Text className="text-white text-sm font-medium">{item.buyPrice.toLocaleString('fr-FR')} FCFA</Text>
        </View>
        <View className="flex-1 bg-gray-800 rounded-xl px-3 py-2">
          <Text className="text-gray-500 text-xs">Vente</Text>
          <Text className="text-white text-sm font-medium">{item.sellPrice.toLocaleString('fr-FR')} FCFA</Text>
        </View>
        <View className="flex-1 bg-gray-800 rounded-xl px-3 py-2">
          <Text className="text-gray-500 text-xs">Lieu</Text>
          <Text className="text-white text-sm font-medium" numberOfLines={1}>{item.location?.name ?? '—'}</Text>
        </View>
      </View>

      {isLow && (
        <View className="flex-row items-center mt-3 bg-rose-950 rounded-xl px-3 py-2">
          <Ionicons name="warning" size={13} color="#f43f5e" />
          <Text className="text-rose-400 text-xs ml-1.5">Stock bas — seuil : {item.minStock} unités</Text>
        </View>
      )}

      {/* Hint tap */}
      <View className="flex-row items-center justify-end mt-2">
        <Ionicons name="swap-horizontal-outline" size={12} color="#374151" />
        <Text className="text-gray-700 text-xs ml-1">Appuyer pour mouvement de stock</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ProductsScreen() {
  const navigation = useNavigation<Nav>();
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [showLowOnly, setShowLowOnly] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(false);
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Recharger quand on revient de AddProductScreen
  useEffect(() => {
    const unsub = navigation.addListener('focus', () => load());
    return unsub;
  }, [navigation, load]);

  useEffect(() => {
    let list = products;
    if (showLowOnly) list = list.filter((p) => p.stockQty <= p.minStock);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    setFiltered(list);
  }, [search, showLowOnly, products]);

  const lowCount = products.filter((p) => p.stockQty <= p.minStock).length;

  return (
    <View className="flex-1 bg-gray-950">
      {/* Header */}
      <View className="px-6 pt-14 pb-4">
        <Text className="text-white text-2xl font-bold">Produits</Text>
        <Text className="text-gray-500 text-sm mt-1">{products.length} référence{products.length > 1 ? 's' : ''}</Text>
      </View>

      {/* Barre de recherche */}
      <View className="px-6 mb-3">
        <View className="flex-row items-center bg-gray-900 rounded-xl px-4 border border-gray-800">
          <Ionicons name="search" size={16} color="#6b7280" />
          <TextInput
            className="flex-1 text-white py-3 px-3 text-sm"
            placeholder="Rechercher par nom ou SKU..."
            placeholderTextColor="#4b5563"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filtre stock bas */}
      {lowCount > 0 && (
        <View className="px-6 mb-3">
          <TouchableOpacity
            onPress={() => setShowLowOnly(!showLowOnly)}
            className="flex-row items-center rounded-xl px-4 py-2.5"
            style={{ backgroundColor: showLowOnly ? '#7f1d1d' : '#1f2937', borderWidth: 1, borderColor: showLowOnly ? '#f43f5e40' : '#374151' }}
          >
            <Ionicons name="warning" size={14} color="#f43f5e" />
            <Text className="text-rose-400 text-sm ml-2 font-medium">
              {showLowOnly ? 'Voir tout' : `${lowCount} alerte${lowCount > 1 ? 's' : ''} stock bas`}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="text-gray-500 mt-3">Chargement des produits...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="cloud-offline-outline" size={48} color="#4b5563" />
          <Text className="text-gray-400 mt-4 text-center">Impossible de charger les produits.</Text>
          <TouchableOpacity onPress={() => load()} className="mt-4 bg-indigo-600 px-6 py-3 rounded-xl">
            <Text className="text-white font-semibold">Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : filtered.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="cube-outline" size={48} color="#4b5563" />
          <Text className="text-gray-400 mt-4 text-center">
            {search ? 'Aucun produit ne correspond à la recherche.' : 'Aucun produit en stock.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductItem item={item} onPress={() => setSelectedProduct(item)} />
          )}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#6366f1" />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => navigation.navigate('AddProduct')}
        className="absolute bottom-8 right-6 bg-indigo-600 rounded-2xl px-5 py-4 flex-row items-center"
        style={{ shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 }}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text className="text-white font-semibold ml-2">Ajouter</Text>
      </TouchableOpacity>

      {/* Modale mouvement de stock */}
      {selectedProduct && (
        <StockMovementModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSuccess={() => { setSelectedProduct(null); load(); }}
        />
      )}
    </View>
  );
}
