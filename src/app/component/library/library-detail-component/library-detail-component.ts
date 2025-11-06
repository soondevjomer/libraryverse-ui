import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, Observable, of, tap } from 'rxjs';

import { environment } from '@env/environment';
import { Book } from '../../../model/book.model';
import { Library } from '../../../model/library.model';
import { Page } from '../../../model/page.model';
import { SearchFilter } from '../../../model/search.model';

import { log, error } from '@/utils/logger';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../service/auth-service';
import { BookStoreService } from '../../../service/book-store-service';
import { CartService } from '../../../service/cart-service';
import { LibraryService } from '../../../service/library-service';
import { ToastService } from '../../../service/toast-service';
import { BookCardComponent } from '../../book/book-card-component/book-card-component';
import { PaginationComponent } from '../../shared/pagination-component/pagination-component';

@Component({
  selector: 'app-library-detail-component',
  imports: [AsyncPipe, PaginationComponent, BookCardComponent, LucideAngularModule],
  templateUrl: './library-detail-component.html',
  styles: ``,
})
export class LibraryDetailComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private libraryService = inject(LibraryService);
  private authService = inject(AuthService);
  private bookStore = inject(BookStoreService);
  private cartService = inject(CartService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  // Observables
  library$!: Observable<Library>;
  books$!: Observable<Page<Book>>;

  // UI States
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');

  // Auth and env info
  role = this.authService._role();
  libraryId = Number(this.authService.userClaim?.libraryId);
  isLoggedIn = this.authService.isLoggedIn;
  baseUrl = environment.apiBaseUrl;
  defaultLibraryCover = environment.defaultLibraryCover;

  // Pagination / filter state
  currentPage = 0;
  totalPages = 1;

  filter: SearchFilter = {
    page: 0,
    sortBy: 'CREATED_DATE',
    sortDirection: 'ASC',
  };

  ngOnInit(): void {
    const libraryId = Number(this.activatedRoute.snapshot.paramMap.get('libraryId'));
    if (!libraryId) {
      this.errorMessage.set('Invalid library ID');
      return;
    }

    this.loading.set(true);
    this.library$ = this.loadLibraryById(libraryId);
    this.loadBooks(libraryId);
  }

  private loadLibraryById(libraryId: number): Observable<Library> {
    return this.libraryService.getLibraryById(libraryId).pipe(
      tap(() => this.loading.set(false)),
      catchError((error) => {
        error('Error loading library:', error);
        this.errorMessage.set('Failed to load library.');
        this.loading.set(false);
        return of({} as Library);
      })
    );
  }

  private loadBooks(libraryId: number, page: number = 0) {
    this.loading.set(true);
    this.filter.libraryId = libraryId;
    this.filter.page = page;

    this.books$ = this.bookStore.getBooks(this.filter, true).pipe(
      tap((pageModel) => {
        this.totalPages = pageModel.totalPage;
        this.currentPage = pageModel.pageNumber;
      }),
      finalize(() => this.loading.set(false)),
      catchError((err) => {
        error('Error loading books:', err);
        this.errorMessage.set('Failed to load books.');
        return of({
          content: [],
          totalPage: 0,
          pageNumber: 0,
          totalElement: 0,
          pageSize: 0,
        });
      })
    );
  }

  // HANDLES
  handlePageChange(pageNumber: number) {
    const libraryId = Number(this.activatedRoute.snapshot.paramMap.get('libraryId'));
    if (libraryId) this.loadBooks(libraryId, pageNumber);
  }

  handleOnEdit(library: Library) {
    this.router.navigate(['libraries/edit', library.id], { state: { library:library } });
  }

  handleOnBookEdit(book: Book) {
    log('edit book with id');
    this.router.navigate(['books/edit', book.id], { state: { book } });
  }

  handleOnCopy(book: Book) {
    log('Copying book:', book);
    this.router.navigate(['books/create'], { state: { book } });
  }

  handleOnView(book: Book) {
    this.router.navigate(['books', book.id], { state: { book } });
  }

  handleOnAddToCart(book: Book) {
    if (!this.authService.isLoggedIn()) {
      this.toastService.info('Please log in first');
      this.router.navigate(['login']);
      return;
    }

    this.cartService.addToCart(book.id).subscribe({
      next: () => this.toastService.success('Book added to cart successfully'),
      error: (err) => {
        error('Add to cart failed:', err);
        this.toastService.error('Failed to add book to cart');
      },
    });
  }

  handleOnBuy(book: Book) {
    if (!this.authService.isLoggedIn()) {
      this.toastService.info('Please log in first');
      this.router.navigate(['login']);
      return;
    }

    if (!book.inventory?.availableStock || book.inventory.availableStock <= 0) {
      this.toastService.info('No available stock to buy');
      return;
    }

    const cartRequests = [
      {
        cartId: 0,
        bookId: book.id,
        bookName: book.bookDetail.title,
        price: book.bookDetail.price,
        quantity: 1,
        maxQuantity: book.inventory.availableStock ?? 0,
      },
    ];

    this.router.navigate(['payment'], { state: { selected: cartRequests } });
  }

  backToLibraryList() {
    this.router.navigate(['libraries']);
  }

  formatAuthors(book: Book): string {
    const authors = book.bookDetail?.authors;
    return authors && authors.length ? authors.join(', ') : 'Unknown';
  }

  formatGenres(book: Book): string {
    const genres = book.bookDetail?.genres;
    return genres && genres.length ? genres.join(', ') : 'N/A';
  }
}
