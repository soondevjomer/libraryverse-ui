import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { CheckRequest, Profile } from '../model/profile.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  //DEPENDENCIES
  private http = inject(HttpClient);

  baseUrl = environment.apiBaseUrl;

  updateProfile(profile: Profile, file?: File): Observable<Profile> {
    console.log('Profile updating check file if there is ', file);

    const payload = structuredClone(profile);

    if (payload.image instanceof File) {
      payload.image = '';
  }

    const formData = new FormData();
    formData.append('profile', new Blob([JSON.stringify(profile)], {type:'application/json'}));
    if (file) formData.append('file', file);
    return this.http.post<Profile>(`${this.baseUrl}/profile`, formData);
  }

  emailExist(checkRequest: CheckRequest): Observable<{exist:boolean}> {

    console.log('email request: ', checkRequest);

    if (checkRequest.current==null || checkRequest.current==undefined) checkRequest.current = '';

    return this.http.post<{exist:boolean}>(`${this.baseUrl}/profile/check-email`, checkRequest);
  }

  usernameExist(checkRequest:CheckRequest): Observable<{exist:boolean}> {

    console.log('username request: ', checkRequest);

    if (checkRequest.current==null || checkRequest.current==undefined) checkRequest.current = '';

    return this.http.post<{exist:boolean}>(`${this.baseUrl}/profile/check-username`, checkRequest);
  }

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(`${this.baseUrl}/profile`);
  }
}
