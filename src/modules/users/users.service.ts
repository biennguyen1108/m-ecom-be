import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './entities';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/updateUser.dto';
import { successException } from '../Exception/succesExeption';


@Injectable()
export class UsersService {
  findOneByPhoneNumber(adminPhoneNumber: string) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}
  
  async getAllUsers(): Promise<Users[]> {
    return await this.usersRepository.find({ where: { status: 'active' } , relations: ['role'],});
  }

  async getUserById(id: number): Promise<Users> {
    const user = await this.usersRepository.findOne({ where: { id, status: 'active' }, relations: ['role'], });
    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    return user;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<Users> {
    const user = await this.usersRepository.findOne({ where: { id } });
  
    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    if (user.status === 'inactive' && Object.keys(updateUserDto).some(field => field !== 'status')) {
      throw new BadRequestException('User is inactive');
    }
    if (updateUserDto.password) {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      updateUserDto.password = hashedPassword;
    }
    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user);
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({where: { id } })
    if (!user){
      throw new NotFoundException('User not found');
    }
    user.status = 'inactive';
    await this.usersRepository.save(user);
    throw new successException('Delete Product Succesfull');
  }
  
  async findByPhoneNumber(phoneNumber: string): Promise<Users | undefined> {
    return this.usersRepository.findOne({ where: { phoneNumber } });
  }

  async create(user: Partial<Users>): Promise<Users> {
    const newUser = this.usersRepository.create(user);
    return this.usersRepository.save(newUser);
  }
}
