import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environment/env';

export interface CartApiItem {
  listingId: string;
  title: string;
  author: string;
  subject: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
}

export interface CartApiResponse {
  sellerId: string | null;
  sellerName: string | null;
  sellerUniversity: string | null;
  items: CartApiItem[];
  totalItems: number;
  subtotal: number;
  totalSavings: number;
}

@Injectable({ providedIn: 'root' })
export class CartApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/cart`;

  readonly isBackendEnabled = environment.useBackendCart;

  getCart(): Observable<CartApiResponse> {
    return this.http.get<CartApiResponse>(this.baseUrl);
  }

  addItem(listingId: string): Observable<CartApiResponse> {
    return this.http.post<CartApiResponse>(`${this.baseUrl}/items`, { listingId });
  }

  removeItem(listingId: string): Observable<CartApiResponse> {
    return this.http.delete<CartApiResponse>(`${this.baseUrl}/items/${encodeURIComponent(listingId)}`);
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(this.baseUrl);
  }
}
