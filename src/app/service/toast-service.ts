import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, delay, of, switchMap } from 'rxjs';
import { Toast, ToastMessage } from '../model/utils.model';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  
  private _toast$ = new BehaviorSubject<Toast | null>(null);

  private _toasts = signal<ToastMessage[]>([]);
  toasts = this._toasts.asReadonly();

  show(message: string, type: ToastMessage['type'] = 'info', duration = 3000) {
    const id = Date.now() + Math.random();
    const toast: ToastMessage = { id, message, type, duration };
    this._toasts.update((list) => [...list, toast]);

    // Auto-remove after duration
    setTimeout(() => this.remove(id), duration);
  }

  success(msg: string, duration = 3000) {
    this.show(msg, 'success', duration);
  }

  error(msg: string, duration = 4000) {
    this.show(msg, 'error', duration);
  }

  info(msg: string, duration = 3000) {
    this.show(msg, 'info', duration);
  }

  warning(msg: string, duration = 3500) {
    this.show(msg, 'warning', duration);
  }

  remove(id: number) {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
