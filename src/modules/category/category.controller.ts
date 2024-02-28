import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from './entities';
import { AddCategoryDTO } from './dto/addCategory.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';


@Controller('category')
export class CategoryController {

constructor(private readonly categoryService: CategoryService){}

  
  @Get()
  async findAll() {
    return this.categoryService.findAll();
  }

  
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.categoryService.findOne(id);
  }

  @UseGuards(new RoleGuard(['marketing','admin']))
  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() addCategoryDTO: AddCategoryDTO) {
    const category = await this.categoryService.addCategory(addCategoryDTO);
    return   category ;
  }

  @UseGuards(new RoleGuard(['admin','marketing']))
  @UseGuards(AuthGuard)
  @Put(':id')
  async update(@Param('id') id: number, @Body() category: Category) {
    return this.categoryService.update(id, category);
  }

  @UseGuards(new RoleGuard(['admin','marketing']))
  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteCategory(@Param('id') id: number): Promise<void> {
    await this.categoryService. remove(id);
  }


}
