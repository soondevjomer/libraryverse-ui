import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../environment/environment';
import { BehaviorSubject, filter, Observable } from 'rxjs';
import { Book } from '../model/book.model';
import { Page } from '../model/page.model';
import { SearchFilter } from '../model/search.model';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  // DEPENDENCIES
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  // API CALL
  getBookById(bookId: number): Observable<Book> {
    return this.http.get<Book>(`${this.baseUrl}/books/${bookId}`);
  }

  createBook(book: Book): Observable<Book> {
    console.log('BOOK_SERVICE: CREATING BOOK');
    return this.http.post<Book>(`${this.baseUrl}/books`, book);
  }

  createBookToLibrary(book: Book, file?: File): Observable<Book> {
    console.log('BOOK_SERVICE: CREATING BOOK TO LIBRARY');

    const payload = structuredClone(book);

    // Ensure no File or nested object is serialized incorrectly
    if (payload.bookDetail?.bookCover instanceof File) {
      payload.bookDetail.bookCover = '';
    }

    // Optional: ensure publisher is a string
    if (typeof payload.bookDetail?.publisher === 'object') {
      payload.bookDetail.publisher = '';
    }

    // Log the exact JSON we send
    console.log('Payload JSON:', JSON.stringify(payload, null, 2));

    const formData = new FormData();
    formData.append('book', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    if (file) {
      formData.append('file', file);
    }

    return this.http.post<Book>(`${this.baseUrl}/books/create`, formData);
  }

  updateBook(bookId: number, book: Book, file?: File): Observable<Book> {
    console.log('BOOK_SERVICE: UPDATING BOOK TO LIBRARY');
    const payload = structuredClone(book);

    // Ensure no File or nested object is serialized incorrectly
    if (payload.bookDetail?.bookCover instanceof File) {
      payload.bookDetail.bookCover = '';
    }

    // Optional: ensure publisher is a string
    if (typeof payload.bookDetail?.publisher === 'object') {
      payload.bookDetail.publisher = '';
    }

    // Log the exact JSON we send
    console.log('Payload JSON:', JSON.stringify(payload, null, 2));

    const formData = new FormData();
    formData.append('book', new Blob([JSON.stringify(book)], { type: 'application/json' }));
    if (file) formData.append('file', file);
    return this.http.put<Book>(`${this.baseUrl}/books/${bookId}`, formData);
  }

  copyBook(bookId: number): Observable<void> {
    console.log('BOOK_SERVICE: COPYING BOOK');
    return this.http.post<void>(`${this.baseUrl}/books/${bookId}/copy`, {});
  }

  getBooksByPage(filters?: SearchFilter): Observable<Page<Book>> {
    if (filters?.sortBy == 'TITLE') {
      console.log('cause filter is title then it will became name');
      filters.sortBy = 'NAME';
    }

    let params = new HttpParams()
      .set('page', filters?.page ?? 0)
      .set('search', filters?.search ?? '')
      .set('sortBy', filters?.sortBy ?? '')
      .set('sortDirection', filters?.sortDirection ?? '')
      .set('libraryId', filters?.libraryId ?? '');
    console.log('sortBy value: ', filters?.sortBy);
    console.log('sortDirection value: ', filters?.sortDirection);
    console.log('libraryId: ', filters?.libraryId ?? 0);

    return this.http.get<Page<Book>>(`${this.baseUrl}/books`, { params });
  }

  getBooksOfLibraryByPage(filters?: SearchFilter) {
    let params = new HttpParams();
    params.set('page', filters?.page ?? 0);
    params.set('search', filters?.search ?? '');
    params.set('sort', filters?.sortBy ?? '');

    return this.http.get<Page<Book>>(`${this.baseUrl}/books/page`, { params });
  }
}
