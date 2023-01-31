import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from 'src/shared/config';

@Module({
  imports: [MulterModule.register(multerConfig)],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
