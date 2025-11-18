import { ErrorPageComponent } from '@/component/shared/error-page-component/error-page-component';
import { Component } from '@angular/core';

@Component({
  selector: 'app-server-down-component',
  imports: [ErrorPageComponent],
  template: `
  <app-error-page-component
  [code]="0"
  title="Server Unavailable"
  message="We couldn't connect to the server. Try again in a few moments."
  homeLink="login"
  ></app-error-page-component>
  `,
  styles: ``
})
export class ServerDownComponent {

}
