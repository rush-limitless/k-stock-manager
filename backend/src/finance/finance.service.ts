import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './finance.dto';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  createTransaction(dto: CreateTransactionDto) {
    return this.prisma.transaction.create({ data: dto });
  }

  getTransactions(type?: 'REVENUE' | 'EXPENSE') {
    return this.prisma.transaction.findMany({
      where: type ? { type } : undefined,
      orderBy: { date: 'desc' },
    });
  }

  async getDashboard(from?: string, to?: string) {
    const dateFilter = from && to ? { date: { gte: new Date(from), lte: new Date(to) } } : {};

    const [revenues, expenses, lowStockCount, soldItems] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { type: 'REVENUE', ...dateFilter },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { type: 'EXPENSE', ...dateFilter },
        _sum: { amount: true },
      }),
      this.prisma.product.count({ where: { stockQty: { lte: 5 } } }),
      this.prisma.stockMovement.findMany({
        where: { type: 'OUT', ...(from && to ? { createdAt: { gte: new Date(from), lte: new Date(to) } } : {}) },
        include: { product: { select: { buyPrice: true } } },
      }),
    ]);

    const ca = revenues._sum.amount ?? 0;
    const totalExpenses = expenses._sum.amount ?? 0;
    const cogs = soldItems.reduce((sum, m) => sum + m.product.buyPrice * m.quantity, 0);
    const grossMargin = ca - cogs;
    const netRevenue = ca - totalExpenses;

    return { ca, totalExpenses, cogs, grossMargin, netRevenue, lowStockCount };
  }

  async getRevenueChart(months = 6) {
    const from = new Date();
    from.setMonth(from.getMonth() - months);

    const transactions = await this.prisma.transaction.findMany({
      where: { date: { gte: from } },
      select: { type: true, amount: true, date: true },
      orderBy: { date: 'asc' },
    });

    const grouped: Record<string, { revenue: number; expense: number }> = {};
    for (const tx of transactions) {
      const key = tx.date.toISOString().slice(0, 7); // YYYY-MM
      if (!grouped[key]) grouped[key] = { revenue: 0, expense: 0 };
      if (tx.type === 'REVENUE') grouped[key].revenue += tx.amount;
      else grouped[key].expense += tx.amount;
    }

    return Object.entries(grouped).map(([month, data]) => ({ month, ...data }));
  }
}
