import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

import { BookCardComponent } from '../components/book-card.component';
import { BOOK_LISTINGS, SELLERS } from '../data/book-listings.data';

type ProfileTab = 'Listings' | 'Reviews';

@Component({
  selector: 'app-profile-page',
  imports: [BookCardComponent],
  template: `
    @if (seller(); as profile) {
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
            @for (review of reviews; track review.comment) {
              <article class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div class="flex items-center justify-between">
                  <p class="font-bold text-slate-900 dark:text-slate-100">{{ review.name }}</p>
                  <p class="font-semibold text-amber-500">{{ review.rating }}</p>
                </div>
                <p class="mt-2 text-slate-600 dark:text-slate-300">{{ review.comment }}</p>
              </article>
            }
          </div>
        }
      </section>
    }
  `
})
export class ProfilePageComponent {
  private readonly route = inject(ActivatedRoute);

  readonly tabs: ProfileTab[] = ['Listings', 'Reviews'];
  readonly activeTab = signal<ProfileTab>('Listings');

  readonly id = toSignal(this.route.paramMap.pipe(map((params) => params.get('id') ?? 's1')), {
    initialValue: 's1'
  });

  readonly seller = computed(() => SELLERS.find((person) => person.id === this.id()) ?? SELLERS[0]);

  readonly sellerBooks = computed(() => BOOK_LISTINGS.filter((book) => book.seller.id === this.seller().id));

  readonly reviews = [
    { name: 'Noah B.', rating: 5, comment: 'Great communication and exactly as described.' },
    { name: 'Priya M.', rating: 4.8, comment: 'Met on campus, smooth transaction and fair price.' },
    { name: 'Leo R.', rating: 4.9, comment: 'Book was in excellent condition. Highly recommend.' }
  ] as const;

  readonly activeTabClass = 'rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white';
  readonly inactiveTabClass =
    'rounded-lg px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800';

  stats(seller: (typeof SELLERS)[number]): Array<{ label: string; value: string | number }> {
    return [
      { label: 'Rating', value: `★ ${seller.rating}` },
      { label: 'Books Sold', value: seller.totalSales },
      { label: 'Response Time', value: seller.responseTime },
      { label: 'Response Rate', value: seller.responseRate }
    ];
  }
}
