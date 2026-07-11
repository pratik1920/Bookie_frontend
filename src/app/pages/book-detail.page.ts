import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';

import { BookCardComponent } from '../components/book-card.component';
import { BookListing } from '../models/book.model';
import { ListingsApiService } from '../services/listings-api.service';

@Component({
  selector: 'app-book-detail-page',
  imports: [RouterLink, CurrencyPipe, DatePipe, BookCardComponent],
  template: `
    @if (book(); as selected) {
      <a routerLink="/browse" class="inline-flex items-center gap-2 text-lg font-bold text-blue-600 hover:text-blue-500">&larr; Back to Browse</a>

      <div class="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div class="space-y-6">
          <article class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <img [src]="selected.imageUrl" [alt]="selected.title" class="aspect-[16/9] w-full object-cover" />
          </article>

          <article class="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div class="flex flex-wrap items-center gap-3">
              <span class="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">{{ selected.type }}</span>
              <span class="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">{{ selected.condition }}</span>
            </div>

            <h1 class="mt-4 text-5xl font-extrabold text-slate-950 dark:text-slate-100">{{ selected.title }}</h1>
            <p class="mt-2 text-2xl text-slate-600 dark:text-slate-300">{{ selected.author }}</p>

            <div class="mt-6 grid gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2 dark:border-slate-700">
              <div>
                <p class="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">Subject</p>
                <p class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ selected.subject }}</p>
              </div>
              @if (selected.edition) {
                <div>
                  <p class="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">Edition</p>
                  <p class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ selected.edition }}</p>
                </div>
              }
              @if (selected.isbn) {
                <div>
                  <p class="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">ISBN</p>
                  <p class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ selected.isbn }}</p>
                </div>
              }
              <div>
                <p class="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">Posted</p>
                <p class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ selected.postedDate | date: 'mediumDate' }}</p>
              </div>
            </div>

            <p class="mt-6 text-lg leading-relaxed text-slate-600 dark:text-slate-300">{{ selected.description }}</p>
          </article>

          <article class="rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/40">
            <h2 class="text-2xl font-bold text-blue-900 dark:text-blue-200">Safety Tips</h2>
            <ul class="mt-3 space-y-2 text-blue-800 dark:text-blue-300">
              <li>- Meet in a public campus location during daylight hours.</li>
              <li>- Verify book condition in person before payment.</li>
              <li>- Prefer campus-approved payment methods for both parties.</li>
            </ul>
          </article>

          @if (relatedBooks().length > 0) {
            <section>
              <h2 class="mb-4 text-3xl font-extrabold text-slate-950 dark:text-slate-100">Similar Listings</h2>
              <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                @for (book of relatedBooks(); track book.id) {
                  <app-book-card [book]="book" />
                }
              </div>
            </section>
          }
        </div>

        <div class="space-y-5">
          <article class="sticky top-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div class="flex items-end gap-2">
              <span class="text-5xl font-black text-slate-950 dark:text-slate-100">{{ selected.price | currency: 'USD' : 'symbol' : '1.0-0' }}</span>
              <span class="pb-1 text-lg text-slate-400 line-through dark:text-slate-500">{{ selected.originalPrice | currency: 'USD' : 'symbol' : '1.0-0' }}</span>
            </div>
            <p class="mt-1 text-lg font-semibold text-emerald-600 dark:text-emerald-400">Save {{ selected.originalPrice - selected.price | currency: 'USD' : 'symbol' : '1.0-0' }}</p>
            <button class="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-lg font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500">Contact Seller</button>
            <button class="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3 text-lg font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800">Make Offer</button>
            <div class="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <p>Campus pickup available</p>
              <p>Verified student seller</p>
            </div>
          </article>

          <article class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div class="flex items-center gap-3">
              <span class="grid h-14 w-14 place-items-center rounded-full bg-blue-600 text-xl font-bold text-white">{{ selected.seller.initials }}</span>
              <div>
                <h3 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ selected.seller.name }}</h3>
                <p class="text-slate-500 dark:text-slate-400">{{ selected.seller.university }}</p>
              </div>
            </div>
            <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div class="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                <p class="text-slate-500 dark:text-slate-400">Rating</p>
                <p class="font-bold text-slate-900 dark:text-slate-100">{{ selected.seller.rating }}</p>
              </div>
              <div class="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                <p class="text-slate-500 dark:text-slate-400">Books Sold</p>
                <p class="font-bold text-slate-900 dark:text-slate-100">{{ selected.seller.totalSales }}</p>
              </div>
            </div>
            <a [routerLink]="['/profile', selected.seller.id]" class="mt-4 inline-flex w-full justify-center rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800">View Seller Profile</a>
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
}
