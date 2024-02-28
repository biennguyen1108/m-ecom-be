import { IsNotEmpty } from "class-validator";
import { Category } from "src/modules/category/entities";

export class ProductDTO {
    id: number;
    product_name: string;
    brand: string;
    price: number;
    product_availability: string;
    sku: number;
    quantity_sold: number;
    quantity_inventory: number; 
    status: string;
    delete_At: Date;
    image: string;
    description: string;
    category: Category;
}