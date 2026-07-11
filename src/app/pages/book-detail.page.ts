import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, finalize, map, of, switchMap } from 'rxjs';

import { BookCardComponent } from '../components/book-card.component';
import { BookListing } from '../models/book.model';
import { CartService } from '../services/cart.service';
import { ListingsApiService } from '../services/listings-api.service';

@Component({
  selector: 'app-book-detail-page',
  imports: [RouterLink, CurrencyPipe, DatePipe, BookCardComponent],
  template: `
    @if (book(); as selected) {
      <a routerLink="/browse" class="inline-flex items-center gap-2 text-lg font-bold text-blue-600 hover:text-blue-500">&larr; Back to Browse</a>

      <div class="mt-4 grid gap-4 lg:grid-cols-[1.78fr_0.82fr] xl:grid-cols-[1.86fr_0.72fr]">
        <div class="space-y-4">
          <article class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <img [src]="selected.imageUrl" [alt]="selected.title" class="aspect-[16/8] w-full max-h-[340px] object-cover" />
          </article>

          <article class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div class="flex flex-wrap items-center gap-3">
              <span class="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">{{ selected.type }}</span>
              <span class="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">{{ selected.condition }}</span>
            </div>

            <h1 class="mt-3 text-4xl font-extrabold text-slate-950 dark:text-slate-100 xl:text-[2.6rem]">{{ selected.title }}</h1>
            <p class="mt-1.5 text-xl text-slate-600 dark:text-slate-300">{{ selected.author }}</p>

            <div class="mt-4 grid gap-3 rounded-xl border border-slate-200 p-3.5 sm:grid-cols-2 dark:border-slate-700">
              <div>
                <p class="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">Subject</p>
                <p class="text-base font-semibold text-slate-900 dark:text-slate-100">{{ selected.subject }}</p>
              </div>
              @if (selected.edition) {
                <div>
                  <p class="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">Edition</p>
                  <p class="text-base font-semibold text-slate-900 dark:text-slate-100">{{ selected.edition }}</p>
                </div>
              }
              @if (selected.isbn) {
                <div>
                  <p class="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">ISBN</p>
                  <p class="text-base font-semibold text-slate-900 dark:text-slate-100">{{ selected.isbn }}</p>
                </div>
              }
              <div>
                <p class="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">Posted</p>
                <p class="text-base font-semibold text-slate-900 dark:text-slate-100">{{ selected.postedDate | date: 'mediumDate' }}</p>
              </div>
            </div>

            <p class="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300 xl:text-[1.02rem]">{{ selected.description }}</p>
          </article>

          <article class="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-900 dark:bg-blue-950/40">
            <h2 class="text-xl font-bold text-blue-900 dark:text-blue-200">Safety Tips</h2>
            <ul class="mt-2.5 space-y-1.5 text-sm text-blue-800 dark:text-blue-300">
              <li>- Meet in a public campus location during daylight hours.</li>
              <li>- Verify book condition in person before payment.</li>
              <li>- Prefer campus-approved payment methods for both parties.</li>
            </ul>
          </article>

          @if (relatedBooks().length > 0) {
            <section>
              <h2 class="mb-3 text-2xl font-extrabold text-slate-950 dark:text-slate-100">Similar Listings</h2>
              <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                @for (book of relatedBooks(); track book.id) {
                  <app-book-card [book]="book" />
                }
              </div>
            </section>
          }
        </div>

        <div class="theme-scrollbar space-y-4 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto lg:pr-1">
          <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div class="flex items-end gap-2">
              <span class="text-4xl font-black text-slate-950 dark:text-slate-100 xl:text-[3.2rem]">{{ selected.price | currency: 'USD' : 'symbol' : '1.0-0' }}</span>
              <span class="pb-1 text-base text-slate-400 line-through dark:text-slate-500">{{ selected.originalPrice | currency: 'USD' : 'symbol' : '1.0-0' }}</span>
            </div>
            <p class="mt-1 text-base font-semibold text-emerald-600 dark:text-emerald-400">Save {{ selected.originalPrice - selected.price | currency: 'USD' : 'symbol' : '1.0-0' }}</p>
            <button class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-sm font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500">
              <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" aria-hidden="true">
                <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v7A2.5 2.5 0 0 1 17.5 15H10l-4.5 3.5V15H6.5A2.5 2.5 0 0 1 4 12.5v-7Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                <path d="M8 7.75h8M8 10.75h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
              <span>Contact Seller</span>
            </button>
            <button
              type="button"
              (click)="addToCart(selected)"
              [disabled]="isAddingToCart()"
              class="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" aria-hidden="true">
                <path d="M6.5 6h14l-1.5 7.5a2 2 0 0 1-2 1.5H9.2a2 2 0 0 1-1.9-1.4L5 3.5H2.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="9.5" cy="19" r="1.6" fill="currentColor"/>
                <circle cx="17" cy="19" r="1.6" fill="currentColor"/>
              </svg>
              <span>{{ isAddingToCart() ? 'Adding...' : (cart.isInCart(selected.id) ? 'Already in Cart' : 'Add to Cart') }}</span>
            </button>
            <a
              routerLink="/cart"
              class="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500"
            >
              <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" aria-hidden="true">
                <path d="M6 6h14l-1.4 7H8.3L7.5 4.5H3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 20a1.25 1.25 0 1 0 0-2.5A1.25 1.25 0 0 0 9 20Zm7 0a1.25 1.25 0 1 0 0-2.5A1.25 1.25 0 0 0 16 20Z" fill="currentColor"/>
              </svg>
              Proceed to Cart
            </a>

            @if (cartMessage(); as message) {
              <p [class]="cartMessageType() === 'error' ? 'mt-2.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300' : 'mt-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'">
                {{ message }}
              </p>
            }
            <div class="mt-3 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
              <p>Campus pickup available</p>
              <p>Verified student seller</p>
            </div>
          </article>

          <article class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div class="flex items-center gap-3">
              <span class="grid h-12 w-12 place-items-center rounded-full bg-blue-600 text-lg font-bold text-white">{{ selected.seller.initials }}</span>
              <div>
                <h3 class="text-xl font-bold text-slate-900 dark:text-slate-100">{{ selected.seller.name }}</h3>
                <p class="text-slate-500 dark:text-slate-400">{{ selected.seller.university }}</p>
              </div>
            </div>
            <div class="mt-3 grid grid-cols-2 gap-2.5 text-sm">
              <div class="rounded-xl bg-slate-100 p-2.5 dark:bg-slate-800">
                <p class="text-slate-500 dark:text-slate-400">Rating</p>
                <p class="font-bold text-slate-900 dark:text-slate-100">{{ selected.seller.rating }}</p>
              </div>
              <div class="rounded-xl bg-slate-100 p-2.5 dark:bg-slate-800">
                <p class="text-slate-500 dark:text-slate-400">Books Sold</p>
                <p class="font-bold text-slate-900 dark:text-slate-100">{{ selected.seller.totalSales }}</p>
              </div>
            </div>
            <a [routerLink]="['/profile', selected.seller.id]" class="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800">
              <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" aria-hidden="true">
                <circle cx="12" cy="8" r="3.2" stroke="currentColor" stroke-width="1.8" />
                <path d="M5 19c1.2-3 3.8-4.7 7-4.7s5.8 1.7 7 4.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
              <span>Seller Profile</span>
            </a>
          </article>
        </div>
      </div>
    } @else {
      <div class="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
        <h2 class="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-100">Book not found</h2>
        <a routerLink="/browse" class="mt-5 inline-flex rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white">Back to Browse</a>
      </div>
    }
  `
})
export class BookDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly listingsApi = inject(ListingsApiService);
  readonly cart = inject(CartService);
  readonly isAddingToCart = signal(false);
  readonly cartMessage = signal<string | null>(null);
  readonly cartMessageType = signal<'success' | 'error'>('success');

  readonly id = toSignal(this.route.paramMap.pipe(map((params) => params.get('id') ?? '')), {
    initialValue: ''
  });

  readonly book = toSignal(
    toObservable(this.id).pipe(
      switchMap((id) => {
        if (!id) {
          return of(null);
        }
        return this.listingsApi.getListingById(id).pipe(catchError(() => of(null)));
      })
    ),
    { initialValue: null }
  );

  readonly relatedBooks = toSignal(
    toObservable(this.book).pipe(
      switchMap((selectedBook) => {
        if (!selectedBook) {
          return of([] as BookListing[]);
        }

        return this.listingsApi
          .getListings({
            subject: selectedBook.subject,
            status: 'ACTIVE',
            page: 0,
            size: 6
          })
          .pipe(
            map((page) => page.content.filter((item) => item.id !== selectedBook.id).slice(0, 3)),
            catchError(() => of([] as BookListing[]))
          );
      })
    ),
    { initialValue: [] as BookListing[] }
  );

  addToCart(listing: BookListing): void {
    this.isAddingToCart.set(true);
    this.cart
      .addListing(listing)
      .pipe(finalize(() => this.isAddingToCart.set(false)))
      .subscribe((result) => {
        this.cartMessageType.set(result.ok ? 'success' : 'error');
        this.cartMessage.set(result.message);
      });
  }
}
