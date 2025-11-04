import { error, log } from '@/utils/logger';
import { Component, inject, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { FormMode } from '../../../model/auth.model';
import { Book, Inventory } from '../../../model/book.model';
import { AuthService } from '../../../service/auth-service';
import { BookService } from '../../../service/book-service';
import { ToastService } from '../../../service/toast-service';
import { BookFormComponent } from '../book-form-component/book-form-component';

@Component({
  selector: 'app-book-create-component',
  imports: [BookFormComponent],
  templateUrl: './book-create-component.html',
  styles: ``,
})
export class BookCreateComponent implements OnInit {
  // DEPENDENCIES
  private bookService = inject(BookService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  createMode: FormMode = FormMode.Add;
  book: Book = {} as Book;

  // UI STATES
  loading = signal<boolean>(false);
  loadingInfo = signal<string | null>(null);

  libraryId = this.authService.userClaim?.libraryId;

  ngOnInit(): void {
    const cachedBook = window.history.state['book'];
    if (cachedBook) this.book = cachedBook;
  }

  // FUNCTIONS
  handleCreate(book: Book) {
    log('handling create book');

    const inventory: Inventory = {
      availableStock: book.bookDetail.quantity ?? 0,
      shipped: 0,
      reservedStock: 0,
      delivered: 0,
      id: 0,
    };
    book.inventory = inventory;

    const file = book.bookDetail.bookCover;

    this.loading.set(true);
    this.loadingInfo.set('Creating book...');
    // New unified flow: backend handles both book + optional file
    this.bookService
      .createBookToLibrary(book, file instanceof File ? file : undefined)
      .pipe(
        finalize(() => {
          this.loading.set(false);
          this.loadingInfo.set(null);
        })
      )
      .subscribe({
        next: (response) => {
          this.toastService.success('Book created successfully');
          log('Book created successfully:', response);
        },
        error: (err) => {
          this.toastService.error('Failed to create book');
          error('Error during book creation:', err);
        },
      });
  }
}
