import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { getProductsDto } from './dto/getProductsDto.dto';
import { CreateProductDTO } from './dto/CreateProduct.dto';
import { Products } from './entities/products.entity';
import { UpdateProductDTO } from './dto/UpdateProduct.dto';
import { ProductDTO } from './dto/Product.dto';
import { successException } from '../Exception/succesExeption';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Products)
    private productsRepository: Repository<Products>,
  ){}

  async searchProducts(searchDto: getProductsDto): Promise<Products[]> {
    const query = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.delete_At IS NULL')
      .andWhere('product.status = :status', { status: 'active' })
    if (searchDto.productName) {
      query.andWhere('LOWER(product.product_name) LIKE LOWER(:productName)', { productName: `%${searchDto.productName}%` });
    }
    if (searchDto.categoryId !== undefined) {
      query.andWhere('category.id = :categoryId', { categoryId: searchDto.categoryId });
    }
    if (searchDto.sortByPrice) {
      query.orderBy('product.price', searchDto.sortByPrice);
    }
    if (searchDto.sortByQuantitySold) {
      query.orderBy('product.quantity_sold', searchDto.sortByQuantitySold);
    }
    return query.getMany();
  }

  // Tìm sản phẩm theo ID
  async findById(id: number): Promise<ProductDTO> {
    const product = await this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.id = :id', { id })
      .andWhere('product.delete_At IS NULL')
      .getOne();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const productDTO: ProductDTO = {
      id: product.id,
      product_name: product.product_name,
      brand: product.brand,
      price: product.price,
      product_availability: product.product_availability,
      sku: product.sku,
      quantity_inventory: product.quantity_inventory,
      status: product.status,
      delete_At: product.delete_At,
      quantity_sold: product.quantity_sold,
      image: product.image,
      description: product.description,
      category: product.category, 
    };

    return productDTO;
  }
  
  // Thêm sản phẩm
  async createProduct(createProductDTO: CreateProductDTO): Promise<ProductDTO>  {
    const product = new ProductDTO();
    product.product_name = createProductDTO.product_name;
    product.brand = createProductDTO.brand;
    product.category = createProductDTO.category;
    product.price = createProductDTO.price;
    product.product_availability = 'selling'
    product.description = createProductDTO.description;
    product.image = createProductDTO.image;
    product.sku = createProductDTO.sku;
    product.quantity_inventory = createProductDTO.quantity_inventory;
    product.status = 'active';
    product.delete_At = null;
    product.quantity_sold = 0;

    return await this.productsRepository.save(product);
  }

  // Cập nhật sản phẩm theo ID
  async updateProduct(id: number, updateProductDTO: UpdateProductDTO): Promise<ProductDTO> {
    const product = await this.productsRepository.findOne({ where: { id, delete_At: null } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found or already deleted`);
    }
    const updateFields = updateProductDTO;
    if (updateFields.delete_At === null) {
      product.delete_At = null; 
      product.product_availability = 'selling';
      product.status = 'active'
    }
    if (
      product.status === 'inactive' &&
      product.product_availability === 'selling' && 
      product.delete_At !== null
    ) {
      throw new NotFoundException('Cannot update product with ceased, inactive status, and deleted product');
    }
    // Perform the updates for other fields
    product.product_name = updateFields.product_name ?? product.product_name;
    product.quantity_sold = updateFields.quantity_sold ?? product.quantity_sold;
    product.quantity_inventory = updateFields.quantity_inventory ?? product.quantity_inventory;
    product.status = updateFields.status ?? product.status;
    product.delete_At = updateFields.delete_At ? new Date(updateFields.delete_At) : product.delete_At;
    product.brand = updateFields.brand ?? product.brand;
    product.category = updateFields.category ?? product.category;
    product.product_availability = updateFields.product_availability ?? product.product_availability;
    product.price = updateFields.price ?? product.price;
    product.description = updateFields.description ?? product.description;
    product.image = updateFields.image ?? product.image;
    product.sku = updateFields.sku ?? product.sku;
  
    return await this.productsRepository.save(product);
  }
  
  // Xóa sản phẩm theo ID
  async deleteProduct(id: number): Promise<void> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    product.delete_At = new Date();
    await this.productsRepository.save(product);
    throw new successException('Delete Product Succesfull');
  }
}

