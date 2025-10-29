import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../service/auth-service';
import { NgClass } from '@angular/common';
import { Role, UserClaim } from '../../../model/auth.model';
import { NAV_ITEMS, Navigation } from '../../../model/navigation.model';
import { LucideAngularModule } from 'lucide-angular';
import { ToastComponent } from '../../shared/toast-component/toast-component';
import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-main-component',
  imports: [RouterOutlet, RouterLink, NgClass, LucideAngularModule, ToastComponent],
  templateUrl: './main-component.html',
  styles: ``,
})
export class MainComponent {
  //DEPENDECIES
  private authService = inject(AuthService);
  private router = inject(Router);

  isMobileMenuOpen: boolean = false;
  isDropDownOpen = false;

  role = this.authService._role;
  isLoggedIn = this.authService.isLoggedIn;
  name = signal<string | undefined>(this.authService.userClaim?.name);

  userClaim = computed(() => this.authService.userClaim);

  userInitial = signal('?');
  image = signal('');

  baseUrl = environment.apiBaseUrl;

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
      const claim = this.userClaim();
      const newName = claim?.name;
      const image = claim?.image;

      this.userInitial.set(newName ? newName.charAt(0).toUpperCase() : '?');
      this.image.set(image ? image : '');
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleDropDown() {
    this.isDropDownOpen = !this.isDropDownOpen;
  }

  handleLogout() {
    this.isDropDownOpen = false;
    this.authService.logout();
  }

  gotoLogin() {
    this.toggleDropDown();
    this.router.navigate(['login']);
  }

  gotoProfile() {
    this.toggleDropDown();
    this.router.navigate(['profile']);
  }

  gotoDashboardOrBooks() {
    if (this.role==Role.Librarian.toString) {
      this.router.navigate(['dashboard']);
    } else {
      this.router.navigate(['books']);
    }
    
  }
}
