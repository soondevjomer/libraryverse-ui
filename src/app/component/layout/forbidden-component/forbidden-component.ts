import { Component } from '@angular/core';
import { ErrorPageComponent } from 'app/component/shared/error-page-component/error-page-component';

@Component({
  selector: 'app-forbidden-component',
  imports: [ErrorPageComponent],
  template: `
  <app-error-page-component
  [code]="403"
  title="Access Denied."
  message="You don’t have permission to view this page. Please check your account
        role or contact an administrator."
  homeLink="/books"
  >
  </app-error-page-component>
  `,
  styles: ``
})
export class ForbiddenComponent {}
