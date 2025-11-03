import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../service/auth-service';
import { Router } from '@angular/router';
import { Role } from '../../../model/auth.model';
import { ToastService } from '../../../service/toast-service';
import { debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { ProfileService } from '../../../service/profile-service';
import { LucideAngularModule } from 'lucide-angular';
import { log } from '@/utils/logger';

@Component({
  selector: 'app-register-component',
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './register-component.html',
  styles: ``,
})
export class RegisterComponent implements OnInit {
  // DEPENDECIES
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private profileService = inject(ProfileService);

  // SIGNALS
  emailTaken = signal(false);
  usernameTaken = signal(false);
  loading = signal(false);

  registerForm!: FormGroup;
  Role = Role;

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      role: [Role.Reader, Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.registerForm
      .get('email')
      ?.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((email) => {
          if (!email || this.registerForm.get('email')?.invalid) {
            this.emailTaken.set(false);
            return of(null);
          }
          return this.profileService.emailExist({
            request: this.registerForm.get('email')?.value,
            current: '',
          });
        })
      )
      .subscribe({
        next: (res) => this.emailTaken.set(!!res?.exist),
        error: () => this.emailTaken.set(false),
      });

    this.registerForm
      .get('username')
      ?.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((username) => {
          if (!username || this.registerForm.get('username')?.invalid) {
            this.usernameTaken.set(false);
            return of(null);
          }
          return this.profileService.usernameExist({
            request: this.registerForm.get('username')?.value,
            current: '',
          });
        })
      )
      .subscribe({
        next: (res) => {
          log('response if username exists: ', res?.exist);
          this.usernameTaken.set(!!res?.exist);
          log('response exists: ', this.usernameTaken());
        },
        error: () => this.usernameTaken.set(false),
      });
  }

  handleRegister() {
    this.loading.set(true);
    if (this.registerForm.invalid) {
      this.toastService.info('Please fill up required fields');
      this.loading.set(false);
      return;
    }

    if (this.usernameTaken() || this.emailTaken()) {
      if (this.usernameTaken()) this.toastService.info('Username already exists');
      if (this.emailTaken()) this.toastService.info('Email already exists');
      this.loading.set(false);
      return;
    }

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        const role = this.authService.userClaim?.role;
        if (role == Role.Librarian) {
          log('claims: ', this.authService.userClaim);
          this.toastService.success('Registered successfully');
          this.loading.set(false);
          this.router.navigate(['dashboard']);
        } else {
          log('claims: ', this.authService.userClaim);
          this.toastService.success('Registered successfully');
          this.loading.set(false);
          this.router.navigate(['books']);
        }
      },
      error: (error: any) => {
        this.toastService.error('Failed to register. Please try again');
        error('Register error:', error);
        this.loading.set(false);
      },
    });
  }

  goLogin() {
    this.router.navigate(['login']);
  }
}
