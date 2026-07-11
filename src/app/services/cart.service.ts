import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';

import { BookListing } from '../models/book.model';
import { CartApiResponse, CartApiService } from './cart-api.service';

export interface CartItem {
  listingId: string;
  title: string;
  author: string;
  subject: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
  sellerId: string;
  sellerName: string;
  sellerUniversity: string;
}

export interface AddToCartResult {
  ok: boolean;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly cartApi = inject(CartApiService);

  private readonly itemsState = signal<CartItem[]>([]);
  private readonly isLoadingState = signal(false);

  readonly items = computed(() => this.itemsState());
  readonly isLoading = computed(() => this.isLoadingState());
  readonly totalItems = computed(() => this.itemsState().length);
  readonly subtotal = computed(() => this.itemsState().reduce((sum, item) => sum + item.price, 0));
  readonly totalSavings = computed(() => this.itemsState().reduce((sum, item) => sum + (item.originalPrice - item.price), 0));
  readonly sellerId = computed(() => this.itemsState()[0]?.sellerId ?? null);
  readonly sellerName = computed(() => this.itemsState()[0]?.sellerName ?? null);

  constructor() {
    this.refreshCart().subscribe();
  }

  refreshCart(): Observable<void> {
    this.isLoadingState.set(true);

    return this.cartApi.getCart().pipe(
      tap((response) => this.syncFromApi(response)),
      map(() => undefined),
      catchError(() => {
        this.itemsState.set([]);
        return of(undefined);
      }),
      tap(() => this.isLoadingState.set(false))
    );
  }

  addListing(listing: BookListing): Observable<AddToCartResult> {
    this.isLoadingState.set(true);

    return this.cartApi.addItem(listing.id).pipe(
      tap((response) => this.syncFromApi(response)),
      map(() => ({ ok: true, message: 'Book added to cart.' })),
      catchError((error) => of({ ok: false, message: this.resolveCartErrorMessage(error) })),
      tap(() => this.isLoadingState.set(false))
    );
  }

  removeListing(listingId: string): Observable<void> {
    this.isLoadingState.set(true);

    return this.cartApi.removeItem(listingId).pipe(
      tap((response) => this.syncFromApi(response)),
      map(() => undefined),
      catchError(() => of(undefined)),
      tap(() => this.isLoadingState.set(false))
    );
  }

  clearCart(): Observable<void> {
    this.isLoadingState.set(true);

    return this.cartApi.clearCart().pipe(
      tap(() => this.itemsState.set([])),
      map(() => undefined),
      catchError(() => of(undefined)),
      tap(() => this.isLoadingState.set(false))
    );
  }

  isInCart(listingId: string): boolean {
    return this.itemsState().some((item) => item.listingId === listingId);
  }

  private syncFromApi(response: CartApiResponse): void {
    const sellerId = response.sellerId ?? '';
    const sellerName = response.sellerName ?? '';
    const sellerUniversity = response.sellerUniversity ?? '';

    const normalizedItems = (response.items ?? []).map((item) => ({
      listingId: item.listingId,
      title: item.title,
      author: item.author,
      subject: item.subject,
      price: item.price,
      originalPrice: item.originalPrice,
      imageUrl: item.imageUrl,
      sellerId,
      sellerName,
      sellerUniversity
    }));

    this.itemsState.set(normalizedItems);
  }

  private resolveCartErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const code = (error.error?.code ?? '').toString();

      if (code === 'CART_SELLER_MISMATCH') {
        return 'Your cart contains books from another seller. Please clear cart first.';
      }
      if (code === 'CART_DUPLICATE_ITEM') {
        return 'This book is already in your cart.';
      }
      if (code === 'LISTING_NOT_FOUND') {
        return 'This listing no longer exists.';
      }
      if (code === 'LISTING_NOT_ACTIVE') {
        return 'This listing is no longer active.';
      }
    }

    return 'Unable to update cart right now. Please try again.';
  }
}
