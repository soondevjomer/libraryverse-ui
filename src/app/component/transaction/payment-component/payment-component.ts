import { Component, inject, OnInit, effect, signal } from '@angular/core';
import { Cart, MyCart } from '../../../model/cart.model';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentMethod, PaymentRequest } from '../../../model/payment.model';
import { PaymentService } from '../../../service/payment-service';
import { OrderService } from '../../../service/order-service';
import { OrderItem, OrderRequest } from '../../../model/order.model';
import { JsonPipe } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ɵInternalFormsSharedModule,
} from '@angular/forms';
import { Customer } from '../../../model/customer.model';
import { ToastService } from '../../../service/toast-service';
import { AuthService } from '../../../service/auth-service';

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

  address:string = this.authService.userClaim?.address ?? '';
  contactNumber:string = this.authService.userClaim?.contactNumber ?? '';

  ngOnInit(): void {
    this.buildPaymentForm();
    this.selected = window.history.state['selected'] ?? [];
    console.log('SELECTED: ', this.selected);
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
    console.log('Creating order...', orderRequest);

    this.orderService.createOrder(orderRequest).subscribe({
      next: (response) => {
        this.orderService.setOrderResponse(response);
        console.log('Order created successfully:', response);
        console.log('Order placed successfully!');
        this.router.navigate(['orders/summary']);
      },
      error: (err) => {
        console.error('Error creating order:', err);
        console.error('Something went wrong while creating order.');
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
      console.log('Buying...');

      if (paymentMethod === 'COD') {
        console.log('Payment Method is COD');
        this.createOrderCall();
      } else {
        console.log('Payment Method is BANK/WALLET');
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
