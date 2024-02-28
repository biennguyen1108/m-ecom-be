import { Injectable, NotFoundException, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carts, CartsProducts } from './entities';
import { Products } from '../products/entities';
import { Users } from '../users/entities';
import { updateCartDTO } from './dto/updateCart.dto';

@Injectable()
export class CartsService {
    constructor(
        @InjectRepository(Carts)
        private readonly cartsRepository: Repository<Carts>,
        @InjectRepository(Products)
        private readonly productsRepository: Repository<Products>,
        @InjectRepository(CartsProducts)
        private readonly cartsProductRepository: Repository<CartsProducts>,
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
    ) {}

    async getCartsByUserId(@Param('userId') userId: number): Promise<Carts[]> {
        const carts = await this.cartsRepository.createQueryBuilder('cart')
            .leftJoinAndSelect('cart.cartsProduct', 'cartsProduct')
            .leftJoinAndSelect('cartsProduct.product', 'product')
            .where('cart.user = :userId', { userId })
            .getMany();
            if (!carts || carts.length === 0) {
                throw new NotFoundException(`No carts found for userId ${userId}`);
            }
        return carts;
    }

    async addToCart(@Param('userId') userId: number, @Param('productId') productId: number): Promise<string> {

        let cart = await this.cartsRepository.createQueryBuilder('cart')
            .where('cart.user = :userId', { userId })
            .getOne();

        let product = await this.productsRepository.createQueryBuilder('product')
            .where('product.id = :productId', { productId })
            .getOne();

        let cartsProduct = await this.cartsProductRepository.createQueryBuilder('cartsProduct')
            .where('cartsProduct.productId = :productId', { productId })
            .getOne();

        if (!cart) {
            // Nếu giỏ hàng chưa tồn tại, tạo giỏ hàng mới
            const user = await this.usersRepository.findOne({ where: { id: userId } });
            cart = new Carts();
            cart.user = user;
            cart.total_price = 0;
            cart.total_quantity = 0;
            await this.cartsRepository.save(cart);

            const cartsProduct = new CartsProducts();
            cartsProduct.cartId = cart.id;
            cartsProduct.productId = productId;
            cartsProduct.quantity = 1;
            await this.cartsProductRepository.save(cartsProduct);

            cart.total_quantity += 1;
            cart.total_price += product.price;
            await this.cartsRepository.save(cart);

            return "Thêm sản phẩm thành công";
        }
        else {
            if (cartsProduct) {
                cartsProduct.quantity += 1
                await this.cartsProductRepository.save(cartsProduct);

                cart.total_price += product.price * cartsProduct.quantity;
                await this.cartsRepository.save(cart);
                return "Thêm sản phẩm thành công";
            }
            else {
                const cartsProduct = new CartsProducts();
                cartsProduct.cartId = cart.id;
                cartsProduct.productId = productId;
                cartsProduct.quantity = 1;
                await this.cartsProductRepository.save(cartsProduct);
                // Cập nhật thông tin của giỏ hàng
                cart.total_quantity += 1;
                cart.total_price += product.price;
                await this.cartsRepository.save(cart)

                return "Thêm sản phẩm thành công";

               
            }

        }
       

    }

    async updateCart(updateCartDTO: updateCartDTO): Promise<Carts> {
        const { userId, productId, operation } = updateCartDTO;

        let cart = await this.cartsRepository.createQueryBuilder('cart')
            .where('cart.user = :userId', { userId })
            .getOne();

        let product = await this.productsRepository.createQueryBuilder('product')
            .where('product.id = :productId', { productId })
            .getOne();

        let cartsProduct = await this.cartsProductRepository.createQueryBuilder('cartsProduct')
            .where('cartsProduct.productId = :productId', { productId })
            .getOne();

        if (operation === 'add') {
            cartsProduct.quantity += 1;
            cart.total_price += product.price;
        } else if (operation === 'remove') {
            cartsProduct.quantity -= 1;
            cart.total_price -= product.price;
        }
        await this.cartsRepository.save(cart);
        await this.cartsProductRepository.save(cartsProduct);

        return cart;
    }

    async removeFromCart(userId: string, productId: string): Promise<Carts> {
        let cart = await this.cartsRepository.createQueryBuilder('cart')
            .where('cart.user = :userId', { userId })
            .getOne();

        let product = await this.productsRepository.createQueryBuilder('product')
            .where('product.id = :productId', { productId })
            .getOne();

            let cartsProduct = await this.cartsProductRepository.createQueryBuilder('cartsProduct')
                .where('cartsProduct.productId = :productId', { productId })
                .andWhere('cartsProduct.cartId = :id', { id :cart.id})
                .getOne();

        if (cartsProduct) {
            await this.cartsProductRepository.remove(cartsProduct);
            cart.total_price -= product.price * cartsProduct.quantity;
            cart.total_quantity -= 1;
            await this.cartsRepository.save(cart);
        }

        return cart;
    }


}
