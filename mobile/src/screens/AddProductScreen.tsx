import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { createProduct, getLocations, Location } from '../api/inventory';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddProduct'>;
  route: RouteProp<RootStackParamList, 'AddProduct'>;
};

type Field = { label: string; key: string; placeholder: string; numeric?: boolean; optional?: boolean };

const FIELDS: Field[] = [
  { label: 'Nom du produit', key: 'name', placeholder: 'Ex: Perceuse Bosch Pro' },
  { label: 'SKU (référence)', key: 'sku', placeholder: 'Ex: SKU-001' },
  { label: 'Code-barres', key: 'barcode', placeholder: 'Ex: 1234567890123', optional: true },
  { label: "Prix d'achat (FCFA)", key: 'buyPrice', placeholder: '0', numeric: true },
  { label: 'Prix de vente (FCFA)', key: 'sellPrice', placeholder: '0', numeric: true },
  { label: 'Quantité initiale', key: 'stockQty', placeholder: '0', numeric: true },
  { label: "Seuil d'alerte", key: 'minStock', placeholder: '5', numeric: true },
];

function flattenLocations(locs: Location[], depth = 0): { id: string; label: string }[] {
  return locs.flatMap((l) => [
    { id: l.id, label: '  '.repeat(depth) + l.name },
    ...flattenLocations(l.children ?? [], depth + 1),
  ]);
}

export default function AddProductScreen({ navigation, route }: Props) {
  const prefillBarcode = route.params?.barcode ?? '';
  const [form, setForm] = useState<Record<string, string>>({
    name: '', sku: '', barcode: prefillBarcode, buyPrice: '', sellPrice: '', stockQty: '0', minStock: '5',
  });
  const [locationId, setLocationId] = useState('');
  const [locations, setLocations] = useState<{ id: string; label: string }[]>([]);
  const [loadingLocs, setLoadingLocs] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getLocations()
      .then((res) => {
        const flat = flattenLocations(res.data);
        setLocations(flat);
        if (flat.length > 0) setLocationId(flat[0].id);
      })
      .catch(() => Alert.alert('Erreur', 'Impossible de charger les emplacements.'))
      .finally(() => setLoadingLocs(false));
  }, []);

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const required = FIELDS.filter((f) => !f.optional);
    for (const f of required) {
      if (!form[f.key]?.trim()) {
        Alert.alert('Champ manquant', `Le champ "${f.label}" est obligatoire.`);
        return false;
      }
    }
    if (!locationId) {
      Alert.alert('Emplacement manquant', 'Sélectionnez un emplacement.');
      return false;
    }
    if (parseFloat(form.sellPrice) <= parseFloat(form.buyPrice)) {
      Alert.alert('Prix invalide', 'Le prix de vente doit être supérieur au prix d\'achat.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createProduct({
        name: form.name.trim(),
        sku: form.sku.trim(),
        barcode: form.barcode.trim() || undefined,
        buyPrice: parseFloat(form.buyPrice),
        sellPrice: parseFloat(form.sellPrice),
        stockQty: parseInt(form.stockQty),
        minStock: parseInt(form.minStock),
        locationId,
      });
      Alert.alert('✅ Produit créé', `"${form.name}" a été ajouté au stock.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'Une erreur est survenue.';
      Alert.alert('Erreur', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-950">
      {/* Header */}
      <View className="flex-row items-center px-6 pt-14 pb-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 bg-gray-800 p-2 rounded-xl">
          <Ionicons name="arrow-back" size={20} color="#9ca3af" />
        </TouchableOpacity>
        <View>
          <Text className="text-white text-xl font-bold">Nouveau Produit</Text>
          <Text className="text-gray-500 text-xs">Remplissez les informations</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {FIELDS.map((field) => (
            <View key={field.key} className="mb-4">
              <Text className="text-gray-400 text-xs uppercase tracking-widest mb-2">
                {field.label}{field.optional && <Text className="text-gray-600"> (optionnel)</Text>}
              </Text>
              <TextInput
                className="bg-gray-900 text-white rounded-xl px-4 py-3 border border-gray-800 text-sm"
                placeholder={field.placeholder}
                placeholderTextColor="#4b5563"
                keyboardType={field.numeric ? 'numeric' : 'default'}
                value={form[field.key]}
                onChangeText={(v) => set(field.key, v)}
              />
            </View>
          ))}

          {/* Emplacement */}
          <View className="mb-6">
            <Text className="text-gray-400 text-xs uppercase tracking-widest mb-2">Emplacement</Text>
            {loadingLocs ? (
              <View className="bg-gray-900 rounded-xl py-4 items-center border border-gray-800">
                <ActivityIndicator size="small" color="#6366f1" />
              </View>
            ) : locations.length === 0 ? (
              <View className="bg-gray-900 rounded-xl py-4 px-4 border border-rose-900">
                <Text className="text-rose-400 text-sm">Aucun emplacement disponible. Créez-en un d'abord.</Text>
              </View>
            ) : (
              <View className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <Picker
                  selectedValue={locationId}
                  onValueChange={(v) => setLocationId(v)}
                  style={{ color: '#fff', backgroundColor: 'transparent' }}
                  dropdownIconColor="#6b7280"
                >
                  {locations.map((loc) => (
                    <Picker.Item key={loc.id} label={loc.label} value={loc.id} color="#fff" />
                  ))}
                </Picker>
              </View>
            )}
          </View>

          {/* Bouton soumettre */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting || loadingLocs}
            className="bg-indigo-600 rounded-2xl py-4 items-center mb-10"
            style={{ opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text className="text-white font-bold text-base ml-2">Créer le produit</Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
