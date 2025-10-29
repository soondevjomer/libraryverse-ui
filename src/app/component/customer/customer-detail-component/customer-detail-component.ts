import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Customer } from '../../../model/customer.model';
import { LucideAngularModule } from 'lucide-angular';
import { environment } from '../../../environment/environment';

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
    console.log('CUSTOMER: ', this.customer);
  }

  handleEdit(customerId: number) {}
  handleViewOrder(customerId: number) {}

  getInitial(name: string | undefined): string {
    if (!name) return '?'; // fallback if no name
    return name.charAt(0).toUpperCase();
  }
}
