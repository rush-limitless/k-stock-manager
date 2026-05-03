import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getProductByBarcode, Product } from '../api/inventory';
import StockMovementModal from '../components/StockMovementModal';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ScanScreen() {
  const navigation = useNavigation<Nav>();
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [searching, setSearching] = useState(false);
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);

  const handleBarcodeScan = useCallback(async ({ data }: { data: string }) => {
    if (!scanning || searching) return;
    setScanning(false);
    setSearching(true);

    try {
      const res = await getProductByBarcode(data);
      setFoundProduct(res.data);
    } catch (e: any) {
      if (e?.response?.status === 404) {
        Alert.alert(
          'Produit inconnu',
          `Code : ${data}\n\nVoulez-vous créer ce produit ?`,
          [
            { text: 'Annuler', style: 'cancel', onPress: () => setScanning(true) },
            {
              text: 'Créer',
              onPress: () => {
                navigation.navigate('AddProduct', { barcode: data });
                setScanning(true);
              },
            },
          ]
        );
      } else {
        Alert.alert('Erreur', 'Impossible de contacter le serveur.', [
          { text: 'OK', onPress: () => setScanning(true) },
        ]);
      }
    } finally {
      setSearching(false);
    }
  }, [scanning, searching, navigation]);

  // Permission non encore demandée
  if (!permission) {
    return <View style={styles.center}><ActivityIndicator color="#6366f1" size="large" /></View>;
  }

  // Permission refusée
  if (!permission.granted) {
    return (
      <View style={styles.center} className="bg-gray-950 px-8">
        <Ionicons name="camera-outline" size={64} color="#4b5563" />
        <Text className="text-white text-xl font-bold mt-6 text-center">Accès caméra requis</Text>
        <Text className="text-gray-400 text-sm mt-3 text-center leading-5">
          K-Stock a besoin d'accéder à votre caméra pour scanner les codes-barres et QR codes.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="mt-8 bg-indigo-600 px-8 py-4 rounded-2xl flex-row items-center"
        >
          <Ionicons name="camera" size={18} color="#fff" />
          <Text className="text-white font-bold ml-2">Autoriser la caméra</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Caméra — active seulement si l'onglet est focus */}
      {isFocused && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanning ? handleBarcodeScan : undefined}
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39', 'upc_a', 'upc_e'] }}
        />
      )}

      {/* Overlay UI */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
        {/* Header */}
        <View className="pt-14 px-6 pb-4">
          <Text className="text-white text-2xl font-bold">Scanner</Text>
          <Text className="text-white/60 text-sm mt-1">Pointez vers un code-barres ou QR code</Text>
        </View>

        {/* Viseur centré */}
        <View className="flex-1 justify-center items-center">
          {searching ? (
            <View className="bg-black/70 rounded-3xl px-8 py-6 items-center">
              <ActivityIndicator size="large" color="#6366f1" />
              <Text className="text-white mt-3 font-medium">Recherche du produit...</Text>
            </View>
          ) : (
            <View style={styles.viewfinder}>
              {/* Coins du viseur */}
              {[
                { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
                { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
                { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
                { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
              ].map((style, i) => (
                <View key={i} style={[styles.corner, style, { borderColor: '#6366f1' }]} />
              ))}
            </View>
          )}
        </View>

        {/* Bas de l'écran */}
        <View className="pb-12 px-6 items-center">
          {!scanning && !searching && (
            <TouchableOpacity
              onPress={() => setScanning(true)}
              className="bg-indigo-600 px-6 py-3 rounded-2xl flex-row items-center"
            >
              <Ionicons name="refresh" size={16} color="#fff" />
              <Text className="text-white font-semibold ml-2">Scanner à nouveau</Text>
            </TouchableOpacity>
          )}
          {scanning && (
            <Text className="text-white/40 text-xs text-center">
              Scan automatique activé
            </Text>
          )}
        </View>
      </View>

      {/* Modale mouvement de stock */}
      {foundProduct && (
        <StockMovementModal
          product={foundProduct}
          onClose={() => { setFoundProduct(null); setScanning(true); }}
          onSuccess={() => { setFoundProduct(null); setScanning(true); }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#030712' },
  viewfinder: {
    width: 240,
    height: 240,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 4,
  },
});
