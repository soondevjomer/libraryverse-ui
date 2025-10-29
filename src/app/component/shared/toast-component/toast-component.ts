import { Component, inject } from '@angular/core';
import { ToastService } from '../../../service/toast-service';
import { LucideAngularModule } from 'lucide-angular';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-toast-component',
  imports: [LucideAngularModule, NgClass],
  template: `
    <div
      class="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-3 z-[1000] w-full px-4 sm:px-0 sm:w-auto"
    >
      @for (toast of toasts(); track toast.id) {
        <div
          class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium
                 w-full sm:w-auto max-w-md sm:min-w-[280px]
                 opacity-0 translate-y-3 animate-toast-slide text-center sm:text-left"
          [ngClass]="{
            'bg-emerald-600': toast.type === 'success',
            'bg-red-600': toast.type === 'error',
            'bg-sky-600': toast.type === 'info',
            'bg-amber-500': toast.type === 'warning'
          }"
        >
          <lucide-icon
            [name]="getIconName(toast.type)"
            class="w-5 h-5 text-white shrink-0"
          />
          <span class="flex-1">{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes toast-slide {
      0% {
        opacity: 0;
        transform: translateY(8px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-toast-slide {
      animation: toast-slide 0.25s ease-out forwards;
    }
  `]
})
export class ToastComponent {
  private toastService = inject(ToastService);
  toasts = this.toastService.toasts;

  getIconName(type?: string) {
    switch (type) {
      case 'success': return 'circle-check';
      case 'error': return 'circle-x';
      case 'warning': return 'circle-alert';
      default: return 'circle-question-mark';
    }
  }
}
