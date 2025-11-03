import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorPageComponent } from 'app/component/shared/error-page-component/error-page-component';

@Component({
  selector: 'app-not-found-component',
  imports: [ErrorPageComponent],
  template: `
  <app-error-page-component
  [code]="404"
  title="Page not found."
  message="The page you’re looking for doesn’t exist or has been moved."
  homeLink="/books"
  >
  </app-error-page-component>
  `,
  styles: ``
})
export class NotFoundComponent {}
