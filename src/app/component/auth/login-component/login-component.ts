import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../service/auth-service';
import { Router } from '@angular/router';
import { LoginRequest, Role } from '../../../model/auth.model';
import { ToastService } from '../../../service/toast-service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-login-component',
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './login-component.html',
})
export class LoginComponent implements OnInit {
  // DEPENDECIES
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  loginForm!: FormGroup;
  errorMessage: string | null = null;
  Role = Role;
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  handleLogin() {
    if (this.loginForm.invalid) {
      this.toastService.info("Please fill up required fields");
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.authService.login(this.loginForm.value as LoginRequest).subscribe({
      next: () => {
        const role = this.authService.userClaim?.role;
        this.isLoading.set(false);
        if (role == Role.Librarian) {
          this.toastService.success('Login successfully');
          this.router.navigate(['dashboard']);
        }
        else {
          this.toastService.success('Login successfully');
          this.router.navigate(['books']);
        }
      },
      error: (err) => {
        this.toastService.error('Login failed');
        error('Login error:', err);
        this.isLoading.set(false);
      },
    });
  }

  goRegister() {
    this.router.navigate(['register']);
  }
}
