import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  Signal,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormMode, Role } from '../../../model/auth.model';
import { Book } from '../../../model/book.model';
import { LucideAngularModule } from 'lucide-angular';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { log } from '@/utils/logger';

@Component({
  selector: 'app-book-form-component',
  imports: [ReactiveFormsModule, LucideAngularModule, ImageCropperComponent],
  templateUrl: './book-form-component.html',
  styles: ``,
})
export class BookFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() book!: Book;
  @Input() role!: Role;
  @Input() isSubmitting = signal(false);
  @Input() submittingInfo = signal<string | null>(null);
  @Input() formMode: FormMode = FormMode.Add;
  @Output() create = new EventEmitter<{ book: Book; file?: File }>();
  @Output() edit = new EventEmitter<{ book: Book; file?: File }>();
  @Output() bookCopy = new EventEmitter<{ book: Book; file?: File }>();

  bookForm!: FormGroup;
  genreInput = new FormControl('');
  authorInput = new FormControl('');
  genres: string[] = [];
  authors: string[] = [];

  FormMode = FormMode;

  previewUrl = signal<string | ArrayBuffer | null>(null);
  fileError: string | null = null;
  submitted: boolean = false;
  isPreviewLoading = signal(false);
  showCropper = signal(false);
  imageChangeEvent = signal<any>(null);
  croppedFile: File | null = null;
  cropWidth = signal(1024);
  cropHeight = signal(1536);

  ngOnInit(): void {
    this.bookForm = this.buildForm();
    if (this.book) this.patchBook(this.book);
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      id: [0],
      isbn: ['', Validators.required],
      bookDetail: this.fb.group({
        id: [0],
        title: ['', Validators.required],
        seriesTitle: [''],
        description: [''],
        bookCover: [null],
        bookThumbnailCover: [null],
        genres: [[]],
        authors: [[]],
        publisher: [''],
        publishedYear: [new Date().getFullYear()],
        price: [
          0,
          [
            Validators.min(0),
            Validators.pattern(/^\d+(\.\d{1,2})?$/), // up to 2 decimal places
          ],
        ],
        quantity: [0, [Validators.min(0)]],
      }),
    });
  }

  private patchBook(book: Book): void {
    if (!book) return;
    this.bookForm.patchValue({
      id: book.id ?? 0,
      isbn: book.isbn ?? '',
      bookDetail: {
        id: book.bookDetail?.id ?? 0,
        title: book.bookDetail?.title ?? '',
        seriesTitle: book.bookDetail?.seriesTitle ?? '',
        description: book.bookDetail?.description ?? '',
        bookCover: book.bookDetail?.bookCover ?? null,
        bookThumbnailCover: book.bookDetail?.bookThumbnailCover ?? null,
        genres: book.bookDetail?.genres ?? [],
        authors: book.bookDetail?.authors ?? [],
        publisher: book.bookDetail?.publisher ?? '',
        publishedYear: book.bookDetail?.publishedYear ?? new Date().getFullYear(),
        price: book.bookDetail?.price ?? 0,
        quantity: book.inventory?.availableStock ?? 0,
      },
    });
    this.genres = [...(book.bookDetail?.genres ?? [])];
    this.authors = [...(book.bookDetail?.authors ?? [])];
  }

  onResetForm():void {
    this.bookForm.reset({
      id: 0,
      isbn: '',
      bookDetail: {
        id: 0,
        title: '',
        seriesTitle: '',
        description: '',
        bookCover: null,
        bookThumbnailCover: null,
        genres: [],
        authors: [],
        publisher: '',
        publishedYear: new Date().getFullYear(),
        price: 0,
        quantity: 0,
      },
    });
    this.genres = [];
    this.authors = [];
  }

  // ---------- CRUD Emitters ----------
  onCreate() {
    this.submitted = true;
    if (this.bookForm.invalid || this.fileError) {
      this.bookForm.markAllAsTouched();
      return;
    }
    const book = this.bookForm.value as Book;
    if (this.croppedFile) {
      this.create.emit({ book, file: this.croppedFile });
    } else {
      this.create.emit({ book });
    }
  }

  onSave() {
    this.submitted = true;
    if (this.bookForm.invalid || this.fileError) {
      this.bookForm.markAllAsTouched();
      return;
    }
    const book = this.bookForm.value as Book;
    if (this.croppedFile) {
      this.edit.emit({ book, file: this.croppedFile });
    } else {
      this.edit.emit({ book });
    }
  }

  onCopy() {
    this.submitted = true;
    if (this.bookForm.invalid || this.fileError) {
      this.bookForm.markAllAsTouched();
      return;
    }
    const book = this.bookForm.value as Book;

    if (this.croppedFile) {
      this.bookCopy.emit({ book, file: this.croppedFile });
    } else {
      this.bookCopy.emit({ book });
  }
  }

  // ---------- Genre / Author ----------
  addGenre() {
    const value = this.genreInput.value?.trim();
    if (value && !this.genres.includes(value)) {
      this.genres.push(value);
      this.bookForm.get('bookDetail.genres')?.setValue(this.genres);
    }
    this.genreInput.reset();
  }

  addAuthor() {
    const value = this.authorInput.value?.trim();
    if (value && !this.authors.includes(value)) {
      this.authors.push(value);
      this.bookForm.get('bookDetail.authors')?.setValue(this.authors);
    }
    this.authorInput.reset();
  }

  removeGenre(name: string): void {
    this.handleRemoveChip(name, this.genres, 'bookDetail.genres');
  }

  removeAuthor(name: string): void {
    this.handleRemoveChip(name, this.authors, 'bookDetail.authors');
  }

  onGenreKeyDown(e: KeyboardEvent) {
    this.handleAddChip(e, this.genreInput, this.genres, 'bookDetail.genres');
  }

  onAuthorKeyDown(e: KeyboardEvent) {
    this.handleAddChip(e, this.authorInput, this.authors, 'bookDetail.authors');
  }

  private handleAddChip(
    e: KeyboardEvent,
    input: FormControl,
    list: string[],
    formControlPath: string
  ) {
    const value = input.value?.trim();
    if (e.key === 'Enter' && value) {
      if (!list.includes(value)) {
        list.push(value);
        this.bookForm.get(formControlPath)?.setValue(list);
      }
      input.reset();
      e.preventDefault();
    }
  }

  private handleRemoveChip(name: string, list: string[], path: string) {
    const updated = list.filter((item) => item !== name);
    this.bookForm.get(path)?.setValue(updated);
    if (path.includes('genres')) this.genres = updated;
    if (path.includes('authors')) this.authors = updated;
  }

  // ---------- File Upload ----------
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const minSizeMb = 0.001;
    const maxSizeMb = 10;

    if (!allowedTypes.includes(file.type)) {
      this.fileError = 'Only JPG, PNG, WEBP formats are allowed.';
      this.previewUrl.set(null);
      this.bookForm.get('bookDetail.bookCover')?.reset();
      return;
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB < minSizeMb || sizeMB > maxSizeMb) {
      this.fileError = `Book cover must be between ${minSizeMb} MB and ${maxSizeMb} MB.`;
      this.previewUrl.set(null);
      this.bookForm.get('bookDetail.bookCover')?.reset();
      return;
    }

    this.imageChangeEvent.set(event);
    this.showCropper.set(true);
  }

  onImageCropped(e: ImageCroppedEvent) {
    if (!e.blob) return;

    const mimeType = e.blob.type || 'image/png';
    const ext = mimeType.split('/')[1]; // "png", "jpeg", etc.

    this.croppedFile = new File([e.blob], `book-cover.${ext}`, { type: mimeType });
    this.fileError=null;

    log('croppedFIle ', this.croppedFile);
    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result);
    reader.readAsDataURL(this.croppedFile);
  }

  confirmCrop() {
    if (!this.croppedFile) {
      this.fileError = 'Please crop the image first.';
      return;
    }
    this.bookForm.get('bookDetail.bookCover')?.setValue(this.croppedFile);
    this.showCropper.set(false);
  }

  cancelCrop() {
    this.showCropper.set(false);
    this.croppedFile = null;
    this.imageChangeEvent.set(null);
    this.bookForm.get('bookDetail.bookCover')?.setValue(null);
  }

  removeCover() {
    this.previewUrl.set(null);
    this.fileError = null;
    this.bookForm.get('bookDetail.bookCover')?.reset();
  }
}
