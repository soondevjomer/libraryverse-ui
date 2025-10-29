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
      console.log('Book Copy Component on init');
      this.book = window.history.state['book'];
      if (!this.book) {
        console.log('No book copied');
        return;
      }
      console.log('bookL: ', this.book);
  }

  handleBookCopy(book: Book) {
    if (!book) return;
    console.log('CREATE THE COPIED BOOK: ',book);
    book.id = 0;
    console.log('book now id: ', book.id);
    this.bookService.createBookToLibrary(book).subscribe({
      next:res=>console.log('book copy created: ', res.id),
      error:error=>console.error('book copying error: ', error)
    });
  }


}
