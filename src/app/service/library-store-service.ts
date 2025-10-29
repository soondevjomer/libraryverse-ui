import { inject, Injectable, signal } from '@angular/core';
import { LibraryService } from './library-service';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { Library } from '../model/library.model';
import { Page } from '../model/page.model';
import { SearchFilter } from '../model/search.model';

@Injectable({
  providedIn: 'root'
})
export class LibraryStoreService {
  // DEPENDENCIES
  private libraryService = inject(LibraryService);

  private cache$ = new BehaviorSubject<Page<Library> | null>(null);
  private lastFilter: SearchFilter | null = null;
  private loading = signal(false);
  private error = signal<string | null>(null);

  getLibraries(filter: SearchFilter, forceRefresh = false, role?: any)
    : Observable<Page<Library>> {
    const cached = this.cache$.value;

    if (cached && !forceRefresh && this.isSameFilter(filter)) {

      this.refreshInBackground(filter);
      return of(cached);
    }

    return this.fetchLibraries(filter, role);
  }

  reloadLibraries(filter: SearchFilter): Observable<Page<Library>> {
    return this.fetchLibraries(filter, true);
  }

  private fetchLibraries(filter: SearchFilter, replaceCache = true, role?:any): Observable<Page<Library>> {
    this.loading.set(true);
    this.error.set(null);
    this.lastFilter = filter;

    return this.libraryService.getLibraryByPage(filter).pipe(
      tap((page)=>{
        if (replaceCache) this.cache$.next(page);
      }),
      catchError(error=>{
        this.error.set('Failed to load books');
        console.error('Fetch error: ', error);
        return of(this.cache$.value ?? { content: [], totalPage: 0, pageNumber: 0, totalElement: 0, pageSize: 0 });
      }),
      tap(()=>this.loading.set(false))
    );
  }

  private refreshInBackground(filter: SearchFilter) {
    this.libraryService.getLibraryByPage(filter).subscribe({
      next: (page) => this.cache$.next(page),
      error: (err) => console.warn('Background refresh failed:', err),
    });
  }

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

  get cachedPage(): Page<Library> | null {
    return this.cache$.value;
  }
  get loadingSignal() {
    return this.loading;
  }
  get errorSignal() {
    return this.error;
  }
}
