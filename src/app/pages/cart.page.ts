import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-cart-page',
  imports: [RouterLink, CurrencyPipe],
  template: `
    <section>
      <h1 class="text-5xl font-extrabold text-slate-950 dark:text-slate-100">Your Cart</h1>
      <p class="mt-2 text-xl text-slate-500 dark:text-slate-400">Review your selected books before payment.</p>

      @if (cartItems().length === 0) {
        <article class="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
          <h2 class="text-3xl font-bold text-slate-900 dark:text-slate-100">Your cart is empty</h2>
          <p class="mt-2 text-lg text-slate-500 dark:text-slate-400">Add books from a seller to proceed with checkout.</p>
          <a routerLink="/browse" class="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-bold text-white">Browse Books</a>
        </article>
      } @else {
        <div class="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div class="space-y-4">
            <article class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <p class="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">Seller</p>
              <p class="text-xl font-bold text-slate-900 dark:text-slate-100">{{ cartItems()[0].sellerName }}</p>
              <p class="text-slate-500 dark:text-slate-400">{{ cartItems()[0].sellerUniversity }}</p>
            </article>

            @for (item of cartItems(); track item.listingId) {
              <article class="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[110px_minmax(0,1fr)_auto] dark:border-slate-800 dark:bg-slate-900">
                <img [src]="item.imageUrl" [alt]="item.title" class="h-28 w-full rounded-xl object-cover" />

                <div>
                  <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ item.title }}</h2>
                  <p class="text-slate-500 dark:text-slate-400">{{ item.author }}</p>
                  <p class="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{{ item.subject }}</p>
                </div>

                <div class="flex flex-col items-end justify-between gap-3">
                  <div class="text-right">
                    <p class="text-2xl font-black text-slate-900 dark:text-slate-100">{{ item.price | currency: 'USD' : 'symbol' : '1.0-0' }}</p>
                    <p class="text-sm text-slate-400 line-through dark:text-slate-500">{{ item.originalPrice | currency: 'USD' : 'symbol' : '1.0-0' }}</p>
                  </div>
                  <button
                    type="button"
                    (click)="remove(item.listingId)"
                    class="rounded-xl border border-red-300 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
                  >
                    Remove
                  </button>
                </div>
              </article>
            }
          </div>

          <aside class="h-fit rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-28">
            <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Order Summary</h2>

            <div class="mt-4 space-y-2 text-slate-600 dark:text-slate-300">
              <div class="flex items-center justify-between">
                <span>Items</span>
                <span class="font-semibold">{{ totalItems() }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>Subtotal</span>
                <span class="font-semibold">{{ subtotal() | currency: 'USD' : 'symbol' : '1.0-0' }}</span>
              </div>
              <div class="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                <span>You save</span>
                <span class="font-semibold">{{ totalSavings() | currency: 'USD' : 'symbol' : '1.0-0' }}</span>
              </div>
            </div>

            <a
              routerLink="/payment-options"
              class="mt-6 inline-flex w-full justify-center rounded-xl bg-blue-600 px-4 py-3 text-lg font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500"
            >
              Proceed to Payment
            </a>

            <button
              type="button"
              (click)="clear()"
              class="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Clear Cart
            </button>
          </aside>
        </div>
      }
    </section>
  `
})
export class CartPageComponent {
  private readonly cart = inject(CartService);

  readonly cartItems = this.cart.items;
  readonly isLoading = this.cart.isLoading;
  readonly totalItems = this.cart.totalItems;
  readonly subtotal = this.cart.subtotal;
  readonly totalSavings = this.cart.totalSavings;
  readonly hasItems = computed(() => this.totalItems() > 0);

  remove(listingId: string): void {
    this.cart.removeListing(listingId).subscribe();
  }

  clear(): void {
    this.cart.clearCart().subscribe();
  }
}
