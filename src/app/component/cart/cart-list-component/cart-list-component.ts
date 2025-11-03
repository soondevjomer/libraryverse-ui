import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe, CommonModule } from '@angular/common';
import { CartService } from '../../../service/cart-service';
import { Cart, MyCart } from '../../../model/cart.model';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Observable, tap } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-cart-list-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AsyncPipe, LucideAngularModule],
  templateUrl: './cart-list-component.html',
})
export class CartListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cartService = inject(CartService);
  private router = inject(Router);

  myCarts$!: Observable<MyCart[]>;
  myCarts: MyCart[] = [];
  cartForm!: FormGroup;
  isFormReady = false;

  ngOnInit(): void {
    this.myCarts$ = this.loadCarts();
    this.myCarts$ = this.cartService.getMyCart().pipe(
      tap((carts) => {
        this.myCarts = carts;
        this.buildForm(carts);
      })
    );

    // Rebuild form on navigation back to /carts
    this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationEnd &&
            (event as NavigationEnd).urlAfterRedirects === '/carts'
        )
      )
      .subscribe(() => {
        this.cartService.getMyCart().subscribe((carts) => {
          this.myCarts = carts;
          this.buildForm(carts);
        });
      });
  }

  loadCarts() {
    return this.cartService.getMyCart();
  }

  buildForm(carts: MyCart[]) {
    this.cartForm = this.fb.group({
      libraries: this.fb.array(
        carts.map((lib) =>
          this.fb.group({
            checked: [false],
            carts: this.fb.array(
              lib.carts?.map((cart) =>
                this.fb.group({
                  selected: [false],
                  quantity: [cart.quantity || 0],
                  price: [cart.price],
                  maxQuantity: [cart.maxQuantity ?? 0],
                })
              ) ?? []
            ),
          })
        )
      ),
    });
  }

  get libraries(): FormArray {
    return this.cartForm.get('libraries') as FormArray;
  }

  getCartGroup(libIndex: number, itemIndex: number): FormGroup {
    return (this.libraries.at(libIndex).get('carts') as FormArray).at(itemIndex) as FormGroup;
  }

  getQuantity(libIndex: number, itemIndex: number): number {
    return this.getCartGroup(libIndex, itemIndex).get('quantity')?.value || 1;
  }

  increaseQuantity(libIndex: number, itemIndex: number) {
    const group = this.getCartGroup(libIndex, itemIndex);
    const current = group.get('quantity')?.value || 1;
    const max = group.get('maxQuantity')?.value || 10;
    if (current < max) {
      group.get('quantity')?.setValue(current + 1);
    }
  }

  decreaseQuantity(libIndex: number, itemIndex: number) {
    const group = this.getCartGroup(libIndex, itemIndex);
    const current = group.get('quantity')?.value || 1;
    if (current > 1) {
      group.get('quantity')?.setValue(current - 1);
    }
  }

  toggleItem(libIndex: number) {
    const libCtrl = this.libraries.at(libIndex);
    const cartControls = libCtrl.get('carts') as FormArray;
    const allChecked = cartControls.controls.every((ctrl) => ctrl.get('selected')?.value);
    libCtrl.get('checked')?.setValue(allChecked, { emitEvent: false });
  }

  toggleLibrary(libIndex: number) {
    const libCtrl = this.libraries.at(libIndex);
    const checked = libCtrl.get('checked')?.value;
    const carts = libCtrl.get('carts') as FormArray;
    carts.controls.forEach((ctrl) => ctrl.get('selected')?.setValue(checked));
  }

  get totalAmount(): number {
    if (!this.cartForm) return 0;
    let total = 0;
    this.libraries.controls.forEach((libCtrl) => {
      const carts = libCtrl.get('carts') as FormArray;
      carts.controls.forEach((ctrl) => {
        const selected = ctrl.get('selected')?.value;
        const quantity = ctrl.get('quantity')?.value;
        const price = ctrl.get('price')?.value;
        if (selected) total += price * quantity;
      });
    });
    return total;
  }

  checkoutSelected() {
    const selected: Cart[] = [];

    this.libraries.controls.forEach((libCtrl, i) => {
      const cartControls = libCtrl.get('carts') as FormArray;

      cartControls.controls.forEach((ctrl, j) => {
        const sel = ctrl.get('selected')?.value;
        const qty = ctrl.get('quantity')?.value;
        const cart = this.myCarts[i]?.carts?.[j];

        if (sel && cart) {
          selected.push({ ...cart, quantity: qty });
        }
      });
    });

    if (selected.length === 0) return;

    log('Checkout items:', selected);
    this.router.navigate(['/payment'], { state: { selected } });
  }

  /** 🗑 Remove Cart Item (frontend + backend call) */
  removeCartItem(libIndex: number, cartIndex: number, cartId: number) {
    if (!confirm('Remove this item from your cart?')) return;

    this.cartService.removeCart(cartId).subscribe({
      next: () => {
        const librariesArray = this.libraries as FormArray;
        const cartsArray = librariesArray.at(libIndex).get('carts') as FormArray;

        // Remove from local form
        cartsArray.removeAt(cartIndex);

        // Remove from data array
        this.myCarts[libIndex].carts?.splice(cartIndex, 1);

        // If library becomes empty, remove the library
        if (this.myCarts[libIndex].carts?.length === 0) {
          this.myCarts.splice(libIndex, 1);
          librariesArray.removeAt(libIndex);
        }

        log(`Removed cart ${cartId}`);
      },
      error: (err) => {
        error('Error removing cart item:', err);
      },
    });
  }
}
