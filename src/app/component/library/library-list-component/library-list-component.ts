import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { debounceTime, distinctUntilChanged, finalize, Observable, tap } from 'rxjs';
import { Library } from '../../../model/library.model';
import { Page } from '../../../model/page.model';
import { LibraryService } from '../../../service/library-service';
import { AsyncPipe } from '@angular/common';
import { LibraryCardComponent } from '../library-card-component/library-card-component';
import { Router } from '@angular/router';
import { PaginationComponent } from '../../shared/pagination-component/pagination-component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SearchFilter, SortBy, SortDirection } from '../../../model/search.model';
import { LibraryStoreService } from '../../../service/library-store-service';
import { AuthService } from '../../../service/auth-service';
import { Role } from '../../../model/auth.model';
import { LucideAngularModule } from 'lucide-angular';
import { log } from '@/utils/logger';

@Component({
  selector: 'app-library-list-component',
  imports: [
    AsyncPipe,
    PaginationComponent,
    LibraryCardComponent,
    ReactiveFormsModule,
    LucideAngularModule,
  ],
  templateUrl: './library-list-component.html',
  styles: ``,
})
export class LibraryListComponent implements OnInit {
  // DEPENDENCIES
  private libraryStoreService = inject(LibraryStoreService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // DATA
  libraryPage$!: Observable<Page<Library>>;

  // USER INFO
  role = this.authService._role;
  Role = Role;
  libraryId = Number(this.authService.userClaim?.libraryId);
  isLoggedIn = this.authService.isLoggedIn;

  // SIGNALS
  loading = signal<boolean>(false);
  libraryViewMode = signal<'myLibrary' | 'allLibraries'>('allLibraries');
  viewMode = signal<'card' | 'table'>('card');

  // PAGINATION & FILTER
  currentPage = 0;
  totalPages = 1;
  filterForm!: FormGroup;

  // SORT ENUMS
  SortBy = SortBy;
  SortDirection = SortDirection;
  sortKeys = (Object.keys(SortBy) as Array<keyof typeof SortBy>).filter((k) => k !== 'TITLE');
  defaultSortBy: keyof typeof SortBy = 'CREATED_DATE';
  defaultSortDirection: keyof typeof SortDirection = 'ASC';

  librarianEffect = effect(() => {
    if (this.role() === Role.Librarian) {
      this.loadLibraries(this.createSearchFilter());
    }
  });

  ngOnInit(): void {
    this.buildFilterForm();
    this.loadLibraries({
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
          this.loadLibraries(this.createSearchFilter());
        })
      )
      .subscribe();
  }

  private buildFilterForm() {
    this.filterForm = this.fb.group({
      searchName: [''],
      sortBy: [this.defaultSortBy],
      sortDirection: [this.defaultSortDirection],
      libraryViewMode: ['allLibraries'],
    });
  }

  private createSearchFilter(page?: number): SearchFilter {
    const search = this.filterForm.get('searchName')?.value ?? '';
    const sortBy = this.filterForm.get('sortBy')?.value ?? this.defaultSortBy;
    const sortDirection = this.filterForm.get('sortDirection')?.value ?? this.defaultSortDirection;

    const filter: SearchFilter = {
      search,
      sortBy,
      sortDirection,
      page: page ?? this.currentPage,
    };

    if (this.role() === Role.Librarian && this.libraryViewMode() === 'myLibrary') {
      log('librarian request for its library');
      filter.libraryId = this.libraryId;
    }

    return filter;
  }

  private loadLibraries(filter: SearchFilter) {
    this.loading.set(false);
    const effectiveFilter = filter ?? this.createSearchFilter();

    this.libraryPage$ = this.libraryStoreService.getLibraries(effectiveFilter).pipe(
      tap((pageModel) => {
        log('library pagedmodel: ', pageModel);
        this.totalPages = pageModel.totalPage;
        this.currentPage = pageModel.pageNumber;
      }),
      finalize(() => this.loading.set(false))
    );
  }

  toggleViewMode() {
    this.viewMode.set(this.viewMode() === 'card' ? 'table' : 'card');
  }

  toggleLibraryViewMode() {
    const newMode = this.libraryViewMode() === 'allLibraries' ? 'myLibrary' : 'allLibraries';
    log('new library mode is ', newMode);
    this.libraryViewMode.set(newMode);
    this.filterForm.patchValue({ libraryViewMode: newMode });
  }

  toggleSortDirection() {
    const current = this.filterForm.get('sortDirection')?.value;
    const newDir = current === 'ASC' ? 'DESC' : 'ASC';
    this.filterForm.patchValue({ sortDirection: newDir });
    this.loadLibraries(this.createSearchFilter(0));
  }

  onSearchKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this.loadLibraries(this.createSearchFilter(0));
      e.preventDefault();
    }
  }

  onSortChange() {
    this.loadLibraries({
      page: 0,
      search: this.filterForm.get('searchName')?.value ?? '',
      sortBy: this.filterForm.get('sortBy')?.value ?? this.defaultSortBy,
      sortDirection: this.filterForm.get('sortDirection')?.value ?? this.defaultSortDirection,
    });
  }

  handlePageChange(pageNumber: number) {
    this.loadLibraries(this.createSearchFilter(pageNumber));
  }

  handleOnView(library: Library) {
    if (library) this.router.navigate(['libraries', library.id]);
  }

  handleOnEdit(library: Library) {
    if (library) this.router.navigate(['libraries/edit', library.id], { state: { library } });
  }
}
