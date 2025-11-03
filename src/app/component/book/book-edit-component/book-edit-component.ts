import { log } from '@/utils/logger';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { FormMode } from '../../../model/auth.model';
import { Book } from '../../../model/book.model';
import { AuthService } from '../../../service/auth-service';
import { BookService } from '../../../service/book-service';
import { ImageService } from '../../../service/image-service';
import { ToastService } from '../../../service/toast-service';
import { BookFormComponent } from '../book-form-component/book-form-component';

@Component({
  selector: 'app-book-edit-component',
  imports: [BookFormComponent],
  templateUrl: './book-edit-component.html',
})
export class BookEditComponent implements OnInit {
  //DEPENDECIES
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private bookService = inject(BookService);
  private imageService = inject(ImageService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  // USER
  libraryId = this.authService.userClaim?.libraryId;

  // DATA
  book: Book = {} as Book;
  book$!: Observable<Book>;

  editMode: FormMode = FormMode.Edit;

  // UI STATES
  loading = signal<boolean>(false);
  message = signal<string | null>(null);
  messageType = signal<'success' | 'error' | 'info'>('info');

  ngOnInit(): void {
    log('Book Edit Component on init');
    this.book = window.history.state['book'];
    if (!this.book) {
      this.toastService.info('Book not found');
      return;
    }

    log('book: ', this.book);
  }

  handleBookEdit(book: Book) {
    if (!book) return;

    log('UPDATING BOOK WITH THIS:', book);
    this.loading.set(true);

    const file = book.bookDetail.bookCover;

    if (typeof book.bookDetail.bookCover !== 'string') {
      book.bookDetail.bookCover = '';
    }

    // Unified call — backend handles optional file
    this.bookService
      .updateBook(book.id, book, file instanceof File ? file : undefined)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (updatedBook) => {
          this.toastService.success('Book updated successfully');
          log('Book updated successfully:', updatedBook);
          this.router.navigate(['books', updatedBook.id], { state: { book: updatedBook } });
        },
        error: (error) => {
          error('Error updating book:', error);
          this.toastService.error('Failed to update book');
        },
      });
  }
}
