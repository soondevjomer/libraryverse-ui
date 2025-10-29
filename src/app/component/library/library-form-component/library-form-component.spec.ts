import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryFormComponent } from './library-form-component';

describe('LibraryFormComponent', () => {
  let component: LibraryFormComponent;
  let fixture: ComponentFixture<LibraryFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibraryFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LibraryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
