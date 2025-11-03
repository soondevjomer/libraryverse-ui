import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-error-page-component',
  imports: [RouterLink],
  templateUrl: './error-page-component.html',
  styles: ``
})
export class ErrorPageComponent {
  @Input() code: number | string = 'Error';
  @Input() title: string = 'Something went wrong';
  @Input() message: string = 'An unexpected error occurred.';
  @Input() homeLink: string = '/';
}
