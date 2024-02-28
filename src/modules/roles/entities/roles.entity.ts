//role.entity.ts
import { Users } from 'src/modules/users/entities/users.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany } from 'typeorm';

@Entity()
export class Roles {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nameRole: string;

  @OneToMany(() => Users, user => user.role)
  user: Users[];
}