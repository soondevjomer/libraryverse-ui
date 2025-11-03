import { log } from '@/utils/logger';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { debounceTime, distinctUntilChanged, finalize, of, switchMap } from 'rxjs';
import { Profile } from '../../../model/profile.model';
import { AuthService } from '../../../service/auth-service';
import { ProfileService } from '../../../service/profile-service';
import { ToastService } from '../../../service/toast-service';

@Component({
  selector: 'app-profile-edit-component',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule],
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
  usernameTaken = signal(false);
  emailTaken = signal(false);

  // FORMS
  profileForm!: FormGroup;

  // DATA
  profile: Profile | undefined = {} as Profile;
  previewUrl: string | ArrayBuffer | null = null;
  fileError: string | null = null;
  submitted: boolean = false;
  selectedFile: File | null = null;
  currentEmail = this.authService.userClaim?.email;
  currentUsername = this.authService.userClaim?.username;

  ngOnInit(): void {
    this.profile = window.history.state['profile'] as Profile | undefined;
    this.profileForm = this.buildForm();
    if (this.profile) this.patchForm(this.profile);

    log('profile data: ', this.profile);

    this.profileForm
      .get('email')
      ?.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((email) => {
          if (!email || this.profileForm.get('email')?.invalid) {
            this.emailTaken.set(false);
            return of(null);
          }
          return this.profileService.emailExist({
            request: email,
            current: this.currentEmail,
          });
        })
      )
      .subscribe({
        next: (res) => this.emailTaken.set(!!res?.exist),
        error: () => this.emailTaken.set(false),
      });

    this.profileForm
      .get('username')
      ?.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((username) => {
          if (!username || this.profileForm.get('username')?.invalid) {
            this.usernameTaken.set(false);
            return of(null);
          }
          return this.profileService.usernameExist({
            request: username,
            current: this.currentUsername,
          });
        })
      )
      .subscribe({
        next: (res) => this.usernameTaken.set(!!res?.exist),
        error: () => this.usernameTaken.set(false),
      });
  }

  // FUNCTIONS
  buildForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      contactNumber: ['', Validators.required],
      image: [null],
    });
  }

  private patchForm(profile: Profile): void {
    if (!profile) return;
    log('patching profile form..');
    this.profileForm.patchValue({
      name: profile?.name ?? '',
      username: profile?.username ?? '',
      email: profile?.email ?? '',
      address: profile?.address ?? '',
      contactNumber: profile?.contactNumber ?? '',
      image: profile?.image ?? null,
    });
  }

  handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.fileError = 'Please select a valid image file';
      return;
    }

    this.selectedFile = file;
    this.fileError = null;
    this.loading.set(true);

    const reader = new FileReader();
    reader.onload = () => {
      setTimeout(() => {
        this.previewUrl = reader.result;
        this.loading.set(false);
      }, 600); // short delay to show loader for smoother UX
    };
    reader.readAsDataURL(file);
  }

  handleSave() {
    if (!this.profileForm.valid) {
      this.toastService.info('Please fill up required fields');
    }

    if (this.usernameTaken() || this.emailTaken()) {
      if (this.usernameTaken()) this.toastService.info('Username already exists');
      if (this.emailTaken()) this.toastService.info('Email already exists');
      return;
    }

    // call profile service update
    this.loading.set(true);
    const profileData = this.profileForm.value as Profile;

    const file = this.selectedFile ?? undefined;

    if (typeof profileData?.image !== 'string') {
      profileData.image = '';
    }

    this.profileService
      .updateProfile(profileData, file instanceof File ? file : undefined)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (updatedProfile) => {
          if (updatedProfile.image instanceof File) {
            updatedProfile.image = '';
          }

          const currentClaim = this.authService.userClaim;
          if (currentClaim) {
            this.authService['_userClaim'].set({
              ...currentClaim,
              image: updatedProfile.image,
            });
          }

          this.toastService.success('Profile updated successfully');
          this.router.navigate(['profile'], { state: { profile: updatedProfile } });
        },
        error: () => this.toastService.error('Failed to update profile'),
      });
  }

  backToProfile() {
    this.router.navigate(['profile']);
  }
}
