import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product, moveStock } from '../api/inventory';

type MvtType = 'IN' | 'OUT' | 'ADJUST';

type Props = {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
};

const MVT_OPTIONS: { type: MvtType; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { type: 'IN',     label: 'Entrée',      icon: 'arrow-down-circle', color: '#10b981' },
  { type: 'OUT',    label: 'Sortie',      icon: 'arrow-up-circle',   color: '#f43f5e' },
  { type: 'ADJUST', label: 'Ajustement',  icon: 'swap-horizontal',   color: '#f59e0b' },
];

export default function StockMovementModal({ product, onClose, onSuccess }: Props) {
  const [type, setType] = useState<MvtType>('IN');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const selected = MVT_OPTIONS.find((o) => o.type === type)!;

  const handleConfirm = async () => {
    const qty = parseInt(quantity);
    if (!quantity || isNaN(qty) || qty <= 0) {
      return Alert.alert('Erreur', 'Entrez une quantité valide (> 0).');
    }
    if (type === 'OUT' && qty > product.stockQty) {
      return Alert.alert('Stock insuffisant', `Stock actuel : ${product.stockQty} unités.`);
    }
    setLoading(true);
    try {
      await moveStock({ productId: product.id, type, quantity: qty, reason: reason || undefined });
      onSuccess();
      onClose();
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message ?? 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      >
        <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />

        <View className="bg-gray-900 rounded-t-3xl px-6 pt-5 pb-10 border-t border-gray-800">
          {/* Handle */}
          <View className="w-10 h-1 bg-gray-700 rounded-full self-center mb-5" />

          {/* Produit info */}
          <View className="flex-row justify-between items-start mb-6">
            <View className="flex-1 mr-4">
              <Text className="text-gray-400 text-xs mb-1">Mouvement de stock</Text>
              <Text className="text-white text-lg font-bold" numberOfLines={2}>{product.name}</Text>
              <Text className="text-gray-500 text-xs mt-1">SKU : {product.sku}</Text>
            </View>
            <View className="bg-gray-800 rounded-2xl px-4 py-3 items-center">
              <Text className="text-white text-xl font-bold">{product.stockQty}</Text>
              <Text className="text-gray-500 text-xs">en stock</Text>
            </View>
          </View>

          {/* Sélecteur de type */}
          <Text className="text-gray-400 text-xs uppercase tracking-widest mb-3">Type de mouvement</Text>
          <View className="flex-row gap-3 mb-5">
            {MVT_OPTIONS.map((opt) => {
              const active = type === opt.type;
              return (
                <TouchableOpacity
                  key={opt.type}
                  onPress={() => setType(opt.type)}
                  className="flex-1 rounded-2xl py-3 items-center"
                  style={{
                    backgroundColor: active ? opt.color + '20' : '#111827',
                    borderWidth: 1.5,
                    borderColor: active ? opt.color : '#1f2937',
                  }}
                >
                  <Ionicons name={opt.icon} size={20} color={active ? opt.color : '#4b5563'} />
                  <Text className="text-xs mt-1.5 font-medium" style={{ color: active ? opt.color : '#6b7280' }}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Quantité */}
          <Text className="text-gray-400 text-xs uppercase tracking-widest mb-2">Quantité</Text>
          <TextInput
            className="bg-gray-800 text-white rounded-xl px-4 py-3 mb-4 text-base border border-gray-700"
            placeholder={type === 'ADJUST' ? 'Nouveau stock total' : 'Nombre d\'unités'}
            placeholderTextColor="#4b5563"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />

          {/* Motif */}
          <Text className="text-gray-400 text-xs uppercase tracking-widest mb-2">Motif (optionnel)</Text>
          <TextInput
            className="bg-gray-800 text-white rounded-xl px-4 py-3 mb-6 border border-gray-700"
            placeholder="Ex: Réapprovisionnement fournisseur..."
            placeholderTextColor="#4b5563"
            value={reason}
            onChangeText={setReason}
          />

          {/* Bouton confirmer */}
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={loading}
            className="rounded-2xl py-4 items-center"
            style={{ backgroundColor: selected.color }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View className="flex-row items-center">
                <Ionicons name={selected.icon} size={18} color="#fff" />
                <Text className="text-white font-bold text-base ml-2">
                  Confirmer {selected.label}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
