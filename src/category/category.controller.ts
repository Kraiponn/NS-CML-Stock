import {
  Body,
  CACHE_MANAGER,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Cache } from 'cache-manager';
import { Roles } from 'src/shared/decorators';
import { AccessTokenGuard, RolesGuard } from 'src/shared/guards';
import { EOrderBy } from 'src/shared/utils/enum';
import { CategoryService } from './category.service';
import {
  CategoryCreateDTO,
  CategoryResponseDTO,
  CategoryResponseWithPaginateDTO,
  CategoryUpdateDTO,
} from './dto';
import { IFilterKey } from './interface';

@Controller('categories')
export class CategoryController {
  constructor(private readonly catService: CategoryService) {}

  /************************************************************************************
   * Description     Get categories
   * Route           GET /api/categories
   * Access          Public
   ***********************************************************************************/
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.EMPLOYEE)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getCategories(
    @Query('skey') skey?: string,
    @Query('page', ParseIntPipe) page?: number,
    @Query('pageSize', ParseIntPipe) pageSize?: number,
    @Query('order_by', new ParseEnumPipe(EOrderBy)) order_by?: EOrderBy,
  ): Promise<CategoryResponseWithPaginateDTO> {
    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    const title: IFilterKey = {
      contains: skey ? skey : '',
      mode: 'insensitive',
    };

    const filter = {
      ...(title && { title }),
      ...(order_by && { orderBy: { title: order_by } }),
      ...(startIndex && { skip: startIndex }),
      ...(endIndex && { take: endIndex }),
      ...(page && { page }),
      ...(pageSize && { pageSize }),
    };

    return await this.catService.findCategories(filter);
  }

  /************************************************************************************
   * Description     Get single category
   * Route           GET /api/categories/:id
   * Access          Public
   ***********************************************************************************/
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.EMPLOYEE)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getCategory(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CategoryResponseDTO> {
    return this.catService.findCategory(id);
  }

  /************************************************************************************
   * Description     Create category
   * Route           POST /api/categories
   * Access          Private(Manager, Admin)
   ***********************************************************************************/
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCategory(
    @Body() dto: CategoryCreateDTO,
  ): Promise<CategoryResponseDTO> {
    return this.catService.create(dto);
  }

  /************************************************************************************
   * Description     Update category
   * Route           PUT /api/categories/:id
   * Access          Private(Manager, Admin)
   ***********************************************************************************/
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CategoryUpdateDTO,
  ): Promise<CategoryResponseDTO> {
    return this.catService.update(id, dto);
  }

  /************************************************************************************
   * Description     Delete category
   * Route           DELETE /api/categories/:id
   * Access          Private(Manager, Admin)
   ***********************************************************************************/
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteCategory(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CategoryResponseDTO> {
    return this.catService.delete(id);
  }
}
