import { Component } from '@angular/core';
import { ErrorPageComponent } from 'app/component/shared/error-page-component/error-page-component';

@Component({
  selector: 'app-internal-server-component',
  imports: [ErrorPageComponent],
  template: `
  <app-error-page-component
  [code]="500"
  title="Internal Server Error."
  message="The server encountered an internal error or misconfiguration and was unable to complete your request. <br>
        Please contact the server administrator at support@libraryverse.com and inform them of the time this error occured, and the actions you performed just before this error. <br>
        More information about this error may be available in the server log."
  homeLink="/books"
  >
  </app-error-page-component>
  `,
  styles: ``
})
export class InternalServerComponent {

}
