import { error, log } from '@/utils/logger';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, tap } from 'rxjs';
import { FormMode } from '../../../model/auth.model';
import { Library } from '../../../model/library.model';
import { AuthService } from '../../../service/auth-service';
import { LibraryService } from '../../../service/library-service';
import { ToastService } from '../../../service/toast-service';
import { LibraryFormComponent } from '../library-form-component/library-form-component';

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
  loadingInfo = signal<string | null>(null);

  ngOnInit(): void {
    this.library = window.history.state['library'];
    if (!this.library) {
      this.toastService.info('No library found');
      return;
    }

    log('library: ', this.library);
  }

  handleLibraryEdit({ library, file }: { library: Library; file?: File }) {
    if (!library) return;
    this.loading.set(true);
    this.loadingInfo.set('Updating library...');

    this.libraryService
      .updateLibraryById(library.id, library, file)
      .pipe(
        tap((updatedLibrary) => log('Library updated successfully: ', updatedLibrary)),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (updatedLibrary) => {
          this.toastService.success('Library updated successfully');
          this.router.navigate(['libraries', updatedLibrary.id], {
            state: { library: updatedLibrary },
          });
        },
        error: (err) => {
          if (err instanceof ProgressEvent) {
            log('Non-critical parse error (empty response), ignoring.');
            this.toastService.success('Library updated successfully');
            this.router.navigate(['libraries', library.id], { state: { library } });
            return;
          }
          error('Error updating library: ', err);
          this.toastService.error('Failed to update library');
        },
      });
  }
}
