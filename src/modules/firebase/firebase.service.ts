import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  async createUser(phoneNumber: string) {
    try {
      const userRecord = await admin.auth().createUser({
        phoneNumber,
      });
      return userRecord.uid;
    } catch (error) {
      throw error;
    }
  }
}

