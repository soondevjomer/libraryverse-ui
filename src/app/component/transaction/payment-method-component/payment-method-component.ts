import { log, error } from '@/utils/logger';
import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderRequest, OrderResponse } from '../../../model/order.model';
import { PaymentMethod, PaymentRequest, PaymentResponse } from '../../../model/payment.model';
import { OrderService } from '../../../service/order-service';
import { PaymentService } from '../../../service/payment-service';
import { ToastService } from '@/service/toast-service';
import { LucideAngularModule } from 'lucide-angular';
@Component({
  selector: 'app-payment-method-component',
  imports: [ReactiveFormsModule, DecimalPipe, LucideAngularModule],
  templateUrl: './payment-method-component.html',
  styles: ``,
})
export class PaymentMethodComponent implements OnInit {
  // Dependencies
  private router = inject(Router);
  private orderService = inject(OrderService);
  private paymentService = inject(PaymentService);
  private toastService = inject(ToastService);

  // Enums
  PaymentMethod = PaymentMethod;

  // Component state
  paymentMethod!: PaymentMethod;
  methodKey!:keyof typeof PaymentMethod;
  orderRequest!: OrderRequest;
  totalAmount: number = 0;

  // Form Controls
  accountNumberCtrl = new FormControl('');
  walletIdCtrl = new FormControl('');

  // Signals
  loading = signal(false);

  ngOnInit(): void {
    // Retrieve order request from previous page
    this.orderRequest = window.history.state as OrderRequest;

    if (this.orderRequest?.paymentMethod) {
      this.methodKey = this.orderRequest.paymentMethod as keyof typeof PaymentMethod;
      this.paymentMethod = PaymentMethod[this.methodKey];
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
    log('paymentMethod: ', this.paymentMethod);
    log('Payment method: ', PaymentMethod[this.methodKey]);
    if (this.methodKey=='BANK_TRANSFER' && !this.accountNumberCtrl.value) {
      this.toastService.info('Please fill up your account number');
      return;
    }
    if (this.methodKey=='DIGITAL_WALLET' && !this.walletIdCtrl.value) {
      this.toastService.info('Please fill up your wallet id');
      return;
    }
    this.loading.set(true);
    log('processing payment...');
    let paymentRequest: PaymentRequest = {
      paymentMethod: this.paymentMethod,
      amount: this.totalAmount,
      accountNumber: '',
      walletId: '',
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
                this.loading.set(false);
                this.router.navigate(['orders/summary']);
              }
            },
            error: (err) => {
              error('Order creation failed:', err);
              this.loading.set(false);
            },
          });
        }
      },
      error: (err) => {
        error('Payment simulation failed:', err);
        this.loading.set(false);
      },
    });
  }
}
