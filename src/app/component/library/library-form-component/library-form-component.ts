import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Library } from '../../../model/library.model';
import { FormMode, Role } from '../../../model/auth.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-library-form-component',
  imports: [ReactiveFormsModule],
  templateUrl: './library-form-component.html',
  styleUrl: './library-form-component.css',
})
export class LibraryFormComponent implements OnInit {
  // DEPENDENCIES
  private fb = inject(FormBuilder);

  // DATA
  @Input() library!: Library;
  @Input() formMode: FormMode = FormMode.Edit;
  @Output() saveEdit = new EventEmitter<Library>();

  // FORMS
  libraryForm!: FormGroup;
  FormMode = FormMode;

  // UTILS
  previewUrl: string | ArrayBuffer | null = null;
  fileError: string | null = null;
  submitted: boolean = false;

  ngOnInit(): void {
    this.libraryForm = this.buildForm();
    if (this.library) this.patchLibrary(this.library);
  }

  buildForm(): FormGroup {
    return this.fb.group({
      id: [0],
      name: ['', Validators.required],
      address: [],
      contactNumber: [],
      description: [],
      libraryCover: [null],
    });
  }

  private patchLibrary(library: Library): void {
    if (!library) return;
    this.libraryForm.patchValue({
      id: library.id ?? 0,
      name: library.name ?? 'Library No Name',
      address: library.address ?? '',
      description: library.description ?? '',
      contactNumber: library.contactNumber ?? '',
      libraryCover: library.libraryCover ?? null,
    });
  }

  onEdit() {
    this.submitted = true;
    if (this.libraryForm.invalid || this.fileError) {
      this.libraryForm.markAllAsTouched();
      return;
    }
    this.saveEdit.emit(this.libraryForm.value as Library);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const sizeMB = file.size / (1024 * 1024);

    if (sizeMB < 0.01 || sizeMB > 5) {
      this.fileError = 'Library cover must be between 0.2 MB and 5 MB.';
      this.previewUrl = null;
      this.libraryForm.get('libraryCover')?.reset();
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      this.fileError = 'Only JPG, PNG, or WEBP formats are allowed.';
      this.previewUrl = null;
      this.libraryForm.get('libraryCover')?.reset();
      return;
    }

    this.fileError = null;
    this.libraryForm.get('libraryCover')?.setValue(file);
    const reader = new FileReader();
    reader.onload = () => (this.previewUrl = reader.result);
    reader.readAsDataURL(file);
  }

  removeCover() {
    this.previewUrl = null;
    this.fileError = null;
    this.libraryForm.get('libraryCover')?.reset();
  }
}
