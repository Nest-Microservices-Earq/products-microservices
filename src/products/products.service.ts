import { HttpStatus, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit { 
  
  onModuleInit() {
      this.$connect();
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;

    const totalPages = await this.product.count({ where : { available: true } });
    const lastPage = Math.ceil(totalPages / limit);

    return{ 
      data : await this.product.findMany({
        take: limit,
        skip: (page - 1) * limit,
        where: { available: true },
      }),
      meta: {
        total: totalPages,
        page,
        lastPage,
      }
    }
  }

  async findOne(id: number) {
    const product = await this.product.findUnique({
      where: { id, available: true },
    });
    if (!product) {
      throw new RpcException(`Product #${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.product.findUnique({
      where: { id, available: true },
    });
    if (!product) {
      throw new RpcException(`Product #${id} not found`);
    }
    const { id: _, ...data } = updateProductDto;
    return this.product.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: number) {
    await this.product.findUnique({
      where: { id, available: true },
    });
    const product = await this.product.update({
      where: { id },
      data: { available: false },
    });
    return product;
  }

  async validateProducts(ids: number[]) {
    ids = Array.from(new Set(ids));
    const products = await this.product.findMany({
      where: { id: { in: ids }, available: true },
    });
    if (products.length !== ids.length) {
      throw new RpcException({
        message:'Some products are not available',
        status: HttpStatus.BAD_REQUEST,
      });
    }
    return products;
  }
}
