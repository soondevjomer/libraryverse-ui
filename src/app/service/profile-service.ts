import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { environment } from '@env/environment';
import { CheckRequest, Profile, ChangePasswordRequest } from '../model/profile.model';
import { Observable } from 'rxjs';
import { log } from '@/utils/logger';
import { AuthService } from './auth-service';
import { UserClaim } from '@/model/auth.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  //DEPENDENCIES
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  baseUrl = environment.apiBaseUrl;

  //USER
  private _profile = signal<Profile|null>(null);
  profile = this._profile.asReadonly();

  constructor() {
    effect(()=>{
      const userClaim = this.authService.userClaim;
      if (userClaim) {
        this.syncProfile(userClaim);
      } else {
        this._profile.set(null);
      }
    });
  }

  syncProfile(newProfile:UserClaim) {
    const updatedProfile:Profile = {
      name:newProfile.name,
      username:newProfile.username,
      contactNumber:newProfile.contactNumber,
      address:newProfile.address,
      email:newProfile.email,
      image:newProfile.image,
      imageThumbnail:newProfile.imageThumbnail,
    }
    this._profile.set(updatedProfile);
  }

  manuallyUpdateProfile(newProfile:Profile) {
    this._profile.set(newProfile);
  }

  updateProfile(profile: Profile, file?: File | Blob): Observable<Profile> {
    log('Profile updating check file if there is ', file);

    const payload = structuredClone(profile);

    if (payload?.image instanceof File) {
      payload.image = '';
    }

    if (payload?.imageThumbnail instanceof File) {
      payload.imageThumbnail = '';
    }

    const formData = new FormData();
    formData.append('profile', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    if (file) {
      const fileWithType =
        file instanceof File
          ? file
          : new File([file], 'profile-image.webp', { type: file.type || 'image/webp' });

      formData.append('file', fileWithType);
    }
    return this.http.post<Profile>(`${this.baseUrl}/profile`, formData);
  }

  emailExist(checkRequest: CheckRequest): Observable<{ exist: boolean }> {
    log('email request: ', checkRequest);

    if (checkRequest.current == null || checkRequest.current == undefined)
      checkRequest.current = '';

    return this.http.post<{ exist: boolean }>(`${this.baseUrl}/profile/check-email`, checkRequest);
  }

  usernameExist(checkRequest: CheckRequest): Observable<{ exist: boolean }> {
    log('username request: ', checkRequest);

    if (checkRequest.current == null || checkRequest.current == undefined)
      checkRequest.current = '';

    return this.http.post<{ exist: boolean }>(
      `${this.baseUrl}/profile/check-username`,
      checkRequest
    );
  }

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(`${this.baseUrl}/profile`);
  }

  changePassword(changePasswordRequest:ChangePasswordRequest): Observable<{result:boolean}> {
    return this.http.post<{result:boolean}>(`${this.baseUrl}/profile/change-password`, changePasswordRequest);
  }
}
