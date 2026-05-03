import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InventoryService } from './inventory.service';
import { CreateProductDto, StockMoveDto, CreateLocationDto } from './inventory.dto';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get('products')
  @ApiOperation({ summary: 'Lister tous les produits' })
  @ApiQuery({ name: 'lowStock', required: false, type: Boolean, description: 'Filtrer les produits sous le seuil' })
  @ApiResponse({ status: 200, description: 'Liste des produits avec leur emplacement' })
  getProducts(@Query('lowStock') lowStock?: string) {
    return this.inventoryService.getProducts(lowStock === 'true');
  }

  @Get('products/barcode/:barcode')
  @ApiOperation({ summary: 'Rechercher un produit par code-barres' })
  @ApiResponse({ status: 200, description: 'Produit trouvé' })
  @ApiResponse({ status: 404, description: 'Produit introuvable' })
  getByBarcode(@Param('barcode') barcode: string) {
    return this.inventoryService.getProductByBarcode(barcode);
  }

  @Post('products')
  @ApiOperation({ summary: 'Créer un nouveau produit' })
  @ApiResponse({ status: 201, description: 'Produit créé' })
  createProduct(@Body() dto: CreateProductDto) {
    return this.inventoryService.createProduct(dto);
  }

  @Put('products/:id')
  @ApiOperation({ summary: 'Modifier un produit' })
  @ApiResponse({ status: 200, description: 'Produit mis à jour' })
  updateProduct(@Param('id') id: string, @Body() dto: Partial<CreateProductDto>) {
    return this.inventoryService.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Supprimer un produit' })
  @ApiResponse({ status: 200, description: 'Produit supprimé' })
  deleteProduct(@Param('id') id: string) {
    return this.inventoryService.deleteProduct(id);
  }

  @Post('move')
  @ApiOperation({ summary: 'Enregistrer un mouvement de stock (IN / OUT / ADJUST)' })
  @ApiResponse({ status: 201, description: 'Mouvement enregistré, stock mis à jour' })
  @ApiResponse({ status: 400, description: 'Stock insuffisant' })
  moveStock(@Request() req, @Body() dto: StockMoveDto) {
    return this.inventoryService.moveStock(req.user.id, dto);
  }

  @Get('movements')
  @ApiOperation({ summary: 'Historique des mouvements de stock' })
  @ApiQuery({ name: 'productId', required: false, description: 'Filtrer par produit' })
  getMovements(@Query('productId') productId?: string) {
    return this.inventoryService.getMovements(productId);
  }

  @Get('locations')
  @ApiOperation({ summary: 'Arborescence des emplacements (Entrepôt > Zone > Étagère)' })
  getLocations() {
    return this.inventoryService.getLocations();
  }

  @Post('locations')
  @ApiOperation({ summary: 'Créer un emplacement' })
  createLocation(@Body() dto: CreateLocationDto) {
    return this.inventoryService.createLocation(dto);
  }
}
