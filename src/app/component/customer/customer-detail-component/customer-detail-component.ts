import { log } from '@/utils/logger';
import { Component, OnInit } from '@angular/core';
import { environment } from '@env/environment';
import { LucideAngularModule } from 'lucide-angular';
import { Customer } from '../../../model/customer.model';

@Component({
  selector: 'app-customer-detail-component',
  imports: [LucideAngularModule],
  templateUrl: './customer-detail-component.html',
  styles: ``,
})
export class CustomerDetailComponent implements OnInit {
  customer!: Customer;
  baseUrl = environment.apiBaseUrl;

  ngOnInit(): void {
    this.customer = window.history.state['customer'];
    log('CUSTOMER: ', this.customer);
  }

  handleEdit(customerId: number) {}
  handleViewOrder(customerId: number) {}

  getInitial(name: string | undefined): string {
    if (!name) return '?'; // fallback if no name
    return name.charAt(0).toUpperCase();
  }
}
