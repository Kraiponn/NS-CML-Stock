import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CategoryCreateDTO,
  CategoryResponseDTO,
  CategoryResponseWithPaginateDTO,
  CategoryUpdateDTO,
} from './dto';
import { IFilterGetCategory } from './interface';

@Injectable()
export class CategoryService {
  constructor(private readonly db: PrismaService) {}

  /*************************************************************************************
   * Create new category
   */
  async create(dto: CategoryCreateDTO): Promise<CategoryResponseDTO> {
    const result = await this.db.category.create({
      data: dto,
    });

    if (!result) throw new BadRequestException('Something went wrong');

    return new CategoryResponseDTO({ ...result });
  }

  /*************************************************************************************
   *  Update category
   */
  async update(
    categoryId: number,
    dto: CategoryUpdateDTO,
  ): Promise<CategoryResponseDTO> {
    const category = await this.db.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) throw new NotFoundException('Category not found');

    const result = await this.db.category.update({
      where: { id: categoryId },
      data: dto,
    });

    return new CategoryResponseDTO({ ...result });
  }

  /*************************************************************************************
   *  Remove category
   */
  async delete(categoryId: number): Promise<CategoryResponseDTO> {
    const category = await this.db.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) throw new NotFoundException('Category not found');

    await this.db.category.delete({
      where: { id: categoryId },
    });

    return new CategoryResponseDTO({
      message: 'Successfully deleted category',
    });
  }

  /*************************************************************************************
   *  Get a single category
   */
  async findCategory(categoryId: number): Promise<CategoryResponseDTO> {
    const category = await this.db.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) throw new NotFoundException('Category not found');

    return new CategoryResponseDTO({ ...category });
  }

  /*************************************************************************************
   *  Get categories
   */
  async findCategories(
    filter: IFilterGetCategory,
  ): Promise<CategoryResponseWithPaginateDTO> {
    try {
      const { page, pageSize, title, take, skip, orderBy } = filter;
      const search = title ? { title } : undefined;

      const categoryExists = await this.db.category.findMany({
        where: search,
        orderBy,
        take,
        skip,
      });

      if (!categoryExists) throw new NotFoundException('Category not found');

      const total = await this.db.category.count({ where: search });

      const categories = categoryExists.map(
        (cat) => new CategoryResponseDTO({ ...cat }),
      );

      return new CategoryResponseWithPaginateDTO({
        total,
        categories,
        page,
        pageSize,
      });
    } catch (error) {
      throw new BadRequestException('Something went wrong');
    }
  }
}
