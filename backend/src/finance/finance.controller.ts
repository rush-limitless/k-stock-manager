import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FinanceService } from './finance.service';
import { CreateTransactionDto } from './finance.dto';

@ApiTags('Finance')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('finance')
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  @Post('transactions')
  @ApiOperation({ summary: 'Enregistrer une transaction (vente ou dépense)' })
  @ApiResponse({ status: 201, description: 'Transaction enregistrée' })
  create(@Body() dto: CreateTransactionDto) {
    return this.financeService.createTransaction(dto);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Lister les transactions' })
  @ApiQuery({ name: 'type', required: false, enum: ['REVENUE', 'EXPENSE'] })
  getAll(@Query('type') type?: 'REVENUE' | 'EXPENSE') {
    return this.financeService.getTransactions(type);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'KPIs financiers : CA, Marge Brute, Revenu Net, stock bas' })
  @ApiQuery({ name: 'from', required: false, example: '2025-01-01' })
  @ApiQuery({ name: 'to', required: false, example: '2025-12-31' })
  @ApiResponse({ status: 200, description: 'Retourne ca, totalExpenses, cogs, grossMargin, netRevenue, lowStockCount' })
  getDashboard(@Query('from') from?: string, @Query('to') to?: string) {
    return this.financeService.getDashboard(from, to);
  }

  @Get('chart')
  @ApiOperation({ summary: 'Données mensuelles pour graphique (revenus vs dépenses)' })
  @ApiQuery({ name: 'months', required: false, example: 6 })
  getChart(@Query('months') months?: string) {
    return this.financeService.getRevenueChart(months ? parseInt(months) : 6);
  }
}
