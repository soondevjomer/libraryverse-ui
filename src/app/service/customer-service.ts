import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Page } from '../model/page.model';
import { Observable } from 'rxjs';
import { Customer, CustomerCountAndTopStat } from '../model/customer.model';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  //DEPENDENCIES
  private http = inject(HttpClient);

  private baseUrl = environment.apiBaseUrl;

  getCustomerPage(options?: {
    page?: number;
    size?: number;
    genre?: string;
    title?: string;
  }): Observable<Page<Customer>> {
    let params = new HttpParams();

    if (options?.page !== undefined) params = params.set('page', options.page);
    if (options?.size !== undefined) params = params.set('size', options.size);
    if (options?.genre) params = params.set('genre', options.genre);
    if (options?.title) params = params.set('title', options.title);

    return this.http.get<Page<Customer>>(`${this.baseUrl}/customers`, { params });
  }

  getCustomerCountAndTopStat(): Observable<CustomerCountAndTopStat> {
    return this.http.get<CustomerCountAndTopStat>(`${this.baseUrl}/storeOrders/stat/customer`);
  }
}
