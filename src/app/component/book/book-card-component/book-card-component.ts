import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Book } from '../../../model/book.model';
import { Role } from '../../../model/auth.model';
import { DecimalPipe, NgClass } from '@angular/common';
import { environment } from '@env/environment';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-book-card-component',
  imports: [DecimalPipe, LucideAngularModule, NgClass],
  templateUrl: './book-card-component.html',
  styles: ``,
})
export class BookCardComponent {
  // COMMUNICATE OUTSIDE
  @Input() book!: Book;
  @Input() libraryId: number = 0;
  @Input() role!: Role;
  @Input() isLoggedIn:boolean = false;
  @Output() view = new EventEmitter<Book>();
  @Output() addToCart = new EventEmitter<Book>();
  @Output() buy = new EventEmitter<Book>();
  @Output() edit = new EventEmitter<Book>();
  @Output() copy = new EventEmitter<Book>();
  @Output() toLibrary = new EventEmitter<number>();

  baseUrl = environment.apiBaseUrl;
  defaultBookCover = environment.defaultBookCover;
  Role = Role;

  isAnimating: boolean = false;

  //FUNCTIONS
  truncateText(text: string | undefined | null, maxLength: number): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;

    // Find last space before maxLength - 3 to avoid cutting mid-word
    let truncated = text.slice(0, maxLength - 3);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0) truncated = truncated.slice(0, lastSpace);

    return truncated + '...';
  }

  onAddToCart(book: Book) {
    if (this.isAnimating) return;

    this.isAnimating = true;

    setTimeout(() => {
      this.isAnimating = false;
      this.addToCart.emit(book);
    }, 600);
  }

  getPopularityRating(popularityScore: number) {
    return Math.round(popularityScore);
  }

  goToLibrary(libraryId:number){
    if (libraryId!=0) {
      this.toLibrary.emit(libraryId);
    }
  }
}
