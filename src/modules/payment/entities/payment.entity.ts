// payment.entity.ts
import { Checkout } from 'src/modules/checkout/entities/checkout.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany } from 'typeorm';


@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  method: string;

  @OneToMany(() => Checkout, checkout => checkout.payment)
  checkout: Checkout;
}