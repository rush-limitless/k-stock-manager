import { IsString, IsNumber, IsOptional, IsPositive, Min, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MvtType } from '@prisma/client';

export class CreateProductDto {
  @ApiProperty({ example: 'Perceuse Bosch' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'SKU-001' })
  @IsString()
  sku: string;

  @ApiPropertyOptional({ example: '1234567890123' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ example: 45.99 })
  @IsNumber()
  @IsPositive()
  buyPrice: number;

  @ApiProperty({ example: 89.99 })
  @IsNumber()
  @IsPositive()
  sellPrice: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  stockQty: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(0)
  minStock: number;

  @ApiProperty({ example: 'uuid-de-la-location' })
  @IsString()
  locationId: string;
}

export class StockMoveDto {
  @ApiProperty({ example: 'uuid-du-produit' })
  @IsString()
  productId: string;

  @ApiProperty({ enum: MvtType, example: 'IN' })
  @IsEnum(MvtType)
  type: MvtType;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiPropertyOptional({ example: 'Réapprovisionnement fournisseur' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreateLocationDto {
  @ApiProperty({ example: 'Entrepôt Principal' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'uuid-parent' })
  @IsOptional()
  @IsString()
  parentId?: string;
}
