import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../service/auth-service';
import { catchError, Observable, of, tap } from 'rxjs';
import { LibraryStat } from '../../../model/library.model';
import { BookService } from '../../../service/book-service';
import { LibraryService } from '../../../service/library-service';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { CustomerCountAndTopStat } from '../../../model/customer.model';
import { CustomerService } from '../../../service/customer-service';
import { SaleService } from '../../../service/sale-service';
import { SaleStat } from '../../../model/sale.model';
import { OrderStat } from '../../../model/order.model';
import { OrderService } from '../../../service/order-service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-dashboard-component',
  imports: [AsyncPipe, DecimalPipe, LucideAngularModule],
  templateUrl: './dashboard-component.html',
  styles: ``,
})
export class DashboardComponent implements OnInit {
  //DEPENDECIES
  private authService = inject(AuthService);
  private libraryService = inject(LibraryService);
  private customerService = inject(CustomerService);
  private saleService = inject(SaleService);
  private orderService = inject(OrderService);

  claim = this.authService.userClaim;
  loadingLibraryStat = false;
  loadingCustomerStat = false;
  loadingSaleStat = false;
  loadingOrderStat = false;
  errorMessage = '';

  libraryStat$!: Observable<LibraryStat>;
  customerStat$!: Observable<CustomerCountAndTopStat>;
  saleStat$!: Observable<SaleStat>;
  orderStat$!: Observable<OrderStat>;

  ngOnInit(): void {
    this.loadLibraryStats();
    this.loadCustomerStats();
    this.loadSaleStats();
    this.loadOrderStats();
  }

  loadLibraryStats() {
    this.loadingLibraryStat = true;
    this.libraryStat$ = this.libraryService.getLibraryStat().pipe(
      tap(() => (this.loadingLibraryStat = false)),
      catchError((error) => {
        console.error('Error loading book: ', error);
        this.errorMessage = 'Failed to load book stat.';
        this.loadingLibraryStat = false;
        return of({} as LibraryStat);
      })
    );
  }

  loadCustomerStats() {
    this.loadingCustomerStat = true;
    this.customerStat$ = this.customerService.getCustomerCountAndTopStat().pipe(
      tap(() => (this.loadingCustomerStat = false)),
      catchError((error) => {
        console.error('Error loading customer: ', error);
        this.errorMessage = 'Failed to load customer stat.';
        this.loadingCustomerStat = false;
        return of({} as CustomerCountAndTopStat);
      })
    );
  }

  loadSaleStats() {
    this.loadingSaleStat = true;
    this.saleStat$ = this.saleService.getSaleStat().pipe(
      tap(() => (this.loadingSaleStat = false)),
      catchError((error) => {
        console.error('Error loading sales: ', error);
        this.errorMessage = 'Failed to load sales stat.';
        this.loadingSaleStat = false;
        return of({} as SaleStat);
      })
    );
  }

  loadOrderStats() {
    this.loadingOrderStat = true;
    this.orderStat$ = this.orderService.getOrderStat().pipe(
      tap(() => (this.loadingOrderStat = false)),
      catchError((error) => {
        console.error('Error loading sales: ', error);
        this.errorMessage = 'Failed to load sales stat.';
        this.loadingOrderStat = false;
        return of({} as OrderStat);
      })
    );
  }
}
