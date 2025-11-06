import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Book } from '../model/book.model';
import { Page } from '../model/page.model';
import { SearchFilter } from '../model/search.model';
import { buildHttpParams } from 'app/utils/build-http-params';
import { log } from '@/utils/logger';

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
    log('BOOK_SERVICE: CREATING BOOK');
    return this.http.post<Book>(`${this.baseUrl}/books`, book);
  }

  createBookToLibrary(book: Book, file?: File | Blob): Observable<Book> {
    log('BOOK_SERVICE: CREATING BOOK TO LIBRARY');
    console.log('file is instance of File:', file instanceof File);
    console.log('file content:', file);

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
    log('Payload JSON:', JSON.stringify(payload, null, 2));

    const formData = new FormData();
    formData.append('book', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    if (file) {
      const fileWithType =
        file instanceof File
          ? file
          : new File([file], 'book-cover.webp', { type: file.type || 'image/webp' });

      formData.append('file', fileWithType);
    }

    return this.http.post<Book>(`${this.baseUrl}/books/create`, formData);
  }

  updateBook(bookId: number, book: Book, file?: File | Blob): Observable<Book> {
    log('BOOK_SERVICE: UPDATING BOOK TO LIBRARY');
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
    log('Payload JSON:', JSON.stringify(payload, null, 2));

    const formData = new FormData();
    formData.append('book', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    if (file) {
      const fileWithType =
        file instanceof File
          ? file
          : new File([file], 'book-cover.webp', { type: file.type || 'image/webp' });

      formData.append('file', fileWithType);
    }
    return this.http.put<Book>(`${this.baseUrl}/books/${bookId}`, formData);
  }

  getBooksByPage(filters?: SearchFilter): Observable<Page<Book>> {
    const params = buildHttpParams(filters);
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
