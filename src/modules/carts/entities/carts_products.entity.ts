// carts-products.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn, PrimaryColumn } from 'typeorm';
import { Carts } from './carts.entity';
import { Products } from 'src/modules/products/entities/products.entity';

@Entity()
export class CartsProducts {
  push(cartsProduct: CartsProducts) {
      throw new Error('Method not implemented.');
  }
  @PrimaryColumn({ name: 'cartId' })
  cartId: number;

  @PrimaryColumn({ name: 'productId' })
  productId: number;
  
  @Column({ default: 1 }) 
  quantity: number;


  @ManyToOne(() => Carts, cart => cart.cartsProduct)
  @JoinColumn({ name: "cartId", referencedColumnName: 'id' })
  cart: Carts;
 
  @ManyToOne(() => Products, product => product.cartsProducts)
  @JoinColumn({ name: "productId", referencedColumnName: 'id' })
  product: Products;
  
}

