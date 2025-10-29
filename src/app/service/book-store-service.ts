import { inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, of, switchMap, tap, catchError } from 'rxjs';
import { Page } from '../model/page.model';
import { Book } from '../model/book.model';
import { SearchFilter } from '../model/search.model';
import { BookService } from './book-service';

@Injectable({ providedIn: 'root' })
export class BookStoreService {
  //DEPENDECIES
  private bookService = inject(BookService);

  private cache$ = new BehaviorSubject<Page<Book> | null>(null);
  private lastFilter: SearchFilter | null = null;
  private loading = signal(false);
  private error = signal<string | null>(null);

  /** Get books — return cached data immediately if present */
  getBooks(filter: SearchFilter, forceRefresh = false, role?: any): Observable<Page<Book>> {
    const cached = this.cache$.value;

    // If cache exists & filter is the same — reuse
    if (cached && !forceRefresh && this.isSameFilter(filter)) {
      // Return cached immediately and refresh in background
      this.refreshInBackground(filter);
      return of(cached);
    }

    // Otherwise fetch fresh
    return this.fetchBooks(filter, role);
  }

  /** Force reload books (ignore cache) */
  reloadBooks(filter: SearchFilter): Observable<Page<Book>> {
    return this.fetchBooks(filter, true);
  }

  /** Internal fetch logic */
  private fetchBooks(filter: SearchFilter, replaceCache = true, role?: any): Observable<Page<Book>> {
    this.loading.set(true);
    this.error.set(null);
    this.lastFilter = filter;

    return this.bookService.getBooksByPage(filter).pipe(
      tap((page) => {
        if (replaceCache) this.cache$.next(page);
      }),
      catchError((err) => {
        this.error.set('Failed to load books');
        console.error('Fetch error:', err);
        // fallback to cached data if available
        return of(this.cache$.value ?? { content: [], totalPage: 0, pageNumber: 0, totalElement: 0, pageSize: 0 });
      }),
      tap(() => this.loading.set(false))
    );
  }

  /** Background refresh */
  private refreshInBackground(filter: SearchFilter) {
    this.bookService.getBooksByPage(filter).subscribe({
      next: (page) => this.cache$.next(page),
      error: (err) => console.warn('Background refresh failed:', err),
    });
  }

  /** Compare filters to decide whether to reuse cache */
  private isSameFilter(filter: SearchFilter): boolean {
    if (!this.lastFilter) return false;
    return (
      this.lastFilter.search === filter.search &&
      this.lastFilter.sortBy === filter.sortBy &&
      this.lastFilter.page === filter.page &&
      this.lastFilter?.sortDirection === filter.sortDirection &&
      this.lastFilter?.libraryId === filter.libraryId
    );
  }

  /** Accessors for UI */
  get cachedPage(): Page<Book> | null {
    return this.cache$.value;
  }
  get loadingSignal() {
    return this.loading;
  }
  get errorSignal() {
    return this.error;
  }
}
