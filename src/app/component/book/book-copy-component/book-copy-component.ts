import { Component, inject, OnInit, signal } from '@angular/core';
import { BookFormComponent } from '../book-form-component/book-form-component';
import { ActivatedRoute } from '@angular/router';
import { catchError, Observable, of, tap } from 'rxjs';
import { Book } from '../../../model/book.model';
import { BookService } from '../../../service/book-service';
import { AsyncPipe } from '@angular/common';
import { FormMode } from '../../../model/auth.model';

@Component({
  selector: 'app-book-copy-component',
  imports: [BookFormComponent],
  templateUrl: './book-copy-component.html',
  styles: ``
})
export class BookCopyComponent implements OnInit {
  // Dependencies
  private activatedRoute = inject(ActivatedRoute);
  private bookService = inject(BookService);

  copyMode: FormMode = FormMode.Copy;
  book!: Book;

  loading = signal<boolean>(false);

  ngOnInit(): void {
      log('Book Copy Component on init');
      this.book = window.history.state['book'];
      if (!this.book) {
        log('No book copied');
        return;
      }
      log('bookL: ', this.book);
  }

  handleBookCopy(book: Book) {
    if (!book) return;
    log('CREATE THE COPIED BOOK: ',book);
    book.id = 0;
    log('book now id: ', book.id);
    this.bookService.createBookToLibrary(book).subscribe({
      next:res=>log('book copy created: ', res.id),
      error:error=>error('book copying error: ', error)
    });
  }


}
