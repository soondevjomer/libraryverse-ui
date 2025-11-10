import { log, error } from '@/utils/logger';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { debounceTime, distinctUntilChanged, finalize, of, switchMap } from 'rxjs';
import { Profile, CheckRequest } from '../../../model/profile.model';
import { AuthService } from '../../../service/auth-service';
import { ProfileService } from '../../../service/profile-service';
import { ToastService } from '../../../service/toast-service';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { environment } from '@env/environment';
import { ProfileFormComponent } from '../profile-form-component/profile-form-component';
import { FormMode } from '@/model/auth.model';

@Component({
  selector: 'app-profile-edit-component',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule, ProfileFormComponent],
  templateUrl: './profile-edit-component.html',
})
export class ProfileEditComponent implements OnInit {
  //DEPENDENCIES
  private profileService = inject(ProfileService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private authService = inject(AuthService);

  // SIGNALS
  loading = signal(false);
  loadingInfo = signal<string | null>(null);
  usernameTaken = signal(false);
  emailTaken = signal(false);

  // DATA
  profile: Profile = {} as Profile;
  currentEmail = this.authService.userClaim?.email;
  currentUsername = this.authService.userClaim?.username;

  previewUrl = signal<string | ArrayBuffer | null>(null);
  fileError: string | null = null;
  submitted: boolean = false;
  selectedFile: File | null = null;
  isPreviewLoading = signal(false);
  showCropper = signal(false);
  imageChangeEvent = signal<any>(null);
  croppedFile: File | null = null;
  cropWidth = signal(1024);
  cropHeight = signal(1536);

  editMode = FormMode.Edit;

  imageUrl = environment.imageUrl;

  ngOnInit(): void {
    this.profile = window.history.state['profile'];
  }

  handleSave({ profile, file }: { profile: Profile, file?: File }) {
    this.loading.set(true);
    this.loadingInfo.set('Updating profile...');

    this.profileService
      .updateProfile(profile, file)
      .pipe(
        finalize(() => {
          this.loading.set(false);
          this.loadingInfo.set(null);
        })
      )
      .subscribe({
        next: (response: Profile) => {
          this.toastService.success('Profile updated successfully');
          this.profileService.manuallyUpdateProfile(response);
          log('Profile updated successfully', response);
          this.router.navigate(['profile']);
        },
        error: (err) => {
          this.toastService.error('Failed to update profile');
          error('Failed to update profile ', err);
        },
      });
  }

  backToProfile() {
    this.router.navigate(['profile'], { state: { profile: this.profile } });
  }

  handleUsernameChanged(username: string) {
    const checkRequest: CheckRequest = {
      request: username,
      current: this.currentUsername,
    };
    this.profileService.usernameExist(checkRequest).subscribe({
      next: (res) => this.usernameTaken.set(res.exist),
      error: (err) => error('Error in checking username if exists: ', err),
    });
  }

  handleEmailChanged(email: string) {
    const CheckRequest: CheckRequest = {
      request: email,
      current: this.currentEmail,
    };
    this.profileService.emailExist(CheckRequest).subscribe({
      next: (res) => this.emailTaken.set(res.exist),
      error: (err) => error('Error in checking email if exists: ', err),
    });
  }

  updateUserClaim(newProfile: Profile):void {
    const userClaim = this.authService.userClaim;
  }
}
