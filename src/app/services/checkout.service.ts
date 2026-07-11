import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

import { environment } from '../../environment/env';
import { CartItem } from './cart.service';

export type CheckoutPaymentMethod = 'CARD' | 'UPI' | 'CASH';

export interface CheckoutPaymentInput {
  method: CheckoutPaymentMethod;
  cardHolder?: string;
  cardNumber?: string;
  cvv?: string;
  upiId?: string;
}

export interface PlaceOrderRequest {
  sellerId: string;
  items: Array<{ listingId: string }>;
  payment: {
    method: CheckoutPaymentMethod;
    cardHolder?: string;
    cardNumberLast4?: string;
    upiId?: string;
  };
}

export interface PlaceOrderResponse {
  orderId: string;
  status: 'PLACED' | 'PENDING' | 'FAILED';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/orders/checkout`;

  readonly isBackendEnabled = environment.useBackendCheckout;

  placeOrderForItems(cartItems: CartItem[], payment: CheckoutPaymentInput): Observable<PlaceOrderResponse> {
    const request = this.toRequest(cartItems, payment);

    if (!this.isBackendEnabled) {
      const demoResponse: PlaceOrderResponse = {
        orderId: `demo-${Date.now()}`,
        status: 'PLACED',
        message: 'Demo order placed successfully.'
      };

      return of(demoResponse).pipe(delay(500));
    }

    return this.http.post<PlaceOrderResponse>(this.baseUrl, request);
  }

  private toRequest(cartItems: CartItem[], payment: CheckoutPaymentInput): PlaceOrderRequest {
    const sellerId = cartItems[0]?.sellerId ?? '';

    return {
      sellerId,
      items: cartItems.map((item) => ({ listingId: item.listingId })),
      payment: {
        method: payment.method,
        cardHolder: payment.cardHolder?.trim() || undefined,
        cardNumberLast4: payment.cardNumber ? payment.cardNumber.slice(-4) : undefined,
        upiId: payment.upiId?.trim() || undefined
      }
    };
  }
}
