import { IsEnum, IsNumber, IsPositive, IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TxType } from '@prisma/client';

export class CreateTransactionDto {
  @ApiProperty({ enum: TxType, example: 'REVENUE' })
  @IsEnum(TxType)
  type: TxType;

  @ApiProperty({ example: 1500.00 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 'Vente directe' })
  @IsString()
  category: string;

  @ApiPropertyOptional({ example: 'Vente client Dupont' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ example: '2025-06-15T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  date?: string;
}
