import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Library } from '../../../model/library.model';
import { Role } from '../../../model/auth.model';
import { environment } from '../../../environment/environment';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-library-card-component',
  imports: [LucideAngularModule],
  templateUrl: './library-card-component.html',
  styles: ``
})
export class LibraryCardComponent {

  @Input() library!: Library;
  @Input() libraryId: number = 0;
  @Input() role!: Role;
  @Output() view = new EventEmitter<Library>();
  @Output() edit = new EventEmitter<Library>();
  
  Role = Role;

  baseUrl = environment.apiBaseUrl;
  defaultLibraryCover = environment.defaultLibraryCover;

  truncateText(text: string | undefined, limit: number): string {
    if (!text) return '';
    return text.length > limit ? text.substring(0, limit) + '…' : text;
  }

  onView(library: Library) {
    if (!library) return;
    console.log('handling view of libraryId: ', library.id);
    this.view.emit(this.library);
  }

  onEdit(library: Library) {
    if (!library) return;
    console.log('handling edit of libraryId: ', library.id);
    this.edit.emit(library);
  }
}
