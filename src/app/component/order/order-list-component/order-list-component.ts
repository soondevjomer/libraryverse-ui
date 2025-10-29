import { Component, OnInit, computed, inject, signal, effect } from '@angular/core';
import { OrderService } from '../../../service/order-service';
import { AuthService } from '../../../service/auth-service';
import { Role } from '../../../model/auth.model';
import { OrderStatus, StoreOrder } from '../../../model/order.model';
import { Page } from '../../../model/page.model';
import { PaginationComponent } from '../../shared/pagination-component/pagination-component';
import { DecimalPipe, NgClass } from '@angular/common';
import { switchMap } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { ToastService } from '../../../service/toast-service';

@Component({
  selector: 'app-order-list-component',
  standalone: true,
  imports: [PaginationComponent, NgClass, DecimalPipe, LucideAngularModule],
  templateUrl: './order-list-component.html',
})
export class OrderListComponent implements OnInit {
  // DEPENDENCIES
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  // SIGNALS
  statusFilter = signal<keyof typeof OrderStatus | 'ALL'>('ALL');
  currentPage = signal(0);
  orders = signal<StoreOrder[]>([]);
  totalPages = signal(1);
  expandedOrders = signal<number[]>([]);
  isLibrarian = computed(() => this.authService._role() === Role.Librarian);
  refreshTrigger = signal(0);

  pageSize = 10;

  orderStatuses: Array<keyof typeof OrderStatus | 'ALL'> = [
    'ALL', 'PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'
  ];

  // Auto-fetch orders whenever filter or page changes
  constructor() {
    effect(() => {
      this.refreshTrigger();
      const status = this.statusFilter();
      const page = this.currentPage();

      this.orderService.getStoreOrders(status, page, this.pageSize).subscribe({
        next: (pageModel: Page<StoreOrder>) => {
          this.orders.set(pageModel.content || []);
          this.totalPages.set(pageModel.totalPage);
          this.currentPage.set(pageModel.pageNumber);
        },
      });
    });
  }

  ngOnInit(): void {}

  // UI methods
  toggleExpand(orderId: number) {
    const list = [...this.expandedOrders()];
    if (list.includes(orderId)) {
      this.expandedOrders.set(list.filter(id => id !== orderId));
    } else {
      this.expandedOrders.set([...list, orderId]);
    }
  }

  isExpanded(orderId: number) {
    return this.expandedOrders().includes(orderId);
  }

  setStatusFilter(status: keyof typeof OrderStatus | 'ALL') {
    this.statusFilter.set(status);
    this.currentPage.set(0); // reset page
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  markAsShipped(id: number) {
    this.orderService.markAsShipped(id).subscribe({
      next:()=>{
        this.toastService.success('Book mark as shipped successfully');
        this.refreshTrigger.update(v=>v+1)
      },
      error:()=>{
        this.toastService.error('Failed the book to mark as shipped');
      }
    });
  }

  markAsDelivered(id: number) {
    this.orderService.markAsDelivered(id).subscribe({
      next:()=>{
        this.toastService.success('Book mark as delivered successfully');
        this.refreshTrigger.update(v=>v+1)
      },
      error:()=>{
        this.toastService.error('Failed the book to mark as delivered');
      }
    });
  }

  cancelOrder(id: number) {
    this.orderService.cancelOrder(id).subscribe({
      next:()=>{
        this.toastService.success('Cancel order successfully');
        this.refreshTrigger.update(v=>v+1)
      },
      error:()=>{
        this.toastService.error('Failed the book to cancel order');
      }
    });
  }

}
