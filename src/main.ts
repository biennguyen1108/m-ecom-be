import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';//thêm này cho phần static file
import { NestExpressApplication } from '@nestjs/platform-express';//thêm này cho phần static file
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule,);//thêm này cho phần static file
  const config = new DocumentBuilder()
  .setTitle('Blog APIs')
  .setDescription("List APIs for simple Blog by NXB Dev")
  .setVersion('1.0')
  .addTag('Auth')
  .addTag('Users')
  .addBearerAuth()
  .build();
  const documnent = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documnent);
  app.enableCors();
  app.useStaticAssets(join(__dirname , '..', 'uploads'), {
    index: false,
  });
  const configService = app.get(ConfigService);
  const firebaseConfig = {
    apiKey: configService.get('FIREBASE_API_KEY'),
    authDomain: configService.get('FIREBASE_AUTH_DOMAIN'),
    projectId: configService.get('FIREBASE_PROJECT_ID'),
    storageBucket: configService.get('FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: configService.get('FIREBASE_MESSAGING_SENDER_ID'),
    appId: configService.get('FIREBASE_APP_ID'),
    measurementId: configService.get('FIREBASE_MEASUREMENT_ID'),
  };
  const serviceAccount = require('../serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount), // Thay serviceAccount bằng đường dẫn đến tệp serviceAccountKey.json
  });
  await app.listen(3000);
}
bootstrap();
