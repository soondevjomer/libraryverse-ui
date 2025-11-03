import { Pipe, PipeTransform } from '@angular/core';
import { PaymentMethod } from '../model/payment.model';
import { log } from '@/utils/logger';

@Pipe({
  name: 'paymentMethodDisplay',
})
export class PaymentMethodDisplayPipe implements PipeTransform {
  transform(value: keyof typeof PaymentMethod | string | null): string {
    log('payment method pipe value: ', value);
    if (!value) return 'Unknown';

    const key = value as keyof typeof PaymentMethod;
    return PaymentMethod[key] ?? 'Unknown';
  }
}
