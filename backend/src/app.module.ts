import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { InventoryModule } from './inventory/inventory.module';
import { FinanceModule } from './finance/finance.module';

@Module({
  imports: [PrismaModule, AuthModule, InventoryModule, FinanceModule],
})
export class AppModule {}
