import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination-component',
  templateUrl: './pagination-component.html',
  styleUrl: './pagination-component.css'
})
export class PaginationComponent {
  @Input() pageNumber = 0;   // zero-based
  @Input() pageTotal = 1;
  @Output() pageChange = new EventEmitter<number>();

  onBack() {
    if (this.pageNumber > 0) this.pageChange.emit(this.pageNumber - 1);
  }

  onNext() {
    if (this.pageNumber < this.pageTotal - 1) this.pageChange.emit(this.pageNumber + 1);
  }

  goToPage(event: Event) {
    const input = event.target as HTMLInputElement;
    const entered = Number(input.value);

    if (isNaN(entered) || entered < 1 || entered > this.pageTotal) {
      input.value = this.displayPage.toString(); // reset invalid input
      return;
    }

    const newPage = entered - 1;
    if (newPage !== this.pageNumber) {
      this.pageChange.emit(newPage);
    }
  }

  onInputBlur(event: Event) {
    const input = event.target as HTMLInputElement;
    const entered = Number(input.value);

    // Reset to correct page on blur if invalid
    if (isNaN(entered) || entered < 1 || entered > this.pageTotal) {
      input.value = this.displayPage.toString();
    }
  }

  get displayPage(): number {
    return this.pageNumber + 1;
  }
}
