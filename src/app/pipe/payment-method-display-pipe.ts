import { Pipe, PipeTransform } from '@angular/core';
import { PaymentMethod } from '../model/payment.model';

@Pipe({
  name: 'paymentMethodDisplay'
})
export class PaymentMethodDisplayPipe implements PipeTransform {

  transform(value: keyof typeof PaymentMethod | string | null): string {
    console.log('payment method pipe value: ', value);
    if (!value) return 'Unknown';

    const key = value as keyof typeof PaymentMethod;
    return PaymentMethod[key] ?? 'Unknown';
  }

}
