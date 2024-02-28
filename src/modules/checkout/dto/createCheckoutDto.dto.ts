import { Carts } from "src/modules/carts/entities";
import { Payment } from "src/modules/payment/entities";

export class createCheckoutDto {

    
    Recipient_name: string;

    delivery_address: string;

    Recipient_phone: string;

    userId:number;

    Payment: Payment ;
    
    
    
}