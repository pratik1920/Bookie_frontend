import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';

import { BookCardComponent } from '../components/book-card.component';
import { BookListing } from '../models/book.model';
import { AuthSessionService } from '../services/auth.service';
import { ReviewApi, SellerApi, SellersApiService } from '../services/sellers-api.service';

type ProfileTab = 'Listings' | 'Reviews';

@Component({
  selector: 'app-profile-page',
  imports: [BookCardComponent],
  template: `
    @if (!resolvedSellerId()) {
      <section class="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100">Profile unavailable</h1>
        <p class="mt-2 text-lg text-slate-500 dark:text-slate-400">Log in to view your seller profile.</p>
      </section>
    } @else if (seller(); as profile) {
      <section>
        <article class="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-4">
              <span class="grid h-20 w-20 place-items-center rounded-2xl bg-blue-600 text-3xl font-black text-white">{{ profile.initials }}</span>
              <div>
                <h1 class="text-4xl font-extrabold text-slate-950 dark:text-slate-100">{{ profile.name }}</h1>
                <p class="text-lg text-slate-500 dark:text-slate-400">{{ profile.university }}</p>
                <p class="text-sm text-slate-400 dark:text-slate-500">Member since {{ profile.memberSince }}</p>
              </div>
            </div>
          </div>

          <div class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            @for (stat of stats(profile); track stat.label) {
              <div class="rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
                <p class="text-sm text-slate-500 dark:text-slate-400">{{ stat.label }}</p>
                <p class="text-2xl font-black text-slate-900 dark:text-slate-100">{{ stat.value }}</p>
              </div>
            }
          </div>
        </article>

        <div class="mt-6 inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
          @for (tab of tabs; track tab) {
            <button type="button" (click)="activeTab.set(tab)" [class]="activeTab() === tab ? activeTabClass : inactiveTabClass">
              {{ tab }}
            </button>
          }
        </div>

        @if (activeTab() === 'Listings') {
          <div class="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            @for (book of sellerBooks(); track book.id) {
              <app-book-card [book]="book" />
            }
          </div>
        } @else {
          <div class="mt-6 space-y-4">
            @for (review of reviews(); track review.id) {
              <article class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div class="flex items-center justify-between">
                  <p class="font-bold text-slate-900 dark:text-slate-100">{{ review.reviewerName }}</p>
                  <p class="font-semibold text-amber-500">{{ review.rating }}</p>
                </div>
                <p class="mt-2 text-slate-600 dark:text-slate-300">{{ review.comment }}</p>
              </article>
            }
          </div>
        }
      </section>
    } @else {
      <section class="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100">Unable to load profile</h1>
        <p class="mt-2 text-lg text-slate-500 dark:text-slate-400">We could not fetch your seller data right now.</p>
      </section>
    }
  `
})
export class ProfilePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly authSession = inject(AuthSessionService);
  private readonly sellersApi = inject(SellersApiService);

  readonly tabs: ProfileTab[] = ['Listings', 'Reviews'];
  readonly activeTab = signal<ProfileTab>('Listings');

  readonly routeId = toSignal(this.route.paramMap.pipe(map((params) => params.get('id') ?? 'me')), {
    initialValue: 'me'
  });

  readonly resolvedSellerId = computed(() => {
    const requestedId = this.routeId();
    const loggedInId = this.authSession.sellerId();

    if (requestedId === 'me') {
      return loggedInId;
    }

    if (!requestedId) {
      return null;
    }

    return requestedId;
  });

  readonly seller = toSignal(
    toObservable(this.resolvedSellerId).pipe(
      switchMap((sellerId) => {
        if (!sellerId) {
          return of(null);
        }

        return this.sellersApi.getSellerById(sellerId).pipe(catchError(() => of(null)));
      })
    ),
    { initialValue: null }
  );

  readonly sellerBooks = toSignal(
    toObservable(this.resolvedSellerId).pipe(
      switchMap((sellerId) => {
        if (!sellerId) {
          return of([] as BookListing[]);
        }

        return this.sellersApi
          .getSellerListings(sellerId, 0, 12)
          .pipe(map((page) => page.content), catchError(() => of([] as BookListing[])));
      })
    ),
    { initialValue: [] as BookListing[] }
  );

  readonly reviews = toSignal(
    toObservable(this.resolvedSellerId).pipe(
      switchMap((sellerId) => {
        if (!sellerId) {
          return of([] as ReviewApi[]);
        }

        return this.sellersApi
          .getSellerReviews(sellerId, 0, 10)
          .pipe(map((page) => page.content), catchError(() => of([] as ReviewApi[])));
      })
    ),
    { initialValue: [] as ReviewApi[] }
  );

  readonly activeTabClass = 'rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white';
  readonly inactiveTabClass =
    'rounded-lg px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800';

  stats(seller: SellerApi): Array<{ label: string; value: string | number }> {
    return [
      { label: 'Rating', value: `★ ${seller.rating}` },
      { label: 'Books Sold', value: seller.totalSales },
      { label: 'Response Time', value: seller.responseTime },
      { label: 'Response Rate', value: seller.responseRate }
    ];
  }
}