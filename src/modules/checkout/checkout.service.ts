import { Inject, Injectable } from '@nestjs/common';
import { createCheckoutDto } from './dto/createCheckoutDto.dto';
import { Checkout } from './entities';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, getConnection } from 'typeorm';
import * as crypto from 'crypto';
import axios from 'axios';
import { Carts, CartsProducts } from '../carts/entities';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { saveDataDto } from './dto/saveData.dto';
import { Products } from '../products/entities';
import * as https from 'https';
@Injectable()
export class CheckoutService {

  constructor(
    @InjectRepository(Checkout)
    private readonly checkoutRepository: Repository<Checkout>,
    @InjectRepository(Carts)
    private readonly cartsRepository: Repository<Carts>,
    @InjectRepository(Products)
    private readonly productsRepository: Repository<Products>,
    @InjectRepository(CartsProducts)
    private readonly cartsProductsRepository: Repository<CartsProducts>,


    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
  ) { }


  async findAll(): Promise<Checkout[]> {
   const checkout = await this.checkoutRepository
   .createQueryBuilder('checkout')
   .leftJoinAndSelect('checkout.payment','payment')
   .leftJoinAndSelect('checkout.cart','cart')
   .leftJoinAndSelect('cart.user','user')
   .getMany()
   return checkout;
  }

  async generateQRCode(checkoutDto: createCheckoutDto): Promise<any> {
    const { Recipient_name, delivery_address, Recipient_phone, userId, Payment } = checkoutDto;
    let cart = await this.cartsRepository.createQueryBuilder('cart')
      .where('cart.user = :userId', { userId })
      .getOne();
    const CartId = cart.id
    const amount_cart = cart.total_price;
    const checkoutData = {
      Recipient_name,
      delivery_address,
      Recipient_phone,
      CartId,
      Payment,
      amount_cart

    };



    const partnerCode = process.env.MOMO_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;
    const orderInfo = " thanh toán qua momo ";
    const amount = amount_cart;
    const orderId = Date.now().toString(); // Generate a unique order ID
    const redirectUrl = `${process.env.APP_URL_FE}/homepage`;
    const ipnUrl = 'https://momo.vn';
    const requestId = Date.now().toString(); // Generate a unique request ID
    const requestType = 'captureWallet';
    const extraData = '';
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');
    //json object send to MoMo endpoint
    const requestBody = JSON.stringify({
      partnerCode: partnerCode,
      accessKey: accessKey,
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      extraData: extraData,
      requestType: requestType,
      signature: signature,
      lang: 'en'
    });
    //Create the HTTPS objects
    const https = require('https');
    const options = {
      hostname: 'test-payment.momo.vn',
      port: 443,
      path: '/v2/gateway/api/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    }
    //Send the request and get the response
    const payURL = await new Promise((resolve, reject) => {
      const req = https.request(options, res => {
        res.on('data', async (body) => {
          const orderId = JSON.parse(body).orderId;
          const cacheKey = orderId;
          console.log('orderId: ', orderId);
          await this.cacheService.set(cacheKey, checkoutData);
          const payUrl = JSON.parse(body).payUrl;
          console.log('payUrl:', payUrl);
          resolve(payUrl);
        });
      });

      req.on('error', error => {
        reject(error);
      });

      req.write(requestBody);
      req.end();
    });

    return payURL;
}

  async saveData(saveDataDto: saveDataDto): Promise<any> {
    const { message, orderId } = saveDataDto;
    if (message === "Successful.") {
      const cacheKey = orderId;
      const cachedData = await this.cacheService.get(cacheKey);
      if (cachedData) {
        const checkout = new Checkout();
        checkout.Recipient_name = cachedData['Recipient_name'];
        checkout.delivery_address = cachedData['delivery_address'];
        checkout.Recipient_phone = cachedData['Recipient_phone'];
        checkout.payment = cachedData['Payment']
        checkout.amount = cachedData['amount_cart']
        checkout.cart = cachedData['CartId']
        await this.checkoutRepository.save(checkout);

        const cartId = cachedData['CartId'];
        
        const cartItems = await this.cartsProductsRepository
          .createQueryBuilder('cartsProduct')
          .where('cartsProduct.cartId = :cartId', { cartId })
          .getMany();
        const productIds = cartItems.map(item => item.productId);
        const products = await this.productsRepository.find({
          where: { id: In(productIds) },
        });
        for (const product of products) {
          const cartItem = cartItems.find(item => item.productId === product.id);

          if (cartItem) {
            product.quantity_inventory -= cartItem.quantity;
            product.quantity_sold += cartItem.quantity;
          }
        }
        await this.productsRepository.save(products);
      

      await this.cartsProductsRepository
        .createQueryBuilder()
        .delete()
        .where('cartId = :cartId', { cartId })
        .execute();


      await this.cartsRepository
        .createQueryBuilder()
        .update(Carts)
        .set({ total_quantity: 0, total_price: 0 })
        .where('id = :cartId', { cartId })
        .execute();
      return "Thanh toán thành công";
    }

  }
}

}

