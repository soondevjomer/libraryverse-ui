import { Component, inject, Input, OnInit } from '@angular/core';
import { OrderResponse } from '../../../model/order.model';
import { Router } from '@angular/router';
import { OrderService } from '../../../service/order-service';
import { AsyncPipe, DatePipe } from '@angular/common';
import { PaymentMethod } from '../../../model/payment.model';
import { PaymentMethodDisplayPipe } from '../../../pipe/payment-method-display-pipe';

@Component({
  selector: 'app-order-summary-component',
  imports: [AsyncPipe, DatePipe, PaymentMethodDisplayPipe],
  templateUrl: './order-summary-component.html',
  styles: ``
})
export class OrderSummaryComponent implements OnInit {
  //DEPENDENCIES
  private orderService = inject(OrderService);

  orderSummary$ = this.orderService.order$;

  ngOnInit(): void {
    this.orderService.getOrderResponse();
  }
}
