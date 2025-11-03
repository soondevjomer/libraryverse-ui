import { log } from '@/utils/logger';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { buildHttpParams } from 'app/utils/build-http-params';
import { Observable } from 'rxjs';
import { Library, LibraryRequest, LibraryStat } from '../model/library.model';
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
    const params = buildHttpParams(filters);
    return this.http.get<Page<Library>>(`${this.baseUrl}/libraries`, { params });
  }

  getLibraryById(libraryId: number): Observable<Library> {
    return this.http.get<Library>(`${this.baseUrl}/libraries/${libraryId}`);
  }

  updateLibraryById(libraryId: number, libraryReq: LibraryRequest, file?: File): Observable<Library> {
    log('update library by id');
    const payload = structuredClone(libraryReq);
  
    // Ensure no File or nested object is serialized incorrectly
    if (payload.libraryCover instanceof File) {
      payload.libraryCover = '';
    }

    log('Payload JSON:', JSON.stringify(payload, null, 2));
    
    const formData = new FormData();
    formData.append('library', new Blob([JSON.stringify(libraryReq)], { type: 'application/json' }));
    if (file) formData.append('file', file);

    return this.http.put<Library>(`${this.baseUrl}/libraries/${libraryId}`, formData);
  }
  
}
