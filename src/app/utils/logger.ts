import { environment } from '@env/environment';

export const log = (...args: any[]) => {
  if (environment.enableLogging) console.log(...args);
};
export const error = (...args: any[]) => {
  if (environment.enableLogging) console.error(...args);
};
export const warn = (...args: any[]) => {
  if (environment.enableLogging) console.warn(...args);
};
