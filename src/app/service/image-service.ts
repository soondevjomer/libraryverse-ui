import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';
import { UploadDto } from './image-model';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  //DEPENDENCIES
  private http = inject(HttpClient);

  private baseUrl = environment.apiBaseUrl;

  uploadBookCover(file: File, bookTitle: string, libraryId: number): Observable<UploadDto> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bookTitle', bookTitle);
    formData.append('libraryId', libraryId.toString());

    return this.http.post<UploadDto>(`${this.baseUrl}/uploads/book-cover`, formData);
  }

  uploadLibraryCover(file: File,libraryName: string, libraryId: number): Observable<UploadDto> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bookTitle', libraryName);
    formData.append('libraryId', libraryId.toString());
    return this.http.post<UploadDto>(`${this.baseUrl}/uploads/library-cover`, formData);
  }
}
