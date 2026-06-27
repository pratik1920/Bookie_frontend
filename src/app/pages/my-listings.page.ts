import { CurrencyPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BOOK_LISTINGS } from '../data/book-listings.data';

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

      <div class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
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
                      <span>Views {{ viewCount(listing.id) }}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 sm:flex-col">
                    <button class="rounded-xl border border-slate-300 px-3 py-1 text-sm font-semibold dark:border-slate-700">View</button>
                    <button class="rounded-xl border border-slate-300 px-3 py-1 text-sm font-semibold dark:border-slate-700">Edit</button>
                    <button class="rounded-xl border border-red-300 px-3 py-1 text-sm font-semibold text-red-600 dark:border-red-900 dark:text-red-300">Delete</button>
                  </div>
                </article>
              }
            </div>
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
              <p class="text-3xl font-black text-slate-900 dark:text-slate-100">{{ activeListings.length }}</p>
            </div>
            <div class="rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
              <p class="text-sm text-slate-500 dark:text-slate-400">Sold Listings</p>
              <p class="text-3xl font-black text-slate-900 dark:text-slate-100">0</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  `
})
export class MyListingsPageComponent {
  readonly tabs: ListingTab[] = ['Active Listings', 'Sold', 'Drafts'];
  readonly activeTab = signal<ListingTab>('Active Listings');
  readonly activeListings = BOOK_LISTINGS.slice(0, 4);

  readonly tabListings = computed(() => {
    if (this.activeTab() === 'Active Listings') {
      return this.activeListings;
    }
    return [];
  });

  readonly activeTabClass = 'rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white';
  readonly inactiveTabClass =
    'rounded-lg px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800';

  viewCount(id: string): number {
    const base = id.charCodeAt(1) * 4;
    return base + 28;
  }
}
