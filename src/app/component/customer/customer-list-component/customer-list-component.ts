import { Component, inject, OnInit } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Page } from '../../../model/page.model';
import { Customer } from '../../../model/customer.model';
import { CustomerService } from '../../../service/customer-service';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { PaginationComponent } from '../../shared/pagination-component/pagination-component';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-customer-list-component',
  imports: [AsyncPipe, PaginationComponent, LucideAngularModule],
templateUrl: './customer-list-component.html',
  styles: ``,
})
export class CustomerListComponent implements OnInit {
  //DEPENDENCIES
  private customerService = inject(CustomerService);
  private router = inject(Router);

  customers$!: Observable<Page<Customer>>;

  ngOnInit(): void {
    this.customers$ = this.loadCustomers();
  }

  loadCustomers(pageNumber?: number) {
    return this.customerService.getCustomerPage({page:pageNumber});
  }

  onView(customer: Customer) {
    console.log('on view this customer: ', customer);
    this.router.navigate(['customers', customer.id], { state: {customer} });
  }

  handlePageChange(pageNumber: number) {
    this.customers$ = this.loadCustomers(pageNumber);
  }
}
