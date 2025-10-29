import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookCopyComponent } from './book-copy-component';

describe('BookCopyComponent', () => {
  let component: BookCopyComponent;
  let fixture: ComponentFixture<BookCopyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookCopyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookCopyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
