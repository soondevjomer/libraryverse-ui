import { log, error } from '@/utils/logger';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Cart } from '../../../model/cart.model';
import { OrderItem, OrderRequest } from '../../../model/order.model';
import { PaymentMethod } from '../../../model/payment.model';
import { AuthService } from '../../../service/auth-service';
import { OrderService } from '../../../service/order-service';
import { ToastService } from '../../../service/toast-service';

@Component({
  selector: 'app-payment-component',
  imports: [ReactiveFormsModule],
  templateUrl: './payment-component.html',
  styles: ``,
})
export class PaymentComponent implements OnInit {
  // DEPENDENCIES
  private activatedRoute = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private orderService = inject(OrderService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toastService = inject(ToastService);

  // SIGNALS
  submitted = signal<boolean>(false);

  // DATA
  selected: Cart[] = [];

  PaymentMethod = PaymentMethod;
  paymentForm!: FormGroup;

  paymentMethodCtrl = new FormControl(PaymentMethod.COD);
  paymentMethodKeys = Object.keys(PaymentMethod) as Array<keyof typeof PaymentMethod>;

  address: string = this.authService.userClaim?.address ?? '';
  contactNumber: string = this.authService.userClaim?.contactNumber ?? '';

  ngOnInit(): void {
    this.buildPaymentForm();
    this.selected = window.history.state['selected'] ?? [];
    log('SELECTED: ', this.selected);
  }

  buildPaymentForm() {
    this.paymentForm = this.fb.group({
      address: [this.address, Validators.required],
      contactNumber: [this.contactNumber, Validators.required],
      paymentMethod: ['COD'],
    });
  }

  get totalBooks(): number {
    return this.selected.reduce((sum, cart) => sum + cart.quantity, 0);
  }

  get totalAmount(): number {
    return this.selected.reduce((sum, cart) => sum + cart.price * cart.quantity, 0);
  }

  createOrderCall() {
    const orderRequest = this.createOrderRequest();
    log('Creating order...', orderRequest);

    this.orderService.createOrder(orderRequest).subscribe({
      next: (response) => {
        this.orderService.setOrderResponse(response);
        log('Order created successfully:', response);
        log('Order placed successfully!');
        this.router.navigate(['orders/summary']);
      },
      error: (err) => {
        error('Error creating order:', err);
        error('Something went wrong while creating order.');
      },
    });
  }

  handleBuy() {
    if (!this.paymentForm.valid) {
      this.toastService.info('Please fill up required fields');
      this.submitted.set(true);
      return;
    }
    if (this.selected.length == 0) {
      this.toastService.info('You got no selected book to buy');
      return;
    }
    const paymentMethod = this.paymentForm.get('paymentMethod')
      ?.value as keyof typeof PaymentMethod;

    if (this.selected != null && paymentMethod != null) {
      log('Buying...');

      if (paymentMethod === 'COD') {
        log('Payment Method is COD');
        this.createOrderCall();
      } else {
        log('Payment Method is BANK/WALLET');
        this.router.navigate(['payment/process'], {
          state: this.createOrderRequest(),
        });
      }
    }
  }

  createOrderRequest(): OrderRequest {
    const paymentMethod = this.paymentForm.get('paymentMethod')
      ?.value as keyof typeof PaymentMethod;

    return {
      address: this.paymentForm.get('address')?.value,
      contactNumber: this.paymentForm.get('contactNumber')?.value,
      paymentMethod,
      orderItems: this.selected.map(
        (cart) =>
          ({
            bookId: cart.bookId,
            quantity: cart.quantity,
            price: cart.price,
          } as OrderItem)
      ),
    };
  }
}
