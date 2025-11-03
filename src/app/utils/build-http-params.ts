import { HttpParams } from '@angular/common/http';
import { SearchFilter } from 'app/model/search.model';


/**
 * Build HttpParams safely from an object.
 * - Skips null, undefined, or empty string values
 * - Supports arrays (adds multiple query params)
 * - Trims string values
 */
export function buildHttpParams(filters: SearchFilter = {}): HttpParams {
  let params = new HttpParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    if (typeof value === 'string' && value.trim() === '') return;

    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v !== null && v !== undefined && String(v).trim() !== '') {
          params = params.append(key, String(v).trim());
        }
      });
    } else {
      params = params.set(key, String(value).trim());
    }
  });

  return params;
}
