import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../environment/environment';
import { Page } from '../model/page.model';
import { MyCart } from '../model/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // DEPENDENCIES
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;
  
  // API CALL
   addToCart(bookId: number) {
    return this.http.post(`${this.baseUrl}/carts/${bookId}`, null);
  }

  removeFromCart(bookId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/carts/${bookId}`);
  }

  clearCart(): Observable<any> {
  return this.http.delete(`${this.baseUrl}/carts/clear`);
  }

  getCartsPage(options?: {
    page?: number;
    size?: number;
    genre?: string;
    title?: string;
  }): Observable<Page<MyCart>> {

    let params = new HttpParams();

    if (options?.page !== undefined) params = params.set('page', options.page);
    if (options?.size !== undefined) params = params.set('size', options.size);
    if (options?.genre) params = params.set('genre', options.genre);
    if (options?.title) params = params.set('title', options.title);

    return this.http.get<Page<MyCart>>(`${this.baseUrl}/carts`, { params });
  }

  getMyCart(): Observable<MyCart[]> {
    return this.http.get<MyCart[]>(`${this.baseUrl}/carts`);
  }

  removeCart(cartId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/carts/${cartId}`);
  }
}
