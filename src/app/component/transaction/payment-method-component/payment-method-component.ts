import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentMethod, PaymentRequest, PaymentResponse } from '../../../model/payment.model';
import { OrderRequest, OrderResponse } from '../../../model/order.model';
import { OrderService } from '../../../service/order-service';
import { PaymentService } from '../../../service/payment-service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-payment-method-component',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './payment-method-component.html',
  styles: ``,
})
export class PaymentMethodComponent implements OnInit {
  // Dependencies
  private router = inject(Router);
  private orderService = inject(OrderService);
  private paymentService = inject(PaymentService);

  // Enums
  PaymentMethod = PaymentMethod;

  // Component state
  paymentMethod!: PaymentMethod;
  orderRequest!: OrderRequest;
  totalAmount: number = 0;

  // Form Controls
  accountNumberCtrl = new FormControl('');
  walletIdCtrl = new FormControl('');

  ngOnInit(): void {
    // Retrieve order request from previous page
    this.orderRequest = window.history.state as OrderRequest;

    if (this.orderRequest?.paymentMethod) {
      const methodKey = this.orderRequest.paymentMethod as keyof typeof PaymentMethod;
      this.paymentMethod = PaymentMethod[methodKey];
    }

    // Calculate total on init
    this.totalAmount = this.calculateTotalAmount();
  }

  calculateTotalAmount(): number {
    return (
      this.orderRequest.orderItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0
    );
  }

  processPayment() {
    
    log('processing payment...');
    let paymentRequest: PaymentRequest = {
      paymentMethod: this.paymentMethod,
      amount: this.totalAmount,
      accountNumber: '',
      walletId: ''
    };

    
    if (this.paymentMethod === PaymentMethod.BANK_TRANSFER) {
      paymentRequest.accountNumber = this.accountNumberCtrl.value ?? '';
    } else if (this.paymentMethod === PaymentMethod.DIGITAL_WALLET) {
      paymentRequest.walletId = this.walletIdCtrl.value ?? '';
    }

    log('Payment Request:', paymentRequest);

    // Call payment service
    this.paymentService.simulatePayment(paymentRequest).subscribe({
      next: (paymentResponse: PaymentResponse) => {
        if (paymentResponse.status) {
          log('Payment successful, creating order...');

          // Call order service
          this.orderService.createOrder(this.orderRequest).subscribe({
            next: (orderResponse: OrderResponse) => {
              log('Order created:', orderResponse.orderId);
              if (orderResponse.orderId != null) {
                this.orderService.setOrderResponse(orderResponse);
                this.router.navigate(['orders/summary']);
              }
            },
            error: (err) => error('Order creation failed:', err),
          });
        }
      },
      error: (err) => error('Payment simulation failed:', err),
    });
  }
}
