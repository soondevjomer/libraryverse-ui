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
  bookPage$!: Observable<Page<Book>>;

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
    this.loadBooks({
      page: 0,
      search: '',
      sortBy: this.defaultSortBy,
      sortDirection: this.defaultSortDirection,
      libraryId: 0,
    });

    // when filter change
    this.filterForm.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
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
      bookViewMode: ['allBooks'],
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
      console.log('librarian request for its books');
      filter.libraryId = Number(this.libraryId);
    }

    return filter;
  }

  private loadBooks(filter?: SearchFilter) {
    this.loading.set(true);
    const effectiveFilter = filter ?? this.createSearchFilter();

    this.bookPage$ = this.bookStoreService.getBooks(effectiveFilter).pipe(
      tap((pageModel) => {
        console.log('book pagedmodel: ', pageModel);
        this.totalPages = pageModel.totalPage;
        this.currentPage = pageModel.pageNumber;
      }),
      finalize(() => this.loading.set(false))
    );
  }

  // UI HANDLERS
  toggleViewMode() {
    this.viewMode.set(this.viewMode() === 'card' ? 'table' : 'card');
  }

  toggleBookViewMode() {
    const newMode = this.bookViewMode() === 'allBooks' ? 'myBooks' : 'allBooks';
    console.log('new book mode is ', newMode);
    this.bookViewMode.set(newMode);
    this.filterForm.patchValue({ bookViewMode: newMode });
  }

  toggleSortDirection() {
    const current = this.filterForm.get('sortDirection')?.value;
    const newDir = current === 'ASC' ? 'DESC' : 'ASC';
    this.filterForm.patchValue({ sortDirection: newDir });
    this.loadBooks(this.createSearchFilter(0));
  }

  onSearchKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this.loadBooks(this.createSearchFilter(0));
      e.preventDefault();
    }
  }

  onSortChange() {
    this.loadBooks({
      page: 0,
      search: this.filterForm.get('searchTitle')?.value ?? '',
      sortBy: this.filterForm.get('sortBy')?.value ?? this.defaultSortBy,
      sortDirection: this.filterForm.get('sortDirection')?.value ?? this.defaultSortDirection,
    });
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
    if (book.inventory?.availableStock == null || book.inventory.availableStock == 0) return;
    this.cartService.addToCart(book.id).subscribe({
      next: () => {
        console.log('Added to cart');
        this.toastService.success('Book add to cart successfully');
      },
      error: (err) => {
        console.error('Error adding to cart:', err);
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

    console.log('book', book);

    if (book.inventory?.availableStock !== undefined && book.inventory?.availableStock !== null) {
      console.log('Have an available stock value');

      if (book.inventory.availableStock <= 0) {
        this.toastService.info('No available stock to buy');
        return;
      }
    }

    console.log('Buying book:', book.bookDetail.title);

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
    console.log('edit book with id');
    this.router.navigate(['books/edit', book.id], { state: { book } });
  }

  handleOnCopy(book: Book) {
    console.log('Copying book:', book);
    this.router.navigate(['books/create'], { state: { book } });
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
}
