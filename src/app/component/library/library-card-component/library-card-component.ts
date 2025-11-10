import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Library } from '../../../model/library.model';
import { Role } from '../../../model/auth.model';
import { environment } from '@env/environment';
import { LucideAngularModule } from 'lucide-angular';
import { log } from '@/utils/logger';

@Component({
  selector: 'app-library-card-component',
  imports: [LucideAngularModule],
  templateUrl: './library-card-component.html',
  styles: ``,
})
export class LibraryCardComponent {
  @Input() library!: Library;
  @Input() libraryId: number = 0;
  @Input() isLoggedIn: boolean = false;
  @Input() role!: Role;
  @Output() view = new EventEmitter<Library>();
  @Output() edit = new EventEmitter<Library>();

  Role = Role;

  imageUrl = environment.imageUrl;
  defaultLibraryCover = environment.defaultLibraryCover;

  truncateText(text: string | undefined | null, maxLength: number): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;

    // Find last space before maxLength - 3 to avoid cutting mid-word
    let truncated = text.slice(0, maxLength - 3);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0) truncated = truncated.slice(0, lastSpace);

    return truncated + '...';
  }

  onView(library: Library) {
    if (!library) return;
    log('handling view of libraryId: ', library.id);
    this.view.emit(this.library);
  }

  onEdit(library: Library) {
    if (!library) return;
    log('handling edit of libraryId: ', library.id);
    this.edit.emit(library);
  }
}
