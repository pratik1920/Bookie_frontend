import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, finalize, of, switchMap } from 'rxjs';

import { AuthSessionService } from '../services/auth.service';
import { BookListing } from '../models/book.model';
import { ListingStatusApi, ListingsApiService } from '../services/listings-api.service';

type ListingTab = 'Active Listings' | 'Sold' | 'Drafts';

@Component({
  selector: 'app-my-listings-page',
  imports: [RouterLink, CurrencyPipe],
  template: `
    <section>
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-5xl font-extrabold text-slate-950 dark:text-slate-100">My Listings</h1>
          <p class="mt-2 text-xl text-slate-500 dark:text-slate-400">Manage your books and track earnings.</p>
        </div>
        <a routerLink="/sell" class="rounded-xl bg-blue-600 px-5 py-3 text-lg font-bold text-white shadow-md shadow-blue-600/30">Add New Listing</a>
      </div>

      @if (!currentSellerId()) {
        <div class="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
          <h2 class="text-3xl font-bold text-slate-900 dark:text-slate-100">No seller session found</h2>
          <p class="mt-2 text-lg text-slate-500 dark:text-slate-400">Log in to view only your own listings.</p>
        </div>
      } @else {
      <div class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          @if (isLoading()) {
            <p class="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
              Loading your listings...
            </p>
          }

          <div class="inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
            @for (tab of tabs; track tab) {
              <button type="button" (click)="activeTab.set(tab)" [class]="activeTab() === tab ? activeTabClass : inactiveTabClass">
                {{ tab }}
              </button>
            }
          </div>

          @if (tabListings().length === 0) {
            <div class="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
              <h2 class="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-100">No {{ activeTab() }} yet</h2>
              <a routerLink="/sell" class="mt-5 inline-flex rounded-xl bg-blue-600 px-4 py-2 font-bold text-white">Create Listing</a>
            </div>
          } @else {
            <div class="mt-6 space-y-4">
              @for (listing of tabListings(); track listing.id) {
                <article class="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row">
                  <img [src]="listing.imageUrl" [alt]="listing.title" class="h-32 w-full rounded-xl object-cover sm:w-40" />
                  <div class="flex-1">
                    <h3 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ listing.title }}</h3>
                    <p class="text-slate-500 dark:text-slate-400">{{ listing.author }}</p>
                    <div class="mt-2 flex flex-wrap items-center gap-2">
                      <span class="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">{{ listing.condition }}</span>
                      <span class="text-sm text-slate-500 dark:text-slate-400">{{ listing.subject }}</span>
                    </div>
                    <div class="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                      <span class="text-3xl font-black text-slate-900 dark:text-slate-100">{{ listing.price | currency: 'USD' : 'symbol' : '1.0-0' }}</span>
                      <span>Views {{ listing.viewCount ?? 0 }}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 sm:flex-col">
                    <a [routerLink]="['/book', listing.id]" class="rounded-xl border border-slate-300 px-3 py-1 text-sm font-semibold dark:border-slate-700">View</a>
                    <button
                      type="button"
                      (click)="changeStatus(listing)"
                      [disabled]="isActionBusy(listing.id)"
                      class="rounded-xl border border-slate-300 px-3 py-1 text-sm font-semibold dark:border-slate-700"
                    >
                      {{ listing.status === 'ACTIVE' ? 'Mark Sold' : listing.status === 'SOLD' ? 'Move to Draft' : 'Activate' }}
                    </button>
                    <button
                      type="button"
                      (click)="deleteListing(listing.id)"
                      [disabled]="isActionBusy(listing.id)"
                      class="rounded-xl border border-red-300 px-3 py-1 text-sm font-semibold text-red-600 dark:border-red-900 dark:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              }
            </div>
          }

          @if (loadError(); as errorMessage) {
            <p class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {{ errorMessage }}
            </p>
          }
        </div>

        <aside class="h-fit rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Earnings Stats</h3>
          <div class="mt-4 space-y-3">
            <div class="rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
              <p class="text-sm text-slate-500 dark:text-slate-400">Total Earnings</p>
              <p class="text-3xl font-black text-slate-900 dark:text-slate-100">$0</p>
            </div>
            <div class="rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
              <p class="text-sm text-slate-500 dark:text-slate-400">Active Listings</p>
              <p class="text-3xl font-black text-slate-900 dark:text-slate-100">{{ activeListings().length }}</p>
            </div>
            <div class="rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
              <p class="text-sm text-slate-500 dark:text-slate-400">Sold Listings</p>
              <p class="text-3xl font-black text-slate-900 dark:text-slate-100">0</p>
            </div>
          </div>
        </aside>
      </div>
      }
    </section>
  `
})
export class MyListingsPageComponent {
  private readonly authSession = inject(AuthSessionService);
  private readonly listingsApi = inject(ListingsApiService);

  readonly tabs: ListingTab[] = ['Active Listings', 'Sold', 'Drafts'];
  readonly activeTab = signal<ListingTab>('Active Listings');
  readonly loadError = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly actionBusyIds = signal<Record<string, boolean>>({});
  readonly refreshTick = signal(0);

  private readonly emptyGroups: Record<ListingStatusApi, BookListing[]> = {
    ACTIVE: [],
    SOLD: [],
    DRAFT: []
  };

  readonly currentSellerId = computed(() => this.authSession.sellerId());
  readonly groupedListings = signal<Record<ListingStatusApi, BookListing[]>>(this.emptyGroups);
  readonly activeListings = computed(() => this.groupedListings().ACTIVE);
  readonly soldListings = computed(() => this.groupedListings().SOLD);
  readonly draftListings = computed(() => this.groupedListings().DRAFT);

  readonly tabListings = computed(() => {
    if (this.activeTab() === 'Active Listings') {
      return this.activeListings();
    }
    if (this.activeTab() === 'Sold') {
      return this.soldListings();
    }
    if (this.activeTab() === 'Drafts') {
      return this.draftListings();
    }
    return [];
  });

  readonly activeTabClass = 'rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white';
  readonly inactiveTabClass =
    'rounded-lg px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800';

  constructor() {
    toObservable(
      computed(() => ({
        sellerId: this.currentSellerId(),
        refreshTick: this.refreshTick()
      }))
    )
      .pipe(
        switchMap(({ sellerId }) => {
          if (!sellerId) {
            this.groupedListings.set(this.emptyGroups);
            return of(this.emptyGroups);
          }

          this.loadError.set(null);
          this.isLoading.set(true);
          return this.listingsApi.getMyListings().pipe(
            catchError(() => {
              this.loadError.set('Unable to load your listings. Please check your login session and try again.');
              return of(this.emptyGroups);
            }),
            finalize(() => this.isLoading.set(false))
          );
        }),
        takeUntilDestroyed()
      )
      .subscribe((grouped) => {
        this.groupedListings.set(grouped);
      });
  }

  isActionBusy(id: string): boolean {
    return !!this.actionBusyIds()[id];
  }

  changeStatus(listing: BookListing): void {
    const currentStatus = listing.status ?? 'ACTIVE';
    let nextStatus: ListingStatusApi = 'ACTIVE';
    if (currentStatus === 'ACTIVE') {
      nextStatus = 'SOLD';
    } else if (currentStatus === 'SOLD') {
      nextStatus = 'DRAFT';
    }

    this.setBusy(listing.id, true);
    this.listingsApi
      .updateStatus(listing.id, nextStatus)
      .pipe(finalize(() => this.setBusy(listing.id, false)))
      .subscribe({
        next: () => this.refresh(),
        error: () => this.loadError.set('Could not change listing status. Please try again.')
      });
  }

  deleteListing(listingId: string): void {
    this.setBusy(listingId, true);
    this.listingsApi
      .deleteListing(listingId)
      .pipe(finalize(() => this.setBusy(listingId, false)))
      .subscribe({
        next: () => this.refresh(),
        error: () => this.loadError.set('Could not delete listing. Please try again.')
      });
  }

  private refresh(): void {
    this.refreshTick.update((value) => value + 1);
  }

  private setBusy(id: string, busy: boolean): void {
    this.actionBusyIds.update((current) => {
      if (busy) {
        return { ...current, [id]: true };
      }

      const next = { ...current };
      delete next[id];
      return next;
    });
  }
}