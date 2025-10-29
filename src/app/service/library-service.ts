import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { filter, Observable } from 'rxjs';
import { Library, LibraryRequest, LibraryStat } from '../model/library.model';
import { environment } from '../environment/environment';
import { Page } from '../model/page.model';
import { SearchFilter } from '../model/search.model';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  //DEPENDENCIES
  private http = inject(HttpClient);

  private baseUrl = environment.apiBaseUrl;

  getLibraryStat(): Observable<LibraryStat> {
    return this.http.get<LibraryStat>(`${this.baseUrl}/libraries/stats`);
  }

  getLibraryByPage(filters: SearchFilter): Observable<Page<Library>> {
    let params = new HttpParams()
      .set('page',  filters?.page ?? 0)
      .set('search', filters?.search ?? '')
      .set('sortBy', filters?.sortBy ?? '')
      .set('sortDirection', filters?.sortDirection ?? '')
      .set('libraryId', filters?.libraryId ?? '');

      console.log('library id is : ', filters.libraryId);

    return this.http.get<Page<Library>>(`${this.baseUrl}/libraries`, { params });
  }

  getLibraryById(libraryId: number): Observable<Library> {
    return this.http.get<Library>(`${this.baseUrl}/libraries/${libraryId}`);
  }

  updateLibraryById(libraryId: number, libraryReq: LibraryRequest, file?: File): Observable<Library> {
    console.log('update library by id');
    const payload = structuredClone(libraryReq);
  
    // Ensure no File or nested object is serialized incorrectly
    if (payload.libraryCover instanceof File) {
      payload.libraryCover = '';
    }

    console.log('Payload JSON:', JSON.stringify(payload, null, 2));
    
    const formData = new FormData();
    formData.append('library', new Blob([JSON.stringify(libraryReq)], { type: 'application/json' }));
    if (file) formData.append('file', file);

    return this.http.put<Library>(`${this.baseUrl}/libraries/${libraryId}`, formData);
  }
  
}
