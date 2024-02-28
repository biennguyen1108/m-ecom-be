// user.entity.ts
import { Checkout } from 'src/modules/checkout/entities/checkout.entity';
import { Products } from 'src/modules/products/entities/products.entity';
import { Users } from 'src/modules/users/entities/users.entity';
import { Entity, ManyToOne,PrimaryGeneratedColumn, Column, OneToOne, JoinColumn,OneToMany ,ManyToMany,JoinTable} from 'typeorm';
import { CartsProducts } from './carts_products.entity';


@Entity()
export class Carts {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  total_price: number;
  
  @Column()
  total_quantity: number;


  @OneToOne(() => Users, user => user.cart)
  @JoinColumn()
  user: Users;

  @OneToMany(() => Checkout, checkout => checkout.cart)
  checkouts: Checkout[];

 
  @OneToMany(()=>CartsProducts , cartsProduct => cartsProduct.cart)
  cartsProduct: CartsProducts[];


  @ManyToMany(() => Products, product => product.cart)
  @JoinTable({
    name: 'carts_products',
    joinColumn: {
      name: 'cartId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'productId',
      referencedColumnName: 'id',
    },
  })
  product: Products[];

}
