import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../../service/book-service';
import { catchError, Observable, of, switchMap, tap } from 'rxjs';
import { Book } from '../../../model/book.model';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { AuthService } from '../../../service/auth-service';
import { Role } from '../../../model/auth.model';
import { CartService } from '../../../service/cart-service';
import { ToastService } from '../../../service/toast-service';
import { Cart } from '../../../model/cart.model';
import { environment } from '@env/environment';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-book-detail-component',
  imports: [AsyncPipe, DecimalPipe, LucideAngularModule],
  templateUrl: './book-detail-component.html',
  styles: ``,
})
export class BookDetailComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private bookService = inject(BookService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private toastService = inject(ToastService);

  baseUrl = environment.apiBaseUrl;
  role = this.authService._role();
  Role = Role;

  // Signals
  loading = signal<boolean>(false);

  // Observable book stream
  book$!: Observable<Book>;

  ngOnInit(): void {
    const bookId = Number(this.activatedRoute.snapshot.paramMap.get('bookId'));
    const cachedBook = window.history.state['book'] as Book | undefined;

    this.loading.set(true);

  // Start with cachedBook if available, then fetch the latest
    this.book$ = (
      cachedBook
        ? of(cachedBook).pipe(
            // show cached immediately
            tap(() => log('Showing cached book')),
            switchMap(() =>
              this.bookService.getBookById(bookId).pipe(
                // then always fetch latest
                tap((latestBook) => log('Fetched latest from backend', latestBook)),
                catchError((err) => {
                  this.toastService.info('No book found');
                  return of(cachedBook); // fallback to cached if API fails
                })
              )
            )
          )
        : this.bookService.getBookById(bookId).pipe(
            // if no cache, fetch directly
            tap((latestBook) => log('Fetched book from backend (no cache)', latestBook)),
            catchError((err) => {
              this.toastService.info('No book found');
              return of({} as Book);
            })
          )
    ).pipe(tap(() => this.loading.set(false)));
  }

  backToBookList() {
    this.router.navigate(['books']);
  }

  handleOnAddToCart(bookId: number) {
    this.cartService
      .addToCart(bookId)
      .pipe(tap(() => log('Adding to cart from book detail')))
      .subscribe({
        next: () => this.toastService.success('Book add to cart successfully'),
        error: () => this.toastService.error('Failed add to cart the book'),
      });
  }

  handleOnEdit(bookId: number) {
    this.router.navigate(['books/edit', bookId]);
  }

  handleOnBuy(book: Book) {
    const buyRequest: Cart[] = [
      {
        bookId: book.id,
        bookName: book.bookDetail.title,
        price: book.bookDetail.price,
        quantity: book.inventory?.availableStock ? 1 : 0,
        maxQuantity: book.inventory?.availableStock ?? 0,
      },
    ];
    this.router.navigate(['payment'], { state: { selected: buyRequest } });
  }
}
