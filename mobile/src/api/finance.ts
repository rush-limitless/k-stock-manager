import client from './client';

export type DashboardData = {
  ca: number;
  totalExpenses: number;
  cogs: number;
  grossMargin: number;
  netRevenue: number;
  lowStockCount: number;
};

export type Transaction = {
  id: string;
  type: 'REVENUE' | 'EXPENSE';
  amount: number;
  category: string;
  note?: string;
  date: string;
};

export const getDashboardData = (from?: string, to?: string) =>
  client.get<DashboardData>('/finance/dashboard', { params: { from, to } });

export const getTransactions = (type?: 'REVENUE' | 'EXPENSE') =>
  client.get<Transaction[]>('/finance/transactions', { params: type ? { type } : {} });
