import { Category } from "src/modules/category/entities";

export class CreateProductDTO {
    product_name: string;
    brand: string;
    category: Category;
    price: number;
    description: string;
    image: string;
    sku: number;
    quantity_inventory: number; 
}