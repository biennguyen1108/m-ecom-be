// user.entity.ts
import { Carts } from 'src/modules/carts/entities/carts.entity';
import { Roles } from 'src/modules/roles/entities/roles.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne } from 'typeorm';


@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  phoneNumber: string;

  @Column()
  password: string;

  @Column({nullable:true})
  address: string;

  @Column({nullable:true})
  name: string;

  @Column()
  status: string;
  
  @Column({default:null})
  refreshToken: string;

    // mối quan hệ với bảng role
  @ManyToOne(() => Roles, role => role.user)
  @JoinColumn({ name: 'role_id'})
  role: Roles;
    // mối quan hệ với bảng carts
  @OneToOne(() => Carts,cart => cart.user)
  cart: Carts;
}

