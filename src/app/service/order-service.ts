import { log } from '@/utils/logger';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  OrderRequest,
  OrderResponse,
  OrderStat,
  OrderStatus,
  StoreOrder,
} from '../model/order.model';
import { Page } from '../model/page.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  // DEPENDENCIES
  private http = inject(HttpClient);

  private baseUrl = environment.apiBaseUrl;
  private orderSubject = new BehaviorSubject<OrderResponse | null>(null);
  order$ = this.orderSubject.asObservable();

  // METHODS
  setOrderResponse(orderResponse: OrderResponse) {
    this.orderSubject.next(orderResponse);
    localStorage.setItem('lastOrder', JSON.stringify(orderResponse));
  }
  getOrderResponse() {
    const orderResponse = localStorage.getItem('lastOrder');
    if (orderResponse) this.orderSubject.next(JSON.parse(orderResponse));
  }

  // APIS
  createOrder(orderRequest: OrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.baseUrl}/orders/create`, orderRequest);
  }

  markAsShipped(storeOrderId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/orders/markAsShipped/${storeOrderId}`, {});
  }

  cancelOrder(storeOrderId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/orders/cancel/${storeOrderId}`, {});
  }

  markAsDelivered(storeOrderId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/orders/markAsDelivered/${storeOrderId}`, {});
  }

  getStoreOrdersOfLibrary(): Observable<Page<StoreOrder>> {
    return this.http.get<Page<StoreOrder>>(`${this.baseUrl}/orders`);
  }

  getOrderStat(): Observable<OrderStat> {
    return this.http.get<OrderStat>(`${this.baseUrl}/storeOrders/stat/orders`);
  }

  getStoreOrders(
    status?: keyof typeof OrderStatus | string,
    page: number = 0,
    size: number = 10
  ): Observable<Page<StoreOrder>> {
    log('store order status: ', status);
    let params = new HttpParams()
      .set('page', page ?? 0)
      .set('size', size ?? 10)
      .set('status', status ?? 'ALL');

    return this.http.get<Page<StoreOrder>>(`${this.baseUrl}/orders`, { params });
  }
}
