import { HttpException, HttpStatus } from '@nestjs/common';

export class successException extends HttpException {
  constructor(message: string) {
    super({ message }, HttpStatus.OK);
  }
}