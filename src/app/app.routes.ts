import { Routes } from '@angular/router';
import { LoginComponent } from './component/auth/login-component/login-component';
import { RegisterComponent } from './component/auth/register-component/register-component';
import { ForbiddenComponent } from './component/layout/forbidden-component/forbidden-component';
import { MainComponent } from './component/layout/main-component/main-component';
import { authGuard } from './guard/auth-guard';
import { Role } from './model/auth.model';
import { ServerDownComponent } from './component/layout/server-down-component/server-down-component';

export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'books',
      },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'forbidden',
        component: ForbiddenComponent,
      },
      {
        path: 'server-down',
        component: ServerDownComponent,
      },

      {
        path: 'register',
        component: RegisterComponent,
      },
      {
        path: 'books',
        loadComponent: () =>
          import('./component/book/book-list-component/book-list-component').then(
            (m) => m.BookListComponent
          ),
      },
      {
        path: 'books/create',
        loadComponent: () =>
          import('./component/book/book-create-component/book-create-component').then(
            (m) => m.BookCreateComponent
          ),
        canActivate: [authGuard],
        data: { role: Role.Librarian },
      },
      {
        path: 'books/edit/:bookId',
        loadComponent: () =>
          import('./component/book/book-edit-component/book-edit-component').then(
            (m) => m.BookEditComponent
          ),
        canActivate: [authGuard],
        data: { role: Role.Librarian },
      },
      {
        path: 'books/:bookId',
        loadComponent: () =>
          import('./component/book/book-detail-component/book-detail-component').then(
            (m) => m.BookDetailComponent
          ),
      },
      {
        path: 'carts',
        loadComponent: () =>
          import('./component/cart/cart-list-component/cart-list-component').then(
            (m) => m.CartListComponent
          ),
        canActivate: [authGuard],
        data: { role: Role.Reader },
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./component/customer/customer-list-component/customer-list-component').then(
            (m) => m.CustomerListComponent
          ),
        canActivate: [authGuard],
      },
      {
        path: 'customers/:customerId',
        loadComponent: () =>
          import('./component/customer/customer-detail-component/customer-detail-component').then(
            (m) => m.CustomerDetailComponent
          ),
        canActivate: [authGuard],
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./component/dashboard/dashboard-component/dashboard-component').then(
            (m) => m.DashboardComponent
          ),
        canActivate: [authGuard],
        data: { role: Role.Librarian },
      },
      {
        path: 'libraries',
        loadComponent: () =>
          import('./component/library/library-list-component/library-list-component').then(
            (m) => m.LibraryListComponent
          ),
      },
      {
        path: 'libraries/books',
        loadComponent: () =>
          import('./component/library/library-books-component/library-books-component').then(
            (m) => m.LibraryBooksComponent
          ),
        canActivate: [authGuard],
        data: { role: Role.Librarian },
      },
      {
        path: 'libraries/edit/:libraryId',
        loadComponent: () =>
          import('./component/library/library-edit-component/library-edit-component').then(
            (m) => m.LibraryEditComponent
          ),
        canActivate: [authGuard],
        data: { role: Role.Librarian, checkOwnership: true },
      },
      {
        path: 'libraries/:libraryId',
        loadComponent: () =>
          import('./component/library/library-detail-component/library-detail-component').then(
            (m) => m.LibraryDetailComponent
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./component/order/order-list-component/order-list-component').then(
            (m) => m.OrderListComponent
          ),
        canActivate: [authGuard],
      },
      {
        path: 'orders/summary',
        loadComponent: () =>
          import('./component/transaction/order-summary-component/order-summary-component').then(
            (m) => m.OrderSummaryComponent
          ),
        canActivate: [authGuard],
      },
      {
        path: 'payment',
        loadComponent: () =>
          import('./component/transaction/payment-component/payment-component').then(
            (m) => m.PaymentComponent
          ),
        canActivate: [authGuard],
        data: { role: Role.Reader },
      },
      {
        path: 'payment/process',
        loadComponent: () =>
          import('./component/transaction/payment-method-component/payment-method-component').then(
            (m) => m.PaymentMethodComponent
          ),
        canActivate: [authGuard],
        data: { role: Role.Reader },
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./component/profile/profile-component/profile-component').then(
            (m) => m.ProfileComponent
          ),
        canActivate: [authGuard],
      },
      {
        path: 'profile/change-password',
        loadComponent: () =>
          import('./component/profile/change-password-component/change-password-component').then(
            (m) => m.ChangePasswordComponent
          ),
        canActivate: [authGuard],
      },
      {
        path: 'profile/edit',
        loadComponent: () =>
          import('./component/profile/profile-edit-component/profile-edit-component').then(
            (m) => m.ProfileEditComponent
          ),
        canActivate: [authGuard],
      },
      {
        path: 'sales',
        loadComponent: () =>
          import('./component/sale/sale-list-component/sale-list-component').then(
            (m) => m.SaleListComponent
          ),
        canActivate: [authGuard],
      },
      {
        path: 'internal-server-error',
        loadComponent: () =>
          import('./component/layout/internal-server-component/internal-server-component').then(
            (m) => m.InternalServerComponent
          ),
      },
      {
        path: '**',
        loadComponent: () =>
          import('./component/layout/not-found-component/not-found-component').then(
            (m) => m.NotFoundComponent
          ),
      },
    ],
  },
];
