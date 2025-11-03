import { Injectable } from '@angular/core';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  log(...args: any[]) {
    if (environment.enableLogging) console.log(...args);
  }

  error(...args: any[]) {
    if (environment.enableLogging) console.error(...args);
  }

  warn(...args: any[]) {
    if (environment.enableLogging) console.warn(...args);
  }
}
