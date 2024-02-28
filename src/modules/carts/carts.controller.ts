import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CartsService } from './carts.service';
import { Carts, CartsProducts } from './entities';
import { updateCartDTO } from './dto/updateCart.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';

@Controller('carts')

export class CartsController {

    constructor(private readonly cartsService: CartsService) { }

    @UseGuards(new RoleGuard(['user']))
    @UseGuards(AuthGuard)
    @Get(':userId')
    async getCartsByUserId(@Param('userId') userId: number) {
        return this.cartsService.getCartsByUserId(userId);
    }

    @UseGuards(new RoleGuard(['user']))
    @UseGuards(AuthGuard)
    @Post('/userId/:userId/productId/:productId')
    async addToCart(@Param('userId') userId: number, @Param('productId') productId: number): Promise<string> {
        return this.cartsService.addToCart(userId, productId);
    }

    @UseGuards(new RoleGuard(['user']))
    @UseGuards(AuthGuard)
    @Patch()
    async updateCart(@Body() updateToCartDTO: updateCartDTO) {
        return await this.cartsService.updateCart(updateToCartDTO);
    }

    @UseGuards(new RoleGuard(['user']))
    @UseGuards(AuthGuard)
    @Delete('remove/:userId/:productId')
    async removeFromCart(@Param('userId') cartId: string, @Param('productId') productId: string): Promise<Carts> {
    const cart = await this.cartsService.removeFromCart(cartId, productId);
    return cart;
    }
}
