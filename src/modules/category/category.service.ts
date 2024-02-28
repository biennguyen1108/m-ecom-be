import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Category } from './entities';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';


import { Products } from '../products/entities';
import { AddCategoryDTO } from './dto/addCategory.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Category)
    private readonly productRepository: Repository<Products>,
  ) { }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: {
        delete_at: IsNull(),
      },
    });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: {
        id,
        delete_at: IsNull(),
      },
    });
    
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    

    return category;
  }

  async addCategory(addCategoryDTO: AddCategoryDTO): Promise<Category> {
    const category = this.categoryRepository.create(addCategoryDTO);
    return await this.categoryRepository.save(category);
  }

  async update(id: number, category: Category): Promise<Category> {
    const existingCategory = await this.categoryRepository.findOne({ where: { id } });
    if (!existingCategory) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    // Update the category fields based on the received data
    existingCategory.category_name = category.category_name;

    return this.categoryRepository.save(existingCategory);
  }

  async remove(id: number): Promise<void> {
    
    const category = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.products', 'product')
      .where('category.id = :id', { id })
      .getOne();
      
    
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    if (category.products.length === 0) {
      category.delete_at = new Date();
      await this.categoryRepository.save(category);
    } else {
    const hasActiveProducts = category.products.some( product => product.status === 'active' && product.product_availability === 'selling');
    console.log(hasActiveProducts,"hasActiveProducts ")
    if (hasActiveProducts) {
      throw new BadRequestException('Cannot delete category with active products');
    }   

      category.delete_at = new Date();
      await this.categoryRepository.save(category);
  
      
      const productIds = category.products.map(product => product.id);
  
      await this.productRepository
        .createQueryBuilder()
        .update(Products)
        .set({ category: null }) // Soft delete marker
        .where('id IN (:...productIds)', { productIds }) // Use IN operator with product IDs
        .execute();

  }
  }
}

