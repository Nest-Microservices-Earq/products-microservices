import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern({ cmd: 'create_product' })
  async create(@Payload() createProductDto: CreateProductDto) {
    return await this.productsService.create(createProductDto);
  }

  @MessagePattern({ cmd: 'find_all_products' })
  async findAll(@Payload() paginationDto: PaginationDto) {
    return await this.productsService.findAll(paginationDto);
  }

  @MessagePattern({ cmd: 'find_one_product' })
  findOne(@Payload('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(+id);
  }

  @MessagePattern({ cmd: 'update_product' })
  update(@Payload() updateProductDto: UpdateProductDto) {
    return this.productsService.update(updateProductDto.id, updateProductDto);
  }

  @MessagePattern({ cmd: 'remove_product' })
  remove(@Payload('id', ParseIntPipe) id: number) {
    return this.productsService.remove(+id);
  }
}
