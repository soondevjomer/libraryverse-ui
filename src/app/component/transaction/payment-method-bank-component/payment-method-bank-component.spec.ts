import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentMethodBankComponent } from './payment-method-bank-component';

describe('PaymentMethodBankComponent', () => {
  let component: PaymentMethodBankComponent;
  let fixture: ComponentFixture<PaymentMethodBankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentMethodBankComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentMethodBankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
