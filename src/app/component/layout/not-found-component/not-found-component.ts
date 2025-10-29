import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found-component',
  imports: [],
  templateUrl: './not-found-component.html',
  styles: ``
})
export class NotFoundComponent {
  private router = inject(Router);

  goBackHome() {
    console.log('back home');
    this.router.navigate(['login']);
  }
}
