import { log } from '@/utils/logger';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { buildHttpParams } from 'app/utils/build-http-params';
import { Observable } from 'rxjs';
import { Library, LibraryInfo, LibraryRequest, LibraryStat } from '../model/library.model';
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

  updateLibraryById(libraryId: number, libraryReq: LibraryRequest, file?: File | Blob): Observable<Library> {
    log('update library by id');
    const payload = structuredClone(libraryReq);

    log('library info for updating:Library ID ', libraryId);
    log('library info for updating:Library ', libraryReq);
    log('library info for updating:File ', file);
    log('Payload: ', payload);
  
    // Ensure no File or nested object is serialized incorrectly
    if (payload.libraryCover instanceof File) {
      log('payload is instance of file');
      payload.libraryCover = '';
    }

    log('Payload JSON:', JSON.stringify(payload, null, 2));
    
    const formData = new FormData();
    formData.append('library', new Blob([JSON.stringify(libraryReq)], { type: 'application/json' }));
    if (file) {
      const fileWithType =
        file instanceof File
          ? file
          : new File([file], 'library-cover.webp', { type: file.type || 'image/webp' });

      formData.append('file', fileWithType);
    }

    return this.http.post<Library>(`${this.baseUrl}/libraries/${libraryId}`, formData);
  }

  getLibraryInfo(libraryId:number):Observable<LibraryInfo> {
    return this.http.get<LibraryInfo>(`${this.baseUrl}/libraries/info/${libraryId}`);
  }
  
}
