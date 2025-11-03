import { log } from '@/utils/logger';
import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Page } from '../../../model/page.model';
import { LibrarianSale } from '../../../model/sale.model';
import { SaleService } from '../../../service/sale-service';
import { PaginationComponent } from '../../shared/pagination-component/pagination-component';

@Component({
  selector: 'app-sale-list-component',
  imports: [AsyncPipe, DecimalPipe, DatePipe, PaginationComponent],
  templateUrl: './sale-list-component.html',
  styles: ``,
})
export class SaleListComponent implements OnInit {
  //DEPENDENCIES
  private saleService = inject(SaleService);

  sales$!: Observable<LibrarianSale[]>;

  salesPage$!: Observable<Page<LibrarianSale>>;

  ngOnInit(): void {
    this.salesPage$ = this.loadSalesPage();
  }

  loadSalesPage(pageNumber?: number) {
    return this.saleService.getSalesPage({ page: pageNumber });
  }

  handlePageChange(pageNumber: number) {
    log('pagenumber changedd....');
    this.salesPage$ = this.loadSalesPage(pageNumber);
  }
}
