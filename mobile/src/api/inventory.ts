import client from './client';

export type Product = {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  buyPrice: number;
  sellPrice: number;
  stockQty: number;
  minStock: number;
  locationId: string;
  location: { id: string; name: string };
  createdAt: string;
};

export type StockMovePayload = {
  productId: string;
  type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  reason?: string;
};

export const getProducts = (lowStock?: boolean) =>
  client.get<Product[]>('/inventory/products', { params: lowStock ? { lowStock: true } : {} });

export const createProduct = (data: Omit<Product, 'id' | 'location' | 'createdAt'>) =>
  client.post<Product>('/inventory/products', data);

export type Location = {
  id: string;
  name: string;
  parentId?: string;
  children?: Location[];
};

export const moveStock = (data: StockMovePayload) =>
  client.post('/inventory/move', data);

export const getLocations = () =>
  client.get<Location[]>('/inventory/locations');

export const getProductByBarcode = (barcode: string) =>
  client.get<Product>(`/inventory/products/barcode/${encodeURIComponent(barcode)}`);
