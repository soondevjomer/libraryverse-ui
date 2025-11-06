import { FormMode, Role } from '@/model/auth.model';
import { Profile } from '@/model/profile.model';
import { ToastService } from '@/service/toast-service';
import { log } from '@/utils/logger';
import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '@env/environment';
import { LucideAngularModule } from 'lucide-angular';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-profile-form-component',
  imports: [ReactiveFormsModule, LucideAngularModule, ImageCropperComponent],
  templateUrl: './profile-form-component.html',
  styles: ``,
})
export class ProfileFormComponent implements OnInit {
  //DEPENDENCIES
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  @Input() profile!: Profile;
  @Input() isSubmitting = signal(false);
  @Input() submittingInfo = signal<string | null>(null);
  @Input() formMode: FormMode = FormMode.Edit;
  @Input() usernameTaken = false;
  @Input() emailTaken = false;
  @Input() role:Role = Role.Guest;
  @Output() create = new EventEmitter<{ profile: Profile; file?: File }>();
  @Output() usernameChanged = new EventEmitter<string>();
  @Output() emailChanged = new EventEmitter<string>();

  previewUrl = signal<string | ArrayBuffer | null>(null);
  fileError: string | null = null;
  submitted: boolean = false;
  isPreviewLoading = signal(false);
  showCropper = signal(false);
  imageChangeEvent = signal<any>(null);
  croppedFile: File | null = null;
  cropWidth = signal(1024);
  cropHeight = signal(1536);

  profileForm!: FormGroup;

  baseUrl = environment.apiBaseUrl;
  Role = Role;

  ngOnInit(): void {
    this.profileForm = this.buildForm();
    if (this.profile) this.patchProfile(this.profile);

    this.profileForm.get('username')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe(v => this.usernameChanged.emit(v));

    this.profileForm.get('email')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe(v => this.emailChanged.emit(v));
    
  }

  buildForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', Validators.required],
      address: [''],
      contactNumber: [''],
      image: [null],
      imageThumbnail: [null],
    });
  }

  patchProfile(profile: Profile): void {
    if (!profile) return;
    this.profileForm.patchValue({
      name: profile.name ?? '',
      username: profile.username ?? '',
      email: profile.email ?? '',
      address: profile.address ?? '',
      contactNumber: profile.contactNumber ?? '',
      image: profile.image ?? null,
      imageThumbnail: profile.image ?? null,
    });
  }

  onSave() {
    this.submitted = true;
    if (this.profileForm.invalid || this.fileError) {
      this.toastService.info("Please fill up required fields");
      this.profileForm.markAllAsTouched();
      return;
    }
    const profile = this.profileForm.value as Profile;
    if (this.croppedFile) {
      this.create.emit({ profile, file: this.croppedFile });
    } else {
      this.create.emit({ profile });
    }
  }

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
      this.profileForm.get('image')?.reset();
      return;
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB < minSizeMb || sizeMB > maxSizeMb) {
      this.fileError = `Profile image must be between ${minSizeMb} MB and ${maxSizeMb} MB.`;
      this.previewUrl.set(null);
      this.profileForm.get('image')?.reset();
      return;
    }

    this.imageChangeEvent.set(event);
    this.showCropper.set(true);
  }

  onImageCropped(e: ImageCroppedEvent) {
    if (!e.blob) return;

    const mimeType = e.blob.type || 'image/png';
    const ext = mimeType.split('/')[1]; // "png", "jpeg", etc.

    this.croppedFile = new File([e.blob], `profile-image.${ext}`, { type: mimeType });

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
    this.profileForm.get('image')?.setValue(this.croppedFile);
    this.showCropper.set(false);
  }

  cancelCrop() {
    this.showCropper.set(false);
    this.croppedFile = null;
    this.imageChangeEvent.set(null);
    this.profileForm.get('image')?.setValue(null);
  }

  removeCover() {
    this.previewUrl.set(null);
    this.fileError = null;
    this.profileForm.get('image')?.reset();
  }
}
