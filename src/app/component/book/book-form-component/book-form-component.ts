import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Book } from '../../../model/book.model';
import { FormMode, Role } from '../../../model/auth.model';
import { BookService } from '../../../service/book-service';

@Component({
  selector: 'app-book-form-component',
  imports: [ReactiveFormsModule],
  templateUrl: './book-form-component.html',
  styles: ``,
})
export class BookFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private bookService = inject(BookService);

  @Input() book!: Book;
  @Input() role!: Role;
  @Input() formMode: FormMode = FormMode.Add;
  @Output() create = new EventEmitter<Book>();
  @Output() edit = new EventEmitter<Book>();
  @Output() bookCopy = new EventEmitter<Book>();

  bookForm!: FormGroup;
  genreInput = new FormControl('');
  authorInput = new FormControl('');
  genres: string[] = [];
  authors: string[] = [];

  FormMode = FormMode;

  previewUrl: string | ArrayBuffer | null = null;
  fileError: string | null = null;
  submitted: boolean = false;

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

  // ---------- CRUD Emitters ----------
  onCreate() {
    this.submitted=true;
    if (this.bookForm.invalid || this.fileError) {
      this.bookForm.markAllAsTouched();
      return;
    }
    this.create.emit(this.bookForm.value as Book);
  }

  onSave() {
    this.submitted=true;
    if (this.bookForm.invalid || this.fileError) {
      this.bookForm.markAllAsTouched();
      return;
    }
    this.edit.emit(this.bookForm.value as Book);
  }

  onCopy() {
    this.submitted=true;
    if (this.bookForm.invalid || this.fileError) {
      this.bookForm.markAllAsTouched();
      return;
    }
    this.bookCopy.emit(this.bookForm.value as Book);
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
    const sizeMB = file.size / (1024 * 1024);

    if (sizeMB < 0.01 || sizeMB > 5) {
      this.fileError = 'Book cover must be between 0.2 MB and 5 MB.';
      this.previewUrl = null;
      this.bookForm.get('bookDetail.bookCover')?.reset();
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      this.fileError = 'Only JPG, PNG, or WEBP formats are allowed.';
      this.previewUrl = null;
      this.bookForm.get('bookDetail.bookCover')?.reset();
      return;
    }

    this.fileError = null;
    this.bookForm.get('bookDetail.bookCover')?.setValue(file);
    const reader = new FileReader();
    reader.onload = () => (this.previewUrl = reader.result);
    reader.readAsDataURL(file);
  }

  removeCover() {
    this.previewUrl = null;
    this.fileError = null;
    this.bookForm.get('bookDetail.bookCover')?.reset();
  }
}
