import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import {
  ProductCreateDTO,
  ProductResponseDTO,
  ProductResponseWithPaginateDTO,
  ProductUpdateDTO,
} from './dto';

import { AccessTokenGuard, RolesGuard } from 'src/shared/guards';
import { IProductFilter, ISearchKey } from './interface';
import { ProductService } from './product.service';
import { EOrderBy } from 'src/shared/utils/enum';

import { FilesInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { Cache } from 'cache-manager';
import { Roles } from 'src/shared/decorators';
import * as _ from 'lodash';
import { REDIS_CACHE } from 'src/redis-cache.module';

@Controller('products')
export class ProductController {
  constructor(
    @Inject(REDIS_CACHE) private cacheManager: Cache,
    private readonly productService: ProductService,
  ) {}

  /************************************************************************************
   * Description     Create product
   * Route           POST /api/products
   * Access          Private(Manager, Admin)
   ***********************************************************************************/
  @Roles(Role.MANAGER, Role.ADMIN)
  @UseGuards(AccessTokenGuard, RolesGuard)
  @UseInterceptors(FilesInterceptor('avatars', 3))
  @Post()
  async createProduct(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() dto: ProductCreateDTO,
  ): Promise<ProductResponseDTO> {
    return await this.productService.create(files, dto);
  }

  /************************************************************************************
   * Description     Update product
   * Route           PUT /api/products/:id
   * Access          Private(Manager, Admin)
   ***********************************************************************************/
  @Roles(Role.MANAGER, Role.ADMIN)
  @UseGuards(AccessTokenGuard, RolesGuard)
  @UseInterceptors(FilesInterceptor('avatars', 3))
  @Put(':id')
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ProductUpdateDTO,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<ProductResponseDTO> {
    return await this.productService.update(id, dto, files);
  }

  /************************************************************************************
   * Description     Delete product
   * Route           DELETE /api/products/:id
   * Access          Private(Manager, Admin)
   ***********************************************************************************/
  @Roles(Role.MANAGER, Role.ADMIN)
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Delete(':id')
  async deleteProduct(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProductResponseDTO> {
    return await this.productService.delete(id);
  }

  /************************************************************************************
   * Description     Get a product
   * Route           GET /api/products/:id
   * Access          Private(Employee, Manager, Admin)
   ***********************************************************************************/
  @Roles(Role.EMPLOYEE, Role.MANAGER, Role.ADMIN)
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Get(':id')
  async getProduct(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProductResponseDTO> {
    return await this.productService.findById(id);
  }

  /************************************************************************************
   * Description     Get products
   * Route           GET /api/products
   * Access          Private(Employee, Manager, Admin)
   ***********************************************************************************/
  @Roles(Role.EMPLOYEE, Role.MANAGER, Role.ADMIN)
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Get()
  async getProducts(
    @Query('skey') skey?: string,
    @Query('page', ParseIntPipe) page?: number,
    @Query('pageSize', ParseIntPipe) pageSize?: number,
    @Query('min_price', ParseIntPipe) min_price?: number,
    @Query('max_price', ParseIntPipe) max_price?: number,
    @Query('order_by', new ParseEnumPipe(EOrderBy)) order_by?: EOrderBy,
  ): Promise<ProductResponseWithPaginateDTO> {
    const title: ISearchKey = skey
      ? {
          contains: skey,
          mode: 'insensitive',
        }
      : undefined;

    const price =
      min_price || max_price
        ? {
            ...(max_price && { lte: max_price }),
            ...(min_price && { gte: min_price }),
          }
        : undefined;

    const filter: IProductFilter = {
      ...(page && { page }),
      ...(pageSize && { pageSize }),
      ...(title && { title }),
      ...(price && { price }),
      ...(order_by && { orderBy: { title: order_by } }),
    };

    // Cache filter(Search products)
    const cacheProductFilter = await this.cacheManager.get<IProductFilter>(
      'CACHE_PRODUCT_FILTER',
    );

    // Cache products result
    const cacheProducts =
      await this.cacheManager.get<ProductResponseWithPaginateDTO>(
        'CACHE_PRODUCTS',
      );

    if (!cacheProductFilter) {
      await this.cacheManager.set('CACHE_PRODUCT_FILTER', filter);
    }

    if (_.isEqual(filter, cacheProductFilter) && cacheProducts) {
      return cacheProducts;
    }

    // Fetching new products
    const response = await this.productService.findProducts(filter);
    await this.cacheManager.set('CACHE_PRODUCTS', response);
    await this.cacheManager.set('CACHE_PRODUCT_FILTER', filter);

    return response;
  }
}
