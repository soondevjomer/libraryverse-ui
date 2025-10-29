import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../service/auth-service';

@Component({
  selector: 'app-library-books-component',
  imports: [],
  templateUrl: './library-books-component.html',
  styles: ``
})
export class LibraryBooksComponent implements OnInit{
  //DEPENDENCIES
  private authService = inject(AuthService);

  libraryId = this.authService.userClaim?.libraryId;

  ngOnInit(): void {
      
  }
}
