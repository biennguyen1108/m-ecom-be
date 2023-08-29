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
    return this.checkoutRepository.find();
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
    const redirectUrl = `${process.env.APP_URL_FE}/profile/mybooking`;
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
    const req = https.request(options, res => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers: ${JSON.stringify(res.headers)}`);
      res.setEncoding('utf8');
      res.on('data', async (body) => {
        console.log('Body: ');
        console.log(body);
        console.log('payUrl: ');
        console.log(JSON.parse(body).payUrl);
        const orderId = JSON.parse(body).orderId;
        const cacheKey = orderId;
        console.log('orderId: ', orderId);
        await this.cacheService.set(cacheKey, checkoutData);
      });
      res.on('end', () => {
        console.log('No more data in response.');
      });
    })
    req.on('error', (e) => {
      console.log(`problem with request: ${e.message}`);
    });
    // write data to request body
    console.log("Sending....")
    req.write(requestBody);
    req.end();
  }

  async saveData(saveDataDto: saveDataDto): Promise<any> {
    const { message, orderId } = saveDataDto;
    if (message === "Successful") {
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

