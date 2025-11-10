import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { Library } from '../../../model/library.model';
import { FormMode, Role } from '../../../model/auth.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { log } from '@/utils/logger';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-library-form-component',
  imports: [ReactiveFormsModule, LucideAngularModule, ImageCropperComponent],
  templateUrl: './library-form-component.html',
  styleUrl: './library-form-component.css',
})
export class LibraryFormComponent implements OnInit {
  // DEPENDENCIES
  private fb = inject(FormBuilder);

  // DATA
  @Input() library!: Library;
  @Input() formMode: FormMode = FormMode.Edit;
  @Input() isSubmitting = signal(false);
  @Input() submittingInfo = signal<string | null>(null);
  @Output() saveEdit = new EventEmitter<{ library: Library; file?: File }>();

  // FORMS
  libraryForm!: FormGroup;
  FormMode = FormMode;

  // UTILS
  previewUrl = signal<string | ArrayBuffer | null>(null);
  fileError: string | null = null;
  submitted: boolean = false;
  isPreviewLoading = signal(false);
  showCropper = signal(false);
  imageChangeEvent = signal<any>(null);
  croppedFile: File | null = null;
  cropWidth = signal(1920);
  cropHeight = signal(960);

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
      libraryThumbnailCover: [null],
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
    const library = this.libraryForm.value as Library;
    if (this.croppedFile) {
    this.saveEdit.emit({ library, file: this.croppedFile });
  } else {
    this.saveEdit.emit({ library });
  }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const sizeMB = file.size / (1024 * 1024);
    const minSizeMb = 0.001;
    const maxSizeMb = 10;

    if (sizeMB < minSizeMb || sizeMB > maxSizeMb) {
      this.fileError = `Library cover must be between ${minSizeMb} MB and ${maxSizeMb} MB.`;
      this.previewUrl.set(null);
      this.libraryForm.get('libraryCover')?.reset();
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      this.fileError = 'Only JPG, PNG, WEBP formats are allowed.';
      this.previewUrl.set(null);
      this.libraryForm.get('libraryCover')?.reset();
      return;
    }

    this.imageChangeEvent.set(event);
    this.showCropper.set(true);
  }

  onImageCropped(e: ImageCroppedEvent) {
    if (!e.blob) return;

    const mimeType = e.blob.type || 'image/png';
    const ext = mimeType.split('/')[1]; // "png", "jpeg", etc.

    this.croppedFile = new File([e.blob], `library-cover.${ext}`, { type: mimeType });

    log('croppedFile ', this.croppedFile);
    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result);
    reader.readAsDataURL(this.croppedFile);
  }

  confirmCrop() {
    if (!this.croppedFile) {
      this.fileError = 'Please crop the image first.';
      return;
    }
    this.libraryForm.get('libraryCover')?.setValue(null);
    this.showCropper.set(false);
  }

  cancelCrop() {
    this.showCropper.set(false);
    this.croppedFile = null;
    this.imageChangeEvent.set(null);
    this.libraryForm.get('libraryCover')?.setValue(null);
  }

  removeCover() {
    this.previewUrl.set(null);
    this.fileError = null;
    this.libraryForm.get('libraryCover')?.reset();
  }
}
