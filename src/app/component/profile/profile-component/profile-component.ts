import { Component, OnInit, inject, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Profile } from '../../../model/profile.model';
import { environment } from '../../../environment/environment';
import { AuthService } from '../../../service/auth-service';
import { Router } from '@angular/router';
import { ProfileService } from '../../../service/profile-service'; // make sure this exists
import { toSignal } from '@angular/core/rxjs-interop'; // helper to convert Observable -> Signal

@Component({
  selector: 'app-profile-component',
  imports: [LucideAngularModule],
  templateUrl: './profile-component.html',
  styles: ``,
  standalone: true,
})
export class ProfileComponent implements OnInit {
  // DEPENDENCIES
  private authService = inject(AuthService);
  private router = inject(Router);
  private profileService = inject(ProfileService);

  baseUrl = environment.apiBaseUrl;

  // REACTIVE STATE
  loading = signal(false);
  error = signal<string | null>(null);
  profile = signal<Profile | null>(null);

  ngOnInit() {
    const cachedProfile = window.history.state['profile'] as Profile | undefined;
    console.log('cachedProfile: ', cachedProfile);
    if (cachedProfile) {
      this.profile.set(cachedProfile);
    } else {
      this.fetchProfile();
    }
  }

  private fetchProfile() {
    this.loading.set(true);
    this.error.set(null);

    this.profileService.getProfile().subscribe({
      next: (data) => {
        this.profile.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load profile:', err);
        this.error.set('Failed to load profile.');
        this.loading.set(false);
      },
    });
  }

  // FUNCTIONS
  getInitial(name: string | undefined): string {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  }

  goEditProfile() {
    this.router.navigate(['profile/edit'], {state:{profile:this.profile()}});
  }
}
