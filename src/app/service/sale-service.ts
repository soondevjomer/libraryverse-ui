import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { Observable } from 'rxjs';
import { LibrarianSale, SaleStat } from '../model/sale.model';
import { Page } from '../model/page.model';

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  //DEPENDENCIES
  private http = inject(HttpClient);

  private baseUrl = environment.apiBaseUrl;

  getSalesOfLibrary(): Observable<LibrarianSale[]> {
    return this.http.get<LibrarianSale[]>(`${this.baseUrl}/storeOrders`);
  }

  getSaleStat(): Observable<SaleStat> {
    return this.http.get<SaleStat>(`${this.baseUrl}/storeOrders/stat/sales`);
  }

  getSalesPage(options?: {
    page?: number;
    size?: number;
    genre?: string;
title?: string;
  }): Observable<Page<LibrarianSale>> {
    let params = new HttpParams();

    if (options?.page !== undefined) params = params.set('page', options.page);
    if (options?.size !== undefined) params = params.set('size', options.size);
    if (options?.genre) params = params.set('genre', options.genre);
    if (options?.title) params = params.set('title', options.title);

    return this.http.get<Page<LibrarianSale>>(`${this.baseUrl}/storeOrders`, { params });
  }
}
