import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IProductCreate, IProductFilter, IProductUpdate } from './interface';
import { ProductResponseDTO, ProductResponseWithPaginateDTO } from './dto';
import * as fsExtra from 'fs-extra';

@Injectable()
export class ProductService {
  constructor(private readonly db: PrismaService) {}

  /*************************************************************************************
   * Create new product
   */
  async create(
    files: Array<Express.Multer.File>,
    dto: IProductCreate,
  ): Promise<ProductResponseDTO> {
    // const product = await this.db.product.create({
    //   data: {
    //     ...dto,
    //     images: {
    //       createMany: {
    //         data: files.map((file) => {
    //           return { url: file.filename };
    //         }),
    //       },
    //     },
    //   },
    // });

    const product = await this.db.product.create({
      data: dto,
    });

    if (files && files.length > 0) {
      const images = files.map((file) => {
        return { url: file.filename, productId: product.id };
      });

      await this.db.productImage.createMany({
        data: images,
      });
    }

    return new ProductResponseDTO({ ...product });
  }

  /*************************************************************************************
   * Update product
   */
  async update(
    id: number,
    dto: IProductUpdate,
    files: Array<Express.Multer.File>,
  ): Promise<ProductResponseDTO> {
    const product = await this.db.product.findUnique({
      where: { id },
    });

    if (!product) throw new NotFoundException('Product not found');

    const newProduct = await this.db.product.update({
      where: { id },
      data: dto,
      include: { images: { select: { id: true, url: true } } },
    });

    if (files && files.length > 0) {
      await this.db.productImage.deleteMany({ where: { productId: id } });

      newProduct.images.map(async (img) => {
        await fsExtra.remove(`./uploads/${img.url}`);
        return true;
      });

      const newImages = files.map((file) => {
        return { url: file.filename, productId: id };
      });

      await this.db.productImage.createMany({
        data: newImages,
      });
    }

    return new ProductResponseDTO({ ...newProduct });
  }

  /*************************************************************************************
   * Delete product
   */
  async delete(id: number): Promise<ProductResponseDTO> {
    const product = await this.db.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!product) throw new NotFoundException('Product not found');

    await this.db.product.delete({
      where: { id },
    });

    if (product.images && product?.images?.length > 0) {
      product.images.map(async (img) => {
        await fsExtra.remove(`./uploads/${img.url}`);
        return true;
      });
    }

    return new ProductResponseDTO({ ...product });
  }

  /*************************************************************************************
   * Find product by id
   */
  async findById(id: number): Promise<ProductResponseDTO> {
    const product = await this.db.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!product) throw new NotFoundException('Product not found');

    return new ProductResponseDTO({ ...product });
  }

  /*************************************************************************************
   * Find products
   */
  async findProducts(
    filter: IProductFilter,
  ): Promise<ProductResponseWithPaginateDTO> {
    const { title, price, page, pageSize, orderBy } = filter;

    const startIndex = (page - 1) * pageSize;
    // const endIndex = page * pageSize;
    const filterConfition =
      title || price
        ? {
            ...(title && { title }),
            ...(price && { price }),
          }
        : undefined;

    const foundProducts = await this.db.product.findMany({
      where: filterConfition,
      orderBy,
      skip: startIndex,
      take: pageSize,
      include: { images: true },
    });

    const total = await this.db.product.count({
      where: filterConfition,
    });

    if (!foundProducts || total <= 0)
      throw new NotFoundException('Product not found');

    const products = foundProducts.map((product) => {
      return new ProductResponseDTO({ ...product });
    });

    return new ProductResponseWithPaginateDTO({
      total,
      page,
      pageSize,
      products,
    });
  }
}
