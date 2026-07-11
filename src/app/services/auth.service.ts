import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly sellerStorageKey = 'bookswap-seller-id';
  private readonly tokenStorageKey = 'bookswap-token';
  private readonly document = inject(DOCUMENT);

  private readonly sellerIdState = signal<string | null>(this.readSellerIdFromStorage());
  private readonly tokenState = signal<string | null>(this.readTokenFromStorage());

  readonly sellerId = computed(() => this.sellerIdState());
  readonly token = computed(() => this.tokenState());
  readonly isAuthenticated = computed(() => !!this.tokenState());

  setSession(token: string, sellerId: string | null): void {
    this.setToken(token);
    this.setSellerId(sellerId);
  }

  setSellerId(id: string | null): void {
    const normalizedId = id?.trim() ?? null;
    this.sellerIdState.set(normalizedId);

    if (normalizedId) {
      this.document.defaultView?.localStorage.setItem(this.sellerStorageKey, normalizedId);
      return;
    }

    this.document.defaultView?.localStorage.removeItem(this.sellerStorageKey);
  }

  setToken(token: string | null): void {
    const normalizedToken = token?.trim() ?? null;
    this.tokenState.set(normalizedToken);

    if (normalizedToken) {
      this.document.defaultView?.localStorage.setItem(this.tokenStorageKey, normalizedToken);
      return;
    }

    this.document.defaultView?.localStorage.removeItem(this.tokenStorageKey);
  }

  clearSession(): void {
    this.setToken(null);
    this.setSellerId(null);
  }

  private readSellerIdFromStorage(): string | null {
    const rawValue = this.document.defaultView?.localStorage.getItem(this.sellerStorageKey)?.trim();
    return rawValue || null;
  }

  private readTokenFromStorage(): string | null {
    const rawValue = this.document.defaultView?.localStorage.getItem(this.tokenStorageKey)?.trim();
    return rawValue || null;
  }
}