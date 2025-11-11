import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../service/auth-service';
import { NgClass } from '@angular/common';
import { Role, UserClaim } from '../../../model/auth.model';
import { NAV_ITEMS, Navigation } from '../../../model/navigation.model';
import { LucideAngularModule } from 'lucide-angular';
import { ToastComponent } from '../../shared/toast-component/toast-component';
import { environment } from '@env/environment';
import { ProfileService } from '@/service/profile-service';

@Component({
  selector: 'app-main-component',
  imports: [
    RouterOutlet,
    RouterLink,
    NgClass,
    LucideAngularModule,
    ToastComponent,
    RouterLinkActive,
  ],
  templateUrl: './main-component.html',
  styles: ``,
})
export class MainComponent {
  //DEPENDECIES
  private authService = inject(AuthService);
  private router = inject(Router);
  private profileService = inject(ProfileService);

  isMobileMenuOpen = signal<boolean>(false);
  isDropDownOpen = signal<boolean>(false);

  role = this.authService._role;
  isLoggedIn = this.authService.isLoggedIn;

  libraryId = Number(this.authService.userClaim?.libraryId);

  userInitial = signal('?');
  image = signal('');

  profile = this.profileService.profile;

  imageUrl = environment.imageUrl;

  filteredNavItems = computed(() => {
    const currentRole = this.role();
    return NAV_ITEMS.filter((item) => {
      if (!item.role) return true;
      return this.authService.isLoggedIn()
        ? item.role.includes(currentRole)
        : item.role.includes(Role.Guest);
    });
  });

  constructor() {
    effect(() => {
      const p = this.profile();
      if (p) {
        const newName = p.name;
        const newImage = p.imageThumbnail;
        this.userInitial.set(newName ? newName.charAt(0).toLocaleUpperCase():'?');
        this.image.set(newImage ? newImage as string : '');
      }
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  }

  toggleDropDown() {
    this.isDropDownOpen.set(!this.isDropDownOpen());
  }

  handleLogout() {
    this.isDropDownOpen.set(false);
    this.authService.logout();
  }

  gotoLogin() {
    this.isDropDownOpen.set(false);
    this.router.navigate(['login']);
  }

  gotoProfile() {
    this.isDropDownOpen.set(false);
    this.router.navigate(['profile']);
  }

  gotoMyLibrary() {
    this.router.navigate(['libraries/info', this.libraryId]);
  }

  gotoDashboardOrBooks() {
    if (this.role == Role.Librarian.toString) {
      this.router.navigate(['dashboard']);
    } else {
      this.router.navigate(['books']);
    }
  }

  getLucideCss(isActive: boolean) {
    const baseCss = 'w-5 h-5 group-hover:text-brand1';
    return isActive ? baseCss : baseCss + ' text-brand6';
  }
}
