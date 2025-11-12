import { ChangePasswordRequest } from '@/model/profile.model';
import { ProfileService } from '@/service/profile-service';
import { error, log } from '@/utils/logger';
import { NgClass } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { catchError, tap, finalize } from 'rxjs';
import { ToastService } from '../../../service/toast-service';

@Component({
  selector: 'app-change-password-component',
  imports: [ReactiveFormsModule, NgClass, LucideAngularModule],
  templateUrl: './change-password-component.html',
  styles: ``,
})
export class ChangePasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private profileService = inject(ProfileService);
  private toastService = inject(ToastService);

  changePasswordForm!: FormGroup;

  // SIGNALS
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  loading = signal(false);

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm() {
    this.changePasswordForm = this.fb.group({
      current: ['', Validators.required],
      newPassword: ['', Validators.required],
    });
  }

  backToProfile() {
    this.router.navigate(['profile']);
  }

  toggleShowPassword(show: 'current' | 'newPassword') {
    show == 'current'
      ? this.showCurrentPassword.set(!this.showCurrentPassword())
      : this.showNewPassword.set(!this.showNewPassword());
  }

  handleChangePassword() {
    if (!this.changePasswordForm.valid) return;
    log('proceed changing password');

    if (
      this.changePasswordForm.get('current')?.value ==
      this.changePasswordForm.get('newPassword')?.value
    ) {
      this.toastService.error('New password should not be the same as current password');
      return;
    }

    this.loading.set(true);
    const request = this.changePasswordForm.value as ChangePasswordRequest;
    this.profileService.changePassword(request).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.result) {
          log('Password changed successfully');
          this.toastService.success('Password changed successfully');
          this.router.navigate(['profile']);
          return;
        }
        error('Have response but failed changing password please try again. caused: ', res);
        this.toastService.error('Failed to change password please try again');
      },
      error: (err) => {
        this.loading.set(false);
        error('Failed changing password please try again. caused: ', err);
        this.toastService.error('Failed to change password please try again');
      },
    });
  }
}
