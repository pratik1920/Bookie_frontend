import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { BookCardComponent } from '../components/book-card.component';
import { BookListing } from '../models/book.model';
import { ListingsApiService } from '../services/listings-api.service';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, BookCardComponent],
  template: `
    <section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-800 px-6 py-16 text-white shadow-xl sm:px-10 lg:px-14">
      <div class="absolute -left-14 top-8 h-40 w-40 rounded-full bg-white/20 blur-3xl"></div>
      <div class="absolute -right-12 bottom-8 h-48 w-48 rounded-full bg-indigo-400/40 blur-3xl"></div>
      <div class="relative max-w-3xl">
        <span class="inline-flex items-center rounded-full bg-white/20 px-4 py-1 text-sm font-semibold backdrop-blur">Built for students, by students</span>
        <h1 class="mt-5 text-5xl font-extrabold leading-tight sm:text-6xl">Buy & Sell Textbooks for Less</h1>
        <p class="mt-5 max-w-2xl text-xl text-blue-100">Save up to 80% on textbooks, notes, and study guides. Connect directly with students at your university.</p>
        <div class="mt-8 flex flex-wrap gap-3">
          <a routerLink="/browse" class="rounded-xl bg-white px-5 py-3 text-base font-bold text-blue-700 transition hover:bg-blue-50">Browse All Books</a>
          <a routerLink="/sell" class="rounded-xl border border-white/60 px-5 py-3 text-base font-bold text-white transition hover:bg-white/10">Start Selling</a>
        </div>
      </div>
    </section>

    <section class="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2 lg:grid-cols-4">
      @for (stat of stats(); track stat.label) {
        <article class="rounded-xl border border-slate-100 p-4 text-center dark:border-slate-800">
          <p class="text-4xl font-black text-slate-950 dark:text-slate-100">{{ stat.value }}</p>
          <p class="text-base text-slate-500 dark:text-slate-400">{{ stat.label }}</p>
        </article>
      }
    </section>

    <section class="mt-14">
      <div class="mb-6 flex items-end justify-between">
        <div>
          <h2 class="text-4xl font-extrabold text-slate-950 dark:text-slate-100">Browse by Subject</h2>
          <p class="mt-2 text-xl text-slate-500 dark:text-slate-400">Find materials for your courses</p>
        </div>
        <a routerLink="/browse" class="text-lg font-bold text-blue-600 hover:text-blue-500">View All -></a>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        @for (subject of subjectCards(); track subject.label) {
          <a routerLink="/browse" class="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <h3 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ subject.label }}</h3>
            <p class="text-lg text-slate-500 dark:text-slate-400">{{ subject.count }} items</p>
          </a>
        }
      </div>
    </section>

    <section class="mt-14">
      <div class="mb-6 flex items-end justify-between">
        <div>
          <h2 class="text-4xl font-extrabold text-slate-950 dark:text-slate-100">Recently Listed</h2>
          <p class="mt-2 text-xl text-slate-500 dark:text-slate-400">Fresh listings from your fellow students</p>
        </div>
        <a routerLink="/browse" class="text-lg font-bold text-blue-600 hover:text-blue-500">See All Books -></a>
      </div>

      <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        @for (book of newestBooks(); track book.id) {
          <app-book-card [book]="book" />
        }
      </div>

      <div class="mt-8 text-center">
        <a routerLink="/browse" class="inline-flex rounded-xl bg-blue-600 px-6 py-3 text-lg font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500">
          Browse All {{ totalActiveListings() > 0 ? totalActiveListings() : '' }}{{ totalActiveListings() > 0 ? ' ' : '' }}Listings
        </a>
      </div>
    </section>

    <section class="mt-16 rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
      <h2 class="text-center text-4xl font-extrabold text-slate-950 dark:text-slate-100">How It Works</h2>
      <div class="mt-8 grid gap-6 md:grid-cols-3">
        @for (step of steps; track step.title) {
          <article class="text-center">
            <span [class]="step.numberClass">{{ step.number }}</span>
            <h3 class="mt-4 text-3xl font-bold text-slate-950 dark:text-slate-100">{{ step.title }}</h3>
            <p class="mt-2 text-xl text-slate-500 dark:text-slate-400">{{ step.description }}</p>
          </article>
        }
      </div>
    </section>

    <section class="mt-14 rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
      <h2 class="text-center text-4xl font-extrabold text-slate-950 dark:text-slate-100">Safe & Trusted</h2>
      <p class="mt-2 text-center text-xl text-slate-500 dark:text-slate-400">We take your safety seriously</p>
      <div class="mt-8 grid gap-5 md:grid-cols-3">
        @for (item of trustCards; track item.title) {
          <article class="rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
            <h3 class="text-3xl font-bold text-slate-900 dark:text-slate-100">{{ item.title }}</h3>
            <p class="mt-1 text-lg text-slate-500 dark:text-slate-400">{{ item.description }}</p>
          </article>
        }
      </div>
    </section>

    <section class="mt-14 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-14 text-center text-white shadow-xl">
      <h2 class="text-5xl font-extrabold">Have books to sell?</h2>
      <p class="mx-auto mt-4 max-w-3xl text-2xl text-blue-100">List your textbooks and notes in under 2 minutes and start earning from materials you no longer need.</p>
      <a routerLink="/sell" class="mt-8 inline-flex rounded-xl bg-white px-6 py-3 text-xl font-bold text-blue-700 transition hover:bg-blue-50">List Your First Book</a>
    </section>
  `
})
export class HomePageComponent {
  private readonly listingsApi = inject(ListingsApiService);
  private readonly emptyListings = [] as BookListing[];
  private readonly emptyListingsPage = {
    content: [] as BookListing[],
    totalPages: 0,
    totalElements: 0,
    page: 0,
    size: 4,
    isFirst: true,
    isLast: true
  };

  readonly newestListingsPage = toSignal(
    this.listingsApi
      .getListings({
        status: 'ACTIVE',
        sortBy: 'NEWEST_FIRST',
        page: 0,
        size: 4
      })
      .pipe(catchError(() => of(this.emptyListingsPage))),
    { initialValue: this.emptyListingsPage }
  );

  readonly totalActiveListings = computed(() => this.newestListingsPage().totalElements);

  readonly allActiveListings = toSignal(
    this.listingsApi
      .getListings({
        status: 'ACTIVE',
        sortBy: 'NEWEST_FIRST',
        page: 0,
        size: 500
      })
      .pipe(
        map((page) => page.content),
        catchError(() => of(this.emptyListings))
      ),
    { initialValue: this.emptyListings }
  );

  readonly activeStudentsCount = computed(() => {
    const sellerIds = new Set(this.allActiveListings().map((listing) => listing.seller.id));
    return sellerIds.size;
  });

  readonly averageSavingsAmount = computed(() => {
    const listings = this.allActiveListings();
    if (listings.length === 0) {
      return 0;
    }

    const totalSavings = listings.reduce((sum, listing) => sum + (listing.originalPrice - listing.price), 0);
    return totalSavings / listings.length;
  });

  readonly averageSellerRating = computed(() => {
    const sellerRatings = new Map<string, number>();
    for (const listing of this.allActiveListings()) {
      sellerRatings.set(listing.seller.id, listing.seller.rating);
    }

    const ratings = [...sellerRatings.values()];
    if (ratings.length === 0) {
      return 0;
    }

    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  });

  readonly stats = computed(() => [
    { value: `${this.totalActiveListings()}`, label: 'Books Listed' },
    { value: `${this.activeStudentsCount()}`, label: 'Active Students' },
    { value: this.formatCurrency(this.averageSavingsAmount()), label: 'Avg. Savings' },
    { value: this.averageSellerRating().toFixed(1), label: 'Avg. Rating' }
  ]);

  readonly subjectCards = computed(() => {
    const subjectCounts = new Map<string, number>();

    for (const listing of this.allActiveListings()) {
      const subject = listing.subject.trim();
      if (!subject) {
        continue;
      }
      subjectCounts.set(subject, (subjectCounts.get(subject) ?? 0) + 1);
    }

    return [...subjectCounts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  });

  readonly newestBooks = computed(() => this.newestListingsPage().content);

  readonly steps = [
    {
      number: 1,
      numberClass: 'inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-3xl font-black text-white shadow-lg shadow-blue-600/30',
      title: 'Browse & Search',
      description: 'Find textbooks and notes from students at your university using powerful filters.'
    },
    {
      number: 2,
      numberClass: 'inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-3xl font-black text-white shadow-lg shadow-indigo-600/30',
      title: 'Connect & Purchase',
      description: 'Message sellers, negotiate prices, and arrange safe campus pickup or delivery.'
    },
    {
      number: 3,
      numberClass: 'inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600 text-3xl font-black text-white shadow-lg shadow-purple-600/30',
      title: 'Save Money',
      description: 'Get the materials you need at a fraction of retail price and help other students too.'
    }
  ] as const;

  readonly trustCards = [
    { title: 'Verified Students', description: 'All sellers verify with a .edu email address' },
    { title: 'Seller Ratings', description: 'Transparent reviews from real buyers' },
    { title: 'Safe Meetups', description: 'Campus exchange guidelines & recommended spots' }
  ] as const;

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  }
}
