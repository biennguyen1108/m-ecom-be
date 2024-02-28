import { Injectable, NotFoundException } from '@nestjs/common';
import { Payment } from './entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentService {

    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,

    ) { }

    async findAll(): Promise<Payment[]> {
        return this.paymentRepository.find();
      }
    
      async findOne(id: number): Promise<Payment> {
        const payment = await this.paymentRepository.findOne({ where: { id } });
        if (!payment) {
          throw new NotFoundException(`Payment with id ${id} not found`);
        }
        return payment;
      }
}