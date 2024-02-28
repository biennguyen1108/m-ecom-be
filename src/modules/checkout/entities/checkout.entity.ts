// checkout.entity.ts
import { Carts } from 'src/modules/carts/entities/carts.entity';
import { Payment } from 'src/modules/payment/entities/payment.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne,OneToOne ,JoinColumn, CreateDateColumn} from 'typeorm';

@Entity()
export class Checkout {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  date_of_payment: Date;

  @Column()
  Recipient_name: string;

  @Column()
  delivery_address: string;

  @Column()
  Recipient_phone: string;

  @Column({ default: null })
  amount:number;

  @ManyToOne(() => Carts, cart => cart.checkouts)
  cart: Carts;

  @ManyToOne(() => Payment,payment=>payment.checkout)
  payment: Payment;

}
