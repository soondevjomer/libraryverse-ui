import { inject, Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { PaymentRequest, PaymentResponse } from '../model/payment.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  // DEPENDENCIES
  private http = inject(HttpClient);

  private baseUrl = environment.apiBaseUrl;  

  simulatePayment(paymentRequest: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.baseUrl}/payments/simulate`, {});
  }
}
