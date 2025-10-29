import { Component, inject, OnInit, signal } from '@angular/core';
import { Library } from '../../../model/library.model';
import { LibraryService } from '../../../service/library-service';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';
import { LibraryFormComponent } from '../library-form-component/library-form-component';
import { AuthService } from '../../../service/auth-service';
import { FormMode } from '../../../model/auth.model';
import { ToastService } from '../../../service/toast-service';

@Component({
  selector: 'app-library-edit-component',
  imports: [LibraryFormComponent],
  templateUrl: './library-edit-component.html',
  styleUrl: './library-edit-component.css',
})
export class LibraryEditComponent implements OnInit {
  // DEPENDENCIES
  private libraryService = inject(LibraryService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  // DATA
  library: Library = {} as Library;

  // USER INFO
  role = this.authService._role;

  editMode = FormMode.Edit;

  // UI STATES
  loading = signal<boolean>(false);

  ngOnInit(): void {
    console.log('First check if library id and user library id is same to access this');
    console.log('Library Edit Component on init');
    this.library = window.history.state['library'];
    if (!this.library) {
      this.toastService.info('No library found');
      return;
    }

    console.log('library: ', this.library);
  }

  handleLibraryEdit(library: Library) {
    if (!library) return;
    console.log('UPDATING LIBRARY WITH THIS: ', library);
    this.loading.set(true);

    const file = library.libraryCover;

    if (typeof library.libraryCover !== 'string') {
      library.libraryCover = '';
    }

    this.libraryService
      .updateLibraryById(library.id, library, file instanceof File ? file : undefined)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (updatedLibrary) => {
          console.log('Library updated successfully: ', updatedLibrary);
          this.toastService.success('Library updated successfully');
          this.router.navigate(['libraries', updatedLibrary.id]);
        },
        error: (error) => {
          console.error('Error updating library: ', error);
          this.toastService.error('Failed to update library');
        },
      });
  }
}
