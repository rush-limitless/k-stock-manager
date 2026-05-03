import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, StockMoveDto, CreateLocationDto } from './inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  // --- Products ---
  getProducts(lowStock?: boolean) {
    return this.prisma.product.findMany({
      where: lowStock ? { stockQty: { lte: this.prisma.product.fields.minStock } } : undefined,
      include: { location: true },
      orderBy: { name: 'asc' },
    });
  }

  async getProductByBarcode(barcode: string) {
    const product = await this.prisma.product.findUnique({
      where: { barcode },
      include: { location: true },
    });
    if (!product) throw new NotFoundException('Produit introuvable');
    return product;
  }

  createProduct(dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto, include: { location: true } });
  }

  async updateProduct(id: string, dto: Partial<CreateProductDto>) {
    await this.findProductOrFail(id);
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async deleteProduct(id: string) {
    await this.findProductOrFail(id);
    return this.prisma.product.delete({ where: { id } });
  }

  // --- Stock Movements ---
  async moveStock(userId: string, dto: StockMoveDto) {
    const product = await this.findProductOrFail(dto.productId);

    const delta = dto.type === 'IN' ? dto.quantity : dto.type === 'OUT' ? -dto.quantity : 0;
    const newQty = product.stockQty + delta;

    if (newQty < 0) throw new BadRequestException('Stock insuffisant');

    const [movement] = await this.prisma.$transaction([
      this.prisma.stockMovement.create({
        data: { productId: dto.productId, userId, type: dto.type, quantity: dto.quantity, reason: dto.reason },
      }),
      this.prisma.product.update({
        where: { id: dto.productId },
        data: { stockQty: dto.type === 'ADJUST' ? dto.quantity : newQty },
      }),
    ]);
    return movement;
  }

  getMovements(productId?: string) {
    return this.prisma.stockMovement.findMany({
      where: productId ? { productId } : undefined,
      include: { product: { select: { name: true, sku: true } }, user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  // --- Locations ---
  getLocations() {
    return this.prisma.location.findMany({
      where: { parentId: null },
      include: { children: { include: { children: true } } },
    });
  }

  createLocation(dto: CreateLocationDto) {
    return this.prisma.location.create({ data: dto });
  }

  // --- Helpers ---
  private async findProductOrFail(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Produit introuvable');
    return product;
  }
}
