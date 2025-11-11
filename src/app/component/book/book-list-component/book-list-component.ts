import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { debounceTime, distinctUntilChanged, finalize, Observable, tap } from 'rxjs';
import { AsyncPipe, CurrencyPipe, JsonPipe, NgClass } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Book } from '../../../model/book.model';
import { Page } from '../../../model/page.model';
import { SortBy, SearchFilter, SortDirection } from '../../../model/search.model';
import { Role } from '../../../model/auth.model';

import { BookStoreService } from '../../../service/book-store-service';
import { AuthService } from '../../../service/auth-service';
import { CartService } from '../../../service/cart-service';
import { BookCardComponent } from '../book-card-component/book-card-component';
import { PaginationComponent } from '../../shared/pagination-component/pagination-component';
import { Cart } from '../../../model/cart.model';
import { ToastService } from '../../../service/toast-service';
import { LucideAngularModule } from 'lucide-angular';
import { log, error } from '@/utils/logger';

@Component({
  selector: 'app-book-list-component',
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    BookCardComponent,
    PaginationComponent,
    CurrencyPipe,
    LucideAngularModule,
    NgClass,
  ],
  templateUrl: './book-list-component.html',
})
export class BookListComponent implements OnInit {
  private bookStoreService = inject(BookStoreService);
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  // DATA
  bookPage$ = this.bookStoreService.books$;

  // USER INFO
  role = this.authService._role;
  Role = Role;
  libraryId = Number(this.authService.userClaim?.libraryId);
  isLoggedIn = this.authService.isLoggedIn;

  // SIGNALS
  bookViewMode = signal<'myBooks' | 'allBooks'>('allBooks');
  viewMode = signal<'card' | 'table'>('card');
  loading = signal<boolean>(false);

  // PAGINATION & FILTER
  currentPage = 0;
  totalPages = 1;
  filterForm!: FormGroup;

  // SORT ENUMS
  SortBy = SortBy;
  SortDirection = SortDirection;
  sortKeys = (Object.keys(SortBy) as Array<keyof typeof SortBy>).filter((k) => k !== 'NAME');
  defaultSortBy: keyof typeof SortBy = 'CREATED_DATE';
  defaultSortDirection: keyof typeof SortDirection = 'ASC';

  // define the reactive effect here, not in ngOnInit
  librarianEffect = effect(() => {
    if (this.role() === Role.Librarian) {
      this.loadBooks(this.createSearchFilter());
    }
  });

  ngOnInit(): void {
    this.buildFilterForm();
    this.loadBooks(this.createSearchFilter(0), true);

    // when filter change
    this.filterForm.valueChanges
      .pipe(
        debounceTime(150),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        tap(() => {
          this.currentPage = 0;
          this.loadBooks(this.createSearchFilter());
        })
      )
      .subscribe();
  }

  private buildFilterForm() {
    this.filterForm = this.fb.group({
      searchTitle: [''],
      sortBy: [this.defaultSortBy],
      sortDirection: [this.defaultSortDirection],
    });
  }

  private createSearchFilter(page?: number): SearchFilter {
    const search = this.filterForm.get('searchTitle')?.value ?? '';
    const sortBy = this.filterForm.get('sortBy')?.value ?? this.defaultSortBy;
    const sortDirection = this.filterForm.get('sortDirection')?.value ?? this.defaultSortDirection;

    const filter: SearchFilter = {
      search,
      sortBy,
      sortDirection,
      page: page ?? this.currentPage,
    };

    if (this.role() === Role.Librarian && this.bookViewMode() === 'myBooks') {
      log('librarian request for its books');
      filter.libraryId = Number(this.libraryId);
    }

    return filter;
  }

  private loadBooks(filter: SearchFilter, forceRefresh = false) {
    this.loading.set(true);
    this.bookStoreService
      .getBooks(filter, forceRefresh)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe();
  }

  // UI HANDLERS
  toggleViewMode() {
    this.viewMode.set(this.viewMode() === 'card' ? 'table' : 'card');
  }

  toggleBookViewMode() {
    const newMode = this.bookViewMode() === 'allBooks' ? 'myBooks' : 'allBooks';
    log('new book mode is ', newMode);
    this.bookViewMode.set(newMode);
    this.loadBooks(this.createSearchFilter(0), true);
  }

  toggleSortDirection() {
    const current = this.filterForm.get('sortDirection')?.value;
    const newDir = current === 'ASC' ? 'DESC' : 'ASC';
    this.filterForm.patchValue({ sortDirection: newDir });
    this.reload();
  }

  onSearchKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this.loadBooks(this.createSearchFilter(0));
      e.preventDefault();
    }
  }

  onSortChange() {
    this.reload();
  }

  private reload(page = 0) {
    this.loadBooks(this.createSearchFilter(page), true);
  }

  handlePageChange(pageNumber: number) {
    this.loadBooks(this.createSearchFilter(pageNumber));
  }

  handleOnView(book: Book) {
    if (book) this.router.navigate(['books', book.id], { state: { book: book } });
  }

  handleOnAddToCart(book: Book) {
    if (!this.isLoggedIn()) {
      this.toastService.info('Please log in first');
      this.router.navigate(['login']);
      return;
    }

    this.cartService.addToCart(book.id).subscribe({
      next: () => {
        log('Added to cart');
        this.toastService.success('Book add to cart successfully');
      },
      error: (err) => {
        error('Error adding to cart:', err);
        this.toastService.error('Failed add to cart the book');
      },
    });
  }

  handleOnBuy(book: Book) {
    if (!this.isLoggedIn()) {
      this.toastService.info('Please log in first');
      this.router.navigate(['login']);
      return;
    }

    const quantity = book.inventory?.availableStock;
    if (quantity == undefined || quantity <= 0 || quantity == null) {
      this.toastService.info('No available stock to buy');
      return;
    }

    const cartRequests: Cart[] = [
      {
        cartId: 0,
        bookId: book.id,
        bookName: book.bookDetail.title,
        price: book.bookDetail.price,
        quantity: 1,
        maxQuantity: book.inventory?.availableStock ?? 0,
      },
    ];
    this.router.navigate(['payment'], { state: { selected: cartRequests } });
  }

  handleOnEdit(book: Book) {
    log('edit book with id');
    this.router.navigate(['books/edit', book.id], { state: { book } });
  }

  handleOnCopy(book: Book) {
    log('Copying book:', book);
    this.router.navigate(['books/create'], { state: { book, isCopy: true } });
  }

  // safe formatting helpers — put these inside BookListComponent
  formatAuthors(book: Book): string {
    if (!book) return 'Unknown';
    const authors = book.bookDetail?.authors;
    return authors && authors.length ? authors.join(', ') : 'Unknown';
  }

  formatGenres(book: Book): string {
    if (!book) return 'N/A';
    const genres = book.bookDetail?.genres;
    return genres && genres.length ? genres.join(', ') : 'N/A';
  }

  handleToLibrary(libraryId: number) {
    this.router.navigate(['libraries', libraryId]);
  }

  goToLibrary(libraryId: number) {
    this.router.navigate(['libraries', libraryId]);
  }
}
